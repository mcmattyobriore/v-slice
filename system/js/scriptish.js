const jsonInput = document.getElementById("jsonInput");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");
const timeLabel = document.getElementById("timeLabel");
const audio = document.getElementById("audio");
const timeScroll = document.getElementById("timeScroll");
const noteInfo = document.getElementById("noteInfo");

let chartData;
let currentTime = 0;
let playing = false;
let audioUnlocked = false;
let selectedNote = null;

// ================== CONSTANTS ==================
const ARROW_SIZE = 40;
const ARROW_HALF = ARROW_SIZE / 2;
const HOLD_WIDTH = 20;
const SCROLL_MULT = 0.5;
const HIT_WINDOW = 40;

// ================== IMAGE PATHS ==================
const playerPaths = [
  "system/arrows/arrow_purple.png",
  "system/arrows/arrow_blue.png",
  "system/arrows/arrow_green.png",
  "system/arrows/arrow_red.png"
];

const opponentPaths = [
  "system/arrows/arrow_miss_purple.png",
  "system/arrows/arrow_miss_blue.png",
  "system/arrows/arrow_miss_green.png",
  "system/arrows/arrow_miss_red.png"
];

const hitPath = "system/arrows/hit.png";

// ================== IMAGE LOADING ==================
const playerImages = playerPaths.map(path => {
  const img = new Image();
  img.src = path;
  img.onload = drawChart;
  return img;
});

const opponentImages = opponentPaths.map(path => {
  const img = new Image();
  img.src = path;
  img.onload = drawChart;
  return img;
});

const hitImage = new Image();
hitImage.src = hitPath;
hitImage.onload = drawChart;

// ================== ROTATIONS ==================
const rotations = [
  -Math.PI / 2,
  Math.PI,
  0,
  Math.PI / 2
];

// ================== HOLD COLORS ==================
const laneColors = ["#C24B99", "#00FFFF", "#12FA05", "#F9393F"];

// ================== INPUT ==================
window.addEventListener("keydown", e => {
  if (document.activeElement === jsonInput) return;

  switch (e.key.toLowerCase()) {
    case "arrowleft": addNote(0); break;
    case "arrowdown": addNote(1); break;
    case "arrowup": addNote(2); break;
    case "arrowright": addNote(3); break;
    case "a": addNote(4); break;
    case "s": addNote(5); break;
    case "w": addNote(6); break;
    case "d": addNote(7); break;
    case " ":
      e.preventDefault();
      unlockAudio();
      playing ? pauseAudio() : playAudio();
      break;
  }
});

// ================== CHART DATA ==================
chartData = {
  version: "2.0.0",
  scrollSpeed: { easy: 1.8, normal: 2, hard: 2.2 },
  events: [],
  notes: { easy: [], normal: [], hard: [] },
  generatedBy: "VslicR5 - FNF v0.8.0"
};

const savedChart = localStorage.getItem("vslicr5_chart");
if (savedChart) {
  try { chartData = JSON.parse(savedChart); } catch {}
}

// ================== UTIL ==================
function updateTimeLabel() {
  const current = Math.floor(currentTime);
  const total = audio.duration ? Math.floor(audio.duration * 1000) : 0;
  timeLabel.textContent = `Time: ${current} ms - ${total} ms`;
}

function stringifyChart(data) {
  const json = JSON.stringify(data, null, 2);
  return json.replace(/\[\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*(\[\])\s*\]/g, "[$1, $2, $3, $4]");
}

function syncTextarea() {
  jsonInput.value = stringifyChart(chartData);
}

jsonInput.addEventListener("input", () => {
  try {
    const parsed = JSON.parse(jsonInput.value);
    if (parsed && parsed.notes) {
      chartData = parsed;
      drawChart();
    }
  } catch {}
});

syncTextarea();

// ================== SAVE / RESET ==================
function saveToLocalStorage() {
  localStorage.setItem("vslicr5_chart", JSON.stringify(chartData));
  syncTextarea();
}

function resetToDefault() {
  chartData = {
    version: "2.0.0",
    scrollSpeed: { easy: 1.8, normal: 2, hard: 2.2 },
    events: [],
    notes: { easy: [], normal: [], hard: [] },
    generatedBy: "VslicR5 - FNF v0.8.0"
  };
  localStorage.removeItem("vslicr5_chart");
  syncTextarea();
  drawChart();
}

// ================== AUDIO ==================
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  audio.play().then(() => {
    audio.pause();
    audio.currentTime = 0;
  }).catch(() => {});
}

function importAudio(input) {
  const file = input.files[0];
  if (!file) return;

  unlockAudio();
  const url = URL.createObjectURL(file);
  audio.pause();
  audio.src = url;
  audio.load();

  audio.onloadedmetadata = () => {
    currentTime = 0;
    timeScroll.max = Math.floor(audio.duration * 1000);
    timeScroll.value = 0;
    updateTimeLabel();
    drawChart();
  };
}

function playAudio() { unlockAudio(); audio.play(); playing = true; }
function pauseAudio() { audio.pause(); playing = false; }

function stopAudio() {
  audio.pause();
  audio.currentTime = 0;
  currentTime = 0;
  playing = false;
  timeScroll.value = 0;
  updateTimeLabel();
  drawChart();
}

function seekTime(ms) {
  unlockAudio();
  currentTime = Math.max(0, currentTime + ms);
  audio.currentTime = currentTime / 1000;
  timeScroll.value = Math.floor(currentTime);
  updateTimeLabel();
  drawChart();
}

audio.addEventListener("timeupdate", () => {
  if (!playing) return;
  currentTime = audio.currentTime * 1000;
  timeScroll.value = Math.floor(currentTime);
  updateTimeLabel();
  drawChart();
});

// ================== SCROLL ==================
timeScroll.addEventListener("input", () => {
  currentTime = Number(timeScroll.value);
  audio.currentTime = currentTime / 1000;
  updateTimeLabel();
  drawChart();
});

// ================== NOTES ==================
function addNote(lane) {
  const note = [Math.floor(currentTime), lane, 0, []];
  chartData.notes.easy.push([...note]);
  chartData.notes.normal.push([...note]);
  chartData.notes.hard.push([...note]);
  chartData.notes.normal.sort((a, b) => a[0] - b[0]);
  syncTextarea();
  drawChart();
}

// ================== NOTE SELECTION ==================
function highlightNoteInTextarea(note) {
  const text = jsonInput.value;
  const str = JSON.stringify(note);
  const idx = text.indexOf(str);
  if (idx === -1) return;

  jsonInput.focus();
  jsonInput.setSelectionRange(idx, idx + str.length);
  jsonInput.scrollTop = jsonInput.value.substr(0, idx).split("\n").length * 18;
}

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const centerY = canvas.height / 2;

  for (const n of chartData.notes.normal) {
    const x = n[1] * 110 + 50;
    const y = centerY - (n[0] - currentTime) * SCROLL_MULT;
    if (mx > x - 20 && mx < x + 20 && my > y - 20 && my < y + 20) {
      selectedNote = n;
      noteInfo.textContent = `Selected note: ${n[0]}ms | lane ${n[1]}`;
      highlightNoteInTextarea(n);
      drawChart();
      return;
    }
  }
});

// ================== DELETE NOTE (ALL DIFFICULTIES) ==================
canvas.addEventListener("dblclick", () => {
  if (!selectedNote) return;

  const [t, d, l] = selectedNote;

  for (const diff of ["easy", "normal", "hard"]) {
    chartData.notes[diff] = chartData.notes[diff].filter(
      n => !(n[0] === t && n[1] === d && n[2] === l)
    );
  }

  selectedNote = null;
  noteInfo.textContent = "Selected note: none";
  syncTextarea();
  drawChart();
});

// ================== DRAW ==================
function drawChart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  const centerY = canvas.height / 2;

  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(i * 110 + 50, 0);
    ctx.lineTo(i * 110 + 50, canvas.height);
    ctx.stroke();
  }

  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(canvas.width, centerY);
  ctx.stroke();

  for (const n of chartData.notes.normal) {
    const t = n[0], d = n[1], l = n[2];
    if (l > 0) {
      const x = d * 110 + 50;
      const y = centerY - (t - currentTime) * SCROLL_MULT;
      const h = l * SCROLL_MULT;
      const topY = y - h;
      if (!(y < 0 || topY > canvas.height)) {
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = laneColors[d % 4];
        ctx.fillRect(x - HOLD_WIDTH / 2, topY, HOLD_WIDTH, h);
        ctx.globalAlpha = 1;
      }
    }
  }

  for (const n of chartData.notes.normal) {
    const t = n[0], d = n[1];
    const x = d * 110 + 50;
    const y = centerY - (t - currentTime) * SCROLL_MULT;
    if (y < -ARROW_SIZE || y > canvas.height + ARROW_SIZE) continue;

    const lane = d % 4;
    let img = d < 4 ? playerImages[lane] : opponentImages[lane];
    if (Math.abs(t - currentTime) <= HIT_WINDOW && hitImage.complete) img = hitImage;

    if (img.complete) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotations[lane]);
      ctx.drawImage(img, -ARROW_HALF, -ARROW_HALF, ARROW_SIZE, ARROW_SIZE);
      ctx.restore();
    }

    if (n === selectedNote) {
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 24, y - 24, 48, 48);
    }
  }
}

updateTimeLabel();
drawChart();
