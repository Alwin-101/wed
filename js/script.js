// ===============================
// 💌 SUPABASE SETUP
// ===============================
const SUPABASE_URL = "https://guxmdiyahpgafvjmxcjy.supabase.co";
const SUPABASE_KEY = "sb_publishable_55wDOnBQuHrucnL4KCBhLg_mr8BYmXN";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// ===============================
// 💌 OPEN ENVELOPE ANIMATION
// ===============================
function openInvite() {
  const envelope = document.querySelector(".envelope");
  const main = document.getElementById("mainContent");

  envelope.classList.add("open");

  // Wait for flap rotation to finish, then lift letter
  setTimeout(() => {
    envelope.classList.add("lift");
  }, 850); 

  setTimeout(() => {
    document.getElementById("intro").style.display = "none";
    main.style.display = "block";

    confetti({
      particleCount: 180,
      spread: 90,
      origin: { y: 0.6 }
    });
  }, 1800);
}


// ===============================
// ⏳ COUNTDOWN TIMER
// ===============================
const weddingDate = new Date("August 23, 2026 15:00:00").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const gap = weddingDate - now;

  if (gap <= 0) {
    document.getElementById("countdown").innerHTML = "🎉 It's Wedding Time!";
    return;
  }

  const d = Math.floor(gap / (1000 * 60 * 60 * 24));
  const h = Math.floor((gap / (1000 * 60 * 60)) % 24);
  const m = Math.floor((gap / (1000 * 60)) % 60);
  const s = Math.floor((gap / 1000) % 60);

  document.getElementById("countdown").innerHTML = `${d}d ${h}h ${m}m ${s}s`;
}

setInterval(updateCountdown, 1000);


// ===============================
// 🗳 TEAM VOTING SYSTEM (With Sync Backups)
// ===============================
// NOTE: For true production global syncing, fetch these aggregates from a Supabase table!
let groomCount =0; // Adjusted base defaults for visual balance on initial render
let brideCount =0;

function updateVoteUI() {
  const groomCountEl = document.getElementById("groomCount");
  const brideCountEl = document.getElementById("brideCount");
  
  if (groomCountEl && brideCountEl) {
    groomCountEl.innerText = groomCount;
    brideCountEl.innerText = brideCount;
  }

  const total = groomCount + brideCount;
  const groomPercent = total > 0 ? (groomCount / total) * 100 : 50;
  const bridePercent = total > 0 ? (brideCount / total) * 100 : 50;

  const groomBar = document.getElementById("groomBar");
  const brideBar = document.getElementById("brideBar");

  if (groomBar && brideBar) {
    groomBar.style.width = groomPercent + "%";
    brideBar.style.width = bridePercent + "%";
  }

  const sliderText = document.getElementById("sliderText");
  if (sliderText) {
    if (groomPercent > bridePercent) {
      sliderText.innerText = "💙 Groom Side Dominating!";
    } else if (bridePercent > groomPercent) {
      sliderText.innerText = "💖 Bride Side Winning!";
    } else {
      sliderText.innerText = "Even match ⚖️";
    }
  }
}

function displayHaldiSchedule(team) {
  const groomEvent = document.querySelector(".groom-event");
  const brideEvent = document.querySelector(".bride-event");
  const statusText = document.getElementById("teamStatus");

  if (team === "groom") {
    // Add active class to show Groom, remove from Bride
    if (groomEvent) groomEvent.classList.add("active");
    if (brideEvent) brideEvent.classList.remove("active");
    if (statusText) statusText.innerText = "Showing Groom's Haldi schedule 💛";
  } else if (team === "bride") {
    // Add active class to show Bride, remove from Groom
    if (brideEvent) brideEvent.classList.add("active");
    if (groomEvent) groomEvent.classList.remove("active");
    if (statusText) statusText.innerText = "Showing Bride's Haldi schedule 💛";
  }
}
function joinTeam(team) {
  if (localStorage.getItem("team")) {
    alert("You already voted 😏");
    return;
  }

  if (team === "groom") {
    groomCount++;
  } else {
    brideCount++;
  }

  localStorage.setItem("team", team);
  displayHaldiSchedule(team);

  // 🎊 small confetti feedback
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 }
  });

  updateVoteUI();
}


// ===============================
// 💌 RSVP - SUBMIT
// ===============================
async function submitRSVP() {
  const nameInput = document.getElementById("name");
  const messageInput = document.getElementById("message");

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!name || !message) {
    alert("Please fill all fields");
    return;
  }

  const { error } = await supabaseClient
    .from("rsvps")
    .insert([{ name, message }]);

  if (error) {
    console.error("Supabase Insertion Error:", error);
    alert("Failed to send 😢");
    return;
  }

  nameInput.value = "";
  messageInput.value = "";

  // Note: Local execution fallback call if real-time engine takes time to broadcast
  loadMessages();
}


// ===============================
// 📩 LOAD RSVP MESSAGES
// ===============================
async function loadMessages() {
  const { data, error } = await supabaseClient
    .from("rsvps")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase Select Error:", error);
    return;
  }

  const messagesDiv = document.getElementById("messages");
  if (!messagesDiv) return;
  
  messagesDiv.innerHTML = "";

  data.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("msg", "card", "p-3", "mb-2", "shadow-sm"); // Boosted styling layout matching Bootstrap layout framework

    div.innerHTML = `
      <strong>${escapeHTML(item.name)}</strong>
      <p class="mb-0 text-muted">${escapeHTML(item.message)}</p>
    `;

    messagesDiv.appendChild(div);
  });
}

// Helper utility function to prevent layout styling injection attacks (XSS) via guest messages
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}


// ===============================
// 🔴 REALTIME RSVP UPDATES
// ===============================
supabaseClient
  .channel("rsvp-live")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "rsvps" },
    () => {
      loadMessages();
    }
  )
  .subscribe();


// ===============================
// 🌸 SCROLL ANIMATIONS (FADE IN)
// ===============================
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.1 }); // triggers when 10% of element framework hits screen window boundaries


// ===============================
// 🚀 INITIAL LOAD
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // Bind dynamic observer targets
  document.querySelectorAll("section, .event").forEach(el => {
    observer.observe(el);
  });

  updateVoteUI();
  loadMessages();

  // Restore dynamic user layout state configurations
  const savedTeam = localStorage.getItem("team");
  if (savedTeam) {
    displayHaldiSchedule(savedTeam);
  }
});