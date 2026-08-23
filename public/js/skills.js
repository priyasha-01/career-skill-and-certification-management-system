// Skills Catalog Tab Controller
(function() {
    async function init() {
        await loadSkillsCatalog();
        setupEventListeners();
    }

    async function loadSkillsCatalog() {
        const container = document.getElementById('skills-catalog-grid');
        if (!container) return;

        container.innerHTML = `
            <div class="col-span-full flex justify-center py-12">
                <i class="fa-solid fa-spinner fa-spin text-3xl text-indigo-500"></i>
            </div>
        `;

        try {
            const skills = await window.API.getSkills();
            // Sync with global state
            window.app.state.skillsCatalog = skills;
            renderSkillsCatalog(skills);
        } catch (error) {
            window.app.showToast("Failed to load skills catalog.", "error");
        }
    }

    function renderSkillsCatalog(skills) {
        const container = document.getElementById('skills-catalog-grid');
        if (!container) return;

        if (skills.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <i class="fa-solid fa-graduation-cap text-gray-400 text-lg"></i>
                    </div>
                    <h3 class="text-sm font-semibold text-gray-900 mb-1">Skills Catalog Empty</h3>
                    <p class="text-xs text-gray-500">Click the "Add New Skill Option" button to seed skills catalog.</p>
                </div>
            `;
            return;
        }

        // Group skills by category
        const groups = {};
        skills.forEach(skill => {
            if (!groups[skill.category]) {
                groups[skill.category] = [];
            }
            groups[skill.category].push(skill);
        });

        // Generate HTML
        let html = '';
        for (const [category, skillList] of Object.entries(groups)) {
            const badgeClass = window.app.CATEGORY_COLORS[category] || "bg-slate-100 text-slate-800";
            
            html += `
                <div class="col-span-full mt-6 first:mt-0">
                    <div class="flex items-center gap-3 mb-4">
                        <h3 class="text-base font-bold text-gray-800">${category}</h3>
                        <span class="px-2 py-0.5 text-xs font-bold rounded-full ${badgeClass} border">${skillList.length} Skills</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${skillList.map(skill => `
                            <div class="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                                <div>
                                    <h4 class="font-bold text-gray-900 text-sm mb-1.5">${skill.name}</h4>
                                    <p class="text-xs text-gray-500 leading-relaxed">${skill.description || 'No description provided.'}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    function setupEventListeners() {
        // Create new catalog skill form submit
        document.getElementById('create-skill-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const payload = {
                name: form.name.value,
                category: form.category.value,
                description: form.description.value || null
            };

            try {
                await window.API.createSkill(payload);
                window.app.showToast("Skill added to global catalog!");
                window.app.closeModal('create-skill-modal');
                form.reset();
                await loadSkillsCatalog();
            } catch (error) {
                window.app.showToast(error.message || "Failed to create skill.", "error");
            }
        });
    }

    function triggerCreateSkill() {
        const form = document.getElementById('create-skill-form');
        if (form) form.reset();
        window.app.openModal('create-skill-modal');
    }

    window.SkillsTab = {
        init,
        loadSkillsCatalog,
        triggerCreateSkill
    };
})();
