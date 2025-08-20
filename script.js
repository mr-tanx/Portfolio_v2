// ---- AOS ----
document.addEventListener("DOMContentLoaded", () => {
  if (window.AOS) {
    AOS.init({ duration: 1000, once: true, offset: 100, easing: "ease-out" });
  }
});

// ---- Theme Toggle ----
const themeToggleBtn = document.getElementById("theme-toggle");
const body = document.body;

function setTheme(mode) {
  if (mode === "light-mode") {
    body.classList.add("light-mode");
    body.classList.remove("dark-mode");
  } else {
    body.classList.add("dark-mode");
    body.classList.remove("light-mode");
  }
  localStorage.setItem("theme", mode);
  const icon = themeToggleBtn?.querySelector("i");
  if (icon) icon.className = mode === "light-mode" ? "fas fa-sun" : "fas fa-moon";
}
setTheme(localStorage.getItem("theme") || "dark-mode");
themeToggleBtn?.addEventListener("click", () => {
  setTheme(body.classList.contains("dark-mode") ? "light-mode" : "dark-mode");
});

// ---- Smooth Scroll + Accurate Sticky Offset + ScrollSpy ----
const header = document.querySelector(".header");
const navLinks = Array.from(document.querySelectorAll(".navbar a[href^='#']"));
const sections = Array.from(document.querySelectorAll("main section[id]"));

// keep header height in a CSS var and section scroll margins in sync
function headerHeight() {
  return header ? Math.ceil(header.offsetHeight) : 0;
}
function applyOffsets() {
  const h = headerHeight();
  document.documentElement.style.setProperty("--header-h", `${h}px`);
  sections.forEach((s) => (s.style.scrollMarginTop = `${h + 16}px`)); // native offset for hash jumps
}
applyOffsets();
window.addEventListener("resize", applyOffsets);

// smooth scroll on click (prevents native jump)
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", href);
  });
});

// ScrollSpy with IntersectionObserver (reliable & smooth)
let activeId = null;
if ("IntersectionObserver" in window) {
  let io;
  const makeObserver = () => {
    const h = headerHeight();
    // Top is raised by header height; bottom leaves some viewport to avoid flicker
    const opts = { root: null, rootMargin: `-${h + 2}px 0px -45% 0px`, threshold: [0.05, 0.25, 0.6] };
    if (io) io.disconnect();
    io = new IntersectionObserver((entries) => {
      // pick the most visible section currently intersecting
      const visible = entries
        .filter((en) => en.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const id = visible[0].target.id;
      if (id === activeId) return;
      activeId = id;
      navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${id}`));
    }, opts);
    sections.forEach((s) => io.observe(s));
  };
  makeObserver();
  window.addEventListener("resize", () => makeObserver());
} else {
  // Fallback: simple scroll handler
  window.addEventListener("scroll", () => {
    const h = headerHeight() + 8;
    const pos = window.scrollY + h;
    let current = sections[0]?.id;
    for (const s of sections) {
      if (pos >= s.offsetTop) current = s.id; 
      else break;
    }
    if (current) {
      navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${current}`));
    }
  });
}


