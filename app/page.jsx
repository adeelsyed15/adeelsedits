'use client'
import { useState, useEffect, useRef } from 'react'

// --- Scroll-triggered reveal hook ---
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect() } },
      { threshold: 0.12, rootMargin: '-40px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, visible]
}

function Reveal({ children, delay = 0, as: Tag = 'div', className = '', style = {}, ...rest }) {
  const [ref, visible] = useReveal()
  return (
    <Tag
      ref={ref}
      className={`${className} reveal ${visible ? 'is-visible' : ''}`}
      style={{ ...style, transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

// --- Timeline Navigation ---
const timelineSections = [
  { id: 'hero', label: 'HERO' },
  { id: 'reel', label: 'REEL' },
  { id: 'proof', label: 'PROOF' },
  { id: 'work', label: 'WORK' },
  { id: 'mindset', label: 'THINK' },
  { id: 'case', label: 'CASE' },
  { id: 'workflow', label: 'STACK' },
  { id: 'about', label: 'BIO' },
  { id: 'contact', label: 'OFFER' },
  { id: 'praise', label: 'PRAISE' },
  { id: 'faq', label: 'FAQ' },
  { id: 'end', label: 'TALK' },
]

function formatTimecode(progress) {
  const totalSeconds = progress * 120
  const mins = Math.floor(totalSeconds / 60)
  const secs = Math.floor(totalSeconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function TimelineNav() {
  const [progress, setProgress] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const trackRef = useRef(null)
  const draggingRef = useRef(false)

  useEffect(() => {
    let raf = null
    const handleScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = null
        const docH = document.documentElement.scrollHeight - window.innerHeight
        const p = docH > 0 ? window.scrollY / docH : 0
        setProgress(Math.max(0, Math.min(1, p)))

        const y = window.scrollY + window.innerHeight * 0.35
        let idx = 0
        for (let i = 0; i < timelineSections.length; i++) {
          const el = document.getElementById(timelineSections[i].id)
          if (el && el.getBoundingClientRect().top + window.scrollY <= y) idx = i
        }
        setActiveIndex(idx)
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const jumpTo = (index) => {
    const el = document.getElementById(timelineSections[index].id)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 130
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  const scrubTo = (clientX) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const docH = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: pct * docH, behavior: 'auto' })
  }

  const startDrag = (e) => {
    if (e.target.closest('button.timeline-clip')) return
    e.preventDefault()
    draggingRef.current = true
    setDragging(true)
    scrubTo(e.clientX)

    const onMove = (ev) => {
      if (!draggingRef.current) return
      scrubTo(ev.clientX)
    }
    const onUp = () => {
      draggingRef.current = false
      setDragging(false)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div className={`timeline-nav ${dragging ? 'is-dragging' : ''}`}>
      <div className="timeline-track" ref={trackRef} onPointerDown={startDrag}>
        {timelineSections.map((s, i) => (
          <button
            key={s.id}
            className={`timeline-clip ${activeIndex === i ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); jumpTo(i) }}
            type="button"
          >
            <span className="clip-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="clip-name">{s.label}</span>
          </button>
        ))}
        <div
          className="timeline-playhead"
          style={{ left: `${progress * 100}%` }}
        />
      </div>
      <div className="timeline-timecode">
        <span className="tc-label">SHOT</span>
        <span className="tc-num">{String(activeIndex + 1).padStart(2, '0')}/{String(timelineSections.length).padStart(2, '0')}</span>
        <span className="tc-sep">·</span>
        <span className="tc-time">{formatTimecode(progress)}</span>
      </div>
    </div>
  )
}

// --- Count-up on scroll into view ---
function CountUp({ end, duration = 1600, format = (v) => v.toFixed(0), start = 0 }) {
  const ref = useRef(null)
  const [val, setVal] = useState(start)
  const [triggered, setTriggered] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !triggered) setTriggered(true)
    }, { threshold: 0.5 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [triggered])
  useEffect(() => {
    if (!triggered) return
    const t0 = performance.now()
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(start + (end - start) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [triggered, end, duration, start])
  return <span ref={ref}>{format(val)}</span>
}

// --- Data ---

const verticals = ['Digital Assets', 'Trading', 'AI Automations', 'EdTech', 'FinTech', 'Wealth']

const proofCards = [
  {
    name: 'Decentralized Masters',
    role: 'In-house · 2023 → Present',
    body: '$1.5M/mo direct-response education company. Lead editor on VSLs, ads, and course revamps. 2nd editor hired; now part of an 8-person team.',
    contact: '[Logo placeholder — swap later]',
    icon: (
      <svg viewBox="0 0 24 24">
        <polygon points="12 2 22 12 12 22 2 12" />
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    name: 'Editing Machine',
    role: 'Senior Editor · 2021 → 2023',
    body: 'UK YouTube post-production studio. Senior editor on documentaries and creator content. Work helped close multiple high-paying creators and drive retention + revenue growth.',
    contact: '[Logo placeholder — swap later]',
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'Jaleed',
    role: 'Freelance · Overflow work',
    body: 'Top-rated Fiverr Direct-Response ad specialist. Trusted overflow editor on premium DR ad campaigns.',
    contact: '[Contact link — add later]',
    icon: (
      <svg viewBox="0 0 24 24">
        <polygon points="12 3 22 20 2 20 12 3" />
      </svg>
    ),
  },
]

const iconPlay = (
  <svg viewBox="0 0 24 24">
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
)
const iconSpark = (
  <svg viewBox="0 0 24 24">
    <path d="M12 2 L14 9 L21 12 L14 15 L12 22 L10 15 L3 12 L10 9 Z" />
  </svg>
)
const iconDoc = (
  <svg viewBox="0 0 24 24">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="7" y1="4" x2="7" y2="20" />
    <line x1="17" y1="4" x2="17" y2="20" />
  </svg>
)

const workTiles = [
  { cat: 'vsl', label: 'VSL', title: 'Become Your Own Bank', status: 'Coming soon', icon: iconPlay },
  { cat: 'vsl', label: 'VSL', title: 'BYOB Indirect', status: 'Coming soon', icon: iconPlay },
  { cat: 'ad', label: 'Ad', title: 'AI-Driven Ad', status: 'Coming soon', icon: iconSpark },
  { cat: 'ad', label: 'Ad', title: 'Ad Batch 321', status: 'Coming soon', icon: iconSpark },
  { cat: 'ad', label: 'Ad', title: 'Ad Batch 322', status: 'Coming soon', icon: iconSpark },
  { cat: 'ad', label: 'Ad', title: 'Stock Training Ad', status: 'Coming soon', icon: iconSpark },
  { cat: 'ad', label: 'Ad', title: 'Ad — Coming', status: 'Coming soon', icon: iconSpark },
  { cat: 'ad', label: 'Ad', title: 'Ad — Coming', status: 'Coming soon', icon: iconSpark },
  { cat: 'documentary', label: 'Documentary', title: 'Documentary — 01', status: 'YouTube · Coming soon', icon: iconDoc },
  { cat: 'documentary', label: 'Documentary', title: 'Documentary — 02', status: 'YouTube · Coming soon', icon: iconDoc },
  { cat: 'documentary', label: 'Documentary', title: 'Documentary — 03', status: 'YouTube · Coming soon', icon: iconDoc },
  { cat: 'documentary', label: 'Documentary', title: 'Documentary — 04', status: 'YouTube · Coming soon', icon: iconDoc },
]

const filters = [
  { key: 'all', label: 'All' },
  { key: 'vsl', label: 'VSLs' },
  { key: 'ad', label: 'Ads' },
  { key: 'course', label: 'Course' },
  { key: 'documentary', label: 'Documentaries' },
]

const faqItems = [
  {
    q: 'What niches do you work in?',
    a: 'Direct Response for high-ticket offers — digital assets, trading, AI automation, EdTech, FinTech, wealth. Nothing outside high-ticket DR.',
  },
  {
    q: "What's your turnaround?",
    a: '2–3 days for a 30–90s ad. 2–3 weeks for a 12-min VSL. Faster with clear briefs.',
  },
  {
    q: 'Do you write scripts?',
    a: 'No — but I sharpen hooks, pacing, and structure. Scripts come from you or your copywriter.',
  },
  {
    q: 'How does the AI workflow actually work?',
    a: 'AI handles the repetitive parts — research, B-roll and animation generation, VO drafts, captions, and a second-opinion review of the final cut through a custom Premiere plugin. I hold the creative direction. See the "How I build" section above.',
  },
  {
    q: 'Can I see more of your work?',
    a: 'The reel and case study cover the main work. Ask for extended samples on the intro call.',
  },
  {
    q: 'Do you offer one-off projects?',
    a: 'No. Retainer only — $3,500/mo minimum. Consistency beats one-off polish for DR work.',
  },
  {
    q: 'Where are you based?',
    a: 'Islamabad, Pakistan. I work globally. Timezone-flexible now, mornings-only long term.',
  },
  {
    q: 'How do we start?',
    a: "Book a 15-min intro. We'll cover fit, scope, and start date. If it's a match, contract in 48h.",
  },
]

const CAL_URL = 'https://cal.com/adeel-abbas-dr/intro'

const BookIntroBtn = ({ style }) => (
  <a
    href={CAL_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="btn-primary"
    style={style}
  >
    Book a 15-min intro →
  </a>
)

// --- Page ---

const mindsetPillars = [
  {
    title: 'Economics-first thinking',
    body: "I understand your unit economics before I open Premiere. CPA, LTV, AOV, break-even ROAS — these are inputs to the edit, not afterthoughts. If the target CPA is $75 and the current control is running at $110, I know the ad has to solve for the difference.",
  },
  {
    title: 'Hooks engineered, not templated',
    body: "Hook rate and hold rate are the only metrics that matter in the first three seconds. I don't chase Reels trends — I engineer hooks against the promise. Every winning creative has a testable thesis, not a \"vibe.\"",
  },
  {
    title: 'Iteration cadence built for testing',
    body: "I ship at ad-cycle speed — 2–3 days per variant. I structure ads in testable batches, not one-offs. I know when the control is about to fatigue and when to angle-shift instead of restart.",
  },
  {
    title: 'Native to Meta + Google workflows',
    body: "Aspect ratios, placement-native cuts, safe zones — deliverables ship ready for Ad Manager, not as cinema cuts your buyer has to re-slice. I read the Meta Ad Library before I cut. Same language as your media buyer.",
  },
]

const vocabRow1 = [
  'ROAS', 'CPA', 'CPM', 'CTR', 'CVR', 'AOV', 'LTV', 'Break-even ROAS',
  'Quality Score', 'Hook Rate', 'Hold Rate', 'Thumb-Stop', 'First-Frame Test',
]
const vocabRow2 = [
  'Meta Ad Library', 'Winning Control', 'Ad Set Structure', 'TOF / MOF / BOF',
  'Retargeting', 'Cold Traffic', 'Frequency Cap', 'Ad Fatigue',
  'Placement-Native', 'Iteration Cadence', 'Creative Testing', 'Angle Testing',
]

const workflowSteps = [
  {
    label: 'Research',
    title: 'Research & hook architecture',
    body: 'Break the offer, the audience, and the funnel. Draft hook variations against the promise, not the format.',
    icon: <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>,
    tools: [
      { name: 'Gemini', bg: 'linear-gradient(135deg, #4285F4, #9B72CB, #EA4335)', markSvg: <svg viewBox="0 0 24 24"><path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"/></svg> },
      { name: 'Claude', bg: '#D97757', markSvg: <svg viewBox="0 0 24 24"><path d="M12 2 v20 M2 12 h20 M5 5 L19 19 M5 19 L19 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg> },
    ],
  },
  {
    label: 'Edit',
    title: 'Edit & pacing',
    body: 'Hand-crafted assembly. Story first, cuts second. No filler. No unearned moments.',
    icon: <svg viewBox="0 0 24 24"><polygon points="12 2 2 8 12 14 22 8 12 2"/><polyline points="2 16 12 22 22 16"/><polyline points="2 12 12 18 22 12"/></svg>,
    tools: [
      { name: 'Premiere Pro', bg: '#2A0634', markText: 'Pr', markColor: '#9999FF' },
      { name: 'After Effects', bg: '#00005B', markText: 'Ae', markColor: '#D291FF' },
    ],
  },
  {
    label: 'B-Rolls',
    title: 'Custom B-Rolls & Animation',
    body: 'Purpose-built B-roll and motion graphics — generated to match the exact story beat and offer tone. Premium animation output at ad-cycle speed.',
    icon: <svg viewBox="0 0 24 24"><path d="M12 3 L14 9 L20 12 L14 15 L12 21 L10 15 L4 12 L10 9 Z"/><circle cx="19" cy="5" r="1.5"/><circle cx="5" cy="19" r="1.5"/></svg>,
    tools: [
      { name: 'Kling / Cdans', bg: '#FF3366', markText: 'K' },
      { name: 'Veo3', bg: '#4285F4', markSvg: <svg viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3" fill="white"/></svg> },
      { name: 'GPT Image', bg: '#10A37F', markText: 'GPT', markFontSize: 8 },
      { name: 'Nano-banana', bg: '#F4C430', markText: 'N', markColor: '#3A2A00' },
      { name: 'Replit', bg: '#F26207', markText: 'R' },
    ],
  },
  {
    label: 'Voice',
    title: 'Voice & captions',
    body: 'Cloned VO for iteration speed. Dynamic subtitles that read like a caption editor wrote them — not a robot.',
    icon: <svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>,
    tools: [
      { name: 'ElevenLabs', bg: '#000000', markText: '11', markFontSize: 8 },
      { name: 'Submagic', bg: 'linear-gradient(135deg, #FF6B6B, #FFA500)', markText: 'S' },
    ],
  },
  {
    label: 'Ship',
    title: 'Review & ship',
    body: "Custom-built Premiere Pro plugin runs Gemini across the finished cut — trained on advanced DR knowledge plus my own experience — and returns a detailed second-opinion review before the video ever leaves my machine. Client review and iterations happen in Frame.io. 2–3 days for a 30–90s ad. 2–3 weeks for a 12-min VSL.",
    icon: <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    tools: [
      { name: 'Gemini (custom plugin)', bg: 'linear-gradient(135deg, #4285F4, #9B72CB, #EA4335)', markSvg: <svg viewBox="0 0 24 24"><path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"/></svg> },
      { name: 'Frame.io', bg: '#00B4E6', markSvg: <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="white" fill="none" strokeWidth="2"/><rect x="8" y="8" width="8" height="8" fill="white"/></svg> },
    ],
  },
]

function BrandTool({ tool }) {
  return (
    <div className="brand-tool">
      <div className="brand-mark" style={{ background: tool.bg }}>
        {tool.markSvg
          ? tool.markSvg
          : <span style={{ color: tool.markColor || 'white', fontWeight: 700, fontSize: tool.markFontSize }}>{tool.markText}</span>}
      </div>
      {tool.name}
    </div>
  )
}

export default function Home() {
  const [filter, setFilter] = useState('all')
  const [openFaq, setOpenFaq] = useState(null)
  const [activePillar, setActivePillar] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

  return (
    <>
      <TimelineNav />

      {/* NAV */}
      <nav>
        <div className="wordmark">Adeel</div>
        <div className="nav-right">
          <div className="nav-links">
            <a href="#reel">Reel</a>
            <a href="#work">Work</a>
            <a href="#workflow">Workflow</a>
            <a href="#about">About</a>
          </div>
          <a href={CAL_URL} target="_blank" rel="noopener noreferrer" className="nav-cta">Book a Call →</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="hero">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/reel.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />
        <div className="hero-inner">
          <div className="availability">
            <span className="dot"></span>
            Available for one retainer client
          </div>
          <h1>
            Direct Response Video Editor for{' '}
            <span className="accent">High-Ticket Offers.</span>
          </h1>
          <p className="sub">
            I cut ads, VSLs, and product videos that move serious money — for the people running premium offers in digital assets, trading, AI automation, EdTech, FinTech, and wealth.
          </p>
          <div className="verticals">
            {verticals.map((v) => (
              <span key={v} className="vertical-chip">{v}</span>
            ))}
          </div>
          <div className="cta-row">
            <BookIntroBtn />
            <a href="#work" className="btn-secondary">See the work ↓</a>
          </div>
        </div>
      </section>

      {/* SHOWREEL */}
      <section className="showreel" id="reel">
        <div className="container">
          <div className="section-label">// The Reel</div>
          <h2 className="section-title">75 seconds.</h2>
          <p className="showreel-sub">
            Direct Response, cinematic pacing, AI-native workflow. A year of work, condensed.
          </p>
          <div className="reel-frame">
            <video
              className="reel-video"
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src="/reel.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="reel-caption">
            Direct Response<span className="sep">·</span>VSL + Ad<span className="sep">·</span>AI-native workflow
          </div>
        </div>
      </section>

      {/* PROOF */}
      <div className="proof" id="proof">
        <div className="container" style={{ padding: 0 }}>
          <div className="proof-metric">
            <CountUp end={1.5} format={(v) => `$${v.toFixed(1)}M`} />/mo ad spend
            <span className="sep">·</span>
            <CountUp end={300} format={(v) => `${Math.round(v)}+`} /> projects
            <span className="sep">·</span>
            <CountUp end={5} format={(v) => `${Math.round(v)}`} /> years
          </div>
          <div className="proof-cards">
            {proofCards.map((c) => (
              <div key={c.name} className="proof-card">
                <div className="proof-icon">{c.icon}</div>
                <div className="proof-name">{c.name}</div>
                <div className="proof-role">{c.role}</div>
                <p>{c.body}</p>
                <div className="proof-contact">
                  <span className="placeholder-tag">{c.contact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WORK */}
      <section id="work">
        <div className="container">
          <div className="section-label">// Selected Work</div>
          <h2 className="section-title">Recent projects.</h2>
          <div className="filter-chips">
            {filters.map((f) => (
              <button
                key={f.key}
                className={`chip ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="work-grid" style={filter === 'course' ? { display: 'none' } : {}}>
            {workTiles.map((t, i) => {
              const show = filter === 'all' || t.cat === filter
              return (
                <div
                  key={i}
                  className="work-tile"
                  data-category={t.cat}
                  style={show ? {} : { display: 'none' }}
                >
                  <div className="tile-header">
                    <div className="tile-category">{t.label}</div>
                    <div className="tile-icon">{t.icon}</div>
                  </div>
                  <div>
                    <div className="tile-title">{t.title}</div>
                    <div className="tile-status">{t.status}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className={`course-showcase ${filter === 'course' ? 'active' : ''}`}>
            <div className="course-card">
              <div className="course-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M2 3 L12 8 L22 3" />
                  <path d="M2 3 L2 17 L12 22 L22 17 L22 3" />
                  <line x1="12" y1="8" x2="12" y2="22" />
                </svg>
              </div>
              <div className="course-tag">DeFi Education · Flagship · Premium Ticket</div>
              <h3>DeFi Accelerator (DA) Program</h3>
              <div className="course-stats">
                <div className="course-stat"><span className="stat-num">4</span><span>iterations shipped — DA 2.0 · 3.2 · 4.2 · 5.0</span></div>
                <div className="course-stat"><span className="stat-num">Lead</span><span>editor on the current DA 5.0 revamp</span></div>
                <div className="course-stat"><span className="stat-num">Premium</span><span>high-ticket flagship curriculum — one of DM's most expensive programs</span></div>
              </div>
              <p>DM's flagship DeFi curriculum. Cut, updated, and revamped across 4 versions over 2+ years — from structure to intros to lesson-level edits. Head of Education: "Special thanks to our masterful video editors — you worked tirelessly."</p>
            </div>
            <div className="course-card">
              <div className="course-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M3 3 v18 h18" />
                  <polyline points="7 15 11 11 14 14 21 7" />
                  <polyline points="17 7 21 7 21 11" />
                </svg>
              </div>
              <div className="course-tag">Stock Market Education · Full Curriculum · Premium</div>
              <h3>Stocks Equity Program</h3>
              <div className="course-stats">
                <div className="course-stat"><span className="stat-num">Full</span><span>program delivered — every phase, every step</span></div>
                <div className="course-stat"><span className="stat-num">Heavy</span><span>use of AI-generated animations across the curriculum</span></div>
                <div className="course-stat"><span className="stat-num">Premium</span><span>comprehensive stocks equity program — top-tier production</span></div>
              </div>
              <p>DM's stock market curriculum, delivered end-to-end. A very comprehensive, premium program with heavy use of AI-generated animations to explain trading concepts, chart mechanics, and portfolio dynamics — production values well above the DM baseline.</p>
              <div className="course-quote">
                "Genuinely surprised — and really happy — with the level of premium animations Adeel produced across this program."
                <small>— Creative Director · Decentralized Masters</small>
              </div>
            </div>
          </div>

          {/* mini CTA */}
          <div className="mini-cta">
            <div className="cta-text">Like the range? Let's see what your funnel needs.</div>
            <BookIntroBtn />
          </div>
        </div>
      </section>

      {/* MARKETER MINDSET */}
      <Reveal as="section" className="marketer-mind" style={{}}>
        <div className="container" id="mindset">
          <div className="section-label">// How I Think</div>
          <h2 className="section-title">
            I think like a <span className="serif-italic">media buyer</span>.
          </h2>
          <p className="mindset-lead">
            Editing for direct response is not decoration. Every cut is a bet on ROAS. Every first frame is a thumb-stop test. If your CPA is running <em>$110 against a $75 target</em>, the ad has to solve for the gap — not just look nice.
          </p>

          <div className="mindset-tabs">
            <div className="mindset-tab-list">
              {mindsetPillars.map((p, i) => (
                <button
                  key={i}
                  className={`mindset-tab ${activePillar === i ? 'active' : ''}`}
                  onClick={() => setActivePillar(i)}
                  onMouseEnter={() => setActivePillar(i)}
                >
                  <span className="mindset-tab-num">0{i + 1}</span>
                  <span className="mindset-tab-title">{p.title}</span>
                </button>
              ))}
            </div>

            <div className="mindset-tab-panel">
              <div className="tab-num-huge">0{activePillar + 1}</div>
              <div className="tab-num-label">Pillar · 0{activePillar + 1} / 04</div>
              <h3 className="tab-panel-title">{mindsetPillars[activePillar].title}</h3>
              <p className="tab-panel-body">{mindsetPillars[activePillar].body}</p>
            </div>
          </div>

          <div className="vocab-panel">
            <div className="vocab-label">Fluent in</div>
            <div className="marquee marquee-left">
              <div className="marquee-track">
                {[...vocabRow1, ...vocabRow1].map((v, i) => (
                  <span key={i} className="vocab-chip">{v}</span>
                ))}
              </div>
            </div>
            <div className="marquee marquee-right">
              <div className="marquee-track marquee-track-reverse">
                {[...vocabRow2, ...vocabRow2].map((v, i) => (
                  <span key={i} className="vocab-chip">{v}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* CASE STUDY */}
      <section className="case-study" id="case">
        <div className="container">
          <div className="section-label">// Case Study</div>
          <h2 className="section-title">Become Your Own Bank.</h2>
          <p className="case-sub">A VSL that's still a core active funnel, 12 months in.</p>
          <div className="case-grid">
            <div className="case-block">
              <h3>Challenge</h3>
              <p>Explain the concept of a self-custodied wallet to a cold audience — in a way that builds trust for a high-ticket education offer.</p>
            </div>
            <div className="case-block">
              <h3>Approach</h3>
              <p>Custom Coinbase wallet visualization, internal footage, hand-built animations for abstract concepts. Storytelling-first pacing.</p>
            </div>
            <div className="case-block">
              <h3>Result</h3>
              <p>Still running as a core funnel 12 months after launch. Praised internally as one of DM's strongest VSLs to date.</p>
            </div>
          </div>
          <div className="pull-quote">
            <div className="q">This is a masterclass. Incredible job.</div>
            <div className="attr">— Tan, CEO · Decentralized Masters</div>
          </div>
        </div>
      </section>

      {/* AI WORKFLOW — SCRUBBER */}
      <Reveal as="section" className="workflow" style={{}}>
        <div className="container" id="workflow">
          <div className="section-label pipeline-label">
            <span className="pulse-dot"></span>
            // AI PIPELINE · LIVE
          </div>
          <h2 className="section-title">How I build.</h2>

          <div className="scrubber">
            <div className="scrubber-nav" style={{ '--active-i': activeStep }}>
              <div className="scrubber-track">
                <div
                  className="scrubber-indicator"
                  style={{ top: `calc(${activeStep} * (100% / ${workflowSteps.length}))` }}
                />
              </div>
              {workflowSteps.map((s, i) => (
                <button
                  key={i}
                  className={`scrubber-step ${activeStep === i ? 'active' : ''}`}
                  onClick={() => setActiveStep(i)}
                  onMouseEnter={() => setActiveStep(i)}
                >
                  <span className="scrubber-num">0{i + 1}</span>
                  <span className="scrubber-label">{s.label}</span>
                </button>
              ))}
            </div>

            <div className="scrubber-panel" key={activeStep}>
              <div className="scrubber-panel-header">
                <div className="scrubber-panel-icon">{workflowSteps[activeStep].icon}</div>
                <div>
                  <div className="scrubber-panel-num">STEP · 0{activeStep + 1} / 0{workflowSteps.length}</div>
                  <h3 className="scrubber-panel-title">{workflowSteps[activeStep].title}</h3>
                </div>
              </div>
              <p className="scrubber-panel-body">{workflowSteps[activeStep].body}</p>
              <div className="brand-tools">
                {workflowSteps[activeStep].tools.map((t, i) => (
                  <BrandTool key={i} tool={t} />
                ))}
              </div>
            </div>
          </div>

          <div className="workflow-tagline">"AI doesn't replace editors. It replaces the editors who don't use AI."</div>

          <div className="mini-cta">
            <div className="cta-text">Want this pipeline running on your ads?</div>
            <BookIntroBtn />
          </div>
        </div>
      </Reveal>

      {/* ABOUT */}
      <section id="about">
        <div className="container">
          <div className="section-label">// About</div>
          <div className="about-grid">
            <div className="about-photo">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 22 c0-4 4-7 8-7 s8 3 8 7" /></svg>
              <span>Photo placeholder</span>
            </div>
            <div className="about-text">
              <p>I'm Adeel — a Direct Response video editor based in Islamabad, working with high-ticket offers globally.</p>
              <p>Started as a debate kid. Learned that a good argument has three acts. Applied it to video. Spent two years as a Senior Editor at Editing Machine in the UK — cutting documentaries and creator content that helped the studio land and retain premium creators.</p>
              <p>For the last 2.5 years I've been in-house at Decentralized Masters — a $1.5M/mo direct-response education company — cutting the VSLs and ads that drive their funnel. I cut the "Become Your Own Bank" VSL. It's still one of their core active funnels.</p>
              <p>Now I work with a short list of high-ticket brands in digital assets, trading, AI automation, EdTech, FinTech, and wealth. One retainer at a time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="contact">
        <div className="container services">
          <div className="section-label">// Services</div>
          <h2 className="section-title">One retainer client at a time.</h2>
          <div className="service-card">
            <div className="service-label">Monthly Retainer</div>
            <div className="service-price">From $3,500<small>&nbsp;/month</small></div>
            <ul className="service-scope">
              <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Up to N ad edits per month (30–90s each)</li>
              <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>OR one long-form VSL (up to 12 min) + supporting cuts</li>
              <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Full AI-augmented workflow (captions, VO, B-roll, animation)</li>
              <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Custom-plugin second-opinion review before delivery</li>
              <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Dedicated Slack/Discord channel · 24h response</li>
              <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Frame.io for client review + iterations</li>
              <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Testimonial + case-study rights after 60 days</li>
            </ul>
            <BookIntroBtn style={{ marginTop: 8 }} />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="praise">
        <div className="container">
          <div className="section-label">// What people say</div>
          <h2 className="section-title">The receipts.</h2>
          <div className="testimonials-grid">
            {[
              { name: 'Editing Machine CEO', role: 'Video post-production studio' },
              { name: 'DM Manager', role: 'Decentralized Masters' },
              { name: 'Jaleed', role: 'Top-rated Fiverr Ads Editor' },
            ].map((t) => (
              <div key={t.name} className="testimonial">
                <div className="testimonial-quote-icon">"</div>
                <div>
                  <div className="pending-tag">Pending</div>
                  <div className="testimonial-quote">Video testimonial in the works.</div>
                </div>
                <div className="testimonial-attribution">
                  <div className="avatar-placeholder">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 22 c0-4 4-7 8-7 s8 3 8 7" /></svg>
                  </div>
                  <div>
                    <div className="attr-name">{t.name}</div>
                    <div className="attr-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mini-cta">
            <div className="cta-text">Want to hear it from someone whose funnel I cut?</div>
            <BookIntroBtn />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="container">
          <div className="section-label">// FAQ</div>
          <h2 className="section-title">The usual questions.</h2>
          {faqItems.map((item, i) => (
            <div
              key={i}
              className={`faq-item ${openFaq === i ? 'open' : ''}`}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="faq-q">
                <span>{item.q}</span>
                <span className="plus">+</span>
              </div>
              <div className="faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <div className="final-cta" id="end">
        <h2>
          If you're running high-ticket DR and need an editor who can keep up, <em>let's talk.</em>
        </h2>
        <a href={CAL_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">Book a 15-min intro →</a>
        <span className="email">
          or email <a href="mailto:hello@adeelsedits.com">hello@adeelsedits.com</a>
        </span>
      </div>

      {/* FOOTER */}
      <footer>
        <div>Adeel · adeelsedits.com</div>
        <div className="foot-links">
          <a href="mailto:hello@adeelsedits.com">hello@adeelsedits.com</a>
          <a href="#">LinkedIn</a>
        </div>
        <div>© 2026 · Built with obsession</div>
      </footer>
    </>
  )
}
