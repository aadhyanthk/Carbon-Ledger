/**
 * CarbonLedger — Reports Component
 */
import { getActivities, getProfile } from '../services/storage.js';
import { getDailyBudget, CATEGORY_ICONS } from '../services/carbon-data.js';
import { getInsight } from '../services/gemini.js';
import {
  Chart,
  DoughnutController,
  ArcElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip,
  Filler,
} from 'chart.js';

Chart.register(
  DoughnutController,
  ArcElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip,
  Filler
);
import { escapeHtml } from '../utils/sanitize.js';

let donutChart = null;
let lineChart = null;
let currentPeriod = 'week'; // 'week', 'month', 'all'

/**
 * Render the entire reports page.
 * @returns {Promise<string>}
 */
export async function render() {
  return `
    <div class="page-header">
      <button id="btn-reports-back" class="back-btn" aria-label="Go back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1>Reports</h1>
    </div>

    <div class="reports-wrap fade-in">
      <div class="period-selector">
        <button class="period-btn active" data-period="week">This Week</button>
        <button class="period-btn" data-period="month">This Month</button>
        <button class="period-btn" data-period="all">All Time</button>
      </div>

      <div id="ai-insight-container">
        <!-- Gemini insight goes here -->
      </div>

      <div class="card chart-card mb-24">
        <div class="section-title">Category Breakdown</div>
        <div class="chart-wrap">
          <canvas id="donut-chart" role="img" aria-label="Donut chart showing carbon emissions by category"></canvas>
        </div>
      </div>

      <div class="card chart-card mb-24">
        <div class="section-title">Daily Trend</div>
        <div class="chart-wrap">
          <canvas id="line-chart" role="img" aria-label="Line chart showing daily carbon emissions trend"></canvas>
        </div>
      </div>

      <div class="section-title">Carbon Statement</div>
      <div class="statement-card mb-24" id="carbon-statement">
        <!-- Rendered by JS -->
      </div>
      
      <div class="flex gap-12 mb-24" style="flex-direction: column; margin-top: 32px;">
        <button class="btn btn-primary btn-full" id="btn-share">Share my stats 📸</button>
        <button class="btn btn-secondary btn-full" id="btn-export">Export Data (JSON)</button>
      </div>
    </div>
  `;
}

/**
 * Calculate the timestamp range for a given period.
 * @param {string} period - 'week', 'month', or 'all'
 * @returns {{from: number}}
 */
function getPeriodRange(period) {
  const now = new Date();
  if (period === 'week') {
    now.setDate(now.getDate() - 7);
  } else if (period === 'month') {
    now.setMonth(now.getMonth() - 1);
  } else {
    return { from: 0 };
  }
  return { from: now.getTime() };
}

/**
 * Initializes reports event handlers.
 */
export async function init() {
  await loadDataAndRender();

  const backBtn = document.getElementById('btn-reports-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => window.carbonNavigate('/'));
  }

  // Period switching
  const selector = document.querySelector('.period-selector');
  selector.addEventListener('click', async (e) => {
    if (e.target.classList.contains('period-btn')) {
      document
        .querySelectorAll('.period-btn')
        .forEach((b) => b.classList.remove('active'));
      e.target.classList.add('active');
      currentPeriod = e.target.dataset.period;
      await loadDataAndRender();
    }
  });

  // Export
  document.getElementById('btn-export').addEventListener('click', async () => {
    const { getAllData } = await import('../services/storage.js');
    const data = await getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carbon_ledger_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.showToast('Data exported successfully', 'success');
  });

  // Share
  document.getElementById('btn-share').addEventListener('click', async () => {
    const { shareStatsCard } = await import('../utils/share.js');
    const { getProfile, getActivities } =
      await import('../services/storage.js');
    const { getDailyBudget } = await import('../services/carbon-data.js');

    const profile = await getProfile();
    const range = getPeriodRange(currentPeriod);
    const activities = await getActivities(range);

    let totalKg = 0;
    activities.forEach((a) => (totalKg += a.kgCO2));

    const daysInPeriod =
      currentPeriod === 'week'
        ? 7
        : currentPeriod === 'month'
          ? 30
          : Math.max(1, activities.length); // simplified
    const periodBudget = getDailyBudget(profile) * daysInPeriod;
    const isOver = totalKg > periodBudget;

    const periodLabel =
      currentPeriod === 'week'
        ? 'Past 7 Days'
        : currentPeriod === 'month'
          ? 'Past 30 Days'
          : 'All Time';

    const success = await shareStatsCard(profile, totalKg, periodLabel, isOver);
    if (success) {
      window.showToast('Card saved! Share it with friends.', 'success');
    } else {
      window.showToast('Failed to generate card.', 'error');
    }
  });
}

/**
 * Load data and render all report subcomponents.
 * @returns {Promise<void>}
 */
async function loadDataAndRender() {
  const profile = await getProfile();
  const range = getPeriodRange(currentPeriod);
  const activities = await getActivities(range);

  // Aggregate data
  let totalKg = 0;
  const catTotals = {};
  const dailyTotals = {};

  activities.forEach((a) => {
    totalKg += a.kgCO2;
    catTotals[a.category] = (catTotals[a.category] || 0) + a.kgCO2;

    const dateStr = new Date(a.timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + a.kgCO2;
  });

  const topCategory =
    Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';
  const daysInPeriod =
    currentPeriod === 'week'
      ? 7
      : currentPeriod === 'month'
        ? 30
        : Math.max(1, Object.keys(dailyTotals).length);
  const dailyBudget = getDailyBudget(profile);
  const periodBudget = dailyBudget * daysInPeriod;

  // Render Charts
  renderDonutChart(catTotals);
  renderLineChart(dailyTotals, dailyBudget);
  renderStatement(activities, totalKg, periodBudget);

  // Fetch AI Insight
  const insightContainer = document.getElementById('ai-insight-container');
  if (activities.length > 0) {
    insightContainer.innerHTML =
      '<div class="text-center text-muted mb-16" aria-live="polite"><div class="spinner"></div> Generating insight...</div>';

    const insightText = await getInsight({
      totalKg,
      budget: periodBudget,
      topCategory,
      period: currentPeriod,
      activities,
    });

    insightContainer.innerHTML = `
      <div class="ai-insight-card fade-in" aria-live="polite">
        <h3>✨ AI Insight</h3>
        <p>${escapeHtml(insightText)}</p>
      </div>
    `;
  } else {
    insightContainer.innerHTML = '';
  }
}

/**
 * Render the doughnut chart for categories.
 * @param {Record<string, number>} catTotals - Category totals map.
 */
function renderDonutChart(catTotals) {
  const ctx = document.getElementById('donut-chart');
  if (donutChart) donutChart.destroy();

  const labels = Object.keys(catTotals);
  const data = Object.values(catTotals);

  if (data.length === 0) {
    ctx.parentElement.innerHTML =
      '<div class="empty-state"><p>No data for this period</p></div>';
    return;
  }

  // Use design system colors
  const colors = [
    '#22c55e',
    '#fbbf24',
    '#f87171',
    '#d97706',
    '#16a34a',
    '#86efac',
  ];

  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { font: { family: 'Inter' } } },
      },
      cutout: '70%',
    },
  });
}

/**
 * Render the daily line chart.
 * @param {Record<string, number>} dailyTotals - Daily totals map.
 * @param {number} dailyBudget - The user's daily budget.
 */
function renderLineChart(dailyTotals, dailyBudget) {
  const wrap = document.getElementById('line-chart')?.parentElement;
  if (!wrap) return;

  if (lineChart) lineChart.destroy();
  if (!document.getElementById('line-chart')) {
    wrap.innerHTML =
      '<canvas id="line-chart" role="img" aria-label="Line chart showing daily carbon emissions trend"></canvas>';
  }
  const ctx = document.getElementById('line-chart');

  const labels = Object.keys(dailyTotals).reverse(); // oldest to newest assuming sort
  const data = Object.values(dailyTotals).reverse();

  if (data.length === 0) return;

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'kg CO₂',
          data,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
        },
        {
          label: 'Budget',
          data: labels.map(() => dailyBudget),
          borderColor: '#f87171',
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false } },
      },
      plugins: { legend: { display: false } },
    },
  });
}

/**
 * Render the carbon statement list.
 * @param {Array<Object>} activities - Array of activity objects.
 * @param {number} totalKg - Total emissions.
 * @param {number} periodBudget - Total budget for the period.
 */
function renderStatement(activities, totalKg, periodBudget) {
  const container = document.getElementById('carbon-statement');

  if (activities.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><p>No transactions to show.</p></div>';
    return;
  }

  const isOver = totalKg > periodBudget;

  container.innerHTML = `
    <div class="statement-header">
      <h3>Carbon Statement</h3>
      <p>${currentPeriod === 'week' ? 'Past 7 Days' : currentPeriod === 'month' ? 'Past 30 Days' : 'All Time'}</p>
      
      <div class="statement-total">
        <div>
          <div class="lbl">Total Emissions</div>
          <div class="val">${totalKg.toFixed(1)} kg</div>
        </div>
        <div style="text-align:right;">
          <div class="lbl">Budget Target</div>
          <div class="val" style="font-size:1.25rem; color: ${isOver ? '#fca5a5' : '#bbf7d0'}">${periodBudget.toFixed(1)} kg</div>
        </div>
      </div>
    </div>
    
    <div class="statement-body">
      ${activities
        .map(
          (a) => `
        <div class="statement-row">
          <div class="stmt-icon">${CATEGORY_ICONS[a.category] || '📊'}</div>
          <div class="stmt-info">
            <div class="stmt-label">${escapeHtml(a.label)}</div>
            <div class="stmt-date">${new Date(a.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <div class="stmt-co2">${a.kgCO2.toFixed(1)}</div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}
