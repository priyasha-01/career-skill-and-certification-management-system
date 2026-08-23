// Application state controller
const state = {
    activeTab: 'dashboard',
    selectedStudentId: null,
    skillsCatalog: [],
    students: []
};

// Map of departments for drop downs
const DEPARTMENTS = [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering"
];

// Map of skills categories for color representations
const CATEGORY_COLORS = {
    "Programming Languages": "bg-blue-100 text-blue-800 border-blue-200",
    "Web Development": "bg-purple-100 text-purple-800 border-purple-200",
    "Cloud & DevOps": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Database Systems": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Data Science & AI": "bg-amber-100 text-amber-800 border-amber-200",
    "Soft Skills": "bg-pink-100 text-pink-800 border-pink-200"
};

// Map of proficiency colors
const PROFICIENCY_COLORS = {
    "Beginner": "bg-slate-100 text-slate-700 border-slate-200",
    "Intermediate": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Advanced": "bg-violet-100 text-violet-800 border-violet-200",
    "Expert": "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent"
};

// Toast Notifications Helper
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `flex items-center w-full max-w-xs p-4 mb-3 text-gray-500 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 transform translate-y-2 opacity-0`;
    
    let iconColor = 'text-green-500 bg-green-100';
    let iconClass = 'fa-check';
    
    if (type === 'error') {
        iconColor = 'text-red-500 bg-red-100';
        iconClass = 'fa-xmark';
    } else if (type === 'warning') {
        iconColor = 'text-amber-500 bg-amber-100';
        iconClass = 'fa-triangle-exclamation';
    }
    
    toast.innerHTML = `
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${iconColor} rounded-lg">
            <i class="fa-solid ${iconClass}"></i>
        </div>
        <div class="ms-3 text-sm font-medium text-gray-800">${message}</div>
        <button type="button" class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);
    
    // Close button event
    toast.querySelector('button').addEventListener('click', () => {
        dismissToast(toast);
    });
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
        dismissToast(toast);
    }, 4000);
}

function dismissToast(toast) {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => {
        toast.remove();
    }, 300);
}

// Modal Toggle Helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.classList.add('overflow-hidden');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
}

// Global Tab Switching Logic
function switchTab(tabId) {
    // 1. Update state
    state.activeTab = tabId;
    
    // 2. Toggle active tab visual states on buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const isCurrent = btn.dataset.tab === tabId;
        if (isCurrent) {
            btn.classList.add('bg-indigo-50', 'text-indigo-600', 'font-semibold');
            btn.classList.remove('text-gray-600', 'hover:bg-gray-50');
        } else {
            btn.classList.remove('bg-indigo-50', 'text-indigo-600', 'font-semibold');
            btn.classList.add('text-gray-600', 'hover:bg-gray-50');
        }
    });

    // 3. Toggle views
    document.querySelectorAll('.tab-view').forEach(view => {
        if (view.id === `${tabId}-view`) {
            view.classList.remove('hidden');
        } else {
            view.classList.add('hidden');
        }
    });
    
    // 4. Trigger data re-loads for respective tab
    if (tabId === 'dashboard') {
        if (window.DashboardTab) window.DashboardTab.init();
    } else if (tabId === 'students') {
        if (window.StudentsTab) window.StudentsTab.init();
    } else if (tabId === 'skills') {
        if (window.SkillsTab) window.SkillsTab.init();
    } else if (tabId === 'certifications') {
        if (window.CertificationsTab) window.CertificationsTab.init();
    } else if (tabId === 'reports') {
        if (window.ReportsTab) window.ReportsTab.init();
    }
}

// Open Student Drawer Portfolio
async function openStudentDrawer(studentId) {
    state.selectedStudentId = studentId;
    const drawer = document.getElementById('student-drawer');
    const overlay = document.getElementById('drawer-overlay');
    
    if (!drawer || !overlay) return;
    
    // Slide in & show
    overlay.classList.remove('hidden', 'pointer-events-none');
    overlay.classList.add('opacity-50');
    drawer.classList.remove('translate-x-full');
    
    // Load student profile details
    if (window.StudentsTab) {
        await window.StudentsTab.loadProfileDetails(studentId);
    }
}

function closeStudentDrawer() {
    state.selectedStudentId = null;
    const drawer = document.getElementById('student-drawer');
    const overlay = document.getElementById('drawer-overlay');
    
    if (!drawer || !overlay) return;
    
    drawer.classList.add('translate-x-full');
    overlay.classList.remove('opacity-50');
    overlay.classList.add('pointer-events-none');
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 300);
}

// Initial App Startup Handler
document.addEventListener('DOMContentLoaded', async () => {
    // Theme Switcher Initialization
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    const themeToggleText = document.getElementById('theme-toggle-text');

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.body.classList.add('dark');
        updateThemeUI(true);
    } else {
        document.body.classList.remove('dark');
        updateThemeUI(false);
    }

    themeToggle?.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeUI(isDark);
    });

    function updateThemeUI(isDark) {
        if (!themeToggleIcon || !themeToggleText) return;
        if (isDark) {
            themeToggleIcon.className = 'fa-solid fa-sun';
            themeToggleText.textContent = 'Light Mode';
        } else {
            themeToggleIcon.className = 'fa-solid fa-moon';
            themeToggleText.textContent = 'Dark Mode';
        }
    }

    // 1. Bind Navigation Click Handlers
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.currentTarget.dataset.tab;
            if (tabId) switchTab(tabId);
        });
    });
    
    // 2. Bind Drawer Closer Click Handler
    document.getElementById('close-drawer-btn')?.addEventListener('click', closeStudentDrawer);
    document.getElementById('drawer-overlay')?.addEventListener('click', closeStudentDrawer);
    
    // 3. Preload global components
    try {
        state.skillsCatalog = await window.API.getSkills();
    } catch (e) {
        showToast("Error pre-loading skills catalog.", "error");
    }
    
    // 4. Load initial tab
    switchTab('dashboard');
});

// Bind globally for sharing
window.app = {
    state,
    DEPARTMENTS,
    CATEGORY_COLORS,
    PROFICIENCY_COLORS,
    showToast,
    openModal,
    closeModal,
    switchTab,
    openStudentDrawer,
    closeStudentDrawer
};
