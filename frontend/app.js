// Career Skill Engine — Frontend Logic
const API_BASE_URL = "http://127.0.0.1:8000";

let state = {
  skills: [],
  enrollments: [],
  certifications: [],
  stats: {},
  currentCategory: 'All',
  isOnline: false
};

// Icon Mapping Helper
function getIconClass(category) {
  switch (category.toLowerCase()) {
    case 'cloud': return 'fa-solid fa-cloud text-sky-400';
    case 'devops': return 'fa-solid fa-cpu text-emerald-400';
    case 'backend': return 'fa-solid fa-server text-indigo-400';
    case 'security': return 'fa-solid fa-shield-halved text-rose-400';
    case 'frontend': return 'fa-solid fa-layer-group text-amber-400';
    case 'ai & data': return 'fa-solid fa-brain text-purple-400';
    default: return 'fa-solid fa-code text-indigo-400';
  }
}

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  await checkHealth();
  await refreshData();
}

async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/`, { method: 'GET' });
    if (res.ok) {
      state.isOnline = true;
      updateStatusBadge(true);
    } else {
      updateStatusBadge(false);
    }
  } catch (err) {
    state.isOnline = false;
    updateStatusBadge(false);
  }
}

function updateStatusBadge(online) {
  const badge = document.getElementById("api-status-badge");
  if (online) {
    badge.innerHTML = `
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
      <span class="text-emerald-300 font-medium">FastAPI Connected (:8000)</span>
    `;
    badge.className = "flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs";
  } else {
    badge.innerHTML = `
      <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
      <span class="text-amber-300">Offline / Standalone Mode</span>
    `;
    badge.className = "flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/30 text-xs";
  }
}

async function refreshData() {
  if (state.isOnline) {
    try {
      const [skillsRes, enrollRes, certRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/skills`),
        fetch(`${API_BASE_URL}/api/enrollments`),
        fetch(`${API_BASE_URL}/api/certifications`),
        fetch(`${API_BASE_URL}/api/stats`)
      ]);

      if (skillsRes.ok) state.skills = await skillsRes.json();
      if (enrollRes.ok) state.enrollments = await enrollRes.json();
      if (certRes.ok) state.certifications = await certRes.json();
      if (statsRes.ok) state.stats = await statsRes.json();
    } catch (e) {
      console.warn("Failed fetching from API, falling back", e);
    }
  }

  renderStats();
  renderEnrollments();
  renderCatalog();
  renderCertifications();
}

// 1. RENDER STATS
function renderStats() {
  const totalSkills = state.skills.length || 6;
  const activeEnrollments = state.enrollments.filter(e => e.progress_percentage < 100).length;
  const completed = state.enrollments.filter(e => e.progress_percentage === 100).length;
  const hours = state.enrollments.reduce((acc, e) => e.progress_percentage === 100 ? acc + (e.skill?.duration_hours || 0) : acc, 0);

  document.getElementById("stat-total-skills").innerText = totalSkills;
  document.getElementById("stat-active-enrollments").innerText = activeEnrollments;
  document.getElementById("stat-completed").innerText = completed;
  document.getElementById("stat-hours").innerText = `${hours} hrs`;
  document.getElementById("cert-count-badge").innerText = state.certifications.length;
}

// 2. RENDER ENROLLMENTS (DASHBOARD)
function renderEnrollments() {
  const container = document.getElementById("enrollments-list");
  if (!container) return;

  if (state.enrollments.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 glass-card rounded-xl">
        <i class="fa-solid fa-graduation-cap text-3xl text-slate-600 mb-2"></i>
        <p class="text-sm text-slate-300 font-medium">No skills enrolled yet.</p>
        <p class="text-xs text-slate-500 mb-4">Browse the skill catalog to enroll in your first skill!</p>
        <button onclick="switchTab('catalog')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold">
          Browse Catalog
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = state.enrollments.map(e => {
    const isCompleted = e.progress_percentage === 100;
    const cert = state.certifications.find(c => c.enrollment_id === e.id || c.skill_id === e.skill_id);

    return `
      <div class="glass-card p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-start space-x-4">
          <div class="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
            <i class="${getIconClass(e.skill.category)}"></i>
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase">${e.skill.category}</span>
              <span class="text-xs text-slate-400"><i class="fa-solid fa-clock"></i> ${e.skill.duration_hours} hrs</span>
            </div>
            <h3 class="text-base font-bold text-white mt-1">${e.skill.title}</h3>
            <p class="text-xs text-slate-400 mt-0.5 line-clamp-1">${e.skill.description}</p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
          <!-- Progress Bar & Text -->
          <div class="w-full sm:w-44">
            <div class="flex justify-between text-xs mb-1">
              <span class="text-slate-400 font-medium">Progress</span>
              <span class="font-bold ${isCompleted ? 'text-emerald-400' : 'text-indigo-400'}">${e.progress_percentage}%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}" style="width: ${e.progress_percentage}%"></div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2">
            ${!isCompleted ? `
              <button onclick="handleProgressUpdate(${e.id}, ${e.progress_percentage + 25})" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition">
                +25%
              </button>
              <button onclick="handleProgressUpdate(${e.id}, 100)" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition">
                Complete
              </button>
            ` : `
              <button onclick="openCertModal('${cert ? cert.certificate_code : 'CERT-2026-LIVE'}', '${e.skill.title}', '${new Date().toLocaleDateString()}')" class="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center space-x-1.5">
                <i class="fa-solid fa-certificate"></i>
                <span>View Cert</span>
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// 3. RENDER CATALOG
function renderCatalog() {
  const container = document.getElementById("skills-grid");
  if (!container) return;

  const filteredSkills = state.currentCategory === 'All'
    ? state.skills
    : state.skills.filter(s => s.category.toLowerCase() === state.currentCategory.toLowerCase());

  container.innerHTML = filteredSkills.map(s => {
    const isEnrolled = state.enrollments.some(e => e.skill_id === s.id);

    return `
      <div class="glass-card p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">
              <i class="${getIconClass(s.category)}"></i>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${getLevelBadgeClass(s.level)}">${s.level}</span>
          </div>

          <span class="text-xs font-bold text-indigo-400 uppercase tracking-wider">${s.category}</span>
          <h3 class="text-base font-bold text-white mt-1 mb-2">${s.title}</h3>
          <p class="text-xs text-slate-400 leading-relaxed mb-4">${s.description}</p>
        </div>

        <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-2">
          <span class="text-xs text-slate-400 font-medium"><i class="fa-solid fa-clock mr-1"></i> ${s.duration_hours} hours</span>
          ${isEnrolled ? `
            <button disabled class="px-3 py-1.5 bg-slate-800 text-slate-500 text-xs font-bold rounded-lg cursor-not-allowed border border-slate-700">
              <i class="fa-solid fa-check mr-1"></i> Enrolled
            </button>
          ` : `
            <button onclick="handleEnroll(${s.id})" class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition shadow-md shadow-indigo-600/30">
              Enroll Now
            </button>
          `}
        </div>
      </div>
    `;
  }).join("");
}

function getLevelBadgeClass(level) {
  switch (level.toLowerCase()) {
    case 'beginner': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'intermediate': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'advanced': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    default: return 'bg-slate-800 text-slate-400';
  }
}

// 4. RENDER CERTIFICATIONS
function renderCertifications() {
  const container = document.getElementById("certifications-grid");
  if (!container) return;

  if (state.certifications.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 glass-panel rounded-2xl">
        <i class="fa-solid fa-award text-4xl text-slate-600 mb-3"></i>
        <h3 class="text-base font-bold text-white">No Certifications Earned Yet</h3>
        <p class="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">Complete 100% of any enrolled skill to automatically generate a verifiable digital certificate!</p>
        <button onclick="switchTab('dashboard')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold">
          Go to Dashboard
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = state.certifications.map(c => `
    <div class="glass-card p-6 rounded-2xl border border-amber-500/20 relative overflow-hidden flex flex-col justify-between">
      <div class="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>

      <div>
        <div class="flex items-center justify-between mb-4">
          <span class="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 uppercase tracking-wider border border-amber-500/30">VERIFIED CREDENTIAL</span>
          <i class="fa-solid fa-award text-amber-400 text-2xl"></i>
        </div>

        <h3 class="text-lg font-bold text-white">${c.skill.title}</h3>
        <p class="text-xs text-slate-400 mt-1">Issued for demonstrating 100% competency in ${c.skill.category}.</p>

        <div class="mt-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-xs flex justify-between items-center">
          <span class="text-slate-500">ID:</span>
          <span class="text-indigo-300 font-semibold">${c.certificate_code}</span>
        </div>
      </div>

      <div class="pt-4 mt-6 border-t border-slate-800 flex items-center justify-between">
        <span class="text-[11px] text-slate-400">Date: ${new Date(c.issue_date).toLocaleDateString()}</span>
        <button onclick="openCertModal('${c.certificate_code}', '${c.skill.title}', '${new Date(c.issue_date).toLocaleDateString()}')" class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center space-x-1">
          <span>View Certificate</span>
          <i class="fa-solid fa-arrow-right text-[10px]"></i>
        </button>
      </div>
    </div>
  `).join("");
}

// HANDLERS
async function handleEnroll(skillId) {
  if (state.isOnline) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/enroll/${skillId}`, { method: 'POST' });
      if (res.ok) {
        await refreshData();
        switchTab('dashboard');
        return;
      }
    } catch (e) {
      console.warn("API enroll failed, updating local state", e);
    }
  }

  // Fallback offline state update
  const skill = state.skills.find(s => s.id === skillId);
  if (skill && !state.enrollments.some(e => e.skill_id === skillId)) {
    const newEnrollment = {
      id: Date.now(),
      skill_id: skillId,
      progress_percentage: 0,
      status: 'Enrolled',
      enrolled_at: new Date().toISOString(),
      skill: skill
    };
    state.enrollments.push(newEnrollment);
    renderStats();
    renderEnrollments();
    renderCatalog();
    switchTab('dashboard');
  }
}

async function handleProgressUpdate(enrollmentId, newPct) {
  const pct = Math.min(100, newPct);

  if (state.isOnline) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/enrollments/${enrollmentId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress_percentage: pct })
      });
      if (res.ok) {
        await refreshData();
        return;
      }
    } catch (e) {
      console.warn("API progress update failed", e);
    }
  }

  // Local fallback
  const enrollment = state.enrollments.find(e => e.id === enrollmentId);
  if (enrollment) {
    enrollment.progress_percentage = pct;
    if (pct === 100) {
      enrollment.status = 'Completed';
      if (!state.certifications.some(c => c.enrollment_id === enrollmentId)) {
        state.certifications.push({
          id: Date.now(),
          skill_id: enrollment.skill_id,
          enrollment_id: enrollmentId,
          certificate_code: `CERT-${enrollment.skill.category.substring(0,4).toUpperCase()}-2026-${Math.floor(1000 + Math.random()*9000)}`,
          issue_date: new Date().toISOString(),
          skill: enrollment.skill
        });
      }
    }
    renderStats();
    renderEnrollments();
    renderCertifications();
  }
}

// MODAL CONTROLS
function openCertModal(code, title, dateStr) {
  document.getElementById("modal-cert-code").innerText = code;
  document.getElementById("modal-cert-title").innerText = title;
  document.getElementById("modal-cert-date").innerText = dateStr;
  document.getElementById("cert-modal").classList.remove("hidden");
}

function closeCertModal() {
  document.getElementById("cert-modal").classList.add("hidden");
}

// TAB SWITCHING
function switchTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".tab-btn").forEach(el => {
    el.classList.remove("active", "bg-indigo-600", "text-white");
    el.classList.add("text-slate-400");
  });

  const activeContent = document.getElementById(`tab-${tabId}`);
  if (activeContent) activeContent.classList.remove("hidden");

  const activeBtn = document.getElementById(`tab-btn-${tabId}`);
  if (activeBtn) activeBtn.classList.add("active");
}

// CATALOG FILTERING
function filterCatalog(category) {
  state.currentCategory = category;
  document.querySelectorAll(".cat-filter-btn").forEach(btn => {
    btn.classList.remove("bg-indigo-600", "text-white");
    btn.classList.add("bg-slate-800", "text-slate-400");
  });
  event.target.classList.remove("bg-slate-800", "text-slate-400");
  event.target.classList.add("bg-indigo-600", "text-white");

  renderCatalog();
}
