import React, { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';
import Dashboard from './Dashboard';
import ScenarioSwitcher from './ScenarioSwitcher';
import RetrainingNotification from './RetrainingNotification';
import ComponentShowcase from './ComponentShowcase';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.gsap) return;
    const gsap = window.gsap;

    const xDot = gsap.quickTo(dotRef.current, 'left', { duration: 0, ease: 'none' });
    const yDot = gsap.quickTo(dotRef.current, 'top', { duration: 0, ease: 'none' });
    const xRing = gsap.quickTo(ringRef.current, 'left', { duration: 0.15, ease: 'power3' });
    const yRing = gsap.quickTo(ringRef.current, 'top', { duration: 0.15, ease: 'power3' });

    const handleMouseMove = (e: MouseEvent) => {
      xDot(e.clientX); yDot(e.clientY);
      xRing(e.clientX); yRing(e.clientY);

      // Magnetic hover logic
      const target = e.target as HTMLElement;
      const mag = target.closest('.magnetic-btn') as HTMLElement;
      if (mag) {
        const rect = mag.getBoundingClientRect();
        const xOffset = (e.clientX - rect.left - rect.width / 2) * 0.15; // Pull strength
        const yOffset = (e.clientY - rect.top - rect.height / 2) * 0.15;
        gsap.to(mag, { x: xOffset, y: yOffset, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      // Release magnetic pull
      const target = e.target as HTMLElement;
      const mag = target.closest('.magnetic-btn') as HTMLElement;
      if (mag) {
        gsap.to(mag, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)', overwrite: 'auto' });
      }
    };

    const handleMouseOverToggle = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('button, a, .magnetic-btn, circle') as HTMLElement;
      if (target && dotRef.current && ringRef.current) {
        dotRef.current.classList.add('hovered');
        
        let cClass = 'hover-cyan';
        if (target.classList.contains('btn-dhaka') || target.getAttribute('data-cursor') === 'red') cClass = 'hover-red';
        else if (target.classList.contains('btn-nairobi') || target.getAttribute('data-cursor') === 'orange') cClass = 'hover-orange';
        else if (target.classList.contains('btn-sgp') || target.getAttribute('data-cursor') === 'acid') cClass = 'hover-acid';
        
        ringRef.current.classList.add(cClass);
        ringRef.current.dataset.activeHover = cClass;
      }
    };
    const handleMouseOutToggle = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('button, a, .magnetic-btn, circle') as HTMLElement;
      if (target && dotRef.current && ringRef.current) {
        dotRef.current.classList.remove('hovered');
        const cClass = ringRef.current.dataset.activeHover;
        if (cClass) {
          ringRef.current.classList.remove(cClass);
          ringRef.current.dataset.activeHover = '';
        } else {
          ringRef.current.classList.remove('hover-cyan', 'hover-red', 'hover-orange', 'hover-acid');
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('mouseover', handleMouseOverToggle);
    window.addEventListener('mouseout', handleMouseOutToggle);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('mouseover', handleMouseOverToggle);
      window.removeEventListener('mouseout', handleMouseOutToggle);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot"></div>
      <div ref={ringRef} className="cursor-ring"></div>
    </>
  );
};

export default function App() {
  const [showcase, setShowcase] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [wsOnline, setWsOnline] = useState(false);
  const [events, setEvents]     = useState<any[]>([]);

  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const leftLineRef = useRef<HTMLDivElement>(null);
  const rightLineRef = useRef<HTMLDivElement>(null);
  const amxRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scenarioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let id: NodeJS.Timeout;
    const check = async () => {
      try {
        const r = await fetch(`${API_BASE}/api/status`);
        setWsOnline(r.ok);
      } catch { setWsOnline(false); }
    };
    check();
    id = setInterval(check, 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!window.gsap || !window.SplitType) return;
    const gsap = window.gsap;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ delay: 0.2 });
      if (amxRef.current && heroTitleRef.current && subtitleRef.current) {
        const amxChars = new window.SplitType(amxRef.current, { types: 'chars' });
        
        gsap.set(amxChars.chars, { y: 8, opacity: 0 });
        gsap.set(heroTitleRef.current, { clipPath: 'inset(100% 0 0 0)' });
        gsap.set(subtitleRef.current, { opacity: 0, y: 12 });
        
        const buttons = scenarioRef.current ? Array.from(scenarioRef.current.querySelectorAll('.scenario-btn')) : [];
        gsap.set(buttons, { opacity: 0, y: 16 });

        tl.to(leftLineRef.current, { width: '40vw', duration: 0.7, ease: 'power3.out' }, 0)
          .to(rightLineRef.current, { width: '40vw', duration: 0.7, ease: 'power3.out' }, 0)
          .to(amxChars.chars, { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, 0.5)
          .to(heroTitleRef.current, { clipPath: 'inset(0% 0 0 0)', duration: 0.8, ease: 'power4.out' }, 0.9)
          .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.4)
          .to(buttons, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }, 1.7)
          .to([leftLineRef.current, rightLineRef.current], { opacity: 0, duration: 0.5 }, 2.0);
      }
    });
  }, []);

  const handleScenarioExecute = useCallback(() => {}, []);

  if (showcase) {
    return (
      <>
        <CustomCursor />
        <button 
          onClick={() => setShowcase(false)}
          className="fixed top-6 right-6 z-[1000] bg-white text-black px-4 py-2 font-mono text-xs hover:bg-neutral-200 transition-colors"
        >
          BACK TO DASHBOARD
        </button>
        <ComponentShowcase />
      </>
    );
  }

  return (
    <>
      <CustomCursor />

      <div className="app-container">
        <header className="app-header">
          <div className="header-inner">
            <div className="logo">
              <div 
                className="logo-lockup magnetic-btn" 
                style={{ cursor: 'pointer' }}
                onClick={() => setShowcase(true)}
              >
                <span className="logo-prefix">ΛMX</span>
                <span className="logo-separator">/</span>
                <span className="logo-name">AEGIS MORPHEME</span>
              </div>
            </div>
            <div className="header-status">
              <span className="network-badge magnetic-btn">HEDERA TESTNET</span>
              <div className="status-badge magnetic-btn">
                <span style={{ color: wsOnline ? '#00FF88' : 'rgba(255,255,255,0.2)' }}>
                  {wsOnline ? '[●]' : '[○]'}
                </span>
                <span style={{ color: wsOnline ? '#00FF88' : 'inherit' }}>
                  {wsOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="main-content">
          <section className="hero-section">
            <div ref={leftLineRef} style={{ position: 'absolute', left: 0, top: '35%', height: '1px', background: 'rgba(255,255,255,0.18)', width: '0vw' }} />
            <div ref={rightLineRef} style={{ position: 'absolute', right: 0, top: '65%', height: '1px', background: 'rgba(255,255,255,0.18)', width: '0vw' }} />

            <div className="hero-content-wrapper">
              <div ref={amxRef} style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem',
                color: 'rgba(255,255,255,0.88)', letterSpacing: '0.5em', marginBottom: '24px'
              }}>
                ΛMX
              </div>
              
              <h1 className="hero-title" ref={heroTitleRef}>
                Absolute<br/>Accountability
              </h1>
              <p className="hero-subtitle" ref={subtitleRef}>
                Executable Morpheme-X seals every agent decision on Hedera.
                The Meta-Sentinel terminates rogue logic streams instantly.
                Parametric disbursements execute without human friction.
              </p>

              <div ref={scenarioRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <ScenarioSwitcher onScenarioExecute={handleScenarioExecute} disabled={loading} />
              </div>
            </div>
            
            <div className="hero-shimmer-line" />
          </section>

          <Dashboard events={events} setEvents={setEvents} />
          <RetrainingNotification events={events} />
        </main>

        <a 
          href="https://x.com/TazwarEnan" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="magnetic-btn"
          style={{ 
            position: 'fixed', bottom: 16, right: 24, zIndex: 100, 
            fontSize: 9, fontFamily: 'var(--font-mono)', 
            color: 'rgba(255,255,255,0.15)', textDecoration: 'none',
            transition: 'color 0.2s', padding: 8
          }}
          onMouseEnter={(e: any) => e.target.style.color = 'var(--cyan)'}
          onMouseLeave={(e: any) => e.target.style.color = 'rgba(255,255,255,0.15)'}
        >
          // x.com/TazwarEnan
        </a>
      </div>
    </>
  );
}
