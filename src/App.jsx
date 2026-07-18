import { useEffect, useMemo, useState } from 'react'
import data from './data.json'

const cases = data.cases

const INDUSTRY_ICONS = {
  'Fintech & Banking': '🏦',
  'E-commerce & Creator Economy': '🛍️',
  'Legal Tech': '⚖️',
  'Health & Life Sciences': '🧬',
  'AI & Developer Tools': '🤖',
  'Web3 & Blockchain': '⛓️',
  'IT Services & Consulting': '🧩',
  'Insurance': '🛡️',
  'Automotive': '🚗',
  'Compliance & Risk Services': '📋',
}

function countBy(list, getKeys) {
  const map = new Map()
  for (const c of list) {
    for (const k of [].concat(getKeys(c))) {
      map.set(k, (map.get(k) || 0) + 1)
    }
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash.replace(/^#\/?/, '')
}

export default function App() {
  const route = useHashRoute()
  const slug = route.startsWith('case/') ? route.slice(5) : null
  const detail = slug ? cases.find((c) => c.slug === slug) : null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route])

  return (
    <div className="app">
      <header className="topbar">
        <a href="#/" className="brand">
          <img className="brand-logo" src="mascot.png" alt="Devin the otter" />
          Devin Case Studies
        </a>
        <a
          className="source-link"
          href="https://devin.ai/customers"
          target="_blank"
          rel="noreferrer"
        >
          source: devin.ai/customers ↗
        </a>
      </header>
      {detail ? <Detail c={detail} /> : <Explorer />}
      <footer className="footer">
        <img src="mascot.png" alt="" />
        Data extracted from public case studies at devin.ai/customers.
      </footer>
    </div>
  )
}

function Explorer() {
  const [useCase, setUseCase] = useState(null)
  const [industry, setIndustry] = useState(null)
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () =>
      cases.filter(
        (c) =>
          (!useCase || c.useCases.includes(useCase)) &&
          (!industry || c.industry === industry) &&
          (!query ||
            (c.company + ' ' + c.title + ' ' + c.summary)
              .toLowerCase()
              .includes(query.toLowerCase())),
      ),
    [useCase, industry, query],
  )

  const useCaseCounts = countBy(cases, (c) => c.useCases)
  const industryCounts = countBy(cases, (c) => c.industry)
  const anyFilter = useCase || industry || query

  return (
    <main>
      <section className="hero">
        <div className="hero-mascot-wrap">
          <img
            className="hero-mascot"
            src="mascot.png"
            alt="Devin the otter mascot"
          />
          <span className="hero-badge">hi, I'm Devin!</span>
        </div>
        <div className="hero-copy">
          <h1>
            How teams use <em>Devin</em> in production
          </h1>
          <p className="hero-sub">
            {cases.length} customer case studies, organized by use case and company
            type. Pick a lens below to drill down into the actual stories.
          </p>
          <div className="stats">
            <Stat value={cases.length} label="case studies" />
            <Stat value={industryCounts.length} label="industries" />
            <Stat value={useCaseCounts.length} label="use-case categories" />
            <Stat
              value={cases.reduce((n, c) => n + c.quotes.length, 0)}
              label="customer quotes"
            />
          </div>
        </div>
      </section>

      <div className="facet-columns">
        <FacetBars
          title="By use case"
          counts={useCaseCounts}
          selected={useCase}
          onSelect={(name) => setUseCase(useCase === name ? null : name)}
          limit={5}
        />

        <FacetBars
          title="By industry"
          counts={industryCounts}
          selected={industry}
          onSelect={(name) => setIndustry(industry === name ? null : name)}
          getLabel={(name) => `${INDUSTRY_ICONS[name] || ''} ${name}`}
          limit={5}
        />
      </div>

      <section className="results">
        <div className="results-bar">
          <input
            className="search"
            placeholder="Search companies, stories…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="results-count">
            {filtered.length} of {cases.length} case studies
          </span>
          {anyFilter && (
            <button
              className="clear-btn"
              onClick={() => {
                setUseCase(null)
                setIndustry(null)
                setSize(null)
                setQuery('')
              }}
            >
              Clear filters ✕
            </button>
          )}
        </div>
        <div className="grid">
          {filtered.map((c) => (
            <Card key={c.slug} c={c} />
          ))}
          {filtered.length === 0 && (
            <div className="empty">
              <img src="mascot.png" alt="" />
              <span>Devin couldn't find a match — try clearing some filters.</span>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function Stat({ value, label }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function FacetBars({ title, counts, selected, onSelect, getLabel, limit }) {
  const [expanded, setExpanded] = useState(false)
  const max = counts.length ? counts[0][1] : 1
  const visible =
    limit && !expanded
      ? counts.filter(([name], i) => i < limit || name === selected)
      : counts
  const hidden = counts.length - visible.length
  return (
    <section className="facet">
      <h2>{title}</h2>
      <div className="bars">
        {visible.map(([name, n]) => (
          <button
            key={name}
            className={`bar-row${selected === name ? ' active' : ''}`}
            onClick={() => onSelect(name)}
          >
            <span className="bar-label">{getLabel ? getLabel(name) : name}</span>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${(n / max) * 100}%` }} />
            </span>
            <span className="bar-count">{n}</span>
          </button>
        ))}
      </div>
      {limit && (hidden > 0 || expanded) && (
        <button className="bars-toggle" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'show less ▲' : `+${hidden} more ▼`}
        </button>
      )}
    </section>
  )
}

function Card({ c }) {
  const headline = c.metrics[0]
  return (
    <a className="card" href={`#/case/${c.slug}`}>
      <div className="card-top">
        <span className="card-icon">{INDUSTRY_ICONS[c.industry] || '🏢'}</span>
        <div>
          <div className="card-company">{c.company}</div>
          <div className="card-meta">
            {c.industry} · {c.companySize} · {c.region}
          </div>
        </div>
      </div>
      {headline && (
        <div className="card-metric">
          <span className="card-metric-value">{headline.value}</span>
          <span className="card-metric-label">{headline.label}</span>
        </div>
      )}
      <p className="card-summary">{c.summary}</p>
      <div className="card-tags">
        {c.useCases.slice(0, 3).map((u) => (
          <span key={u} className="tag">
            {u}
          </span>
        ))}
        {c.useCases.length > 3 && (
          <span className="tag more">+{c.useCases.length - 3}</span>
        )}
      </div>
    </a>
  )
}

function Detail({ c }) {
  return (
    <main className="detail">
      <a className="back" href="#/">
        ← All case studies
      </a>
      <div className="detail-head">
        <span className="detail-icon">{INDUSTRY_ICONS[c.industry] || '🏢'}</span>
        <div>
          <h1>{c.company}</h1>
          <div className="card-meta">
            {c.industry} · {c.companySize} · {c.region}
          </div>
        </div>
      </div>
      <h2 className="detail-title">{c.title}</h2>
      <p className="detail-about">{c.about}</p>
      <div className="card-tags detail-tags">
        {c.useCases.map((u) => (
          <span key={u} className="tag">
            {u}
          </span>
        ))}
      </div>

      <div className="metric-grid">
        {c.metrics.map((m) => (
          <div key={m.label} className="metric-box">
            <div className="metric-value">{m.value}</div>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>

      {c.quotes.length > 0 && (
        <blockquote className="lead-quote">
          “{c.quotes[0].text}”
          {c.quotes[0].attribution && <cite>— {c.quotes[0].attribution}</cite>}
        </blockquote>
      )}

      <article className="story">
        {c.sections.map((s, i) => (
          <section key={i}>
            {s.heading && <h3>{s.heading}</h3>}
            {s.paragraphs.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </section>
        ))}
      </article>

      {c.quotes.length > 1 && (
        <section className="quotes">
          <h3>Quotes</h3>
          {c.quotes.slice(1).map((q, i) => (
            <blockquote key={i}>
              “{q.text}”{q.attribution && <cite>— {q.attribution}</cite>}
            </blockquote>
          ))}
        </section>
      )}

      <a className="orig-link" href={c.url} target="_blank" rel="noreferrer">
        Read the original case study ↗
      </a>
    </main>
  )
}
