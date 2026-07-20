// ─── Shared impact-data model ───
// Single source of truth for the numbers shown on BOTH dashboard pages
// (index.html and project1.html). Keep all tunable constants here so the
// overview and the project page can never drift apart.
//
// Loaded before script.js / project1.js via a plain <script> tag.

// Deterministic pseudo-random: same seed → same value on every visit,
// so the "fluctuation" in historical weeks is stable across reloads.
function pseudoRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function generateProjectData() {
    const startDate = new Date(2026, 0, 15); // Prototype I commissioning
    const currentDate = new Date();

    // Assam monthly biogas yield multiplier (m³ per kg of waste)
    // Jan/Feb cold (0.016), peaks in Summer July/Aug (0.035)
    const yieldCurve = [0.016, 0.018, 0.026, 0.030, 0.033, 0.035, 0.035, 0.034, 0.032, 0.028, 0.022, 0.017];

    let labels = [];
    let wasteData = [];
    let biogasData = [];

    let totalWaste = 0;
    let totalBiogas = 0;

    // Generate week-by-week
    let dateCursor = new Date(startDate);
    let weekIndex = 0;
    while (dateCursor <= currentDate) {
        let month = dateCursor.getMonth();
        let weekLabel = 'W' + Math.ceil(dateCursor.getDate() / 7) + ' ' + (new Intl.DateTimeFormat('en-US', {month: 'short'}).format(dateCursor));
        labels.push(weekLabel);

        // Random fluctuation +/- 15% to weekly waste (140kg base)
        let baseWaste = (weekIndex === 0) ? 70 : 140; // first week partial
        let fluctuation = 1.0 + (pseudoRandom(weekIndex * 123.45) * 0.3 - 0.15);
        let weeklyWaste = Math.round(baseWaste * fluctuation);

        // Biogas yield depends on month temperature + tiny random noise
        let baseYield = yieldCurve[month];
        let yieldFluctuation = 1.0 + (pseudoRandom(weekIndex * 678.9) * 0.1 - 0.05);
        let weeklyBiogas = Number((weeklyWaste * baseYield * yieldFluctuation).toFixed(1));

        wasteData.push(weeklyWaste);
        biogasData.push(weeklyBiogas);
        totalWaste += weeklyWaste;
        totalBiogas += weeklyBiogas;

        // Advance 7 days
        dateCursor.setDate(dateCursor.getDate() + 7);
        weekIndex++;
    }

    // 600kg waste = 218kg CO2. Wood displaces 220.1kg CO2. Overall multiplier ~0.73 per kg waste processed.
    let totalCO2e = Math.round(totalWaste * 0.73);
    let totalSmokeFree = weekIndex * 21; // ~21 hours saved per week

    return { labels, wasteData, biogasData, totalWaste, totalBiogas: Math.round(totalBiogas), totalCO2e, totalSmokeFree };
}
