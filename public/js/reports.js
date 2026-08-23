// Reports & Exports Controller
(function() {
    async function init() {
        await loadReportsPreview();
    }

    async function loadReportsPreview() {
        const tableBody = document.getElementById('reports-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-12 text-center text-gray-400 text-xs">
                    <i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading reporting summary...
                </td>
            </tr>
        `;

        try {
            // Load fresh student list
            const students = await window.API.getStudents();
            window.app.state.students = students;
            
            if (students.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-gray-400 text-xs">
                            No students registered to generate reports.
                        </td>
                    </tr>
                `;
                return;
            }

            // For the preview, fetch full profiles in parallel (up to 10) to display skill counts & certification counts
            const profilePromises = students.slice(0, 15).map(s => window.API.getStudentProfile(s.id));
            const profiles = await Promise.all(profilePromises);

            tableBody.innerHTML = profiles.map(p => {
                const skillsList = p.skills.map(s => s.skill.name).join(', ') || 'None';
                const certsCount = p.certifications.length;
                const verifiedCertsCount = p.certifications.filter(c => c.status === 'Verified').count || p.certifications.filter(c => c.status === 'Verified').length;

                return `
                    <tr class="hover:bg-slate-50 border-b border-gray-100 transition-colors">
                        <td class="px-6 py-4 text-xs font-semibold text-gray-900">${p.name}</td>
                        <td class="px-6 py-4 text-xs text-gray-500">${p.roll_no}</td>
                        <td class="px-6 py-4 text-xs text-gray-500">${p.department}</td>
                        <td class="px-6 py-4 text-xs text-gray-600 max-w-xs truncate" title="${skillsList}">${skillsList}</td>
                        <td class="px-6 py-4 text-xs text-gray-500 text-center font-medium">${verifiedCertsCount} / ${certsCount}</td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-red-500 text-xs">
                        Failed to generate report preview.
                    </td>
                </tr>
            `;
        }
    }

    // Export all data to CSV
    async function exportCSV() {
        try {
            window.app.showToast("Preparing data export...");
            
            const students = await window.API.getStudents();
            if (students.length === 0) {
                window.app.showToast("No student data available to export.", "warning");
                return;
            }

            // Retrieve all profiles sequentially or in bulk
            const profiles = await Promise.all(students.map(s => window.API.getStudentProfile(s.id)));
            
            // Build CSV rows
            let csvContent = "Name,Roll No,Email,Department,Year,Skills (Proficiency - Hours),Certifications (Status)\n";
            
            profiles.forEach(p => {
                const skillsStr = p.skills.map(s => `${s.skill.name} (${s.proficiency} - ${s.learning_hours}h)`).join('; ');
                const certsStr = p.certifications.map(c => `${c.title} by ${c.issuing_org} (${c.status})`).join('; ');
                
                // Wrap values in quotes to handle commas
                const row = [
                    `"${p.name}"`,
                    `"${p.roll_no}"`,
                    `"${p.email}"`,
                    `"${p.department}"`,
                    `"${p.year}"`,
                    `"${skillsStr}"`,
                    `"${certsStr}"`
                ].join(',');
                
                csvContent += row + "\n";
            });
            
            // Trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `student_skills_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            window.app.showToast("Export completed successfully!");
        } catch (error) {
            window.app.showToast("Failed to export data to CSV.", "error");
        }
    }

    // Expose reports controller
    window.ReportsTab = {
        init,
        exportCSV
    };
})();
