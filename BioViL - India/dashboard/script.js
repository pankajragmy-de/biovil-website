// Initialize Icons — guarded: unpkg/jsDelivr are intermittently blocked on
// some Indian mobile ISPs, and an unguarded top-level throw here would kill
// the whole file (KPIs, charts, sidebar) with no visible error.
if (typeof lucide !== 'undefined') lucide.createIcons();

// Chart Defaults for consistent premium look
if (typeof Chart !== 'undefined') {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Outfit', sans-serif";
    Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.05)';
}

const gradientPrimary = (ctx) => {
    const canvas = ctx.chart.canvas;
    const chartCtx = canvas.getContext('2d');
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.5)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    return gradient;
};

const gradientSecondary = (ctx) => {
    const canvas = ctx.chart.canvas;
    const chartCtx = canvas.getContext('2d');
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    return gradient;
};

// Impact data comes from the shared model in data.js (loaded first),
// so this page and project1.html always report identical numbers.
const pData = generateProjectData();

// Update DOM KPIs automatically (null-safe: a missing element must not
// abort the rest of the file)
const setKpi = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
};
setKpi('kpi-co2', pData.totalCO2e.toLocaleString());
setKpi('kpi-waste', pData.totalWaste.toLocaleString());
setKpi('kpi-biogas', pData.totalBiogas.toLocaleString());
setKpi('kpi-smoke', pData.totalSmokeFree.toLocaleString());

// Update date filter label dynamically based on elapsed time
const dateLabel = document.getElementById('date-filter-label');
if (dateLabel) {
    const elapsedMonths = Math.round((new Date() - new Date(2026, 0, 15)) / (1000 * 60 * 60 * 24 * 30));
    if (elapsedMonths <= 12) {
        dateLabel.textContent = `All Time (Since Jan '26)`;
    } else {
        dateLabel.textContent = `Last ${elapsedMonths} Months`;
    }
}

// 1. Main Trend Chart — Dynamic Weekly Production Rates
const ctxTrend = document.getElementById('trendChart')?.getContext('2d');
if (ctxTrend && typeof Chart !== 'undefined') new Chart(ctxTrend, {
    type: 'line',
    data: {
        labels: pData.labels,
        datasets: [
            {
                label: 'Weekly Waste Diverted (kg)',
                data: pData.wasteData,
                borderColor: '#38bdf8',
                backgroundColor: gradientSecondary,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                yAxisID: 'y1'
            },
            {
                label: 'Weekly Biogas (m³)',
                data: pData.biogasData,
                borderColor: '#10b981',
                backgroundColor: gradientPrimary,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                yAxisID: 'y'
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: { usePointStyle: true, boxWidth: 8 }
            },
            tooltip: {
                backgroundColor: 'rgba(18, 25, 33, 0.9)',
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 8,
                displayColors: true
            }
        },
        scales: {
            x: {
                grid: { display: false }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: { drawBorder: false },
                title: { display: true, text: 'Biogas (m³)', color: '#10b981' }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'Waste (kg)', color: '#38bdf8' }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        }
    }
});

// 2. Feedstock Composition — Real data: 100% Animal Manure from Project 1
const ctxComposition = document.getElementById('compositionChart')?.getContext('2d');
const compositionData = [100];
const compositionLabels = ['Animal Manure (Cow Dung)'];
const compositionColors = ['#fbbf24'];

if (ctxComposition && typeof Chart !== 'undefined') new Chart(ctxComposition, {
    type: 'doughnut',
    data: {
        labels: compositionLabels,
        datasets: [{
            data: compositionData,
            backgroundColor: compositionColors,
            borderWidth: 0,
            hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(18, 25, 33, 0.9)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function(context) {
                        return ' ' + context.label + ': ' + context.raw + '%';
                    }
                }
            }
        }
    }
});

// Build custom legend for Doughnut chart
const legendContainer = document.getElementById('compositionLegend');
if (legendContainer) compositionLabels.forEach((label, i) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
        <div class="legend-label">
            <span class="legend-color" style="background-color: ${compositionColors[i]}"></span>
            ${label}
        </div>
        <div class="legend-value">${compositionData[i]}%</div>
    `;
    legendContainer.appendChild(item);
});

// 3. Active Biodigester Systems — Real: 1 system (Rampur) operational
const ctxAdoption = document.getElementById('adoptionChart')?.getContext('2d');
if (ctxAdoption && typeof Chart !== 'undefined') new Chart(ctxAdoption, {
    type: 'bar',
    data: {
        labels: ['Jan 2026', 'Feb 2026', 'Mar 2026'],
        datasets: [{
            label: 'Active Systems',
            data: [1, 1, 1],
            backgroundColor: '#a78bfa',
            borderRadius: 6,
            barThickness: 40
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
                max: 5,
                grid: { drawBorder: false },
                title: { display: true, text: 'Number of Systems' },
                ticks: { stepSize: 1 }
            },
            x: {
                grid: { display: false }
            }
        }
    }
});

// ─── Sidebar Collapse/Expand Toggle ───
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebar-toggle');
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('expanded');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
}
