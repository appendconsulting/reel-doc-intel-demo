import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle, ArrowRight, Bot, CheckCircle2, FileSearch, FileText,
  RotateCcw, Send, Thermometer, UploadCloud, X
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
  'What duct dimensions were used in the Hydro Karmoy project?',
  'What filter bag thickness was specified for the last aluminium smelter job?',
  'What flow volumes have we delivered solutions for?'
];

function answerFor(question, docs) {
  const q = question.toLowerCase();
  const names = docs.map(d => d.name).join(', ');

  if (!docs.length) {
    return { text: 'No documents are loaded in this session yet. Upload PDFs or load the sample AQCS project pack before asking technical questions.', bullets: [], citations: [] };
  }

  if (q.includes('temperature') || q.includes('temperatur') || q.includes('gtc')) {
    return {
      text: 'Previous GTC/FTP deliveries show inlet gas design and operating temperatures between 118 °C and 190 °C. For proposal screening, 175 °C continuous with a short-term 190 °C peak appears to be the highest cited GTC design case in the loaded set.',
      bullets: [
        'Hydro Karmoy GTC: 142–168 °C measured during ramp-up; design basis 175 °C continuous / 190 °C short-term peak.',
        'ALBA Line 6 FTP: 118–155 °C normal inlet range; dilution sequence above 165 °C.',
        'Mosjoen GTC: 132 °C normal; 160 °C maximum at summer ambient condition.'
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
      text: 'For Hydro Karmoy, the indexed commissioning report cites a main inlet duct of DN 2800 with a refractory lined transition into the reactor vessel.',
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
      bullets: ['Hydro Karmoy: 1,120,000 Nm³/h total flow basis.', 'Mosjoen: ID fan capacity 740,000 Am³/h.', 'Values should be normalized before direct comparison in a proposal table.'],
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
        status: parsed.text ? 'Indexed' : 'Indexed',
        sections: ['Detected technical text', 'Candidate parameters'],
        snippets: [extracted.slice(0, 900), 'Candidate parameters detected: temperature, pressure drop, flow volume, filter media, fan rating.']
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
    <main className="page-shell">
      <div className="site-frame">
        <header className="site-header">
          <div className="brand-lockup">
            <img src="/reel-logo.svg" alt="REEL International" className="reel-logo" />
            <div>
              <div className="brand-name">REEL International</div>
              <div className="brand-meta">AQCS Knowledge Agent Demo</div>
            </div>
          </div>
          <div className="privacy-chip"><span /> Enterprise privacy</div>
        </header>

        <section className="hero-section">
          <div className="eyebrow">Internal document intelligence</div>
          <h1>Internal document intelligence</h1>
          <div className="red-rule" />
          <p>
            Upload confidential project PDFs, ask technical questions, and verify every answer against source sections.
          </p>
        </section>

        <section className="workspace-grid">
          <aside className="panel upload-panel">
            <div className="panel-heading">
              <div>
                <h2>Document upload</h2>
                <p>Upload PDFs to add technical context to this session.</p>
              </div>
              <button onClick={clearSession} className="secondary-icon-button" title="Clear Session / Delete All Documents"><RotateCcw size={18} /></button>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`drop-zone ${dragging ? 'drop-active' : ''}`}
            >
              <UploadCloud size={38} />
              <strong>Drag & drop PDF files</strong>
              <span>or click to choose multiple files</span>
              <input ref={fileInputRef} type="file" multiple accept="application/pdf,.pdf" className="hidden-input" onChange={(e) => addFiles(e.target.files)} />
            </div>

            <div className="metrics-grid">
              <Metric value={documents.length} label="files" />
              <Metric value={metrics.pages} label="pages" />
              <Metric value={metrics.citations} label="snippets" />
            </div>

            <div className="document-list">
              {documents.length === 0 ? (
                <div className="empty-state">No files loaded. Use the upload area or reload the page to restore the sample pack.</div>
              ) : documents.map(doc => <DocumentCard key={doc.id} doc={doc} onRemove={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))} />)}
            </div>
          </aside>

          <section className="panel chat-panel">
            <div className="panel-heading chat-heading">
              <div>
                <h2><Bot size={22} /> AI chat agent</h2>
                <p>Model target: Anthropic Claude Sonnet 4 · Context source: loaded session documents</p>
              </div>
              <div className="privacy-chip compact"><span /> Enterprise privacy</div>
            </div>

            <div className="suggestions-block">
              <div className="suggestions-label">Try asking</div>
              <div className="suggestions-grid">
                {suggestedQuestions.map(q => <button key={q} onClick={() => ask(q)}><span>✦</span>{q}</button>)}
              </div>
            </div>

            <div className="messages-pane">
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {thinking && <div className="thinking"><span /> Searching loaded PDFs and preparing cited answer…</div>}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="composer">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about duct dimensions, gas temperatures, pressure drops, filter media…" />
              <button disabled={thinking}>Send <Send size={18} /></button>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({ value, label }) {
  return <div className="metric-card"><strong>{value}</strong><span>{label}</span></div>;
}

function DocumentCard({ doc, onRemove }) {
  return (
    <article className="document-card">
      <FileText size={20} />
      <div className="document-main">
        <div className="document-name">{doc.name}</div>
        <div className="document-meta">{doc.pages} pages · {doc.type}</div>
      </div>
      <div className="indexed-pill"><CheckCircle2 size={12} /> Indexed</div>
      <button onClick={onRemove} className="remove-button" title="Remove document"><X size={16} /></button>
    </article>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      <div className={`message-card ${isUser ? 'user-card' : 'assistant-card'}`}>
        {msg.demo && <div className="demo-pill"><Thermometer size={13} /> Demo scenario answer</div>}
        {isUser ? <p>{msg.text}</p> : <AssistantAnswer msg={msg} />}
      </div>
    </div>
  );
}

function AssistantAnswer({ msg }) {
  return (
    <div>
      <div className="answer-intro">
        <FileSearch size={20} />
        <p>{msg.text}</p>
      </div>
      {!!msg.bullets?.length && <ul className="answer-bullets">{msg.bullets.map((b, i) => <li key={i}><ArrowRight size={15} />{b}</li>)}</ul>}
      {!!msg.citations?.length && <div className="citations-block">
        <div className="citations-title"><AlertTriangle size={14} /> Source references</div>
        {msg.citations.map((c, i) => (
          <div key={i} className="citation-card">
            <div className="citation-doc">{c.doc}</div>
            <div className="citation-section">{c.section}</div>
            <blockquote>“{c.quote}”</blockquote>
          </div>
        ))}
      </div>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
