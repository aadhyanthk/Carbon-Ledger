/**
 * CarbonLedger — What-If Simulator
 */
import { getProfile } from '../services/storage.js';
import { calcSavings } from '../services/carbon-data.js';
import { whatIf } from '../services/gemini.js';

let profile = null;

export async function render() {
  profile = await getProfile();
  const baseline = profile ? profile.baseline : 16.3;

  return `
    <div class="page-header">
      <button class="back-btn" onclick="window.carbonNavigate('/')" aria-label="Go back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1>Simulator</h1>
    </div>

    <div class="simulator-wrap fade-in">
      <div class="card mb-24">
        <div class="section-title">Quick Scenarios</div>
        <p class="text-muted" style="font-size:0.875rem; margin-bottom:16px;">Move the sliders to see how small changes impact your annual footprint.</p>

        <!-- Transit Slider -->
        <div class="sim-slider-wrap">
          <div class="sim-slider-label">
            <span>🚲 Public transit / bike</span>
            <span class="sim-val" id="val-transit">0 days/wk</span>
          </div>
          <input type="range" id="sim-transit" min="0" max="7" value="0" data-saving="3.84">
        </div>

        <!-- Meat Slider -->
        <div class="sim-slider-wrap">
          <div class="sim-slider-label">
            <span>🥗 Meat-free days</span>
            <span class="sim-val" id="val-meat">0 days/wk</span>
          </div>
          <input type="range" id="sim-meat" min="0" max="7" value="0" data-saving="5.23">
        </div>

        <!-- Thermostat Slider -->
        <div class="sim-slider-wrap mb-16">
          <div class="sim-slider-label">
            <span>❄️ Lower thermostat by</span>
            <span class="sim-val" id="val-thermo">0°C</span>
          </div>
          <input type="range" id="sim-thermo" min="0" max="5" value="0" data-saving="0.86">
        </div>

        <div class="sim-comparison">
          <div class="sim-row">
            <div class="sim-row-label">Current</div>
            <div class="sim-bar-wrap"><div class="sim-bar-fill current" style="width:100%"></div></div>
            <div class="sim-val-right">${Math.round(baseline * 365)} kg</div>
          </div>
          <div class="sim-row">
            <div class="sim-row-label">Projected</div>
            <div class="sim-bar-wrap"><div class="sim-bar-fill projected" id="sim-bar" style="width:100%"></div></div>
            <div class="sim-val-right text-green" id="sim-total-val">${Math.round(baseline * 365)} kg</div>
          </div>
        </div>

        <div class="equivalents-row">
          <div class="equivalent-chip">
            <span class="eq-icon">🌳</span>
            <span class="eq-val" id="eq-trees">0</span>
            <span class="eq-label">trees planted</span>
          </div>
          <div class="equivalent-chip">
            <span class="eq-icon">✈️</span>
            <span class="eq-val" id="eq-flights">0</span>
            <span class="eq-label">flights offset</span>
          </div>
        </div>
      </div>

      <div class="card mb-24">
        <div class="section-title">Ask AI Anything</div>
        <p class="text-muted mb-12" style="font-size:0.875rem;">Type any scenario to see its impact.</p>
        
        <div class="ai-input-wrap">
          <textarea id="whatif-text" class="ai-input" placeholder="What if I installed solar panels?" rows="2"></textarea>
          <button class="ai-send-btn" id="whatif-submit" aria-label="Calculate Scenario">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        
        <div id="whatif-loading" class="hidden mt-16 text-center text-muted">
          <div class="spinner"></div>
          <div class="mt-8">Calculating impact...</div>
        </div>

        <div id="whatif-result" class="mt-16"></div>
      </div>
    </div>
  `;
}

export function init() {
  const baseline = profile ? profile.baseline : 16.3;
  const currentAnnual = baseline * 365;
  
  const sliders = [
    { el: document.getElementById('sim-transit'), val: document.getElementById('val-transit'), suffix: ' days/wk' },
    { el: document.getElementById('sim-meat'), val: document.getElementById('val-meat'), suffix: ' days/wk' },
    { el: document.getElementById('sim-thermo'), val: document.getElementById('val-thermo'), suffix: '°C' }
  ];

  function updateSimulation() {
    let dailySavings = 0;
    
    sliders.forEach(s => {
      if (!s.el) return;
      const v = parseInt(s.el.value, 10);
      s.val.textContent = v + s.suffix;
      
      const kgPerUnit = parseFloat(s.el.dataset.saving);
      // for days/wk sliders, average it out per day. for temp, it applies daily.
      if (s.suffix.includes('wk')) {
        dailySavings += (v * kgPerUnit) / 7;
      } else {
        dailySavings += v * kgPerUnit;
      }
    });

    const savings = calcSavings(dailySavings);
    const newAnnual = Math.max(0, currentAnnual - savings.annual);
    
    document.getElementById('sim-total-val').textContent = Math.round(newAnnual) + ' kg';
    document.getElementById('sim-bar').style.width = Math.max(10, (newAnnual / currentAnnual) * 100) + '%';
    
    document.getElementById('eq-trees').textContent = savings.trees;
    document.getElementById('eq-flights').textContent = savings.flights;
  }

  sliders.forEach(s => {
    if (s.el) s.el.addEventListener('input', updateSimulation);
  });

  // Smart What-If
  const submitBtn = document.getElementById('whatif-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      const text = document.getElementById('whatif-text').value.trim();
      if (!text) return;

      const loader = document.getElementById('whatif-loading');
      const resultDiv = document.getElementById('whatif-result');
      
      loader.classList.remove('hidden');
      resultDiv.innerHTML = '';
      submitBtn.disabled = true;

      const res = await whatIf(text, { baseline });

      loader.classList.add('hidden');
      submitBtn.disabled = false;

      if (!res || !res.summary) {
        window.showToast('Calculation failed. Try again.', 'error');
        return;
      }

      const isPositive = res.annualSavingKg > 0;
      
      resultDiv.innerHTML = `
        <div class="ai-result-card" style="align-items:flex-start;">
          <div class="activity-icon" style="background: ${isPositive ? 'var(--green-100)' : '#fee2e2'}">${isPositive ? '🌿' : '⚠️'}</div>
          <div class="ai-res-info">
            <p style="font-size:0.9rem; margin-bottom:8px;">${res.summary}</p>
            <div class="flex items-center gap-12 mt-8">
              <span style="font-family:'Outfit'; font-weight:700; color:${isPositive ? 'var(--green-700)' : 'var(--red-500)'}">
                ${isPositive ? '-' : '+'}${Math.abs(res.annualSavingKg)} kg/yr
              </span>
              <span style="font-size:0.8rem; color:var(--text-muted)">${res.equivalent}</span>
            </div>
          </div>
        </div>
      `;
    });
  }
}
