// ===================================================================
// LifeLens AI - Healthcare Dashboard JavaScript Logic
// ===================================================================

let vitalsChartInstance = null;
const BACKEND_HEALTH_URL = "http://localhost:8080/api/health";

document.addEventListener('DOMContentLoaded', () => {
  initHistory();
  initVitalsChart();
  calculateBmi();
  checkBackendHealth();
  // Poll backend health every 10 seconds
  setInterval(checkBackendHealth, 10000);
});

// ===================================================================
// 1. Backend Health Check Connection (Connects to Flask http://127.0.0.1:5000/api/health)
// ===================================================================
async function checkBackendHealth() {
    const dot = document.getElementById('pulseDot');
    const label = document.getElementById('backendStatusLabel');

    try {
        const response = await fetch(BACKEND_HEALTH_URL);

        if (!response.ok) {
            throw new Error('Backend connection failed');
        }

        const data = await response.json();

        dot.className = 'pulse-dot online';
        label.innerText = 'Spring Boot Backend: Online';
        label.style.color = 'var(--teal-dark)';

    } catch (error) {
      console.error("Backend connection error:", error);
        dot.className = 'pulse-dot offline';
        label.innerText = 'Spring Boot Backend: Offline';
        label.style.color = 'var(--danger)';
    }
}

// ===================================================================
// 2. BMI Live Calculation
// ===================================================================
function calculateBmi() {
  const height = parseFloat(document.getElementById('heightCm').value) || 0;
  const weight = parseFloat(document.getElementById('weightKg').value) || 0;

  if (height > 0 && weight > 0) {
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    document.getElementById('bmiDisplay').innerText = bmi;
    const catBadge = document.getElementById('bmiCategory');

    if (bmi < 18.5) {
      catBadge.innerText = 'Underweight';
      catBadge.className = 'badge-risk badge-risk-moderate';
    } else if (bmi <= 24.9) {
      catBadge.innerText = 'Normal (Healthy)';
      catBadge.className = 'badge-risk badge-risk-low';
    } else if (bmi <= 29.9) {
      catBadge.innerText = 'Overweight';
      catBadge.className = 'badge-risk badge-risk-moderate';
    } else {
      catBadge.innerText = 'Obese';
      catBadge.className = 'badge-risk badge-risk-high';
    }
  }
}

function updateSliderVal(id, text) {
  document.getElementById(id).innerText = text;
}

// ===================================================================
// 3. Quick 1-Click Preset Demonstrations
// ===================================================================
function applyPreset(presetType) {
  if (presetType === 'healthy') {
    document.getElementById('patientName').value = 'Alex Morgan';
    document.getElementById('patientAge').value = '28';
    document.getElementById('patientGender').value = 'Male';
    document.getElementById('bpSystolic').value = '120';
    document.getElementById('bpDiastolic').value = '80';
    document.getElementById('bloodGlucose').value = '95';
    document.getElementById('heartRate').value = '72';
    document.getElementById('heightCm').value = '175';
    document.getElementById('weightKg').value = '70';
    document.getElementById('sleepSlider').value = '7.5';
    updateSliderVal('sleepVal', '7.5 hrs');
    document.getElementById('exerciseSlider').value = '4';
    updateSliderVal('exerciseVal', '4 days / week');

    document.getElementById('symFatigue').checked = false;
    document.getElementById('symHeadache').checked = false;
    document.getElementById('symDizziness').checked = false;
    document.getElementById('symShortnessOfBreath').checked = false;
    document.getElementById('symChestPain').checked = false;
  } else if (presetType === 'hypertension') {
    document.getElementById('patientName').value = 'Marcus Vance';
    document.getElementById('patientAge').value = '52';
    document.getElementById('patientGender').value = 'Male';
    document.getElementById('bpSystolic').value = '158';
    document.getElementById('bpDiastolic').value = '96';
    document.getElementById('bloodGlucose').value = '112';
    document.getElementById('heartRate').value = '88';
    document.getElementById('heightCm').value = '178';
    document.getElementById('weightKg').value = '90';
    document.getElementById('sleepSlider').value = '5.5';
    updateSliderVal('sleepVal', '5.5 hrs');
    document.getElementById('exerciseSlider').value = '1';
    updateSliderVal('exerciseVal', '1 days / week');

    document.getElementById('symFatigue').checked = true;
    document.getElementById('symHeadache').checked = true;
    document.getElementById('symDizziness').checked = true;
    document.getElementById('symShortnessOfBreath').checked = false;
    document.getElementById('symChestPain').checked = false;
  } else if (presetType === 'diabetic') {
    document.getElementById('patientName').value = 'Eleanor Smith';
    document.getElementById('patientAge').value = '46';
    document.getElementById('patientGender').value = 'Female';
    document.getElementById('bpSystolic').value = '138';
    document.getElementById('bpDiastolic').value = '86';
    document.getElementById('bloodGlucose').value = '188';
    document.getElementById('heartRate').value = '84';
    document.getElementById('heightCm').value = '162';
    document.getElementById('weightKg').value = '82';
    document.getElementById('sleepSlider').value = '6.0';
    updateSliderVal('sleepVal', '6.0 hrs');
    document.getElementById('exerciseSlider').value = '2';
    updateSliderVal('exerciseVal', '2 days / week');

    document.getElementById('symFatigue').checked = true;
    document.getElementById('symHeadache').checked = false;
    document.getElementById('symDizziness').checked = false;
    document.getElementById('symShortnessOfBreath').checked = true;
    document.getElementById('symChestPain').checked = false;
  }

  calculateBmi();
  runAnalysis();
}

// ===================================================================
// 4. Assessment Form Submission & Clinical AI Analysis
// ===================================================================
function handleAssessmentSubmit(e) {
  e.preventDefault();

  const btn = document.getElementById('submitBtn');
  const spinner = document.getElementById('spinner');
  const btnText = document.getElementById('submitBtnText');

  btn.disabled = true;
  spinner.style.display = 'inline-block';
  btnText.innerText = 'Analyzing Vitals & Running AI Engine...';

  setTimeout(() => {
    runAnalysis();
    btn.disabled = false;
    spinner.style.display = 'none';
    btnText.innerText = '⚡ Run LifeLens AI Health Assessment';
  }, 500);
}

function runAnalysis() {
  const patient = {
    name: document.getElementById('patientName').value.trim() || 'Patient',
    age: parseInt(document.getElementById('patientAge').value) || 30,
    gender: document.getElementById('patientGender').value,
    bpSys: parseInt(document.getElementById('bpSystolic').value) || 120,
    bpDia: parseInt(document.getElementById('bpDiastolic').value) || 80,
    glucose: parseInt(document.getElementById('bloodGlucose').value) || 95,
    hr: parseInt(document.getElementById('heartRate').value) || 72,
    height: parseFloat(document.getElementById('heightCm').value) || 170,
    weight: parseFloat(document.getElementById('weightKg').value) || 70,
    sleep: parseFloat(document.getElementById('sleepSlider').value) || 7,
    exercise: parseInt(document.getElementById('exerciseSlider').value) || 3,
    symptoms: []
  };

  if (document.getElementById('symFatigue').checked) patient.symptoms.push('Fatigue');
  if (document.getElementById('symHeadache').checked) patient.symptoms.push('Headache');
  if (document.getElementById('symDizziness').checked) patient.symptoms.push('Dizziness');
  if (document.getElementById('symShortnessOfBreath').checked) patient.symptoms.push('Shortness of Breath');
  if (document.getElementById('symChestPain').checked) patient.symptoms.push('Chest Discomfort');

  // BMI
  const heightM = patient.height / 100;
  patient.bmi = parseFloat((patient.weight / (heightM * heightM)).toFixed(1));

  // 1. Calculate Risk & Overall Health Index
  let healthScore = 100;
  let riskLevel = 'Low';
  let riskTitle = 'Low Risk (Optimal Health)';
  let riskClass = 'risk-low';
  let riskIcon = '🛡️';
  let recs = [];
  let summary = '';

  // BP Evaluation
  if (patient.bpSys >= 140 || patient.bpDia >= 90) {
    healthScore -= 24;
    recs.push({
      title: 'Cardiovascular Hypertension Management',
      text: 'Blood pressure is elevated (Stage 2 Hypertension range). Reduce dietary sodium, monitor morning BP, and consult a physician for antihypertensive evaluation.'
    });
  } else if (patient.bpSys >= 130 || patient.bpDia >= 80) {
    healthScore -= 12;
    recs.push({
      title: 'Pre-Hypertension Monitoring',
      text: 'Blood pressure is slightly elevated. Implement DASH diet principles and engage in regular aerobic conditioning.'
    });
  }

  // Glucose Evaluation
  if (patient.glucose >= 140) {
    healthScore -= 28;
    recs.push({
      title: 'Metabolic & Glycemic Regulation',
      text: 'Fasting glucose levels exceed normal parameters (Diabetic threshold). Recommend fasting HbA1c testing and an endocrinology consultation.'
    });
  } else if (patient.glucose >= 100) {
    healthScore -= 14;
    recs.push({
      title: 'Pre-Diabetes Glycemic Control',
      text: 'Glucose is in impaired fasting range (100-125 mg/dL). Minimize refined carbohydrates and high glycemic foods.'
    });
  }

  // BMI Evaluation
  if (patient.bmi >= 30) {
    healthScore -= 15;
    recs.push({
      title: 'Weight & Metabolic Optimization',
      text: 'BMI falls in the obese classification. Consider structured caloric pacing and low-impact joint-sparing exercise.'
    });
  } else if (patient.bmi >= 25) {
    healthScore -= 8;
  }

  // Lifestyle Penalties
  if (patient.sleep < 6) healthScore -= 8;
  if (patient.exercise < 2) healthScore -= 6;
  if (patient.symptoms.length > 0) healthScore -= (patient.symptoms.length * 4);

  healthScore = Math.max(15, Math.min(100, healthScore));

  // Determine Final Risk Level
  if (healthScore >= 80) {
    riskLevel = 'Low';
    riskTitle = 'Low Risk (Optimal Biomarkers)';
    riskClass = 'risk-low';
    riskIcon = '🛡️';
    summary = `Patient ${patient.name} exhibits healthy hemodynamic and metabolic parameters. Vital signs remain well-aligned with clinical reference ranges.`;
    if (recs.length === 0) {
      recs.push({
        title: 'Preventative Wellness Protocol',
        text: 'Continue consistent hydration, 7-8 hours restorative sleep, and 150 minutes of weekly moderate cardiovascular conditioning.'
      });
      recs.push({
        title: 'Annual Biomarker Screening',
        text: 'Maintain scheduled annual comprehensive metabolic panel and lipid panel screenings.'
      });
    }
  } else if (healthScore >= 55) {
    riskLevel = 'Moderate';
    riskTitle = 'Moderate Risk (Targeted Intervention)';
    riskClass = 'risk-moderate';
    riskIcon = '⚠️';
    summary = `Patient ${patient.name} exhibits mild to moderate biometric risk factors. Key targets include BP stabilization, glycemic optimization, and lifestyle adjustment.`;
    recs.push({
      title: 'Circadian Rest & Stress Alleviation',
      text: 'Ensure consistent sleep scheduling and implement parasympathetic relaxation techniques (e.g., box breathing).'
    });
  } else {
    riskLevel = 'High';
    riskTitle = 'High Risk (Prompt Medical Review Required)';
    riskClass = 'risk-high';
    riskIcon = '🚨';
    summary = `Multiple biomarkers for ${patient.name} diverge significantly from safe clinical baselines. Immediate physician evaluation is recommended.`;
  }

  // Update Top Metric Stat Cards
  document.getElementById('cardHealthScore').innerHTML = `${healthScore} <span style="font-size: 0.9rem; font-weight: 500;">/ 100</span>`;
  document.getElementById('cardBp').innerHTML = `${patient.bpSys}/${patient.bpDia} <span style="font-size: 0.85rem; font-weight: 500;">mmHg</span>`;
  document.getElementById('cardGlucose').innerHTML = `${patient.glucose} <span style="font-size: 0.85rem; font-weight: 500;">mg/dL</span>`;
  document.getElementById('cardHr').innerHTML = `${patient.hr} <span style="font-size: 0.85rem; font-weight: 500;">BPM</span>`;

  // Status Labels
  const cardHealthStatus = document.getElementById('cardHealthStatus');
  cardHealthStatus.className = 'metric-sub ' + (healthScore >= 80 ? 'status-optimal' : healthScore >= 55 ? 'status-warning' : 'status-alert');
  cardHealthStatus.innerText = healthScore >= 80 ? '● Optimal Range' : healthScore >= 55 ? '● Caution Advised' : '● Clinical Alert';

  const cardBpStatus = document.getElementById('cardBpStatus');
  cardBpStatus.className = 'metric-sub ' + (patient.bpSys < 130 ? 'status-optimal' : patient.bpSys < 140 ? 'status-warning' : 'status-alert');
  cardBpStatus.innerText = patient.bpSys < 120 ? '● Normal' : patient.bpSys < 130 ? '● Elevated' : '● Hypertension Stage';

  // Update Right Panel AI Banner
  const banner = document.getElementById('riskBanner');
  banner.className = `risk-level-banner ${riskClass}`;
  document.getElementById('riskLevelTitle').innerText = riskTitle;
  document.getElementById('riskIcon').innerText = riskIcon;
  document.getElementById('aiClinicalSummary').innerText = summary;

  // Render Recommendations List
  const recsContainer = document.getElementById('recommendationsList');
  recsContainer.innerHTML = '';
  recs.forEach(r => {
    const item = document.createElement('div');
    item.className = 'rec-item';
    item.innerHTML = `
      <span style="font-size: 1.25rem;">📌</span>
      <div>
        <strong>${r.title}</strong>
        <span>${r.text}</span>
      </div>
    `;
    recsContainer.appendChild(item);
  });

  // Update Chart
  updateVitalsChart(patient);

  // Save to History
  saveToHistory({
    patient: patient.name,
    age: patient.age,
    gender: patient.gender,
    bp: `${patient.bpSys}/${patient.bpDia}`,
    glucose: patient.glucose,
    hr: patient.hr,
    healthScore: healthScore,
    riskLevel: riskLevel,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
  });
}

// ===================================================================
// 5. Chart.js Biometric Vitals Chart
// ===================================================================
function initVitalsChart() {
  const ctx = document.getElementById('vitalsChart').getContext('2d');

  vitalsChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Systolic BP', 'Diastolic BP', 'Glucose', 'Heart Rate', 'BMI (x4)'],
      datasets: [
        {
          label: 'Patient Vitals',
          data: [120, 80, 95, 72, 22.9 * 4],
          backgroundColor: '#0d9488',
          borderRadius: 6
        },
        {
          label: 'Normal Baseline Upper Limit',
          data: [120, 80, 100, 80, 24.9 * 4],
          backgroundColor: '#cbd5e1',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 12, font: { size: 11, family: "'Segoe UI', sans-serif" } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#f1f5f9' },
          ticks: { font: { size: 10 } }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 } }
        }
      }
    }
  });
}

function updateVitalsChart(patient) {
  if (!vitalsChartInstance) return;

  vitalsChartInstance.data.datasets[0].data = [
    patient.bpSys,
    patient.bpDia,
    patient.glucose,
    patient.hr,
    patient.bmi * 4
  ];

  // Dynamic bar color based on blood pressure and glucose
  vitalsChartInstance.data.datasets[0].backgroundColor =
    (patient.bpSys >= 140 || patient.glucose >= 140) ? '#ef4444' :
    (patient.bpSys >= 130 || patient.glucose >= 100) ? '#f59e0b' : '#0d9488';

  vitalsChartInstance.update();
}

// ===================================================================
// 6. Assessment History Management (localStorage)
// ===================================================================
function initHistory() {
  let history = JSON.parse(localStorage.getItem('lifelens_patient_history') || '[]');

  if (history.length === 0) {
    history = [
      {
        patient: 'Sarah Jenkins',
        age: 34,
        gender: 'Female',
        bp: '118/76',
        glucose: 92,
        hr: 68,
        healthScore: 92,
        riskLevel: 'Low',
        timestamp: 'Oct 10, 10:15 AM'
      },
      {
        patient: 'Robert Sterling',
        age: 58,
        gender: 'Male',
        bp: '144/92',
        glucose: 132,
        hr: 82,
        healthScore: 62,
        riskLevel: 'Moderate',
        timestamp: 'Oct 10, 11:40 AM'
      }
    ];
    localStorage.setItem('lifelens_patient_history', JSON.stringify(history));
  }

  renderHistoryTable();
}

function saveToHistory(record) {
  let history = JSON.parse(localStorage.getItem('lifelens_patient_history') || '[]');
  history.unshift(record);
  if (history.length > 20) history.pop();
  localStorage.setItem('lifelens_patient_history', JSON.stringify(history));
  renderHistoryTable();
}

function renderHistoryTable() {
  const tbody = document.getElementById('historyTableBody');
  const countSpan = document.getElementById('historyRecordCount');
  const history = JSON.parse(localStorage.getItem('lifelens_patient_history') || '[]');

  countSpan.innerText = history.length;
  tbody.innerHTML = '';

  if (history.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No historical records saved.</td></tr>';
    return;
  }

  history.forEach((h, idx) => {
    const riskBadgeClass = h.riskLevel === 'Low' ? 'badge-risk-low' : (h.riskLevel === 'Moderate' ? 'badge-risk-moderate' : 'badge-risk-high');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(h.patient)}</strong></td>
      <td>${h.age} / ${h.gender}</td>
      <td>${h.bp} mmHg</td>
      <td>${h.glucose} mg/dL</td>
      <td>${h.hr} BPM</td>
      <td><strong>${h.healthScore}</strong>/100</td>
      <td><span class="badge-risk ${riskBadgeClass}">${h.riskLevel} Risk</span></td>
      <td style="color: var(--text-muted); font-size: 0.8rem;">${h.timestamp}</td>
      <td>
        <button class="action-btn action-btn-danger" onclick="deleteHistoryRecord(${idx})" title="Delete Record">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteHistoryRecord(idx) {
  let history = JSON.parse(localStorage.getItem('lifelens_patient_history') || '[]');
  history.splice(idx, 1);
  localStorage.setItem('lifelens_patient_history', JSON.stringify(history));
  renderHistoryTable();
}

// Navigation Helper
function setActiveNav(element) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
