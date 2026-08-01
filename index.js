(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const year = document.getElementById("yr");
  if (year) year.textContent = new Date().getFullYear();

  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const navLinks = Array.prototype.slice.call(
    document.querySelectorAll("#navLinks a"),
  );
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function onScroll() {
    if (nav) nav.classList.toggle("is-stuck", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (burger) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  function spy() {
    const pos = window.scrollY + window.innerHeight * 0.32;
    let idx = 0;
    sections.forEach((section, index) => {
      if (section && section.offsetTop <= pos) idx = index;
    });
    navLinks.forEach((link, index) =>
      link.classList.toggle("is-active", index === idx),
    );
  }
  spy();
  window.addEventListener("scroll", spy, { passive: true });

  const revealEls = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -10px 0px" },
    );
    revealEls.forEach((el) => io.observe(el));
  }

  const counters = document.querySelectorAll("[data-count]");
  if (!reduce && "IntersectionObserver" in window) {
    const countIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.getAttribute("data-count"), 10);
          const suffixEl = el.querySelector("em");
          const suffix = suffixEl ? suffixEl.outerHTML : "";
          if (Number.isNaN(target) || target === 0) {
            countIo.unobserve(el);
            return;
          }
          const start = performance.now();
          const duration = 1100;
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.innerHTML = Math.round(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(step);
            else countIo.unobserve(el);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 },
    );

    counters.forEach((counter) => countIo.observe(counter));
  }

  const filters = document.querySelectorAll(".filter");
  const projects = document.querySelectorAll(".proj");
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((btn) => btn.classList.remove("is-on"));
      button.classList.add("is-on");
      const filterValue = button.getAttribute("data-filter");
      projects.forEach((project) => {
        const categories = project.getAttribute("data-cat") || "";
        project.classList.toggle(
          "is-hidden",
          !(filterValue === "all" || categories.indexOf(filterValue) > -1),
        );
      });
    });
  });

  const anchorLinks = document.querySelectorAll("a[href^='#']");
  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        return;
      }

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    });
  });
})();
