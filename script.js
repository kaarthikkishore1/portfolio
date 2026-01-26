/* ============================
   1) SYSTEM DARK MODE + TOGGLE
============================ */
const themeBtn = document.getElementById("themeBtn");

function setTheme(mode) {
  if (mode === "dark") {
    document.body.classList.add("dark");
    themeBtn.querySelector("i").className = "fa-solid fa-sun";
  } else {
    document.body.classList.remove("dark");
    themeBtn.querySelector("i").className = "fa-solid fa-moon";
  }
  localStorage.setItem("theme", mode);
}

// Load theme preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  setTheme(savedTheme);
} else {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark ? "dark" : "light");
}

themeBtn.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  setTheme(isDark ? "light" : "dark");
});

/* ============================
   2) TYPING ANIMATION
============================ */
const typeText = document.getElementById("typeText");
const text = "Hey, Kaarthik Kishore Here.";
let index = 0;

function typeLoop() {
  if (index <= text.length) {
    typeText.textContent = text.slice(0, index);
    index++;
    setTimeout(typeLoop, 60);
  }
}
typeLoop();

/* ============================
   3) REVEAL ON SCROLL
============================ */
const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
}, { threshold: 0.15 });

reveals.forEach(el => observer.observe(el));

/* ============================
   4) SLIDER ARROWS
============================ */
const expSlider = document.getElementById("expSlider");
const projSlider = document.getElementById("projSlider");

document.querySelectorAll("[data-slide]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.slide;
    const dir = btn.classList.contains("left") ? -1 : 1;

    if (type === "exp") expSlider.scrollBy({ left: 560 * dir, behavior: "smooth" });
    if (type === "proj") projSlider.scrollBy({ left: 450 * dir, behavior: "smooth" });
  });
});

/* ============================
   5) MOBILE SWIPE SUPPORT
============================ */
function enableSwipe(slider) {
  let startX = 0;
  let startScroll = 0;
  let isTouching = false;

  slider.addEventListener("touchstart", (e) => {
    isTouching = true;
    startX = e.touches[0].pageX;
    startScroll = slider.scrollLeft;
  }, { passive: true });

  slider.addEventListener("touchmove", (e) => {
    if (!isTouching) return;
    const x = e.touches[0].pageX;
    const walk = startX - x;
    slider.scrollLeft = startScroll + walk;
  }, { passive: true });

  slider.addEventListener("touchend", () => {
    isTouching = false;
  });
}

enableSwipe(expSlider);
enableSwipe(projSlider);

/* ============================
   6) SKILLS PROGRESS ANIMATE
============================ */
const skillBars = document.querySelectorAll(".bar span");

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      skillBars.forEach((bar) => {
        const lvl = bar.getAttribute("data-level");
        bar.style.width = lvl + "%";
      });
    }
  });
}, { threshold: 0.25 });

document.querySelectorAll(".skills-bars").forEach(s => skillObserver.observe(s));

/* ============================
   7) PARTICLES BACKGROUND
============================ */
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let w, h;
function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

let particles = [];
const particleCount = 55;

function createParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6
    });
  }
}
createParticles();

function drawParticles() {
  ctx.clearRect(0, 0, w, h);

  const isDark = document.body.classList.contains("dark");
  ctx.fillStyle = isDark ? "rgba(96,165,250,.55)" : "rgba(37,99,235,.25)";

  particles.forEach((p) => {
    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > w) p.dx *= -1;
    if (p.y < 0 || p.y > h) p.dy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(drawParticles);
}
drawParticles();

const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  const subject = encodeURIComponent("Portfolio Contact Message");
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  );

  const TO = "mailto:kaarthikkishoreg@gmail.com?subject=Contact%20From%20Website&body=Hello%20Kishore";

  // ✅ Detect mobile devices
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    // ✅ Mobile → opens Mail App
    window.location.href = `mailto:${TO}?subject=${subject}&body=${body}`;
  } else {
    // ✅ Laptop/Desktop → opens Gmail Compose in browser
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${TO}&su=${subject}&body=${body}`;
    window.open(gmailLink, "_blank");
  }

  contactForm.reset();
});