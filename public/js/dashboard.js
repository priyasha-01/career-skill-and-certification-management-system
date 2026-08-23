// Dashboard Tab Controller
(function() {
    let skillChartInstance = null;
    let certOrgChartInstance = null;
    let certStatusChartInstance = null;

    async function init() {
        try {
            const data = await window.API.getAnalytics();
            renderKPIs(data.kpis);
            renderCharts(data);
        } catch (error) {
            window.app.showToast("Failed to load dashboard analytics data.", "error");
            console.error("Dashboard Analytics Error:", error);
        }
    }

    function renderKPIs(kpis) {
        document.getElementById('kpi-total-students').textContent = kpis.total_students;
        document.getElementById('kpi-total-skills').textContent = kpis.total_skills_logged;
        document.getElementById('kpi-total-certs').textContent = kpis.total_certifications_earned;
        
        // Calculate verification percentage
        const percent = kpis.total_certifications_earned > 0 
            ? Math.round((kpis.verified_certifications / kpis.total_certifications_earned) * 100) 
            : 0;
            
        document.getElementById('kpi-verified-certs').textContent = kpis.verified_certifications;
        document.getElementById('kpi-verified-percent').textContent = `${percent}% Verified`;
    }

    function renderCharts(analyticsData) {
        // Destroy existing chart instances to avoid hover overlaps or canvas memory leaks
        if (skillChartInstance) skillChartInstance.destroy();
        if (certOrgChartInstance) certOrgChartInstance.destroy();
        if (certStatusChartInstance) certStatusChartInstance.destroy();

        // 1. Skill Distribution by Category (Doughnut Chart)
        const skillCtx = document.getElementById('skillDistributionChart')?.getContext('2d');
        if (skillCtx) {
            const labels = analyticsData.skills_category_distribution.map(item => item.label);
            const values = analyticsData.skills_category_distribution.map(item => item.value);
            
            skillChartInstance = new Chart(skillCtx, {
                type: 'doughnut',
                data: {
                    labels: labels.length ? labels : ['No Data'],
                    datasets: [{
                        data: values.length ? values : [0],
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.75)',   // Blue
                            'rgba(147, 51, 234, 0.75)',   // Purple
                            'rgba(16, 185, 129, 0.75)',   // Emerald
                            'rgba(99, 102, 241, 0.75)',   // Indigo
                            'rgba(245, 158, 11, 0.75)',   // Amber
                            'rgba(236, 72, 153, 0.75)'    // Pink
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                padding: 15,
                                font: { size: 11, family: 'Plus Jakarta Sans' }
                            }
                        }
                    },
                    cutout: '65%'
                }
            });
        }

        // 2. Certifications by Issuing Organization (Bar Chart)
        const certOrgCtx = document.getElementById('certOrgChart')?.getContext('2d');
        if (certOrgCtx) {
            const labels = analyticsData.certifications_org_distribution.map(item => item.label);
            const values = analyticsData.certifications_org_distribution.map(item => item.value);

            certOrgChartInstance = new Chart(certOrgCtx, {
                type: 'bar',
                data: {
                    labels: labels.length ? labels : ['No Data'],
                    datasets: [{
                        label: 'Certifications',
                        data: values.length ? values : [0],
                        backgroundColor: 'rgba(99, 102, 241, 0.75)', // Indigo
                        borderColor: 'rgb(99, 102, 241)',
                        borderWidth: 1,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                font: { size: 10, family: 'Plus Jakarta Sans' }
                            },
                            grid: { color: '#f1f5f9' }
                        },
                        x: {
                            ticks: {
                                font: { size: 10, family: 'Plus Jakarta Sans' }
                            },
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        // 3. Certifications Status Distribution (Pie Chart)
        const certStatusCtx = document.getElementById('certStatusChart')?.getContext('2d');
        if (certStatusCtx) {
            const labels = analyticsData.certifications_status_distribution.map(item => item.label);
            const values = analyticsData.certifications_status_distribution.map(item => item.value);

            // Match colors to status meanings (Verified = Emerald, Pending = Amber, Expired = Rose/Slate)
            const colorMapping = {
                "Verified": "rgba(16, 185, 129, 0.75)",
                "Pending": "rgba(245, 158, 11, 0.75)",
                "Expired": "rgba(239, 68, 68, 0.75)"
            };
            const backgroundColors = labels.map(label => colorMapping[label] || 'rgba(100, 116, 139, 0.75)');

            certStatusChartInstance = new Chart(certStatusCtx, {
                type: 'pie',
                data: {
                    labels: labels.length ? labels : ['No Data'],
                    datasets: [{
                        data: values.length ? values : [0],
                        backgroundColor: backgroundColors.length ? backgroundColors : ['#cbd5e1'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                padding: 15,
                                font: { size: 11, family: 'Plus Jakarta Sans' }
                            }
                        }
                    }
                }
            });
        }
    }

    // Expose dashboard controller to global scope
    window.DashboardTab = {
        init
    };
})();
