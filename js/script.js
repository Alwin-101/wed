// Envelope open sequence
function openInvite() {
  document.querySelector(".tap-hint").style.display = "none";
  const env = document.querySelector(".envelope");

  if (env.classList.contains("open")) return; // prevent double click

  // Step 1: open flap
  env.classList.add("open");

  // Step 2: lift the letter after the flap has opened
  setTimeout(() => {
    env.classList.add("lift");
  }, 650);

  // Step 3: wait for letter animation to finish
  env.addEventListener("transitionend", function handler(e) {
    if (e.propertyName === "transform" && e.target.classList.contains("letter")) {
      env.removeEventListener("transitionend", handler);

      // Pause briefly before fade
      setTimeout(() => {
        env.classList.add("fade-out");

        // Step 4: show site after fade
        setTimeout(() => {
          document.getElementById("intro").style.display = "none";
          document.getElementById("mainContent").style.display = "block";

          if (typeof confetti === "function") {
            confetti({
              particleCount: 200,
              spread: 80,
              angle: 60,
              origin: { x: 0, y: 1 }
            });

            confetti({
              particleCount: 200,
              spread: 80,
              angle: 120,
              origin: { x: 1, y: 1 }
            });
          }

          document.querySelector(".hero").classList.add("show");
          startCountdown();
        }, 800); // fade duration
      }, 400); // pause before fade
    }
  });

  // Safety fallback: reveal after 3s even if transition fails
  setTimeout(() => {
    if (document.getElementById("mainContent").style.display !== "block") {
      document.getElementById("intro").style.display = "none";
      document.getElementById("mainContent").style.display = "block";
      document.querySelector(".hero").classList.add("show");
      startCountdown();
    }
  }, 3800);
}

/* ⏳ COUNTDOWN */
function startCountdown() {
  const targetDate = new Date("2026-08-23T10:00:00").getTime(); // wedding date

  setInterval(() => {
    const now = new Date().getTime();
    let gap = targetDate - now;

    if (gap < 0) gap = 0;

    const d = Math.floor(gap / (1000*60*60*24));
    const h = Math.floor((gap / (1000*60*60)) % 24);
    const m = Math.floor((gap / (1000*60)) % 60);

        document.getElementById("countdown").innerHTML =
      `${d} Days ${h} Hours ${m} Minutes`;
  }, 1000);
}

/* 🗳️ VOTING SYSTEM */
let groomVotes = 0;
let brideVotes = 0;
let selectedTeam = "";

document.addEventListener("DOMContentLoaded", () => {
  const groomHaldi = document.querySelector(".groom-event .event-content");

  if (groomHaldi) {
    groomHaldi.innerHTML = `
      <h1>Groom's Haldi</h1>
      <p>Sep 21, 2026 - 10:00 AM</p>
      <p>Groom's Home Celebration</p>
    `;
  }

  setupEventReveals();
  setupVoteReveal();
});

function setupVoteReveal() {
  const voteSection = document.querySelector(".vote-section");

  if (!voteSection) return;

  if (!("IntersectionObserver" in window)) {
    voteSection.classList.add("reveal");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal");
        }
      });
    },
    { threshold: 0.45 }
  );

  observer.observe(voteSection);
}

function setupEventReveals() {
  const events = document.querySelectorAll(".event.full");

  if (!("IntersectionObserver" in window)) {
    events.forEach((event) => event.classList.add("reveal"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal");
        }
      });
    },
    { threshold: 0.45 }
  );

  events.forEach((event) => observer.observe(event));
}

function revealVisibleEvents() {
  document.querySelectorAll(".event.full").forEach((event) => {
    const rect = event.getBoundingClientRect();
    const isVisible =
      rect.top < window.innerHeight * 0.65 &&
      rect.bottom > window.innerHeight * 0.35;

    if (isVisible && getComputedStyle(event).display !== "none") {
      event.classList.add("reveal");
    }
  });
}

function joinTeam(team) {
  if (selectedTeam === team) return;

  if (selectedTeam === "groom") {
    groomVotes = Math.max(0, groomVotes - 1);
  } else if (selectedTeam === "bride") {
    brideVotes = Math.max(0, brideVotes - 1);
  }

  if (team === "groom") {
    groomVotes++;
  } else if (team === "bride") {
    brideVotes++;
  }

  selectedTeam = team;
  document.body.dataset.team = team;
  document.querySelectorAll(".team-event").forEach((event) => {
    event.classList.remove("reveal");
  });
  requestAnimationFrame(revealVisibleEvents);

  document.getElementById("groomCount").innerText = groomVotes;
  document.getElementById("brideCount").innerText = brideVotes;
  document.getElementById("teamStatus").innerText =
    team === "groom"
      ? "You are viewing the Groom's Haldi invite."
      : "You are viewing the Bride's Haldi invite.";

  document.getElementById("groomButton").classList.toggle("selected", team === "groom");
  document.getElementById("brideButton").classList.toggle("selected", team === "bride");
}

/* 💬 RSVP COMMENT SYSTEM */
function submitRSVP() {
  const nameInput = document.getElementById("name");
  const messageInput = document.getElementById("message");
  const messages = document.getElementById("messages");

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (name === "" || message === "") return;

  const div = document.createElement("div");
  div.className = "message-card";

  const time = new Date().toLocaleString();
  div.innerHTML = `<strong>${name}:</strong><br>${message}<br><small>${time}</small>`;

  messages.prepend(div);

  nameInput.value = "";
  messageInput.value = "";
}
function createNoteFlowers() {
  const zone = document.querySelector(".flower-zone");
  const emojis = ["🌸", "🌷", "💮", "🌺"];

  for (let i = 0; i < 18; i++) {
    const flower = document.createElement("div");
    flower.classList.add("flower");

    flower.innerText = emojis[Math.floor(Math.random() * emojis.length)];

    flower.style.left = Math.random() * 100 + "%";
    flower.style.animationDuration = 3 + Math.random() * 4 + "s";
    flower.style.fontSize = 14 + Math.random() * 18 + "px";
    flower.style.animationDelay = Math.random() * 3 + "s";

    zone.appendChild(flower);
  }
}

createNoteFlowers();