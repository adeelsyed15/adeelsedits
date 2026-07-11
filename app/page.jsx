'use client'
import { useState } from 'react'

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

export default function Home() {
  const [filter, setFilter] = useState('all')
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <>
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
      <section className="hero">
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
      <div className="proof">
        <div className="container" style={{ padding: 0 }}>
          <div className="proof-metric">
            $1.5M/mo ad spend<span className="sep">·</span>300+ projects<span className="sep">·</span>5 years
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
      <section className="marketer-mind" id="mindset">
        <div className="container">
          <div className="section-label">// How I Think</div>
          <h2 className="section-title">I think like a media buyer.</h2>
          <p className="mindset-lead">
            Editing for direct response is not decoration. Every cut is a bet on ROAS. Every first frame is a thumb-stop test. If your CPA is running $110 against a $75 target, the ad has to solve for the gap — not just look nice.
          </p>

          <div className="mindset-pillars">
            <div className="pillar">
              <div className="pillar-num">01</div>
              <h3>Economics-first thinking</h3>
              <p>
                I understand your unit economics before I open Premiere. CPA, LTV, AOV, break-even ROAS — these are inputs to the edit, not afterthoughts. If the target CPA is $75 and the current control is running at $110, I know the ad has to solve for the difference.
              </p>
            </div>

            <div className="pillar">
              <div className="pillar-num">02</div>
              <h3>Hooks engineered, not templated</h3>
              <p>
                Hook rate and hold rate are the only metrics that matter in the first three seconds. I don't chase Reels trends — I engineer hooks against the promise. Every winning creative has a testable thesis, not a "vibe."
              </p>
            </div>

            <div className="pillar">
              <div className="pillar-num">03</div>
              <h3>Iteration cadence built for testing</h3>
              <p>
                I ship at ad-cycle speed — 2–3 days per variant. I structure ads in testable batches, not one-offs. I know when the control is about to fatigue and when to angle-shift instead of restart.
              </p>
            </div>

            <div className="pillar">
              <div className="pillar-num">04</div>
              <h3>Native to Meta + Google workflows</h3>
              <p>
                Aspect ratios, placement-native cuts, safe zones — deliverables ship ready for Ad Manager, not as cinema cuts your buyer has to re-slice. I read the Meta Ad Library before I cut. Same language as your media buyer.
              </p>
            </div>
          </div>

          <div className="vocab-panel">
            <div className="vocab-label">Fluent in</div>
            <div className="vocab-grid">
              <span className="vocab-chip">ROAS</span>
              <span className="vocab-chip">CPA</span>
              <span className="vocab-chip">CPM</span>
              <span className="vocab-chip">CTR</span>
              <span className="vocab-chip">CVR</span>
              <span className="vocab-chip">AOV</span>
              <span className="vocab-chip">LTV</span>
              <span className="vocab-chip">Break-even ROAS</span>
              <span className="vocab-chip">Quality Score</span>
              <span className="vocab-sep"></span>
              <span className="vocab-chip">Hook Rate</span>
              <span className="vocab-chip">Hold Rate</span>
              <span className="vocab-chip">Thumb-Stop</span>
              <span className="vocab-chip">First-Frame Test</span>
              <span className="vocab-sep"></span>
              <span className="vocab-chip">Meta Ad Library</span>
              <span className="vocab-chip">Winning Control</span>
              <span className="vocab-chip">Ad Set Structure</span>
              <span className="vocab-chip">TOF / MOF / BOF</span>
              <span className="vocab-chip">Retargeting</span>
              <span className="vocab-chip">Cold Traffic</span>
              <span className="vocab-chip">Frequency Cap</span>
              <span className="vocab-chip">Ad Fatigue</span>
              <span className="vocab-chip">Placement-Native</span>
              <span className="vocab-sep"></span>
              <span className="vocab-chip">Iteration Cadence</span>
              <span className="vocab-chip">Creative Testing</span>
              <span className="vocab-chip">Angle Testing</span>
            </div>
          </div>
        </div>
      </section>

      {/* CASE STUDY */}
      <section className="case-study">
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

      {/* AI WORKFLOW */}
      <section className="workflow" id="workflow">
        <div className="container">
          <div className="section-label pipeline-label">
            <span className="pulse-dot"></span>
            // AI PIPELINE · LIVE
          </div>
          <h2 className="section-title">How I build.</h2>

          <div className="ai-pipeline-viz">
            <span className="pipe-stage"><span className="stage-num">01</span> Research</span>
            <span className="pipe-arrow">→</span>
            <span className="pipe-stage"><span className="stage-num">02</span> Edit</span>
            <span className="pipe-arrow">→</span>
            <span className="pipe-stage"><span className="stage-num">03</span> B-roll + Animation</span>
            <span className="pipe-arrow">→</span>
            <span className="pipe-stage"><span className="stage-num">04</span> Voice + Captions</span>
            <span className="pipe-arrow">→</span>
            <span className="pipe-stage"><span className="stage-num">05</span> Review + Ship</span>
          </div>

          <div className="steps-wrapper">
            <div className="steps-connector"></div>

            <div className="step">
              <div className="step-icon">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
              </div>
              <div className="step-num">STEP · 01</div>
              <div className="step-body">
                <h3>Research & hook architecture</h3>
                <p>Break the offer, the audience, and the funnel. Draft hook variations against the promise, not the format.</p>
                <div className="brand-tools">
                  <div className="brand-tool"><div className="brand-mark" style={{ background: 'linear-gradient(135deg, #4285F4, #9B72CB, #EA4335)' }}><svg viewBox="0 0 24 24"><path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" /></svg></div>Gemini</div>
                  <div className="brand-tool"><div className="brand-mark" style={{ background: '#D97757' }}><svg viewBox="0 0 24 24"><path d="M12 2 v20 M2 12 h20 M5 5 L19 19 M5 19 L19 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" /></svg></div>Claude</div>
                </div>
              </div>
            </div>

            <div className="step">
              <div className="step-icon">
                <svg viewBox="0 0 24 24"><polygon points="12 2 2 8 12 14 22 8 12 2" /><polyline points="2 16 12 22 22 16" /><polyline points="2 12 12 18 22 12" /></svg>
              </div>
              <div className="step-num">STEP · 02</div>
              <div className="step-body">
                <h3>Edit & pacing</h3>
                <p>Hand-crafted assembly. Story first, cuts second. No filler. No unearned moments.</p>
                <div className="brand-tools">
                  <div className="brand-tool"><div className="brand-mark" style={{ background: '#2A0634' }}><span style={{ color: '#9999FF', fontWeight: 700 }}>Pr</span></div>Premiere Pro</div>
                  <div className="brand-tool"><div className="brand-mark" style={{ background: '#00005B' }}><span style={{ color: '#D291FF', fontWeight: 700 }}>Ae</span></div>After Effects</div>
                </div>
              </div>
            </div>

            <div className="step">
              <div className="step-icon">
                <svg viewBox="0 0 24 24"><path d="M12 3 L14 9 L20 12 L14 15 L12 21 L10 15 L4 12 L10 9 Z" /><circle cx="19" cy="5" r="1.5" /><circle cx="5" cy="19" r="1.5" /></svg>
              </div>
              <div className="step-num">STEP · 03</div>
              <div className="step-body">
                <h3>Custom B-Rolls & Animation</h3>
                <p>Purpose-built B-roll and motion graphics — generated to match the exact story beat and offer tone. Premium animation output at ad-cycle speed.</p>
                <div className="brand-tools">
                  <div className="brand-tool"><div className="brand-mark" style={{ background: '#FF3366' }}><span style={{ color: 'white', fontWeight: 700 }}>K</span></div>Kling / Cdans</div>
                  <div className="brand-tool"><div className="brand-mark" style={{ background: '#4285F4' }}><svg viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3" fill="white" /></svg></div>Veo3</div>
                  <div className="brand-tool"><div className="brand-mark" style={{ background: '#10A37F' }}><span style={{ color: 'white', fontWeight: 700, fontSize: 8 }}>GPT</span></div>GPT Image</div>
                  <div className="brand-tool"><div className="brand-mark" style={{ background: '#F4C430' }}><span style={{ color: '#3A2A00', fontWeight: 700 }}>N</span></div>Nano-banana</div>
                  <div className="brand-tool"><div className="brand-mark" style={{ background: '#F26207' }}><span style={{ color: 'white', fontWeight: 700 }}>R</span></div>Replit</div>
                </div>
              </div>
            </div>

            <div className="step">
              <div className="step-icon">
                <svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="8" y1="22" x2="16" y2="22" /></svg>
              </div>
              <div className="step-num">STEP · 04</div>
              <div className="step-body">
                <h3>Voice & captions</h3>
                <p>Cloned VO for iteration speed. Dynamic subtitles that read like a caption editor wrote them — not a robot.</p>
                <div className="brand-tools">
                  <div className="brand-tool"><div className="brand-mark" style={{ background: '#000000' }}><span style={{ color: 'white', fontWeight: 700, fontSize: 8 }}>11</span></div>ElevenLabs</div>
                  <div className="brand-tool"><div className="brand-mark" style={{ background: 'linear-gradient(135deg, #FF6B6B, #FFA500)' }}><span style={{ color: 'white', fontWeight: 700 }}>S</span></div>Submagic</div>
                </div>
              </div>
            </div>

            <div className="step">
              <div className="step-icon">
                <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </div>
              <div className="step-num">STEP · 05</div>
              <div className="step-body">
                <h3>Review & ship</h3>
                <p>Custom-built Premiere Pro plugin runs Gemini across the finished cut — trained on advanced DR knowledge plus my own experience — and returns a detailed second-opinion review before the video ever leaves my machine. Client review and iterations happen in Frame.io. 2–3 days for a 30–90s ad. 2–3 weeks for a 12-min VSL.</p>
                <div className="brand-tools">
                  <div className="brand-tool"><div className="brand-mark" style={{ background: 'linear-gradient(135deg, #4285F4, #9B72CB, #EA4335)' }}><svg viewBox="0 0 24 24"><path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" /></svg></div>Gemini (custom plugin)</div>
                  <div className="brand-tool"><div className="brand-mark" style={{ background: '#00B4E6' }}><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="white" fill="none" strokeWidth="2" /><rect x="8" y="8" width="8" height="8" fill="white" /></svg></div>Frame.io</div>
                </div>
              </div>
            </div>
          </div>

          <div className="workflow-tagline">"AI doesn't replace editors. It replaces the editors who don't use AI."</div>

          <div className="mini-cta">
            <div className="cta-text">Want this pipeline running on your ads?</div>
            <BookIntroBtn />
          </div>
        </div>
      </section>

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
      <section>
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
      <section>
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
      <div className="final-cta">
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
