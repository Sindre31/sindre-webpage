// Compiled to app.js by build.js — edit this file, not app.js.
// TWEAK_DEFAULTS is declared inline in index.html (the edit-mode host
// rewrites that block on disk, so it has to stay where it can find it).

const { useState, useEffect, useRef } = React;

const ACCENTS = ["#C2F24A", "#4ED8E6", "#FF6A3D", "#B98CFF", "#ECEAE3"];
const MODES = ["flow", "grid", "plasma"];

function useClock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => {
      const s = new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
      setNow(`${s} OSLO`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const fieldRef = useRef(null);
  const clock = useClock();

  // boot the canvas field once
  useEffect(() => {
    const cv = document.getElementById("bg");
    const f = new BackgroundField(cv, {
      mode: t.bgMode, accent: t.accent, intensity: t.intensity, bg: "#08080A"
    });
    f.start();
    fieldRef.current = f;
    const onMove = (e) => f.setMouse(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
    window.addEventListener("pointermove", onMove);
    const onVis = () => (document.hidden ? f.stop() : f.start());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      f.destroy();
    };
  }, []);

  // react to tweaks
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
    try { localStorage.setItem("site-accent", t.accent); } catch (e) {}
    if (fieldRef.current) fieldRef.current.setOptions({ accent: t.accent, mode: t.bgMode, intensity: t.intensity });
  }, [t.accent, t.bgMode, t.intensity]);

  // tweaks panel mounts below; intro animation safety net
  useEffect(() => {
    const id = setTimeout(() => document.documentElement.classList.add("anim-settled"), 1700);
    return () => clearTimeout(id);
  }, []);

  const go = (e) => {
    e.preventDefault();
    const wipe = document.querySelector(".wipe");
    wipe.querySelector(".wipe-mark").textContent = "// projects";
    wipe.classList.add("in");
    setTimeout(() => { window.location.href = "/projects.html"; }, 540);
  };

  return (
    <div className="stage">
      {t.grain && <div className="fx-grain"></div>}
      {t.scanlines && <div className="fx-scan"></div>}

      <div className="frame-tick ft-tl rev d1"><span className="dot"></span> 62.47°N / 6.15°E</div>
      <div className="frame-tick ft-tr rev d1">EST. 2003 · ÅLESUND</div>

      <main className="hero">
        <div className="eyebrow rev d1">Project Website</div>
        <h1 className="name">
          <span className="mask m1"><span>Sindre</span></span>
          <span className="l2 mask m2"><span>Stolt<span className="nib">·</span>Nielsen</span></span>
        </h1>
        <div className="subtitle rev d3">
          <span>Bergen</span><span className="pipe">/</span><span>Berkeley</span>
          <span className="pipe">·</span><span>IT &amp; Economics</span>
        </div>

        <a href="/projects.html" className="enter rev d4" onClick={go}>
          <span className="en-idx">00 ▸</span>
          <span className="en-main">
            <span className="en-title">Projects</span>
            <span className="en-sub">Selected work · 22 entries</span>
          </span>
          <span className="en-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13M12 5l7 7-7 7"/></svg>
          </span>
        </a>
      </main>

      <div className="status rev d5">
        <span className="live">System nominal</span>
        <span className="clock">{clock}</span>
      </div>

      <TweaksPanel>
        <TweakSection label="Background field" />
        <TweakRadio label="Mode" value={t.bgMode} options={MODES}
          onChange={(v) => setTweak("bgMode", v)} />
        <TweakSlider label="Intensity" value={t.intensity} min={0.4} max={1.6} step={0.1}
          onChange={(v) => setTweak("intensity", v)} />
        <TweakSection label="Accent" />
        <TweakColor label="Signal" value={t.accent} options={ACCENTS}
          onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Texture" />
        <TweakToggle label="Film grain" value={t.grain} onChange={(v) => setTweak("grain", v)} />
        <TweakToggle label="Scanlines" value={t.scanlines} onChange={(v) => setTweak("scanlines", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);