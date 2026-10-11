// State
let criteriaList = [];
let alternativesList = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  checkBackendHealth();
  loadPreset('job'); // Load default job offer template for instant demonstration
  loadDecisionHistory();
});

// 1. Health Check
async function checkBackendHealth() {
  const dot = document.getElementById('backendDot');
  const text = document.getElementById('backendStatus');

  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      dot.style.backgroundColor = 'var(--success)';
      text.innerText = 'Connected: Java 17 Spring Boot';
    } else {
      throw new Error();
    }
  } catch (err) {
    dot.style.backgroundColor = 'var(--danger)';
    text.innerText = 'Backend Offline';
  }
}

// 2. Criteria Management
function addCriterionRow(name = '', weight = 5) {
  const id = 'crit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  criteriaList.push({ id, name, weight });

  renderCriteria();
  renderAlternativeScoreInputs();
}

function removeCriterion(id) {
  if (criteriaList.length <= 1) {
    alert('You need at least one criterion for evaluation.');
    return;
  }
  criteriaList = criteriaList.filter(c => c.id !== id);
  renderCriteria();
  renderAlternativeScoreInputs();
}

function updateCriterionName(id, newName) {
  const c = criteriaList.find(item => item.id === id);
  if (c) {
    c.name = newName;
    renderAlternativeScoreInputs();
  }
}

function updateCriterionWeight(id, newWeight) {
  const c = criteriaList.find(item => item.id === id);
  if (c) {
    c.weight = parseFloat(newWeight);
    document.getElementById(`weight_badge_${id}`).innerText = newWeight;
  }
}

function renderCriteria() {
  const container = document.getElementById('criteriaList');
  container.innerHTML = '';

  criteriaList.forEach((c) => {
    const row = document.createElement('div');
    row.className = 'item-row criteria-grid';
    row.innerHTML = `
      <div>
        <input type="text" class="form-control" placeholder="Factor name (e.g., Salary, Cost)" 
               value="${escapeHtml(c.name)}" oninput="updateCriterionName('${c.id}', this.value)" required>
      </div>
      <div class="weight-slider-wrap">
        <span style="font-size: 0.75rem; color: var(--text-muted);">Priority:</span>
        <input type="range" min="1" max="10" step="1" value="${c.weight}" 
               style="flex: 1;" oninput="updateCriterionWeight('${c.id}', this.value)">
        <span class="weight-badge" id="weight_badge_${c.id}">${c.weight}</span>
      </div>
      <div>
        <button type="button" class="btn-danger-icon" title="Remove Factor" onclick="removeCriterion('${c.id}')">✕</button>
      </div>
    `;
    container.appendChild(row);
  });
}

// 3. Alternatives Management
function addAlternativeCard(name = '', scores = {}) {
  const id = 'alt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  alternativesList.push({ id, name, scores });

  renderAlternatives();
}

function removeAlternative(id) {
  if (alternativesList.length <= 2) {
    alert('At least 2 alternatives are required for a comparison.');
    return;
  }
  alternativesList = alternativesList.filter(a => a.id !== id);
  renderAlternatives();
}

function updateAlternativeName(id, newName) {
  const a = alternativesList.find(item => item.id === id);
  if (a) a.name = newName;
}

function updateAlternativeScore(altId, criterionName, val) {
  const a = alternativesList.find(item => item.id === altId);
  if (a) {
    if (!a.scores) a.scores = {};
    a.scores[criterionName] = parseFloat(val);
    const badge = document.getElementById(`score_badge_${altId}_${cleanId(criterionName)}`);
    if (badge) badge.innerText = val;
  }
}

function renderAlternatives() {
  const container = document.getElementById('alternativesList');
  container.innerHTML = '';

  alternativesList.forEach((alt, idx) => {
    const card = document.createElement('div');
    card.className = 'alt-card';
    card.id = `card_${alt.id}`;

    let scoresHtml = '';
    criteriaList.forEach(c => {
      const cName = c.name.trim() || 'Factor';
      const currentScore = (alt.scores && alt.scores[cName] !== undefined) ? alt.scores[cName] : 7;
      if (!alt.scores) alt.scores = {};
      alt.scores[cName] = currentScore;

      scoresHtml += `
        <div class="alt-score-item">
          <label title="${escapeHtml(cName)}">${escapeHtml(cName)}</label>
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <input type="range" min="1" max="10" step="1" value="${currentScore}" 
                   style="width: 100%;" 
                   oninput="updateAlternativeScore('${alt.id}', '${escapeHtml(cName)}', this.value)">
            <span style="font-size: 0.75rem; font-weight: bold; min-width: 18px;" 
                  id="score_badge_${alt.id}_${cleanId(cName)}">${currentScore}</span>
          </div>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="alt-header">
        <input type="text" class="form-control" style="font-weight: 600; width: 85%;" 
               placeholder="Alternative ${idx + 1} Name (e.g. Option A)" 
               value="${escapeHtml(alt.name)}" oninput="updateAlternativeName('${alt.id}', this.value)" required>
        <button type="button" class="btn-danger-icon" title="Remove Alternative" onclick="removeAlternative('${alt.id}')">✕</button>
      </div>
      <div class="alt-scores-grid" id="scores_grid_${alt.id}">
        ${scoresHtml}
      </div>
    `;
    container.appendChild(card);
  });
}

function renderAlternativeScoreInputs() {
  alternativesList.forEach(alt => {
    const grid = document.getElementById(`scores_grid_${alt.id}`);
    if (!grid) return;

    let scoresHtml = '';
    criteriaList.forEach(c => {
      const cName = c.name.trim() || 'Factor';
      const currentScore = (alt.scores && alt.scores[cName] !== undefined) ? alt.scores[cName] : 7;
      if (!alt.scores) alt.scores = {};
      alt.scores[cName] = currentScore;

      scoresHtml += `
        <div class="alt-score-item">
          <label title="${escapeHtml(cName)}">${escapeHtml(cName)}</label>
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <input type="range" min="1" max="10" step="1" value="${currentScore}" 
                   style="width: 100%;" 
                   oninput="updateAlternativeScore('${alt.id}', '${escapeHtml(cName)}', this.value)">
            <span style="font-size: 0.75rem; font-weight: bold; min-width: 18px;" 
                  id="score_badge_${alt.id}_${cleanId(cName)}">${currentScore}</span>
          </div>
        </div>
      `;
    });
    grid.innerHTML = scoresHtml;
  });
}

// 4. Quick Presets
function loadPreset(type) {
  if (type === 'job') {
    document.getElementById('decisionTitle').value = 'Evaluating Software Engineer Job Offers';
    document.getElementById('decisionCategory').value = 'Career';
    document.getElementById('decisionDesc').value = 'Comparing two offers considering growth, balance, and compensation.';

    criteriaList = [
      { id: 'c1', name: 'Compensation', weight: 9 },
      { id: 'c2', name: 'Work-Life Balance', weight: 8 },
      { id: 'c3', name: 'Career Growth', weight: 9 },
      { id: 'c4', name: 'Company Culture', weight: 7 }
    ];

    alternativesList = [
      {
        id: 'a1',
        name: 'Offer A: High-Growth AI Startup',
        scores: { 'Compensation': 9, 'Work-Life Balance': 5, 'Career Growth': 10, 'Company Culture': 8 }
      },
      {
        id: 'a2',
        name: 'Offer B: Established Global Tech Corp',
        scores: { 'Compensation': 8, 'Work-Life Balance': 9, 'Career Growth': 7, 'Company Culture': 8 }
      },
      {
        id: 'a3',
        name: 'Offer C: Flexible Remote Agency',
        scores: { 'Compensation': 7, 'Work-Life Balance': 10, 'Career Growth': 6, 'Company Culture': 7 }
      }
    ];
  } else if (type === 'laptop') {
    document.getElementById('decisionTitle').value = 'Choosing Best Engineering Laptop';
    document.getElementById('decisionCategory').value = 'Tech';
    document.getElementById('decisionDesc').value = 'Selecting between portability, battery life, and development power.';

    criteriaList = [
      { id: 'c1', name: 'Processing Performance', weight: 9 },
      { id: 'c2', name: 'Battery Endurance', weight: 8 },
      { id: 'c3', name: 'Price to Value', weight: 8 },
      { id: 'c4', name: 'Portability & Weight', weight: 7 }
    ];

    alternativesList = [
      {
        id: 'a1',
        name: 'MacBook Pro 14" M3',
        scores: { 'Processing Performance': 9, 'Battery Endurance': 10, 'Price to Value': 6, 'Portability & Weight': 9 }
      },
      {
        id: 'a2',
        name: 'Dell XPS 15 OLED',
        scores: { 'Processing Performance': 9, 'Battery Endurance': 6, 'Price to Value': 7, 'Portability & Weight': 7 }
      },
      {
        id: 'a3',
        name: 'Lenovo ThinkPad P14s',
        scores: { 'Processing Performance': 8, 'Battery Endurance': 8, 'Price to Value': 9, 'Portability & Weight': 8 }
      }
    ];
  } else if (type === 'college') {
    document.getElementById('decisionTitle').value = 'Selecting College Specialization Major';
    document.getElementById('decisionCategory').value = 'Education';
    document.getElementById('decisionDesc').value = 'Choosing master specialization based on industry demand and passion.';

    criteriaList = [
      { id: 'c1', name: 'Industry Job Demand', weight: 10 },
      { id: 'c2', name: 'Personal Interest & Passion', weight: 9 },
      { id: 'c3', name: 'Curriculum Rigor', weight: 6 },
      { id: 'c4', name: 'Long-term Earning Potential', weight: 8 }
    ];

    alternativesList = [
      {
        id: 'a1',
        name: 'Artificial Intelligence & Data Science',
        scores: { 'Industry Job Demand': 10, 'Personal Interest & Passion': 9, 'Curriculum Rigor': 8, 'Long-term Earning Potential': 10 }
      },
      {
        id: 'a2',
        name: 'Cloud Computing & Cyber Security',
        scores: { 'Industry Job Demand': 9, 'Personal Interest & Passion': 8, 'Curriculum Rigor': 7, 'Long-term Earning Potential': 9 }
      }
    ];
  }

  renderCriteria();
  renderAlternatives();
}

// 5. Submit Form & Run Analysis
async function handleAnalyzeDecision(e) {
  e.preventDefault();

  const title = document.getElementById('decisionTitle').value.trim();
  const category = document.getElementById('decisionCategory').value;
  const description = document.getElementById('decisionDesc').value.trim();

  // Validate criteria
  const criteriaMap = {};
  criteriaList.forEach(c => {
    const name = c.name.trim();
    if (name) {
      criteriaMap[name] = c.weight;
    }
  });

  if (Object.keys(criteriaMap).length === 0) {
    alert('Please enter at least one valid criterion name.');
    return;
  }

  // Validate alternatives
  const optionsPayload = [];
  alternativesList.forEach(a => {
    const name = a.name.trim();
    if (name) {
      optionsPayload.push({
        name: name,
        scores: a.scores || {}
      });
    }
  });

  if (optionsPayload.length < 2) {
    alert('Please enter at least two alternatives with valid names.');
    return;
  }

  const payload = {
    title,
    category,
    description,
    criteria: criteriaMap,
    options: optionsPayload
  };

  // UI Loading state
  const btn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('btnSpinner');
  btn.disabled = true;
  btnText.innerText = 'Calculating Matrix & Querying Gemini AI...';
  spinner.style.display = 'inline-block';

  try {
    const response = await fetch('/api/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to analyze decision');
    }

    const result = await response.json();
    displayResults(result);
    loadDecisionHistory(); // refresh history table
  } catch (err) {
    alert('Error evaluating decision: ' + err.message);
  } finally {
    btn.disabled = false;
    btnText.innerText = '🧠 Run Decision Matrix & Gemini AI Analysis';
    spinner.style.display = 'none';
  }
}

// 6. Display Results
function displayResults(data) {
  document.getElementById('emptyResultsState').style.display = 'none';
  const container = document.getElementById('resultsContainer');
  container.style.display = 'block';

  // Winner banner
  document.getElementById('winnerName').innerText = data.recommendation || 'Top Alternative';
  document.getElementById('winnerScore').innerText = Number(data.recommendedScore || 0).toFixed(2);
  const winOpt = (data.rankedOptions && data.rankedOptions[0]) ? data.rankedOptions[0] : null;
  document.getElementById('winnerAlignment').innerText = (winOpt ? winOpt.percentageScore : 0) + '%';
  document.getElementById('winnerMargin').innerText = data.marginOfVictory ? `+${data.marginOfVictory}` : 'Decisive';

  // Ranked List
  const rankedContainer = document.getElementById('rankedList');
  rankedContainer.innerHTML = '';

  if (data.rankedOptions) {
    data.rankedOptions.forEach((opt) => {
      const rankBadgeClass = opt.rank === 1 ? 'rank-1' : (opt.rank === 2 ? 'rank-2' : (opt.rank === 3 ? 'rank-3' : 'rank-other'));
      const rankItem = document.createElement('div');
      rankItem.className = 'rank-item';
      rankItem.innerHTML = `
        <div class="rank-badge ${rankBadgeClass}">#${opt.rank}</div>
        <div class="rank-info">
          <div class="rank-info-top">
            <span>${escapeHtml(opt.name)}</span>
            <span style="color: var(--primary); font-weight: 700;">${opt.score} / 10 <small style="font-weight: normal; color: var(--text-muted);">(${opt.percentageScore}%)</small></span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${opt.percentageScore}%;"></div>
          </div>
        </div>
      `;
      rankedContainer.appendChild(rankItem);
    });
  }

  // AI Explanation Markdown parsing
  const aiBox = document.getElementById('aiExplanationText');
  if (window.marked && data.aiExplanation) {
    aiBox.innerHTML = marked.parse(data.aiExplanation);
  } else {
    aiBox.innerText = data.aiExplanation || 'Analysis complete.';
  }

  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 7. Load Decision History
async function loadDecisionHistory() {
  const grid = document.getElementById('historyGrid');
  const counter = document.getElementById('historyCount');

  try {
    const res = await fetch('/api/decisions');
    if (!res.ok) return;
    const list = await res.json();

    counter.innerText = list.length;

    if (list.length === 0) {
      grid.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem; padding: 1rem;">No saved decisions yet. Create one above!</div>';
      return;
    }

    grid.innerHTML = '';
    list.forEach(d => {
      const card = document.createElement('div');
      card.className = 'history-card';
      const dateFormatted = d.createdAt ? new Date(d.createdAt).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : 'Recently';

      card.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.5rem;">
            <div class="history-title">${escapeHtml(d.title)}</div>
            <span style="font-size: 0.7rem; background: #e0e7ff; color: #4338ca; padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 600;">${escapeHtml(d.category || 'General')}</span>
          </div>
          <div class="history-meta">📅 ${dateFormatted}</div>
          <div style="font-size: 0.85rem; margin-bottom: 0.5rem;">
            <strong style="color: var(--success);">Winner:</strong> ${escapeHtml(d.recommendation || 'N/A')}
            <span style="color: var(--text-muted);">(${d.recommendedScore || 0}/10)</span>
          </div>
        </div>
        <div class="history-actions">
          <button class="btn btn-outline" style="font-size: 0.78rem; padding: 0.3rem 0.65rem;" onclick='viewHistoricDecision(${JSON.stringify(d).replace(/'/g, "&#39;")})'>👁️ View Result</button>
          <button class="btn btn-secondary" style="font-size: 0.78rem; padding: 0.3rem 0.65rem; color: var(--danger);" onclick="deleteDecision(${d.id})">🗑️ Delete</button>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load history:', err);
  }
}

// 8. Delete Decision
async function deleteDecision(id) {
  if (!confirm('Are you sure you want to delete this saved decision?')) {
    return;
  }

  try {
    const res = await fetch(`/api/decisions/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadDecisionHistory();
    } else {
      alert('Failed to delete decision.');
    }
  } catch (err) {
    alert('Error connecting to backend: ' + err.message);
  }
}

function viewHistoricDecision(d) {
  displayResults(d);
}

function scrollToHistory() {
  document.getElementById('historySection').scrollIntoView({ behavior: 'smooth' });
}

// Helpers
function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function cleanId(str) {
  return (str || '').replace(/[^a-zA-Z0-9]/g, '_');
}
