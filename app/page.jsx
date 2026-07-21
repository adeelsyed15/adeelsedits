'use client'
import { useState, useEffect, useRef } from 'react'

// --- Scroll-triggered reveal hook (re-fires every entry into view) ---
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.12, rootMargin: '-80px 0px -20% 0px' }
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

// --- Custom Editorial Cursor ---
function CustomCursor() {
  const cursorRef = useRef(null)
  const [state, setState] = useState('default')
  const [pressed, setPressed] = useState(false)
  const videoPlayingRef = useRef(false)

  useEffect(() => {
    document.body.classList.add('has-custom-cursor')

    // Track reel video play state — also flip cursor icon immediately when video toggles
    const videos = Array.from(document.querySelectorAll('.reel-video'))
    const onPlay = () => {
      videoPlayingRef.current = true
      setState((prev) => (prev === 'video-play' || prev === 'video-pause') ? 'video-pause' : prev)
    }
    const onPause = () => {
      videoPlayingRef.current = false
      setState((prev) => (prev === 'video-play' || prev === 'video-pause') ? 'video-play' : prev)
    }
    videos.forEach((v) => {
      if (!v.paused) videoPlayingRef.current = true
      v.addEventListener('play', onPlay)
      v.addEventListener('pause', onPause)
    })

    let raf = null
    let mx = 0, my = 0
    let cx = 0, cy = 0
    let initialized = false

    const handleMove = (e) => {
      mx = e.clientX
      my = e.clientY
      if (!initialized) { cx = mx; cy = my; initialized = true }

      const t = e.target
      let s = 'default'

      // Video first — highest priority when inside the reel frame
      const reelFrame = t.closest('.reel-frame')
      if (reelFrame) {
        const video = reelFrame.querySelector('video')
        if (video) {
          const rect = video.getBoundingClientRect()
          // Bottom ~46px = native controls strip
          const controlsTop = rect.bottom - 46
          if (e.clientY > controlsTop) {
            s = 'video-controls'
          } else {
            s = videoPlayingRef.current ? 'video-pause' : 'video-play'
          }
        }
      }
      else if (t.closest('.btn-primary, .tl-cta, .nav-cta')) s = 'cta'
      else if (t.closest('h1, h2.section-title, .section-title')) s = 'razor'
      else if (t.closest('button, a, .work-tile, .proof-card, .career-milestone, .mindset-tab, .scrubber-step, .faq-item, .chip, .timeline-clip')) s = 'interactive'
      else if (t.closest('input, textarea, [contenteditable]')) s = 'text'
      setState((prev) => (prev === s ? prev : s))
    }
    const handleDown = () => setPressed(true)
    const handleUp = () => setPressed(false)
    const handleLeave = () => { if (cursorRef.current) cursorRef.current.style.opacity = '0' }
    const handleEnter = () => { if (cursorRef.current) cursorRef.current.style.opacity = '1' }

    const animate = () => {
      cx += (mx - cx) * 0.22
      cy += (my - cy) * 0.22
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`
      }
      raf = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    window.addEventListener('mousedown', handleDown)
    window.addEventListener('mouseup', handleUp)
    document.addEventListener('mouseleave', handleLeave)
    document.addEventListener('mouseenter', handleEnter)
    raf = requestAnimationFrame(animate)

    return () => {
      document.body.classList.remove('has-custom-cursor')
      videos.forEach((v) => {
        v.removeEventListener('play', onPlay)
        v.removeEventListener('pause', onPause)
      })
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mousedown', handleDown)
      window.removeEventListener('mouseup', handleUp)
      document.removeEventListener('mouseleave', handleLeave)
      document.removeEventListener('mouseenter', handleEnter)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Sync body class for showing native cursor when over video controls
  useEffect(() => {
    if (state === 'video-controls') {
      document.body.classList.add('cursor-mode-native')
    } else {
      document.body.classList.remove('cursor-mode-native')
    }
    return () => document.body.classList.remove('cursor-mode-native')
  }, [state])

  return (
    <div ref={cursorRef} className={`custom-cursor cursor-${state} ${pressed ? 'is-pressed' : ''}`}>
      <span className="cursor-dot" />
      <span className="cursor-icon" />
    </div>
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
    <nav className={`timeline-nav ${dragging ? 'is-dragging' : ''}`} aria-label="Site timeline">
      <a href="#hero" className="tl-wordmark" onClick={(e) => { e.preventDefault(); jumpTo(0) }}>Adeel</a>
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
      <a href={CAL_URL} target="_blank" rel="noopener noreferrer" className="tl-cta">Book a Call →</a>
    </nav>
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

// To swap a placeholder for a real image or video:
//   Drop the file into `website/public/story/<year>.jpg` (or `.mp4`)
//   Set `media: { type: 'image', src: '/story/2018.jpg' }` on that milestone below
//   Delete the `mediaLabel` line (only used when there is no real media yet)
const aboutMilestones = [
  {
    year: '2018',
    title: 'First frames',
    detail: 'I was in the third year of my software engineering degree. Around that time I got hooked on big YouTubers like MKBHD and Peter McKinnon, plus a handful of local content creators. I borrowed a gorilla pod, filmed my own vlogs on a phone, and won a department vlogging competition against a few actual camera ops. That got me pulled into a national short-film competition at LUMS. I wrote the story, acted in it, directed it, and cut it. It won. That was the moment I knew video was the actual thing, not a side project.',
    media: { type: 'image', src: '/story/2018.jpg' },
  },
  {
    year: '2021',
    title: 'Editing Machine',
    detail: 'I graduated. Tried the software engineering job track for a bit and then picked the edit bay instead. Joined Editing Machine, a UK YouTube post-production studio, as a senior editor. Cut documentaries and creator content that helped the studio sign a few high-paying creators and keep them longer than usual.',
    media: { type: 'image', src: '/story/2021.jpg' },
  },
  {
    year: '2023',
    title: 'Decentralized Masters',
    detail: 'In-house at a $1.5M/mo direct-response education company. Lead editor on the VSLs, ads, and full course revamps. I cut the "Become Your Own Bank" VSL, which is still one of their core active funnels.',
    media: { type: 'image', src: '/story/2023.png' },
  },
  {
    year: '2026',
    title: 'Available',
    detail: 'Working with a short list of brands running high-ticket offers. One retainer client at a time.',
    media: { type: 'image', src: '/story/2026-web.jpg' },
  },
]

const proofCards = [
  {
    name: 'Decentralized Masters',
    role: 'In-house · 2023 → Present',
    body: '$1.5M/mo direct-response education company. I was the second editor they hired. Today I lead edits on their VSLs, ads, and course launches from an 8-person video team.',
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
    body: 'UK YouTube post-production studio. Senior editor on documentaries and creator content. The work landed a few high-paying creators and kept them on retainer longer than the studio was used to.',
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
    body: "Top-rated Fiverr Direct-Response ad specialist. He sends me overflow cuts when his queue backs up.",
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
  // 12 Direct Response ads for DM — vertical 9:16
  { cat: 'ad', label: 'Direct Response', title: 'Curiosity / UGC', orient: 'portrait', loop: '/work/opt/ads/ad01.mp4', yt: 'https://youtube.com/shorts/1OjvX5w5xoU' },
  { cat: 'ad', label: 'Direct Response', title: 'Urgency / Negative Hook', orient: 'portrait', loop: '/work/opt/ads/ad02.mp4', yt: 'https://youtube.com/shorts/tnVDCulvz2A' },
  { cat: 'ad', label: 'Direct Response', title: 'Slightly-Aware Audience', orient: 'portrait', loop: '/work/opt/ads/ad03.mp4', yt: 'https://youtu.be/LkaGEGjrfG0' },
  { cat: 'ad', label: 'Direct Response', title: 'Negative Hook', orient: 'portrait', loop: '/work/opt/ads/ad04.mp4', yt: 'https://youtu.be/4SahuWX4j9U' },
  { cat: 'ad', label: 'Direct Response', title: 'Claim and Answer', orient: 'portrait', loop: '/work/opt/ads/ad05.mp4', yt: 'https://youtu.be/b2wP3pI9bVY' },
  { cat: 'ad', label: 'Direct Response', title: 'Comparison Hook', orient: 'portrait', loop: '/work/opt/ads/ad06.mp4', yt: 'https://youtu.be/mOsZFJlv7Cg' },
  { cat: 'ad', label: 'Direct Response', title: 'Date and Data', orient: 'portrait', loop: '/work/opt/ads/ad07.mp4', yt: 'https://youtu.be/HkK4b7KC32M' },
  { cat: 'ad', label: 'Direct Response', title: 'Insider Info', orient: 'portrait', loop: '/work/opt/ads/ad08.mp4', yt: 'https://youtu.be/c85WTKC4a7Y' },
  { cat: 'ad', label: 'Direct Response', title: 'Problem-Aware Audience', orient: 'portrait', loop: '/work/opt/ads/ad09.mp4', yt: 'https://youtube.com/shorts/Xm63LTmEnsQ' },
  { cat: 'ad', label: 'Direct Response', title: 'Shocking News', orient: 'portrait', loop: '/work/opt/ads/ad10.mp4', yt: 'https://youtube.com/shorts/3PcrVXtnWzQ' },
  { cat: 'ad', label: 'Direct Response', title: 'Aware Audience / Big Claim', orient: 'portrait', loop: '/work/opt/ads/ad11.mp4', yt: 'https://youtube.com/shorts/XDtwF6S8lIg' },
  { cat: 'ad', label: 'Direct Response', title: 'Curiosity / Pain Point', orient: 'portrait', loop: '/work/opt/ads/ad12.mp4', yt: 'https://youtu.be/nPg5fYLJsHw' },
  // 3 cinematic brand ads outside DM — 16:9
  { cat: 'ad', label: 'Cinematic', title: 'Cinematic Brand Ad', orient: 'landscape', loop: '/work/opt/ads/ad13.mp4', yt: 'https://youtu.be/dK79xh9B7g0' },
  { cat: 'ad', label: 'Cinematic', title: 'Lumiriam — Brand Film', orient: 'landscape', loop: '/work/opt/ads/ad14.mp4', yt: 'https://youtu.be/EG6sJLpExgQ' },
  { cat: 'ad', label: 'Cinematic', title: 'Apple Watch — Feature', orient: 'landscape', loop: '/work/opt/ads/ad15.mp4', yt: 'https://youtu.be/zY8bjWyvZno' },
  // VSLs — short/direct first
  { cat: 'vsl', label: 'VSL', title: 'Become Your Own Bank — Direct', note: '12+ months live', orient: 'landscape', loop: '/work/opt/vsls/vsl1.mp4', yt: 'https://youtu.be/bwzWsJljEBY' },
  { cat: 'vsl', label: 'VSL', title: 'Become Your Own Bank — Indirect', note: 'Unaware audience', orient: 'landscape', loop: '/work/opt/vsls/vsl2.mp4', yt: 'https://youtu.be/PtPOQMBRx7g' },
  // Documentaries — 16:9
  { cat: 'documentary', label: 'Documentary', title: 'AGI Is Almost Here', orient: 'landscape', loop: '/work/opt/documentaries/doc1.mp4', yt: 'https://youtu.be/uPXmLKYPGzg' },
  { cat: 'documentary', label: 'Documentary', title: 'The Overemployed', note: '1M+ views', orient: 'landscape', loop: '/work/opt/documentaries/doc2.mp4', yt: 'https://youtu.be/oR-mzzIsHVE' },
  { cat: 'documentary', label: 'Documentary', title: 'Lazarus: N. Korean Hackers', orient: 'landscape', loop: '/work/opt/documentaries/doc3.mp4', yt: 'https://youtu.be/VvSIobRXhUs' },
  { cat: 'documentary', label: 'Documentary', title: 'The Linux Political Spectrum', orient: 'landscape', loop: '/work/opt/documentaries/doc4.mp4', yt: 'https://youtu.be/uca3Ggg_2lg' },
]

const filters = [
  { key: 'ad', label: 'Ads' },
  { key: 'vsl', label: 'VSLs' },
  { key: 'documentary', label: 'Documentaries' },
  { key: 'course', label: 'Course' },
  { key: 'all', label: 'All' },
]

const faqItems = [
  {
    q: 'What niches do you work in?',
    a: 'Direct Response for high-ticket offers. If your offer sells for $1K or more and runs on a real DR funnel, we can talk. I do not take low-ticket DTC e-commerce work.',
  },
  {
    q: "What's your turnaround?",
    a: 'For a 30 to 90-second ad, 2 to 3 days. For a 12-minute VSL, 2 to 3 weeks. Faster when the brief is clear.',
  },
  {
    q: 'Do you write scripts?',
    a: 'No. I sharpen hooks, pacing, and structure once I have the script in hand. The script itself has to come from you or your copywriter.',
  },
  {
    q: 'How does the AI workflow actually work?',
    a: 'AI does the repetitive parts. Research, B-roll and animation, VO drafts, caption styling, and a second-opinion review on the final cut through my Premiere plugin. Creative direction is still on me. The "How I build" section above walks through it step by step.',
  },
  {
    q: 'Can I see more of your work?',
    a: 'The reel and the case study cover the main work. If you want more, ask on the intro call.',
  },
  {
    q: 'Do you offer one-off projects?',
    a: 'No. Retainer only, $4,000/mo minimum. For DR work, consistency does more than one-off polish.',
  },
  {
    q: 'Where are you based?',
    a: 'Islamabad, Pakistan. I work with clients globally. Timezone-flexible for now, mornings-only long term.',
  },
  {
    q: 'How do we start?',
    a: "Book a 15-min intro. We cover fit, scope, and start date. If it's a match, contract goes out in 48 hours.",
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
    title: 'Economics before Premiere',
    body: "I want to know your CPA, LTV, AOV, and break-even ROAS before I open the timeline. Those are inputs to the edit, not afterthoughts. If your target CPA is $75 and the control is at $110, the ad has to close that gap. That is the brief.",
  },
  {
    title: 'Hooks against the promise',
    body: "Hook rate and hold rate are the only things that matter in the first three seconds. I don't chase Reels trends. I write hooks against what the offer actually promises. Every winning ad has a thesis you can test, not a vibe.",
  },
  {
    title: 'Cadence built to test',
    body: "I ship at ad-cycle speed, roughly 2 to 3 days per variant, and I build in testable batches instead of one-offs. I can also tell when a control is about to fatigue, and whether the right move is to angle-shift or start over.",
  },
  {
    title: 'Native to Meta and Google',
    body: "Aspect ratios, placement-native cuts, safe zones. Files land in your Ad Manager ready to run, not as cinema cuts your buyer has to re-slice. I read the Meta Ad Library before I cut. Same language your media buyer uses.",
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
    title: 'Research and hook writing',
    body: 'I break down the offer, the audience, and the funnel first. Then I write hook variations against what the offer actually promises, instead of whatever format is currently trending.',
    icon: <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>,
    tools: [
      { name: 'Gemini', bg: 'linear-gradient(135deg, #4285F4, #9B72CB, #EA4335)', markSvg: <svg viewBox="0 0 24 24"><path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"/></svg> },
      { name: 'Claude', bg: '#D97757', markSvg: <svg viewBox="0 0 24 24"><path d="M12 2 v20 M2 12 h20 M5 5 L19 19 M5 19 L19 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg> },
    ],
  },
  {
    label: 'Edit',
    title: 'Edit and pacing',
    body: 'The assembly happens by hand. Story first, cuts second. No filler, no unearned beats. If a shot is in the timeline, it is there for the argument, not because a template said so.',
    icon: <svg viewBox="0 0 24 24"><polygon points="12 2 2 8 12 14 22 8 12 2"/><polyline points="2 16 12 22 22 16"/><polyline points="2 12 12 18 22 12"/></svg>,
    tools: [
      { name: 'Premiere Pro', bg: '#2A0634', markText: 'Pr', markColor: '#9999FF' },
      { name: 'After Effects', bg: '#00005B', markText: 'Ae', markColor: '#D291FF' },
    ],
  },
  {
    label: 'B-Rolls',
    title: 'Custom B-Rolls and Animation',
    body: 'B-roll and motion graphics that I generate for the specific story beat, not stock. Good animation at ad-cycle speed, which is usually the part that breaks under a normal DR workflow.',
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
    title: 'Voice and captions',
    body: 'I clone a VO track so I can iterate on the script without going back for another read. Captions get styled to read like a caption editor wrote them, not the default auto-caption look.',
    icon: <svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>,
    tools: [
      { name: 'ElevenLabs', bg: '#000000', markText: '11', markFontSize: 8 },
      { name: 'Submagic', bg: 'linear-gradient(135deg, #FF6B6B, #FFA500)', markText: 'S' },
    ],
  },
  {
    label: 'Ship',
    title: 'Review and ship',
    body: "I built a Premiere Pro plugin that runs Gemini across the finished cut. It is trained on DR editing patterns plus everything I have learned on the job, and it gives me a second-opinion review before anything leaves my machine. Client review happens in Frame.io. Turnaround is 2 to 3 days on a 30 to 90-second ad, and 2 to 3 weeks on a 12-minute VSL.",
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
  const [filter, setFilter] = useState('ad')
  const [openFaq, setOpenFaq] = useState(null)
  const [activePillar, setActivePillar] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [openProofCard, setOpenProofCard] = useState(null)
  const [activeMilestone, setActiveMilestone] = useState(3)
  const [scopeOpen, setScopeOpen] = useState(false)
  const [openCaseChapter, setOpenCaseChapter] = useState(0)

  return (
    <>
      <CustomCursor />
      <TimelineNav />

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
            I cut the ads and VSLs that carry high-ticket funnels. Built for offers that need to sell, not just look nice.
          </p>
          <div className="cta-row">
            <BookIntroBtn />
            <a href="#work" className="btn-secondary">See the work ↓</a>
          </div>
        </div>
      </section>

      {/* SHOWREEL */}
      <Reveal as="section" className="showreel" id="reel">
        <div className="container">
          <div className="section-label">// The Reel</div>
          <h2 className="section-title">75 seconds.</h2>
          <p className="showreel-sub">
            A year of ads and VSLs, cut down to about a minute.
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
            Direct Response<span className="sep">·</span>VSL and Ad<span className="sep">·</span>AI-native workflow
          </div>
        </div>
      </Reveal>

      {/* PROOF */}
      <Reveal className="proof" id="proof">
        <div className="container" style={{ padding: 0 }}>
          <div className="proof-metric">
            <div className="proof-metric-item">
              <div className="metric-num">
                <CountUp end={1.5} format={(v) => `$${v.toFixed(1)}M`} />
              </div>
              <div className="metric-label">Monthly ad spend</div>
            </div>
            <div className="proof-metric-item">
              <div className="metric-num">
                <CountUp end={300} format={(v) => `${Math.round(v)}+`} />
              </div>
              <div className="metric-label">Projects delivered</div>
            </div>
            <div className="proof-metric-item">
              <div className="metric-num">
                <CountUp end={5} format={(v) => `${Math.round(v)}`} />
              </div>
              <div className="metric-label">Years editing</div>
            </div>
          </div>
          <div className="proof-cards">
            {proofCards.map((c, i) => (
              <div
                key={c.name}
                className={`proof-card ${openProofCard === i ? 'is-open' : ''}`}
                onClick={() => setOpenProofCard(openProofCard === i ? null : i)}
              >
                <div className="proof-icon">{c.icon}</div>
                <div className="proof-name">{c.name}</div>
                <div className="proof-role">{c.role}</div>
                <span className="proof-hint">Tap / hover to expand +</span>
                <div className="proof-details">
                  <p>{c.body}</p>
                  <div className="proof-contact">
                    <span className="placeholder-tag">{c.contact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* WORK */}
      <Reveal as="section" id="work">
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
                <a
                  key={i}
                  className={`work-tile ${t.orient}`}
                  data-category={t.cat}
                  href={t.yt}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={show ? {} : { display: 'none' }}
                  onMouseEnter={(e) => {
                    const v = e.currentTarget.querySelector('video')
                    if (v) { v.currentTime = 0; v.play().catch(() => {}) }
                  }}
                  onMouseLeave={(e) => {
                    const v = e.currentTarget.querySelector('video')
                    if (v) { v.pause() }
                  }}
                >
                  <div className="tile-media">
                    <video src={t.loop} muted loop playsInline preload="auto" />
                    <span className="tile-play" aria-hidden="true">
                      <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                  </div>
                  <div className="tile-meta">
                    <span className="tile-category">{t.label}</span>
                    <span className="tile-title">{t.title}</span>
                    {t.note ? <span className="tile-status">{t.note}</span> : null}
                  </div>
                </a>
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
              <div className="course-tag">DeFi Education · One of DM's highest-ticket programs</div>
              <h3>DeFi Accelerator (DA) Program</h3>
              <div className="course-stats">
                <div className="course-stat"><span className="stat-num">4</span><span>iterations shipped, DA 2.0 through 5.0</span></div>
                <div className="course-stat"><span className="stat-num">Lead</span><span>editor on the current DA 5.0 revamp</span></div>
                <div className="course-stat"><span className="stat-num">Top</span><span>tier ticket price at DM</span></div>
              </div>
              <p>DM's DeFi program. I have cut, updated, and revamped four versions of it over two years and change, from structural work down to individual lesson intros. After the last revamp, the Head of Education said: "Special thanks to our masterful video editors, you worked tirelessly."</p>
            </div>
            <div className="course-card">
              <div className="course-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M3 3 v18 h18" />
                  <polyline points="7 15 11 11 14 14 21 7" />
                  <polyline points="17 7 21 7 21 11" />
                </svg>
              </div>
              <div className="course-tag">Stock Market Education · Full Curriculum</div>
              <h3>Stocks Equity Program</h3>
              <div className="course-stats">
                <div className="course-stat"><span className="stat-num">Full</span><span>program shipped, every phase, every step</span></div>
                <div className="course-stat"><span className="stat-num">Heavy</span><span>use of AI-generated animation across the curriculum</span></div>
                <div className="course-stat"><span className="stat-num">Above</span><span>the DM baseline for animation quality</span></div>
              </div>
              <p>DM's stock market program, delivered end to end. I used AI-generated animation heavily to explain the harder parts, like chart mechanics and how a portfolio behaves under different weightings. The animation quality on this one landed above what DM usually ships.</p>
              <div className="course-quote">
                "Genuinely surprised, and really happy, with the level of premium animations Adeel produced across this program."
                <small>— Creative Director · Decentralized Masters</small>
              </div>
            </div>
          </div>

          {/* mini CTA */}
          <div className="mini-cta">
            <div className="cta-text">Want the same on your funnel?</div>
            <BookIntroBtn />
          </div>
        </div>
      </Reveal>

      {/* MARKETER MINDSET */}
      <Reveal as="section" className="marketer-mind" style={{}}>
        <div className="container" id="mindset">
          <div className="section-label">// How I Think</div>
          <h2 className="section-title">
            I think like a <span className="serif-italic">media buyer</span>.
          </h2>
          <p className="mindset-lead">
            Direct response editing is not decoration. Every cut is a bet on ROAS. Every first frame is a thumb-stop test. If your CPA is running <em>$110 against a $75 target</em>, the ad has to close that gap, not just look nice.
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

          <div className="vocab-line">
            <span className="vocab-line-label">Fluent in</span>
            <span className="vocab-line-terms">
              ROAS <span className="dot">·</span> CPA <span className="dot">·</span> CPQC <span className="dot">·</span> CTR <span className="dot">·</span> CVR <span className="dot">·</span> Hook Rate <span className="dot">·</span> Hold Rate
            </span>
          </div>
        </div>
      </Reveal>

      {/* CASE STUDY — INDEPENDENT VIDEO + ACCORDION */}
      <Reveal as="section" className="case-study" id="case">
        <div className="container">
          <div className="section-label">// Case Study</div>
          <h2 className="section-title">Become Your Own Bank.</h2>
          <p className="case-intro">A VSL that has stayed in the funnel for a year, when most last three months.</p>

          {/* Video plays independently with own controls */}
          <div className="case-video-block">
            <div className="case-video-frame">
              <video
                className="case-video reel-video"
                controls
                muted
                playsInline
                preload="metadata"
              >
                <source src="/reel.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="case-video-caption">
              <span className="caption-mark">"</span>
              <span className="caption-quote">This is a masterclass. Incredible job.</span>
              <span className="caption-attr">— Tan, CEO · Decentralized Masters</span>
            </div>
          </div>

          {/* Accordion — one chapter open at a time */}
          <div className="case-accordion">
            {[
              { title: 'Challenge', headline: 'Explain the invisible.', body: 'A self-custodied wallet is an abstract thing. For a cold audience on a $10K+ education offer, "trust me" does not cut it. The VSL had to make the abstract feel physical, and safe.' },
              { title: 'Approach', headline: 'Story first, animation second.', body: 'Custom Coinbase wallet visualization. Internal footage. Hand-built animations for the parts that are hard to picture. Every cut is in the timeline because the story needs it, not because a template asked for one.' },
              { title: 'Result', headline: 'Still in the funnel a year later.', body: 'It launched, became a core funnel at DM, and is still running today. Most VSLs get retired at 90 days.' },
            ].map((c, i) => (
              <div key={i} className={`case-chapter ${openCaseChapter === i ? 'open' : ''}`}>
                <button
                  className="case-chapter-header"
                  onClick={() => setOpenCaseChapter(openCaseChapter === i ? null : i)}
                  type="button"
                >
                  <span className="chapter-num">0{i + 1}</span>
                  <span className="chapter-label">{c.title}</span>
                  <span className="chapter-headline">{c.headline}</span>
                  <span className="chapter-plus">+</span>
                </button>
                <div className="case-chapter-body">
                  <p>{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

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

      {/* ABOUT — EDITORIAL CAREER STORY */}
      <Reveal as="section" id="about">
        <div className="container">
          <div className="section-label">// Bio</div>
          <h2 className="section-title">The story.</h2>

          <p className="story-lead">
            I started editing in 2018 with a phone and a borrowed gorilla pod. Today I sit inside a $1.5M/mo direct-response shop, cutting the VSLs and ads that carry their funnel.
          </p>

          <div className="story-chapters">
            {aboutMilestones.map((m, i) => (
              <div key={i} className={`story-chapter ${i % 2 === 1 ? 'reverse' : ''}`}>
                <div className="chapter-media">
                  <div className="chapter-media-frame">
                    {/* When real media is ready, replace this placeholder with <img> or <video> */}
                    {m.media ? (
                      m.media.type === 'video' ? (
                        <video
                          className="chapter-media-el"
                          src={m.media.src}
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                      ) : (
                        <img className="chapter-media-el" src={m.media.src} alt={`${m.year} — ${m.title}`} />
                      )
                    ) : (
                      <div className="chapter-media-placeholder">
                        <span className="ph-year">{m.year}</span>
                        <span className="ph-label">{m.mediaLabel}</span>
                        <span className="ph-hint">Drop file at /public/story/{m.year}.jpg</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="chapter-body">
                  <div className="chapter-year">{m.year}</div>
                  <h3 className="chapter-heading">{m.title}</h3>
                  <p className="chapter-text">{m.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* SERVICES */}
      <Reveal as="section" id="contact">
        <div className="container services">
          <div className="section-label">// Services</div>
          <h2 className="section-title">One retainer client at a time.</h2>
          <div className="service-card">
            <div className="service-label">Monthly Retainer</div>
            <div className="service-price">
              <span>From $4,000</span>
              <small>per month</small>
            </div>
            <p className="service-summary">
              Ads, VSLs, and product videos. Everything runs through my AI stack, and every cut goes through a second-opinion review before I send it. One retainer at a time, so nothing falls through.
            </p>

            <button className="reveal-toggle" onClick={() => setScopeOpen(!scopeOpen)}>
              {scopeOpen ? "Hide scope ↑" : "See what's included ↓"}
            </button>

            {scopeOpen && (
              <ul className="service-scope reveal-body">
                <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>A set number of ad edits each month, 30 to 90 seconds each</li>
                <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Or one long-form VSL up to 12 minutes, plus supporting cuts</li>
                <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Full AI-augmented workflow for captions, VO, B-roll, and animation</li>
                <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Every cut runs through my Gemini plugin review before it leaves my machine</li>
                <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Dedicated Slack or Discord channel, 24-hour response</li>
                <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Frame.io for your review and revisions</li>
                <li><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Testimonial and case-study rights after 60 days of work</li>
              </ul>
            )}

            <BookIntroBtn style={{ marginTop: 20 }} />
          </div>
        </div>
      </Reveal>

      {/* TESTIMONIALS */}
      <Reveal as="section" id="praise">
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
      </Reveal>

      {/* FAQ */}
      <Reveal as="section" id="faq">
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
      </Reveal>

      {/* FINAL CTA */}
      <Reveal className="final-cta" id="end">
        <h2>
          If you're running high-ticket DR and need an editor who can keep up, <em>let's talk.</em>
        </h2>
        <a href={CAL_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">Book a 15-min intro →</a>
        <span className="email">
          or email <a href="mailto:hello@adeelsedits.com">hello@adeelsedits.com</a>
        </span>
      </Reveal>

      {/* FOOTER */}
      <footer>
        <div>Adeel · adeelsedits.com</div>
        <div className="foot-links">
          <a href="mailto:hello@adeelsedits.com">hello@adeelsedits.com</a>
          <a href="#">LinkedIn</a>
        </div>
        <div>© 2026 Adeel Abbas</div>
      </footer>
    </>
  )
}
