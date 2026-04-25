import { useState, useRef } from 'react'

// ── helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

// ── sub-components ────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{
        width: 48,
        height: 48,
        border: '3px solid #2a2a2a',
        borderTopColor: '#6366f1',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
        margin: '0 auto 22px',
      }} />
      <p style={{ color: '#f1f1f1', fontSize: 15, fontWeight: 500, margin: '0 0 6px' }}>
        Analyzing your resume…
      </p>
      <p style={{ color: '#888888', fontSize: 13, margin: 0 }}>
        This usually takes 3–10 seconds
      </p>
    </div>
  )
}

function ScoreCard({ score }) {
  const color = scoreColor(score)
  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: 16,
      padding: '32px 28px',
      textAlign: 'center',
      minWidth: 152,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <div style={{
        fontSize: 72,
        fontWeight: 700,
        color,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {score}
      </div>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        color: '#888888',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginTop: 10,
        marginBottom: 18,
      }}>
        Match
      </div>
      <div style={{
        width: '100%',
        height: 5,
        background: '#2a2a2a',
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          background: color,
          borderRadius: 3,
        }} />
      </div>
    </div>
  )
}

function MissingKeywords({ keywords }) {
  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: 16,
      padding: '28px',
      flex: 1,
    }}>
      <p style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#888888',
        margin: '0 0 14px',
      }}>
        Missing Keywords
      </p>
      {keywords.length === 0 ? (
        <p style={{ color: '#22c55e', fontSize: 14, margin: 0 }}>
          ✓ Great coverage — no missing keywords found.
        </p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {keywords.map((kw, i) => (
            <span key={i} style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.28)',
              color: '#a5b4fc',
              borderRadius: 6,
              padding: '4px 12px',
              fontSize: 13,
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

function SuggestionCard({ s, index }) {
  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: 16,
      padding: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{
          width: 26,
          height: 26,
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.28)',
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: '#a5b4fc',
          flexShrink: 0,
        }}>
          {index + 1}
        </div>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#888888',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          Bullet Improvement
        </span>
      </div>

      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ef4444', opacity: 0.85, margin: '0 0 7px' }}>
          Before
        </p>
        <div style={{
          background: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.18)',
          borderRadius: 9,
          padding: '12px 14px',
          fontSize: 14,
          color: '#fca5a5',
          lineHeight: 1.65,
        }}>
          {s.original}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#22c55e', opacity: 0.85, margin: '0 0 7px' }}>
          After
        </p>
        <div style={{
          background: 'rgba(34,197,94,0.07)',
          border: '1px solid rgba(34,197,94,0.18)',
          borderRadius: 9,
          padding: '12px 14px',
          fontSize: 14,
          color: '#86efac',
          lineHeight: 1.65,
        }}>
          {s.improved}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888888', margin: '0 0 7px' }}>
          Why
        </p>
        <p style={{ fontSize: 13, color: '#888888', lineHeight: 1.65, margin: 0 }}>
          {s.reason}
        </p>
      </div>
    </div>
  )
}

// ── main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase] = useState('input') // 'input' | 'loading' | 'results'
  const [file, setFile]   = useState(null)
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
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #0f0f0f; }
        #root { all: unset; display: block; }
        textarea { font-family: inherit; }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        textarea:focus    { outline: none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; }
        .btn-primary      { transition: opacity 0.15s, transform 0.15s; }
        .btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-ghost        { transition: border-color 0.15s, color 0.15s; }
        .btn-ghost:hover  { border-color: #6366f1 !important; color: #a5b4fc !important; }
        .drop-zone        { transition: border-color 0.2s, background 0.2s; }
        .drop-zone:hover  { border-color: #6366f1 !important; }
        ::placeholder     { color: #444; }
        ::-webkit-scrollbar       { width: 5px; }
        ::-webkit-scrollbar-track { background: #1a1a1a; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0f0f0f', padding: '52px 20px 96px', color: '#f1f1f1' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* ── Header ── */}
          <header style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 38,
                height: 38,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: 11,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 19,
                flexShrink: 0,
              }}>
                ⚡
              </div>
              <h1 style={{
                margin: 0,
                fontSize: 30,
                fontWeight: 700,
                color: '#f1f1f1',
                letterSpacing: '-0.025em',
                lineHeight: 1,
              }}>
                Resume Matcher
              </h1>
            </div>
            <p style={{ color: '#888888', fontSize: 15, lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
              Upload your resume and paste a job description to get an AI‑powered match score and tailored rewrite suggestions.
            </p>
          </header>

          {/* ── Input phase ── */}
          {phase === 'input' && (
            <div style={{ animation: 'fadeUp 0.3s ease both' }}>

              {/* Error banner */}
              {error && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  marginBottom: 20,
                }}>
                  <span style={{ color: '#ef4444', fontSize: 16, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>⚠</span>
                  <p style={{ color: '#fca5a5', fontSize: 14, lineHeight: 1.5, flex: 1, margin: 0 }}>{error}</p>
                  <button
                    onClick={() => setError(null)}
                    style={{ background: 'none', border: 'none', color: '#888888', fontSize: 20, lineHeight: 1, cursor: 'pointer', padding: 0, flexShrink: 0 }}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Two-column inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

                {/* PDF drop zone */}
                <div
                  className="drop-zone"
                  onClick={() => fileRef.current.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  style={{
                    background: dragOver ? 'rgba(99,102,241,0.06)' : '#1a1a1a',
                    border: `2px dashed ${dragOver ? '#6366f1' : file ? '#22c55e' : '#2a2a2a'}`,
                    borderRadius: 16,
                    padding: '44px 24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: 'none' }}
                    onChange={e => setFile(e.target.files[0] ?? null)}
                  />
                  <div style={{ fontSize: 38, lineHeight: 1, marginBottom: 12 }}>
                    {file ? '📄' : '⬆️'}
                  </div>
                  {file ? (
                    <>
                      <p style={{ color: '#22c55e', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>{file.name}</p>
                      <p style={{ color: '#888888', fontSize: 13, margin: 0 }}>{(file.size / 1024).toFixed(0)} KB · click to replace</p>
                    </>
                  ) : (
                    <>
                      <p style={{ color: '#f1f1f1', fontWeight: 600, fontSize: 14, margin: '0 0 5px' }}>Drop your resume here</p>
                      <p style={{ color: '#888888', fontSize: 13, margin: 0 }}>or click to browse · PDF only</p>
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
                      background: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                      borderRadius: 16,
                      padding: '18px',
                      color: '#f1f1f1',
                      fontSize: 14,
                      lineHeight: 1.65,
                      resize: 'none',
                      minHeight: 200,
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                  />
                  <p style={{ color: '#555', fontSize: 12, marginTop: 7, textAlign: 'right' }}>
                    {jobDesc.length > 0 ? `${jobDesc.length.toLocaleString()} chars` : 'No text yet'}
                  </p>
                </div>
              </div>

              {/* Analyze button */}
              <button
                className="btn-primary"
                onClick={runAnalysis}
                disabled={!ready}
                style={{
                  width: '100%',
                  padding: '15px 24px',
                  background: ready ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#1e1e1e',
                  border: ready ? 'none' : '1px solid #2a2a2a',
                  borderRadius: 12,
                  color: ready ? '#fff' : '#555',
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                  cursor: ready ? 'pointer' : 'not-allowed',
                }}
              >
                {ready ? 'Analyze Resume →' : 'Add a PDF and job description to continue'}
              </button>
            </div>
          )}

          {/* ── Loading phase ── */}
          {phase === 'loading' && (
            <div style={{ animation: 'fadeUp 0.3s ease both' }}>
              <Spinner />
            </div>
          )}

          {/* ── Results phase ── */}
          {phase === 'results' && result && (
            <div style={{ animation: 'fadeUp 0.4s ease both' }}>

              {/* Score + keywords row */}
              <div style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'stretch' }}>
                <ScoreCard score={result.match_score} />
                <MissingKeywords keywords={result.missing_keywords} />
              </div>

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <h2 style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#f1f1f1',
                      letterSpacing: '-0.01em',
                    }}>
                      Bullet Improvements
                    </h2>
                    <span style={{
                      background: 'rgba(99,102,241,0.12)',
                      border: '1px solid rgba(99,102,241,0.28)',
                      color: '#a5b4fc',
                      borderRadius: 20,
                      padding: '2px 9px',
                      fontSize: 12,
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

              <button
                className="btn-ghost"
                onClick={reset}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: 'transparent',
                  border: '1px solid #2a2a2a',
                  borderRadius: 12,
                  color: '#888888',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                ← Analyze another resume
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
