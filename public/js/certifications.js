// Certifications Tab Controller
(function() {
    let currentFilterStatus = '';

    async function init() {
        setupFilterListeners();
        await loadCertifications();
    }

    async function loadCertifications() {
        const container = document.getElementById('certifications-catalog-grid');
        if (!container) return;

        container.innerHTML = `
            <div class="col-span-full flex justify-center py-12">
                <i class="fa-solid fa-spinner fa-spin text-3xl text-indigo-500"></i>
            </div>
        `;

        try {
            // Pre-load students for mapping student_id to student name
            if (window.app.state.students.length === 0) {
                window.app.state.students = await window.API.getStudents();
            }
            
            const certs = await window.API.getCertifications('', currentFilterStatus);
            renderCertifications(certs);
        } catch (error) {
            window.app.showToast("Failed to load certifications registry.", "error");
        }
    }

    function renderCertifications(certs) {
        const container = document.getElementById('certifications-catalog-grid');
        if (!container) return;

        if (certs.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <i class="fa-solid fa-award text-gray-400 text-lg"></i>
                    </div>
                    <h3 class="text-sm font-semibold text-gray-900 mb-1">No Certificates Logged</h3>
                    <p class="text-xs text-gray-500">Add credentials directly from student profiles or filters.</p>
                </div>
            `;
            return;
        }

        // Map student IDs for easy lookup
        const studentMap = {};
        window.app.state.students.forEach(s => {
            studentMap[s.id] = s.name;
        });

        container.innerHTML = certs.map(c => {
            let badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
            if (c.status === "Verified") badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
            else if (c.status === "Expired") badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";

            const studentName = studentMap[c.student_id] || `Student #${c.student_id}`;

            return `
                <div class="bg-white border border-gray-100 p-5 rounded-2xl hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start gap-2 mb-3">
                            <span class="px-2 py-0.5 rounded-full text-[9px] border font-bold ${badgeStyle}">${c.status}</span>
                            <span class="text-[10px] text-gray-400 font-semibold">${c.issuing_org}</span>
                        </div>
                        <h4 class="font-bold text-gray-900 text-sm mb-1 leading-snug">${c.title}</h4>
                        
                        <!-- Associated Student (clickable to open profile) -->
                        <button onclick="window.app.openStudentDrawer(${c.student_id})" class="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-medium mb-3 hover:underline">
                            <i class="fa-solid fa-circle-user mr-1 text-[10px]"></i> ${studentName}
                        </button>
                        
                        <div class="space-y-1 text-[10px] text-gray-500 mb-4 border-t border-slate-50 pt-2">
                            ${c.credential_id ? `<div><b>Credential ID:</b> ${c.credential_id}</div>` : ''}
                            <div><b>Issue Date:</b> ${c.issue_date}</div>
                            ${c.expiry_date ? `<div><b>Expiry Date:</b> ${c.expiry_date}</div>` : ''}
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between border-t border-slate-50 pt-3 mt-auto">
                        ${c.verification_url ? `
                            <a href="${c.verification_url}" target="_blank" class="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center">
                                <i class="fa-solid fa-arrow-up-right-from-square mr-1"></i> Verify URL
                            </a>
                        ` : '<span class="text-[10px] text-gray-400 italic">No URL provided</span>'}
                        
                        <div class="flex items-center gap-1.5">
                            <button onclick="window.CertificationsTab.toggleStatus(${c.id}, '${c.status}')" class="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded" title="Toggle Status">
                                <i class="fa-solid fa-rotate text-xs"></i>
                            </button>
                            <button onclick="window.CertificationsTab.deleteCert(${c.id})" class="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded" title="Delete Certification">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function setupFilterListeners() {
        document.querySelectorAll('.cert-filter-pill').forEach(pill => {
            pill.addEventListener('click', (e) => {
                // Update active pill styling
                document.querySelectorAll('.cert-filter-pill').forEach(p => {
                    p.classList.remove('bg-indigo-600', 'text-white');
                    p.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
                });
                
                e.currentTarget.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
                e.currentTarget.classList.add('bg-indigo-600', 'text-white');
                
                currentFilterStatus = e.currentTarget.dataset.status;
                loadCertifications();
            });
        });
    }

    async function toggleStatus(certId, currentStatus) {
        const statuses = ["Pending", "Verified", "Expired"];
        const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
        const newStatus = statuses[nextIndex];

        try {
            await window.API.updateCertification(certId, { status: newStatus });
            window.app.showToast(`Certificate status updated to: ${newStatus}`);
            await loadCertifications();
        } catch (error) {
            window.app.showToast("Failed to update status.", "error");
        }
    }

    async function deleteCert(certId) {
        if (confirm("Are you sure you want to permanently delete this certification record?")) {
            try {
                await window.API.deleteCertification(certId);
                window.app.showToast("Certification deleted.");
                await loadCertifications();
            } catch (error) {
                window.app.showToast("Failed to delete certification.", "error");
            }
        }
    }

    window.CertificationsTab = {
        init,
        loadCertifications,
        toggleStatus,
        deleteCert
    };
})();
