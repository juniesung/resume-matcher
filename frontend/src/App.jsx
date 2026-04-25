import { useState, useRef } from 'react'

// ── helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 70) return '#10b981'
  if (score >= 40) return '#fbbf24'
  return '#f87171'
}

// ── sub-components ────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 0' }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid rgba(124,58,237,0.2)',
        borderTopColor: '#7c3aed',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 24px',
      }} />
      <p style={{
        color: '#8b949e',
        fontSize: 14,
        margin: 0,
        animation: 'pulse 2s ease-in-out infinite',
      }}>
        Analyzing your resume…
      </p>
    </div>
  )
}

function ScoreCard({ score }) {
  const color = scoreColor(score)
  return (
    <div style={{
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: 16,
      padding: '28px 24px',
      textAlign: 'center',
      minWidth: 160,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    }}>
      <div style={{
        fontSize: 64,
        fontWeight: 800,
        color,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {score}
      </div>
      <div style={{
        fontSize: 12,
        fontWeight: 600,
        color: '#8b949e',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginTop: 10,
        marginBottom: 16,
      }}>
        Match Score
      </div>
      <div style={{
        width: '100%',
        height: 4,
        background: '#1f2937',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          background: color,
          borderRadius: 2,
        }} />
      </div>
    </div>
  )
}

function MissingKeywords({ keywords }) {
  return (
    <div style={{
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: 16,
      padding: '24px',
      flex: 1,
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    }}>
      <p style={{
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#8b949e',
        margin: '0 0 16px',
      }}>
        Missing Keywords
      </p>
      {keywords.length === 0 ? (
        <p style={{ color: '#10b981', fontSize: 14, margin: 0 }}>
          ✓ Great coverage — no missing keywords found.
        </p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {keywords.map((kw, i) => (
            <span key={i} style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.3)',
              color: '#a78bfa',
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 500,
            }}>
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function SuggestionCard({ s }) {
  return (
    <div style={{
      background: '#161b22',
      border: '1px solid #30363d',
      borderLeft: '3px solid #7c3aed',
      borderRadius: 16,
      padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    }}>
      <p style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#f87171',
        margin: '0 0 6px',
      }}>
        Before
      </p>
      <div style={{
        background: 'rgba(248,113,113,0.1)',
        borderLeft: '2px solid #f87171',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 13,
        color: '#f0f6fc',
        lineHeight: 1.6,
        marginBottom: 12,
      }}>
        {s.original}
      </div>

      <p style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#10b981',
        margin: '0 0 6px',
      }}>
        After
      </p>
      <div style={{
        background: 'rgba(16,185,129,0.1)',
        borderLeft: '2px solid #10b981',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 13,
        color: '#f0f6fc',
        lineHeight: 1.6,
        marginBottom: 12,
      }}>
        {s.improved}
      </div>

      <p style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#484f58',
        margin: '0 0 6px',
      }}>
        Why
      </p>
      <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.6, margin: 0 }}>
        {s.reason}
      </p>
    </div>
  )
}

// ── main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase] = useState('input') // 'input' | 'loading' | 'results'
  const [file, setFile]       = useState(null)
  const [jobDesc, setJobDesc] = useState('')
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const ready = file !== null && jobDesc.trim().length > 0

  async function runAnalysis() {
    if (!ready) return
    setPhase('loading')
    setError(null)

    const fd = new FormData()
    fd.append('file', file)
    fd.append('job_description', jobDesc)

    try {
      const res = await fetch('http://localhost:8000/analyze', { method: 'POST', body: fd })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || `Server returned ${res.status}`)
      }
      setResult(await res.json())
      setPhase('results')
    } catch (e) {
      setError(e.message)
      setPhase('input')
    }
  }

  function reset() {
    setPhase('input')
    setFile(null)
    setJobDesc('')
    setResult(null)
    setError(null)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') setFile(f)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #0d1117; }
        #root { all: unset; display: block; }
        body, input, textarea, button { font-family: 'Plus Jakarta Sans', sans-serif; }

        :root {
          --bg: #0d1117;
          --surface: #161b22;
          --surface-raised: #1f2937;
          --border: #30363d;
          --accent: #7c3aed;
          --accent-light: #a78bfa;
          --accent-glow: rgba(124,58,237,0.15);
          --green: #10b981;
          --green-light: rgba(16,185,129,0.1);
          --red: #f87171;
          --red-light: rgba(248,113,113,0.1);
          --yellow: #fbbf24;
          --text-primary: #f0f6fc;
          --text-secondary: #8b949e;
          --text-muted: #484f58;
        }

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }

        .drop-zone { transition: all 0.2s ease; }
        .drop-zone:hover {
          border-color: var(--accent) !important;
          background: var(--accent-glow) !important;
        }

        textarea:focus {
          outline: none;
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px var(--accent-glow) !important;
        }

        .btn-analyze { transition: all 0.2s ease; }
        .btn-analyze:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        .btn-analyze:active:not(:disabled) { transform: translateY(0); }

        .btn-reset { transition: all 0.2s ease; }
        .btn-reset:hover { background: var(--accent-glow) !important; color: var(--accent-light) !important; }

        ::placeholder { color: var(--text-muted); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: var(--surface); }
        ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 3px; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        justifyContent: 'center',
        padding: '64px 24px 96px',
        color: 'var(--text-primary)',
      }}>
        <div style={{ width: '100%', maxWidth: 860 }}>

          {/* ── Header ── */}
          <header style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ color: '#7c3aed', fontSize: 20, lineHeight: 1 }}>✦</span>
              <h1 style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Resume Matcher
              </h1>
            </div>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: 14,
              lineHeight: 1.6,
              maxWidth: 440,
              margin: '0 auto',
            }}>
              Upload your resume and paste a job description to get an AI‑powered match score and tailored rewrite suggestions.
            </p>
          </header>

          {/* ── Input phase ── */}
          {phase === 'input' && (
            <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>

              {/* Error banner */}
              {error && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  background: 'var(--red-light)',
                  border: '1px solid rgba(248,113,113,0.25)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  marginBottom: 20,
                }}>
                  <span style={{ color: 'var(--red)', fontSize: 15, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>⚠</span>
                  <p style={{ color: 'var(--red)', fontSize: 14, lineHeight: 1.5, flex: 1, margin: 0 }}>{error}</p>
                  <button
                    onClick={() => setError(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, lineHeight: 1, cursor: 'pointer', padding: 0, flexShrink: 0 }}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Two-column inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

                {/* PDF drop zone */}
                <div
                  className="drop-zone"
                  onClick={() => fileRef.current.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  style={{
                    background: dragOver ? 'var(--accent-glow)' : 'var(--surface)',
                    border: `2px dashed ${dragOver ? '#7c3aed' : file ? '#10b981' : '#30363d'}`,
                    borderRadius: 16,
                    padding: '48px 28px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: 'none' }}
                    onChange={e => setFile(e.target.files[0] ?? null)}
                  />
                  <div style={{
                    width: 44,
                    height: 44,
                    background: file ? 'rgba(16,185,129,0.15)' : 'var(--accent-glow)',
                    border: `1px solid ${file ? 'rgba(16,185,129,0.3)' : 'rgba(124,58,237,0.3)'}`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                    fontSize: 18,
                    fontWeight: 700,
                    color: file ? '#10b981' : '#a78bfa',
                  }}>
                    {file ? '✓' : '↑'}
                  </div>
                  {file ? (
                    <>
                      <p style={{ color: '#10b981', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>{file.name}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>{(file.size / 1024).toFixed(0)} KB · click to replace</p>
                    </>
                  ) : (
                    <>
                      <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, margin: '0 0 6px' }}>Drop your resume here</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>or click to browse · PDF only</p>
                    </>
                  )}
                </div>

                {/* Job description textarea */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <textarea
                    value={jobDesc}
                    onChange={e => setJobDesc(e.target.value)}
                    placeholder="Paste the job description here…"
                    style={{
                      flex: 1,
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 16,
                      padding: '20px',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      lineHeight: 1.6,
                      resize: 'none',
                      minHeight: 180,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }}
                  />
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8, textAlign: 'right' }}>
                    {jobDesc.length > 0 ? `${jobDesc.length.toLocaleString()} chars` : 'No text yet'}
                  </p>
                </div>
              </div>

              {/* Analyze button */}
              <button
                className="btn-analyze"
                onClick={runAnalysis}
                disabled={!ready}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  border: 'none',
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                  cursor: ready ? 'pointer' : 'not-allowed',
                  opacity: ready ? 1 : 0.4,
                  boxShadow: ready ? '0 0 24px rgba(124,58,237,0.3)' : 'none',
                }}
              >
                {ready ? 'Analyze Resume →' : 'Add a PDF and job description to continue'}
              </button>
            </div>
          )}

          {/* ── Loading phase ── */}
          {phase === 'loading' && (
            <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
              <Spinner />
            </div>
          )}

          {/* ── Results phase ── */}
          {phase === 'results' && result && (
            <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>

              {/* Score + keywords row */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'stretch' }}>
                <ScoreCard score={result.match_score} />
                <MissingKeywords keywords={result.missing_keywords} />
              </div>

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <p style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--text-secondary)',
                    }}>
                      Bullet Improvements
                    </p>
                    <span style={{
                      background: '#7c3aed',
                      color: '#fff',
                      borderRadius: 999,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      {result.suggestions.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {result.suggestions.map((s, i) => (
                      <SuggestionCard key={i} s={s} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Reset button */}
              <button
                className="btn-reset"
                onClick={reset}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid #7c3aed',
                  borderRadius: 12,
                  color: '#a78bfa',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'block',
                  marginLeft: 'auto',
                }}
              >
                ← Analyze Another
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
