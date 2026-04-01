const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
const navLinks = document.querySelectorAll(".nav a");
const revealElements = document.querySelectorAll(".reveal");
const statusPill = document.querySelector("#status-pill");
const statusText = document.querySelector("#status-text");
const filterButtons = document.querySelectorAll(".filter-btn");
const foodCards = document.querySelectorAll(".food-card");
const updateBanner = document.querySelector("#update-banner");
const updateButton = document.querySelector("#update-button");
const updateDismiss = document.querySelector("#update-dismiss");
let waitingWorker = null;
let refreshing = false;

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16
  }
);

revealElements.forEach((element) => observer.observe(element));

function showUpdateBanner(worker) {
  waitingWorker = worker;

  if (updateBanner) {
    updateBanner.hidden = false;
  }
}

function hideUpdateBanner() {
  if (updateBanner) {
    updateBanner.hidden = true;
  }
}

if (updateButton) {
  updateButton.addEventListener("click", () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
  });
}

if (updateDismiss) {
  updateDismiss.addEventListener("click", () => {
    hideUpdateBanner();
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("service-worker.js");

      if (registration.waiting) {
        showUpdateBanner(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;

        if (!newWorker) {
          return;
        }

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            showUpdateBanner(newWorker);
          }
        });
      });

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) {
          return;
        }

        refreshing = true;
        window.location.reload();
      });
    } catch (error) {
      console.error("Falha ao registrar o service worker:", error);
    }
  });
}

const businessHours = {
  0: { open: "10:00", close: "22:30" },
  1: { open: "09:00", close: "23:00" },
  2: { open: "09:00", close: "23:00" },
  3: { open: "09:00", close: "23:00" },
  4: { open: "09:00", close: "23:00" },
  5: { open: "09:00", close: "23:00" },
  6: { open: "09:00", close: "00:00" }
};

function toMinutes(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}


function updateStoreStatus() {
  if (!statusPill || !statusText) {
    return;
  }

  const now = new Date();
  const day = now.getDay();
  const schedule = businessHours[day];

  if (!schedule) {
    statusPill.classList.remove("open");
    statusPill.classList.add("closed");
    statusText.textContent = "Fechada hoje";
    return;
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = toMinutes(schedule.open);
  let closeMinutes = toMinutes(schedule.close);

  if (closeMinutes === 0) {
    closeMinutes = 24 * 60;
  }

  const isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes;

  statusPill.classList.toggle("open", isOpen);
  statusPill.classList.toggle("closed", !isOpen);
  statusText.textContent = isOpen
    ? `Aberta agora ate ${schedule.close}`
    : `Fechada agora - abre as ${schedule.open}`;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    foodCards.forEach((card) => {
      const matches = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("hidden", !matches);
    });
  });
});

updateStoreStatus();
