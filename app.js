// Compiled to app.js by build.js — edit this file, not app.js.
// TWEAK_DEFAULTS is declared inline in index.html (the edit-mode host
// rewrites that block on disk, so it has to stay where it can find it).

const {
  useState,
  useEffect,
  useRef
} = React;
const ACCENTS = ["#C2F24A", "#4ED8E6", "#FF6A3D", "#B98CFF", "#ECEAE3"];
const MODES = ["flow", "grid", "plasma"];
function useClock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => {
      const s = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Europe/Oslo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
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
      mode: t.bgMode,
      accent: t.accent,
      intensity: t.intensity,
      bg: "#08080A"
    });
    f.start();
    fieldRef.current = f;
    const onMove = e => f.setMouse(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
    window.addEventListener("pointermove", onMove);
    const onVis = () => document.hidden ? f.stop() : f.start();
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
    try {
      localStorage.setItem("site-accent", t.accent);
    } catch (e) {}
    if (fieldRef.current) fieldRef.current.setOptions({
      accent: t.accent,
      mode: t.bgMode,
      intensity: t.intensity
    });
  }, [t.accent, t.bgMode, t.intensity]);

  // tweaks panel mounts below; intro animation safety net
  useEffect(() => {
    const id = setTimeout(() => document.documentElement.classList.add("anim-settled"), 1700);
    return () => clearTimeout(id);
  }, []);
  const go = e => {
    e.preventDefault();
    const wipe = document.querySelector(".wipe");
    wipe.querySelector(".wipe-mark").textContent = "// projects";
    wipe.classList.add("in");
    setTimeout(() => {
      window.location.href = "/projects.html";
    }, 540);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "stage"
  }, t.grain && /*#__PURE__*/React.createElement("div", {
    className: "fx-grain"
  }), t.scanlines && /*#__PURE__*/React.createElement("div", {
    className: "fx-scan"
  }), /*#__PURE__*/React.createElement("div", {
    className: "frame-tick ft-tl rev d1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), " 62.47\xB0N / 6.15\xB0E"), /*#__PURE__*/React.createElement("div", {
    className: "frame-tick ft-tr rev d1"
  }, "EST. 2003 \xB7 \xC5LESUND"), /*#__PURE__*/React.createElement("main", {
    className: "hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow rev d1"
  }, "Project Website"), /*#__PURE__*/React.createElement("h1", {
    className: "name"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mask m1"
  }, /*#__PURE__*/React.createElement("span", null, "Sindre")), /*#__PURE__*/React.createElement("span", {
    className: "l2 mask m2"
  }, /*#__PURE__*/React.createElement("span", null, "Stolt", /*#__PURE__*/React.createElement("span", {
    className: "nib"
  }, "\xB7"), "Nielsen"))), /*#__PURE__*/React.createElement("div", {
    className: "subtitle rev d3"
  }, /*#__PURE__*/React.createElement("span", null, "Bergen"), /*#__PURE__*/React.createElement("span", {
    className: "pipe"
  }, "/"), /*#__PURE__*/React.createElement("span", null, "Berkeley"), /*#__PURE__*/React.createElement("span", {
    className: "pipe"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "IT & Economics")), /*#__PURE__*/React.createElement("a", {
    href: "/projects.html",
    className: "enter rev d4",
    onClick: go
  }, /*#__PURE__*/React.createElement("span", {
    className: "en-idx"
  }, "00 \u25B8"), /*#__PURE__*/React.createElement("span", {
    className: "en-main"
  }, /*#__PURE__*/React.createElement("span", {
    className: "en-title"
  }, "Projects"), /*#__PURE__*/React.createElement("span", {
    className: "en-sub"
  }, "Selected work \xB7 22 entries")), /*#__PURE__*/React.createElement("span", {
    className: "en-arrow"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h13M12 5l7 7-7 7"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "status rev d5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "live"
  }, "System nominal"), /*#__PURE__*/React.createElement("span", {
    className: "clock"
  }, clock)), /*#__PURE__*/React.createElement(TweaksPanel, null, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Background field"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Mode",
    value: t.bgMode,
    options: MODES,
    onChange: v => setTweak("bgMode", v)
  }), /*#__PURE__*/React.createElement(TweakSlider, {
    label: "Intensity",
    value: t.intensity,
    min: 0.4,
    max: 1.6,
    step: 0.1,
    onChange: v => setTweak("intensity", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Accent"
  }), /*#__PURE__*/React.createElement(TweakColor, {
    label: "Signal",
    value: t.accent,
    options: ACCENTS,
    onChange: v => setTweak("accent", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Texture"
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Film grain",
    value: t.grain,
    onChange: v => setTweak("grain", v)
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Scanlines",
    value: t.scanlines,
    onChange: v => setTweak("scanlines", v)
  })));
}
ReactDOM.createRoot(document.getElementById("app")).render(/*#__PURE__*/React.createElement(App, null));
