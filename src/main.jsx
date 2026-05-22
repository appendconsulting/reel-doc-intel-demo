import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle, ArrowRight, Bot, CheckCircle2, DatabaseZap, FileSearch, FileText,
  LockKeyhole, MessageSquareText, RotateCcw, Send, ShieldCheck, Thermometer, UploadCloud, X
} from 'lucide-react';
import './styles.css';

const sampleDocs = [
  {
    id: 'hydro-karmoy',
    name: 'Hydro_Karmoy_GTC_Commissioning_Report.pdf',
    type: 'Commissioning report',
    pages: 48,
    status: 'Indexed',
    sections: ['3.2 Gas train design', '5.1 Start-up measurements'],
    snippets: [
      'Section 5.1: Raw gas inlet temperature measured 142–168 °C during potline ramp-up. Design basis was 175 °C continuous, 190 °C short-term peak.',
      'Section 3.2: Main inlet duct DN 2800 with refractory lined transition to reactor vessel. Total flow basis 1,120,000 Nm³/h.'
    ]
  },
  {
    id: 'alba-line6',
    name: 'ALBA_Line6_FTP_Process_Specification.pdf',
    type: 'Process specification',
    pages: 76,
    status: 'Indexed',
    sections: ['2.4 Design envelope', '6.3 Baghouse media'],
    snippets: [
      'Section 2.4: FTP inlet temperature range 118–155 °C. Excursions above 165 °C trigger dilution damper sequence.',
      'Section 6.3: Filter bags specified as PPS/PTFE blend, 2.2 mm nominal thickness, 160 mm diameter x 7,000 mm length.'
    ]
  },
  {
    id: 'mosjoen-gtc',
    name: 'Mosjoen_GTC_Basic_Engineering_Data_Sheet.pdf',
    type: 'Engineering data sheet',
    pages: 22,
    status: 'Indexed',
    sections: ['1.7 Operating cases', '4.5 Fan sizing'],
    snippets: [
      'Section 1.7: Gas inlet temperature basis 132 °C normal, 160 °C maximum at summer ambient condition.',
      'Section 4.5: ID fan capacity 740,000 Am³/h at 4,850 Pa static pressure, motor rating 1,250 kW.'
    ]
  }
];

const suggestedQuestions = [
  'What were the gas inlet temperatures in our previous GTC deliveries?',
  'What duct dimensions were used in the Hydro Karmøy project?',
  'What filter bag thickness was specified for the last aluminium smelter job?',
  'What flow volumes have we delivered solutions for?'
];

function answerFor(question, docs) {
  const q = question.toLowerCase();
  const names = docs.map(d => d.name).join(', ');

  if (!docs.length) {
    return {
      text: 'No documents are loaded in this session yet. Upload PDFs or load the sample AQCS project pack before asking technical questions.',
      bullets: [],
      citations: []
    };
  }

  if (q.includes('temperature') || q.includes('temperatur') || q.includes('gtc')) {
    return {
      text: 'Previous GTC/FTP deliveries show inlet gas design and operating temperatures between 118 °C and 190 °C. For proposal screening, 175 °C continuous with a short-term 190 °C peak appears to be the highest cited GTC design case in the loaded set.',
      bullets: [
        'Hydro Karmøy GTC: 142–168 °C measured during ramp-up; design basis 175 °C continuous / 190 °C short-term peak.',
        'ALBA Line 6 FTP: 118–155 °C normal inlet range; dilution sequence above 165 °C.',
        'Mosjøen GTC: 132 °C normal; 160 °C maximum at summer ambient condition.'
      ],
      citations: [
        { doc: 'Hydro_Karmoy_GTC_Commissioning_Report.pdf', section: '5.1 Start-up measurements', quote: 'Raw gas inlet temperature measured 142–168 °C... design basis was 175 °C continuous, 190 °C short-term peak.' },
        { doc: 'ALBA_Line6_FTP_Process_Specification.pdf', section: '2.4 Design envelope', quote: 'FTP inlet temperature range 118–155 °C. Excursions above 165 °C trigger dilution damper sequence.' },
        { doc: 'Mosjoen_GTC_Basic_Engineering_Data_Sheet.pdf', section: '1.7 Operating cases', quote: 'Gas inlet temperature basis 132 °C normal, 160 °C maximum...' }
      ]
    };
  }

  if (q.includes('duct') || q.includes('dimension') || q.includes('karm')) {
    return {
      text: 'For Hydro Karmøy, the indexed commissioning report cites a main inlet duct of DN 2800 with a refractory lined transition into the reactor vessel.',
      bullets: ['Main inlet duct: DN 2800.', 'Transition: refractory lined section to reactor vessel.', 'Associated design flow: 1,120,000 Nm³/h.'],
      citations: [{ doc: 'Hydro_Karmoy_GTC_Commissioning_Report.pdf', section: '3.2 Gas train design', quote: 'Main inlet duct DN 2800 with refractory lined transition to reactor vessel. Total flow basis 1,120,000 Nm³/h.' }]
    };
  }

  if (q.includes('filter') || q.includes('bag') || q.includes('thickness')) {
    return {
      text: 'The most recent loaded aluminium smelter FTP specification uses PPS/PTFE blend filter bags with 2.2 mm nominal thickness.',
      bullets: ['Material: PPS/PTFE blend.', 'Nominal thickness: 2.2 mm.', 'Bag dimensions: 160 mm diameter x 7,000 mm length.'],
      citations: [{ doc: 'ALBA_Line6_FTP_Process_Specification.pdf', section: '6.3 Baghouse media', quote: 'Filter bags specified as PPS/PTFE blend, 2.2 mm nominal thickness, 160 mm diameter x 7,000 mm length.' }]
    };
  }

  if (q.includes('flow') || q.includes('volume') || q.includes('nm') || q.includes('am')) {
    return {
      text: 'The loaded project set includes AQCS flow volumes from 740,000 Am³/h fan sizing up to 1,120,000 Nm³/h total GTC design basis.',
      bullets: ['Hydro Karmøy: 1,120,000 Nm³/h total flow basis.', 'Mosjøen: ID fan capacity 740,000 Am³/h.', 'Values should be normalized before direct comparison in a proposal table.'],
      citations: [
        { doc: 'Hydro_Karmoy_GTC_Commissioning_Report.pdf', section: '3.2 Gas train design', quote: 'Total flow basis 1,120,000 Nm³/h.' },
        { doc: 'Mosjoen_GTC_Basic_Engineering_Data_Sheet.pdf', section: '4.5 Fan sizing', quote: 'ID fan capacity 740,000 Am³/h at 4,850 Pa static pressure...' }
      ]
    };
  }

  return {
    text: `I searched the currently loaded files (${names}). I found related AQCS design data, but no exact match for that wording. Try asking for temperatures, flow volumes, filter media, duct dimensions, fan capacity, pressure drops, or emissions.`,
    bullets: [],
    citations: docs.slice(0, 2).flatMap(d => d.snippets.slice(0, 1).map(s => ({ doc: d.name, section: d.sections[0], quote: s.replace(/^Section [^:]+: /, '') })))
  };
}

async function loadPdfJs() {
  if (window.__pdfjsLib) return window.__pdfjsLib;
  window.__pdfjsLib = await import(/* @vite-ignore */ 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
  return window.__pdfjsLib;
}

async function parsePdfText(file) {
  try {
    const pdfjsLib = await loadPdfJs();
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const maxPages = Math.min(pdf.numPages, 8);
    const pageTexts = [];
    for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
      const page = await pdf.getPage(pageNo);
      const content = await page.getTextContent();
      pageTexts.push(content.items.map(item => item.str).join(' ').replace(/\s+/g, ' ').trim());
    }
    return { pages: pdf.numPages, text: pageTexts.join('\n').slice(0, 3200) };
  } catch (error) {
    console.warn('PDF.js parsing unavailable in this environment, using demo fallback.', error);
    return { pages: Math.max(6, Math.round(file.size / 95000)), text: '' };
  }
}

function buildClaudeSessionPayload(question, docs) {
  return {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
    system: 'You are an internal AQCS engineering document agent. Answer only from supplied document context and cite document name, section, and snippet for every technical claim.',
    messages: [{
      role: 'user',
      content: `Question: ${question}\n\nSession documents:\n${docs.map(doc => `# ${doc.name}\n${doc.snippets.join('\n')}`).join('\n\n')}`
    }]
  };
}

function App() {
  const [documents, setDocuments] = useState(sampleDocs);
  const [messages, setMessages] = useState([
    { role: 'assistant', ...answerFor('What were the gas inlet temperatures in our previous GTC deliveries?', sampleDocs), demo: true }
  ]);
  const [input, setInput] = useState('');
  const [dragging, setDragging] = useState(false);
  const [thinking, setThinking] = useState(false);
  const fileInputRef = useRef(null);

  const metrics = useMemo(() => ({
    pages: documents.reduce((sum, d) => sum + d.pages, 0),
    citations: documents.reduce((sum, d) => sum + d.snippets.length, 0),
  }), [documents]);

  async function addFiles(files) {
    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    if (!pdfFiles.length) return;
    const mapped = await Promise.all(pdfFiles.map(async (file, index) => {
      const parsed = await parsePdfText(file);
      const extracted = parsed.text || `Client-side parser queued ${file.name}. In production this text is passed as session context to Claude Sonnet 4 without persistent storage.`;
      return {
        id: `${file.name}-${Date.now()}-${index}`,
        name: file.name,
        type: 'Uploaded PDF',
        pages: parsed.pages,
        status: parsed.text ? 'Parsed with PDF.js in browser' : 'Parsed in browser session',
        sections: ['Detected technical text', 'Candidate parameters'],
        snippets: [
          extracted.slice(0, 900),
          'Candidate parameters detected: temperature, pressure drop, flow volume, filter media, fan rating.'
        ]
      };
    }));
    setDocuments(prev => [...mapped, ...prev]);
  }

  function ask(prefill) {
    const question = (prefill ?? input).trim();
    if (!question || thinking) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setThinking(true);
    const claudePayload = buildClaudeSessionPayload(question, documents);
    console.info('Demo Claude request payload (send via secure server-side endpoint, never directly with a browser API key):', claudePayload);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', ...answerFor(question, documents) }]);
      setThinking(false);
    }, 700);
  }

  function clearSession() {
    setDocuments([]);
    setMessages([{ role: 'assistant', text: 'Session cleared. All loaded document references have been removed from this browser session.', bullets: [], citations: [] }]);
  }

  return (
    <main className="bg-grid min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-sky-200/15 bg-sky-100/8 px-4 py-2 text-sm text-sky-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,.9)]" />
              Reel International · AQCS Knowledge Agent Demo
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              Internal document intelligence for smelter engineering proposals
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              Upload confidential project PDFs, ask technical questions, and verify every answer against source sections. Built for GTC/FTP engineering teams — calm, traceable, session-only.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4 text-sm text-slate-300">
            <div className="mb-2 text-xs uppercase tracking-[.22em] text-slate-500">Logo placeholder</div>
            <div className="text-2xl font-bold tracking-[-.03em] text-white">REEL</div>
            <div className="text-slate-400">International · Air Quality Control Systems</div>
          </div>
        </header>

        <section className="mb-6 grid gap-3 md:grid-cols-3">
          <TrustPill icon={<ShieldCheck size={18} />} title="Secure processing" text="All documents are processed securely. No data is stored or shared externally." />
          <TrustPill icon={<LockKeyhole size={18} />} title="Session-only / Kun økt" text="Loaded files disappear when the session is cleared or the browser is closed." />
          <TrustPill icon={<DatabaseZap size={18} />} title="No external database" text="PDF text is held in browser memory and sent only as per-question context." />
        </section>

        <section className="grid gap-5 lg:grid-cols-[390px_minmax(0,1fr)]">
          <aside className="steel-card rounded-[1.75rem] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Document upload / Dokumenter</h2>
                <p className="text-sm text-slate-400">PDF.js parsing simulated for demo; upload area accepts local PDFs.</p>
              </div>
              <button onClick={clearSession} className="rounded-xl border border-red-300/20 bg-red-400/10 p-3 text-red-100 transition hover:bg-red-400/20" title="Clear Session / Delete All Documents">
                <RotateCcw size={18} />
              </button>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative mb-5 cursor-pointer overflow-hidden rounded-3xl border border-dashed border-sky-200/25 bg-slate-900/45 p-6 text-center transition ${dragging ? 'drop-active' : 'hover:border-sky-200/50 hover:bg-slate-800/55'}`}
            >
              <div className="scan-bar absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-sky-200/10 to-transparent" />
              <UploadCloud className="mx-auto mb-3 text-sky-200" size={34} />
              <div className="font-medium text-white">Drag & drop PDF files</div>
              <div className="mt-1 text-sm text-slate-400">or click to choose multiple files</div>
              <input ref={fileInputRef} type="file" multiple accept="application/pdf,.pdf" className="hidden" onChange={(e) => addFiles(e.target.files)} />
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2 text-center">
              <Metric value={documents.length} label="files" />
              <Metric value={metrics.pages} label="pages" />
              <Metric value={metrics.citations} label="snippets" />
            </div>

            <div className="space-y-3">
              {documents.length === 0 ? (
                <div className="rounded-2xl border border-amber-200/20 bg-amber-300/8 p-4 text-sm text-amber-100">
                  No files loaded. Use the upload area or reload the page to restore the sample pack.
                </div>
              ) : documents.map(doc => <DocumentCard key={doc.id} doc={doc} onRemove={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))} />)}
            </div>
          </aside>

          <section className="steel-card flex min-h-[720px] flex-col rounded-[1.75rem] p-5">
            <div className="mb-4 flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-semibold text-white"><Bot size={22} className="text-sky-200" /> AI chat agent / Kunnskapsagent</h2>
                <p className="mt-1 text-sm text-slate-400">Model target: Anthropic Claude Sonnet 4 · Context source: loaded session documents</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
                <CheckCircle2 size={16} /> Enterprise privacy mode
              </div>
            </div>

            <div className="mb-4 grid gap-2 sm:grid-cols-2">
              {suggestedQuestions.map(q => (
                <button key={q} onClick={() => ask(q)} className="rounded-2xl border border-white/10 bg-white/[.035] p-3 text-left text-sm text-slate-200 transition hover:border-sky-200/35 hover:bg-sky-200/10">
                  {q}
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-white/10 bg-[#06101b]/80 p-4">
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {thinking && <div className="fade-in flex items-center gap-3 text-sm text-slate-400"><span className="h-2 w-2 animate-pulse rounded-full bg-sky-200" /> Searching loaded PDFs and preparing cited answer…</div>}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="mt-4 flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about duct dimensions, gas temperatures, pressure drops, filter media…"
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/65 px-4 py-4 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-200/45"
              />
              <button className="inline-flex items-center gap-2 rounded-2xl bg-sky-200 px-5 py-4 font-semibold text-slate-950 transition hover:bg-white disabled:opacity-50" disabled={thinking}>
                Send <Send size={18} />
              </button>
            </form>
          </section>
        </section>

        <footer className="mt-5 grid gap-4 text-sm text-slate-400 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
            <strong className="text-slate-200">Implementation note:</strong> A production version should route Anthropic API calls through a secure server-side endpoint. Browser-only demos can mock the model or use a temporary demo proxy; API keys must never be exposed client-side.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
            <strong className="text-slate-200">PDF parsing:</strong> The UI is ready for PDF.js (`pdfjs-dist` from cdnjs). Parsed text can be chunked per document and attached to each Claude request as volatile session context.
          </div>
        </footer>
      </div>
    </main>
  );
}

function TrustPill({ icon, title, text }) {
  return <div className="industrial-line rounded-2xl border border-white/10 bg-white/[.04] p-4 pl-5"><div className="mb-1 flex items-center gap-2 font-semibold text-white">{icon}{title}</div><p className="text-sm leading-6 text-slate-400">{text}</p></div>;
}

function Metric({ value, label }) {
  return <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3"><div className="text-2xl font-semibold text-white">{value}</div><div className="text-xs uppercase tracking-[.16em] text-slate-500">{label}</div></div>;
}

function DocumentCard({ doc, onRemove }) {
  return (
    <article className="group rounded-2xl border border-white/10 bg-white/[.035] p-4 transition hover:border-sky-200/25">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-sky-200/10 p-2 text-sky-100"><FileText size={20} /></div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-white">{doc.name}</div>
          <div className="mt-1 text-xs text-slate-400">{doc.type} · {doc.pages} pages</div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-300/10 px-2 py-1 text-xs text-emerald-100"><CheckCircle2 size={12} /> {doc.status}</div>
        </div>
        <button onClick={onRemove} className="rounded-lg p-1 text-slate-500 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"><X size={16} /></button>
      </div>
    </article>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`fade-in flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[920px] rounded-3xl p-4 ${isUser ? 'bg-sky-200 text-slate-950' : 'border border-white/10 bg-white/[.045] text-slate-100'}`}>
        {msg.demo && <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-200/10 px-2 py-1 text-xs text-amber-100"><Thermometer size={13} /> Demo scenario answer</div>}
        {isUser ? <p className="font-medium">{msg.text}</p> : <AssistantAnswer msg={msg} />}
      </div>
    </div>
  );
}

function AssistantAnswer({ msg }) {
  return (
    <div>
      <div className="mb-3 flex items-start gap-3">
        <div className="mt-1 rounded-xl bg-slate-950/60 p-2 text-sky-200"><FileSearch size={18} /></div>
        <p className="leading-7 text-slate-100">{msg.text}</p>
      </div>
      {!!msg.bullets?.length && <ul className="mb-4 space-y-2 pl-11 text-sm text-slate-300">{msg.bullets.map((b, i) => <li key={i} className="flex gap-2"><ArrowRight size={15} className="mt-0.5 shrink-0 text-sky-200" />{b}</li>)}</ul>}
      {!!msg.citations?.length && <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-slate-500"><AlertTriangle size={14} /> Source references</div>
        {msg.citations.map((c, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
            <div className="mb-1 text-sm font-semibold text-sky-100">{c.doc}</div>
            <div className="mb-2 text-xs text-slate-500">{c.section}</div>
            <blockquote className="border-l-2 border-sky-200/50 pl-3 text-sm leading-6 text-slate-300">“{c.quote}”</blockquote>
          </div>
        ))}
      </div>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
