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
// 🗳 TEAM VOTING SYSTEM
// ===============================
let groomCount = 0; 
let brideCount = 0;

function updateVoteUI() {
  const groomCountEl = document.getElementById("groomCount");
  const brideCountEl = document.getElementById("brideCount");
  const statusText = document.getElementById("teamStatus");
  
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

  // Update subheading message dynamically based on selection state
  const currentTeam = localStorage.getItem("team");
  if (currentTeam && statusText) {
    statusText.innerText = `Showing ${currentTeam.charAt(0).toUpperCase() + currentTeam.slice(1)}'s Haldi schedule 💛`;
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

  // Persist choice and stamp structural attribute onto body wrapper
  localStorage.setItem("team", team);
  document.body.setAttribute("data-team", team);

  // 🎊 confetti feedback
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
    div.classList.add("msg", "card", "p-3", "mb-2", "shadow-sm");

    div.innerHTML = `
      <strong>${escapeHTML(item.name)}</strong>
      <p class="mb-0 text-muted">${escapeHTML(item.message)}</p>
    `;

    messagesDiv.appendChild(div);
  });
}

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
}, { threshold: 0.1 });


// ===============================
// 🚀 INITIAL LOAD & INITIALIZATION
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // Bind dynamic observer targets
  document.querySelectorAll("section, .event").forEach(el => {
    observer.observe(el);
  });

  // Restore dynamic user layout state configurations across refreshes safely
  const savedTeam = localStorage.getItem("team");
  if (savedTeam) {
    document.body.setAttribute("data-team", savedTeam);
  }

  updateVoteUI();
  loadMessages();
});