// Initialize Icons — guarded: a blocked CDN must not abort this file
if (typeof lucide !== 'undefined') lucide.createIcons();

// Impact data comes from the shared model in data.js (loaded first),
// so this page and index.html always report identical numbers.
const pData = generateProjectData();

// Wait for DOM to load before updating elements
document.addEventListener("DOMContentLoaded", function() {
    const co2Element = document.getElementById('kpi-co2');
    if (co2Element) {
        co2Element.textContent = pData.totalCO2e.toLocaleString();
    }
});

// Chart Defaults — guarded like lucide above
if (typeof Chart !== 'undefined') {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Outfit', sans-serif";
    Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.05)';
}

// Chart instance holders
let charts = {};

// ─── Chart factory helpers ───
function createBarChart(canvasId, storeKey) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx || typeof Chart === 'undefined') return;
    if (charts[storeKey]) charts[storeKey].destroy();

    charts[storeKey] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Baseline (Before BioViL)', 'Current (With BioViL)'],
            datasets: [
                {
                    label: 'GHG from Rotting Waste (kg CO₂e)',
                    data: [218, 0],
                    backgroundColor: '#fbbf24',
                    borderRadius: 6,
                    barThickness: 50
                },
                {
                    label: 'GHG from Wood Burning (kg CO₂e)',
                    data: [220.1, 0],
                    backgroundColor: '#f87171',
                    borderRadius: 6,
                    barThickness: 50
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
                tooltip: { backgroundColor: 'rgba(18,25,33,0.9)', padding: 12, cornerRadius: 8 }
            },
            scales: {
                x: { stacked: true, grid: { display: false } },
                y: { stacked: true, beginAtZero: true, grid: { drawBorder: false }, title: { display: true, text: 'kg CO₂e per month' } }
            }
        }
    });
}

function createDoughnutChart(canvasId, storeKey, legendId) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx || typeof Chart === 'undefined') return;
    if (charts[storeKey]) charts[storeKey].destroy();

    const data = [218, 220.1];
    const labels = ['Avoided Methane (Waste)', 'Avoided CO₂ (Firewood)'];
    const colors = ['#fbbf24', '#38bdf8'];

    charts[storeKey] = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }] },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: 'rgba(18,25,33,0.9)', padding: 12, cornerRadius: 8,
                    callbacks: { label: ctx => ' ' + ctx.label + ': ' + ctx.raw + ' kg CO₂e' } }
            }
        }
    });

    // Build custom legend
    if (legendId) {
        const container = document.getElementById(legendId);
        if (container && container.innerHTML === '') {
            labels.forEach((label, i) => {
                const item = document.createElement('div');
                item.className = 'legend-item';
                item.innerHTML = `<div class="legend-label"><span class="legend-color" style="background-color: ${colors[i]}"></span>${label}</div><div class="legend-value">${data[i]} kg/mo</div>`;
                container.appendChild(item);
            });
        }
    }
}

function initBudgetChart() {
    const ctx = document.getElementById('budgetChart')?.getContext('2d');
    if (!ctx || typeof Chart === 'undefined') return;
    if (charts.budget) charts.budget.destroy();

    // Category totals only. Line-item breakdown is kept in the internal
    // budget workbook, not in publicly served source.
    charts.budget = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Construction Materials', 'Infrastructure & IT', 'Professional Services', 'Transport & Ops', 'Software & Licenses'],
            datasets: [{
                data: [1559, 952, 303.35, 115, 70.65],
                backgroundColor: ['#10b981', '#3b82f6', '#fbbf24', '#f87171', '#a78bfa'],
                borderWidth: 0, hoverOffset: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '70%',
            plugins: {
                legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8, color: '#94a3b8', font: { size: 11 } } },
                tooltip: {
                    backgroundColor: 'rgba(18,25,33,0.9)', padding: 12, cornerRadius: 8,
                    callbacks: { label: ctx => ' ' + ctx.label + ': €' + ctx.raw.toFixed(2) }
                }
            }
        }
    });
}

// ─── Re-init charts for a given tab ───
function initChartsForTab(tabId) {
    if (tabId === 'tracker-tab') {
        createBarChart('trackerEmissionsChart', 'trackerBar');
        createDoughnutChart('trackerSourceChart', 'trackerDoughnut', 'trackerSourceLegend');
    } else if (tabId === 'environmental-tab') {
        createBarChart('emissionsChart', 'envBar');
        createDoughnutChart('sourceChart', 'envDoughnut', 'sourceLegend');
    } else if (tabId === 'social-tab') {
        initBudgetChart();
    }
}

// ─── Tab Navigation ───
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    // Init default tab charts
    initChartsForTab('tracker-tab');

    // ─── URL Hash Routing (for cross-page navigation from index.html) ───
    // CSS.escape: a crafted hash (e.g. containing `"` or `]`) would make
    // the selector invalid, and the SyntaxError thrown here would prevent
    // the tab and sidebar listeners below from ever binding.
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        const targetNavItem = document.querySelector(`.nav-item[data-tab="${CSS.escape(hash)}"]`);
        if (targetNavItem) {
            // Deactivate all
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            // Activate target
            targetNavItem.classList.add('active');
            const targetTab = document.getElementById(hash);
            if (targetTab) {
                targetTab.classList.add('active');
                setTimeout(() => initChartsForTab(hash), 50);
            }
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Deactivate ALL nav items (including Overview link)
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));

            // Activate clicked
            item.classList.add('active');
            const targetId = item.getAttribute('data-tab');
            const targetTab = document.getElementById(targetId);
            if (targetTab) {
                targetTab.classList.add('active');
                // Small delay to let the DOM repaint before rendering charts
                setTimeout(() => initChartsForTab(targetId), 50);
            }
        });
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
});
