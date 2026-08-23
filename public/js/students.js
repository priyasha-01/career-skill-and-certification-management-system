// Students Tab & Profile Drawer Controller
(function() {
    let currentStudents = [];
    let isEditingStudent = false;
    let editStudentId = null;

    async function init() {
        populateFilters();
        await loadStudents();
        setupEventListeners();
    }

    function populateFilters() {
        const deptSelect = document.getElementById('student-filter-dept');
        if (deptSelect && deptSelect.options.length <= 2) {
            // Keep the default "All Departments" and append from DEPARTMENTS array
            window.app.DEPARTMENTS.forEach(dept => {
                const opt = document.createElement('option');
                opt.value = dept;
                opt.textContent = dept;
                deptSelect.appendChild(opt);
            });
        }
        
        // Populate departments in Add/Edit Student modal too
        const addDeptSelect = document.getElementById('student-form-dept');
        if (addDeptSelect && addDeptSelect.options.length <= 1) {
            window.app.DEPARTMENTS.forEach(dept => {
                const opt = document.createElement('option');
                opt.value = dept;
                opt.textContent = dept;
                addDeptSelect.appendChild(opt);
            });
        }
    }

    async function loadStudents() {
        const searchInput = document.getElementById('student-search-input')?.value || '';
        const deptSelect = document.getElementById('student-filter-dept')?.value || '';
        
        try {
            const container = document.getElementById('students-grid');
            if (!container) return;
            
            container.innerHTML = `
                <div class="col-span-full flex justify-center py-12">
                    <i class="fa-solid fa-spinner fa-spin text-3xl text-indigo-500"></i>
                </div>
            `;
            
            currentStudents = await window.API.getStudents(searchInput, deptSelect);
            renderStudentsList(currentStudents);
        } catch (error) {
            window.app.showToast("Failed to load students.", "error");
        }
    }

    function renderStudentsList(students) {
        const container = document.getElementById('students-grid');
        if (!container) return;

        if (students.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <i class="fa-solid fa-users-slash text-gray-400 text-lg"></i>
                    </div>
                    <h3 class="text-sm font-semibold text-gray-900 mb-1">No Students Found</h3>
                    <p class="text-xs text-gray-500">Try modifying your search queries or department filters.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = students.map(student => {
            return `
                <div class="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200/80 transition-all-300 flex flex-col justify-between group">
                    <div>
                        <div class="flex items-start justify-between mb-4">
                            <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100">
                                ${student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div class="flex items-center gap-2">
                                <button onclick="window.StudentsTab.editStudent(${student.id}, event)" class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Student">
                                    <i class="fa-solid fa-pen text-xs"></i>
                                </button>
                                <button onclick="window.StudentsTab.deleteStudent(${student.id}, event)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Student">
                                    <i class="fa-solid fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <h3 class="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-base mb-1 truncate">${student.name}</h3>
                        <p class="text-xs text-gray-500 font-medium mb-3">${student.roll_no} • ${student.year}</p>
                        
                        <div class="space-y-1.5 mb-5">
                            <div class="flex items-center gap-2 text-xs text-gray-600">
                                <i class="fa-solid fa-building-columns text-gray-400 w-4 text-center"></i>
                                <span class="truncate">${student.department}</span>
                            </div>
                            <div class="flex items-center gap-2 text-xs text-gray-600">
                                <i class="fa-solid fa-envelope text-gray-400 w-4 text-center"></i>
                                <span class="truncate">${student.email}</span>
                            </div>
                        </div>
                    </div>

                    <button onclick="window.app.openStudentDrawer(${student.id})" class="w-full py-2 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-100 transition-all duration-300">
                        View Skill Profile
                    </button>
                </div>
            `;
        }).join('');
    }

    // Load full profile details inside the side-over drawer
    async function loadProfileDetails(studentId) {
        const headerContainer = document.getElementById('drawer-profile-header');
        const skillsContainer = document.getElementById('drawer-skills-list');
        const certsContainer = document.getElementById('drawer-certs-list');

        if (!headerContainer || !skillsContainer || !certsContainer) return;

        // Set Loading state
        headerContainer.innerHTML = `
            <div class="animate-pulse space-y-3">
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                <div class="h-6 bg-gray-200 rounded w-1/2"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
        `;
        skillsContainer.innerHTML = `<div class="py-4 text-center text-gray-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading skills...</div>`;
        certsContainer.innerHTML = `<div class="py-4 text-center text-gray-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading certifications...</div>`;

        try {
            const profile = await window.API.getStudentProfile(studentId);
            
            // Render Profile Header
            headerContainer.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xl text-indigo-600">
                        ${profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-gray-900">${profile.name}</h2>
                        <p class="text-xs text-gray-500 font-medium">${profile.roll_no} • ${profile.year}</p>
                        <p class="text-xs text-indigo-600 font-semibold mt-0.5">${profile.department}</p>
                    </div>
                </div>
                
                ${profile.bio ? `<p class="mt-4 text-xs text-gray-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50 leading-relaxed">${profile.bio}</p>` : ''}
                
                <div class="flex items-center gap-3 mt-4">
                    ${profile.github_url ? `
                        <a href="${profile.github_url}" target="_blank" class="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-900 hover:text-white border border-gray-200 flex items-center justify-center text-sm text-gray-600 transition-all-300">
                            <i class="fa-brands fa-github"></i>
                        </a>
                    ` : ''}
                    ${profile.linkedin_url ? `
                        <a href="${profile.linkedin_url}" target="_blank" class="w-8 h-8 rounded-lg bg-gray-50 hover:bg-blue-600 hover:text-white border border-gray-200 flex items-center justify-center text-sm text-gray-600 transition-all-300">
                            <i class="fa-brands fa-linkedin"></i>
                        </a>
                    ` : ''}
                    <a href="mailto:${profile.email}" class="w-8 h-8 rounded-lg bg-gray-50 hover:bg-indigo-600 hover:text-white border border-gray-200 flex items-center justify-center text-sm text-gray-600 transition-all-300">
                        <i class="fa-solid fa-envelope"></i>
                    </a>
                </div>
            `;

            // Render Skills
            if (profile.skills.length === 0) {
                skillsContainer.innerHTML = `
                    <div class="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                        <p class="text-xs text-slate-400 mb-2">No skills assigned yet</p>
                        <button onclick="window.StudentsTab.triggerAssignSkill(${profile.id})" class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-lg transition-colors">
                            <i class="fa-solid fa-plus mr-1"></i> Assign Skill
                        </button>
                    </div>
                `;
            } else {
                // Map of proficiency values for progress bars
                const proficiencyWidth = { "Beginner": "25%", "Intermediate": "50%", "Advanced": "75%", "Expert": "100%" };
                const proficiencyProgressColor = { 
                    "Beginner": "bg-slate-400", 
                    "Intermediate": "bg-indigo-400", 
                    "Advanced": "bg-violet-500", 
                    "Expert": "bg-gradient-to-r from-blue-500 to-indigo-600" 
                };

                skillsContainer.innerHTML = `
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Skills Matrix</span>
                        <button onclick="window.StudentsTab.triggerAssignSkill(${profile.id})" class="text-xs text-indigo-600 hover:text-indigo-800 font-bold">
                            <i class="fa-solid fa-plus mr-0.5"></i> Add Skill
                        </button>
                    </div>
                    <div class="space-y-4">
                        ${profile.skills.map(ss => {
                            const badgeStyle = window.app.PROFICIENCY_COLORS[ss.proficiency] || "bg-gray-100 text-gray-700";
                            const barColor = proficiencyProgressColor[ss.proficiency] || "bg-indigo-500";
                            const barWidth = proficiencyWidth[ss.proficiency] || "25%";
                            
                            return `
                                <div class="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col justify-between">
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 class="text-sm font-semibold text-gray-800">${ss.skill.name}</h4>
                                            <p class="text-[10px] text-gray-400 font-medium">${ss.skill.category}</p>
                                        </div>
                                        <div class="flex items-center gap-1.5">
                                            <span class="px-2 py-0.5 text-[9px] font-bold rounded-full border ${badgeStyle}">${ss.proficiency}</span>
                                            ${ss.verified ? `
                                                <span class="text-emerald-500 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded text-[8px] font-bold" title="Verified Skill">
                                                    <i class="fa-solid fa-circle-check"></i> Verified
                                                </span>
                                            ` : `
                                                <button onclick="window.StudentsTab.verifySkill(${profile.id}, ${ss.skill_id})" class="text-[9px] bg-indigo-50 hover:bg-emerald-500 hover:text-white border border-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold transition-all" title="Mark as Verified">
                                                    Verify
                                                </button>
                                            `}
                                        </div>
                                    </div>
                                    
                                    <div class="mt-1">
                                        <div class="flex justify-between items-center text-[10px] text-gray-500 mb-1">
                                            <span>Learning: <b>${ss.learning_hours} hrs</b></span>
                                            <span>Proficiency</span>
                                        </div>
                                        <div class="w-full bg-slate-200 rounded-full h-1.5">
                                            <div class="h-1.5 rounded-full ${barColor}" style="width: ${barWidth}"></div>
                                        </div>
                                    </div>
                                    
                                    <div class="flex justify-end gap-3 mt-3 pt-2 border-t border-slate-100/50">
                                        <button onclick="window.StudentsTab.editSkillHours(${profile.id}, ${ss.skill_id}, ${ss.learning_hours}, '${ss.proficiency}')" class="text-[10px] text-slate-500 hover:text-indigo-600 font-medium">
                                            <i class="fa-solid fa-clock-rotate-left mr-0.5"></i> Update Hours
                                        </button>
                                        <button onclick="window.StudentsTab.removeSkill(${profile.id}, ${ss.skill_id})" class="text-[10px] text-slate-400 hover:text-red-600 font-medium">
                                            <i class="fa-solid fa-trash-can mr-0.5"></i> Detach
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }

            // Render Certifications
            if (profile.certifications.length === 0) {
                certsContainer.innerHTML = `
                    <div class="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                        <p class="text-xs text-slate-400 mb-2">No certificates logged yet</p>
                        <button onclick="window.StudentsTab.triggerAddCert(${profile.id})" class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-lg transition-colors">
                            <i class="fa-solid fa-plus mr-1"></i> Add Certificate
                        </button>
                    </div>
                `;
            } else {
                certsContainer.innerHTML = `
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Certificates Registry</span>
                        <button onclick="window.StudentsTab.triggerAddCert(${profile.id})" class="text-xs text-indigo-600 hover:text-indigo-800 font-bold">
                            <i class="fa-solid fa-plus mr-0.5"></i> Add Cert
                        </button>
                    </div>
                    <div class="space-y-3">
                        ${profile.certifications.map(c => {
                            let badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
                            if (c.status === "Verified") badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
                            else if (c.status === "Expired") badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
                            
                            return `
                                <div class="bg-white border border-gray-100 hover:border-gray-200 p-4 rounded-xl flex items-start justify-between shadow-sm">
                                    <div class="space-y-1">
                                        <h4 class="text-sm font-semibold text-gray-800 leading-snug">${c.title}</h4>
                                        <p class="text-xs text-gray-500 font-medium">${c.issuing_org} ${c.credential_id ? `• ID: ${c.credential_id}` : ''}</p>
                                        <p class="text-[10px] text-gray-400">Issued: ${c.issue_date} ${c.expiry_date ? `| Expires: ${c.expiry_date}` : ''}</p>
                                        
                                        ${c.verification_url ? `
                                            <a href="${c.verification_url}" target="_blank" class="inline-flex items-center text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold mt-1">
                                                <i class="fa-solid fa-arrow-up-right-from-square mr-1"></i> Verify Credential
                                            </a>
                                        ` : ''}
                                    </div>
                                    <div class="flex flex-col items-end gap-2">
                                        <span class="px-2 py-0.5 rounded-full text-[9px] border font-bold ${badgeStyle}">${c.status}</span>
                                        <div class="flex items-center gap-1 mt-1">
                                            <button onclick="window.StudentsTab.toggleCertStatus(${c.id}, '${c.status}')" class="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded" title="Toggle Verification Status">
                                                <i class="fa-solid fa-rotate text-xs"></i>
                                            </button>
                                            <button onclick="window.StudentsTab.deleteCert(${c.id})" class="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded" title="Delete Certificate">
                                                <i class="fa-solid fa-trash-can text-xs"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
        } catch (error) {
            headerContainer.innerHTML = `<p class="text-xs text-red-500">Failed to load profile metadata.</p>`;
        }
    }

    function setupEventListeners() {
        // Search & Filter listeners
        document.getElementById('student-search-input')?.addEventListener('input', debounce(loadStudents, 350));
        document.getElementById('student-filter-dept')?.addEventListener('change', loadStudents);

        // Add Student Form listener
        document.getElementById('add-student-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const payload = {
                name: form.name.value,
                roll_no: form.roll_no.value,
                email: form.email.value,
                department: form.department.value,
                year: form.year.value,
                bio: form.bio.value || null,
                github_url: form.github_url.value || null,
                linkedin_url: form.linkedin_url.value || null
            };

            try {
                if (isEditingStudent) {
                    await window.API.updateStudent(editStudentId, payload);
                    window.app.showToast("Student profile updated successfully.");
                } else {
                    await window.API.createStudent(payload);
                    window.app.showToast("Student registered successfully.");
                }
                window.app.closeModal('add-student-modal');
                form.reset();
                await loadStudents();
            } catch (error) {
                window.app.showToast(error.message || "Failed to save student.", "error");
            }
        });
    }

    // Modal Triggers
    function triggerAddStudent() {
        isEditingStudent = false;
        editStudentId = null;
        
        const form = document.getElementById('add-student-form');
        if (form) form.reset();
        
        document.getElementById('student-modal-title').textContent = "Register New Student";
        document.getElementById('student-modal-submit-btn').textContent = "Register Student";
        
        // Ensure roll_no field is editable
        const rollField = document.getElementById('student-form-roll');
        if (rollField) rollField.disabled = false;
        
        window.app.openModal('add-student-modal');
    }

    async function editStudent(studentId, event) {
        if (event) event.stopPropagation(); // Avoid triggering card view click
        
        isEditingStudent = true;
        editStudentId = studentId;

        document.getElementById('student-modal-title').textContent = "Edit Student Profile";
        document.getElementById('student-modal-submit-btn').textContent = "Save Changes";

        try {
            const student = await window.API.getStudentProfile(studentId);
            const form = document.getElementById('add-student-form');
            
            if (form) {
                form.name.value = student.name;
                form.roll_no.value = student.roll_no;
                // Roll number typically serves as a primary identifier, disable it on edit
                form.roll_no.disabled = true;
                
                form.email.value = student.email;
                form.department.value = student.department;
                form.year.value = student.year;
                form.bio.value = student.bio || '';
                form.github_url.value = student.github_url || '';
                form.linkedin_url.value = student.linkedin_url || '';
            }
            
            window.app.openModal('add-student-modal');
        } catch (error) {
            window.app.showToast("Error retrieving student details.", "error");
        }
    }

    async function deleteStudent(studentId, event) {
        if (event) event.stopPropagation();

        if (confirm("Are you sure you want to permanently delete this student record? This deletes all their skill assignments and certifications.")) {
            try {
                await window.API.deleteStudent(studentId);
                window.app.showToast("Student record deleted.");
                await loadStudents();
                
                // If the deleted student was open in the drawer, close it
                if (window.app.state.selectedStudentId === studentId) {
                    window.app.closeStudentDrawer();
                }
            } catch (error) {
                window.app.showToast("Failed to delete student.", "error");
            }
        }
    }

    // Skill Assignment Operations inside Drawer
    function triggerAssignSkill(studentId) {
        // Set context and load global skill options
        const skillSelect = document.getElementById('assign-skill-select');
        if (skillSelect) {
            skillSelect.innerHTML = '<option value="">Select a skill...</option>';
            window.app.state.skillsCatalog.forEach(skill => {
                const opt = document.createElement('option');
                opt.value = skill.id;
                opt.textContent = `${skill.name} (${skill.category})`;
                skillSelect.appendChild(opt);
            });
        }
        
        const form = document.getElementById('assign-skill-form');
        if (form) {
            form.reset();
            form.dataset.studentId = studentId;
        }
        
        window.app.openModal('assign-skill-modal');
    }

    // Submit Skill Assignment
    document.getElementById('assign-skill-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const studentId = parseInt(form.dataset.studentId);
        
        const payload = {
            skill_id: parseInt(form.skill_id.value),
            proficiency: form.proficiency.value,
            learning_hours: parseInt(form.learning_hours.value) || 0
        };

        try {
            await window.API.assignSkill(studentId, payload);
            window.app.showToast("Skill assigned successfully.");
            window.app.closeModal('assign-skill-modal');
            await loadProfileDetails(studentId);
        } catch (error) {
            window.app.showToast(error.message || "Failed to assign skill.", "error");
        }
    });

    async function verifySkill(studentId, skillId) {
        try {
            await window.API.updateStudentSkill(studentId, skillId, { verified: true });
            window.app.showToast("Skill marked as verified!");
            await loadProfileDetails(studentId);
        } catch (error) {
            window.app.showToast("Failed to verify skill.", "error");
        }
    }

    function editSkillHours(studentId, skillId, currentHours, currentProficiency) {
        const modal = document.getElementById('update-skill-modal');
        const form = document.getElementById('update-skill-form');
        if (!modal || !form) return;
        
        form.dataset.studentId = studentId;
        form.dataset.skillId = skillId;
        form.learning_hours.value = currentHours;
        form.proficiency.value = currentProficiency;
        
        window.app.openModal('update-skill-modal');
    }

    document.getElementById('update-skill-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const studentId = parseInt(form.dataset.studentId);
        const skillId = parseInt(form.dataset.skillId);
        
        const payload = {
            learning_hours: parseInt(form.learning_hours.value),
            proficiency: form.proficiency.value
        };

        try {
            await window.API.updateStudentSkill(studentId, skillId, payload);
            window.app.showToast("Skill progress updated.");
            window.app.closeModal('update-skill-modal');
            await loadProfileDetails(studentId);
        } catch (error) {
            window.app.showToast("Failed to update skill details.", "error");
        }
    });

    async function removeSkill(studentId, skillId) {
        if (confirm("Are you sure you want to remove this skill from the student's profile?")) {
            try {
                await window.API.removeStudentSkill(studentId, skillId);
                window.app.showToast("Skill detached from profile.");
                await loadProfileDetails(studentId);
            } catch (error) {
                window.app.showToast("Failed to remove skill.", "error");
            }
        }
    }

    // Certification Operations inside Drawer
    function triggerAddCert(studentId) {
        const form = document.getElementById('add-cert-form');
        if (form) {
            form.reset();
            form.dataset.studentId = studentId;
        }
        window.app.openModal('add-cert-modal');
    }

    // Submit Add Certificate
    document.getElementById('add-cert-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const studentId = parseInt(form.dataset.studentId);
        
        const payload = {
            title: form.title.value,
            issuing_org: form.issuing_org.value,
            issue_date: form.issue_date.value,
            expiry_date: form.expiry_date.value || null,
            credential_id: form.credential_id.value || null,
            verification_url: form.verification_url.value || null,
            status: form.status.value
        };

        try {
            await window.API.createCertification(studentId, payload);
            window.app.showToast("Certificate registered.");
            window.app.closeModal('add-cert-modal');
            await loadProfileDetails(studentId);
        } catch (error) {
            window.app.showToast("Failed to register certificate.", "error");
        }
    });

    async function toggleCertStatus(certId, currentStatus) {
        const statuses = ["Pending", "Verified", "Expired"];
        const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
        const newStatus = statuses[nextIndex];
        
        try {
            await window.API.updateCertification(certId, { status: newStatus });
            window.app.showToast(`Certificate status updated to: ${newStatus}`);
            if (window.app.state.selectedStudentId) {
                await loadProfileDetails(window.app.state.selectedStudentId);
            }
        } catch (error) {
            window.app.showToast("Failed to update certificate status.", "error");
        }
    }

    async function deleteCert(certId) {
        if (confirm("Are you sure you want to delete this certificate?")) {
            try {
                await window.API.deleteCertification(certId);
                window.app.showToast("Certificate deleted.");
                if (window.app.state.selectedStudentId) {
                    await loadProfileDetails(window.app.state.selectedStudentId);
                }
            } catch (error) {
                window.app.showToast("Failed to delete certificate.", "error");
            }
        }
    }

    // Debounce Utility Helper
    function debounce(func, delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Expose Student methods to window
    window.StudentsTab = {
        init,
        loadStudents,
        loadProfileDetails,
        triggerAddStudent,
        editStudent,
        deleteStudent,
        
        // Skill assigns
        triggerAssignSkill,
        verifySkill,
        editSkillHours,
        removeSkill,
        
        // Cert assigns
        triggerAddCert,
        toggleCertStatus,
        deleteCert
    };
})();
