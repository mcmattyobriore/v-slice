const jsonInput = document.getElementById("jsonInput");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");
const timeLabel = document.getElementById("timeLabel");
const audio = document.getElementById("audio");

let chartData;
let currentTime = 0;
let playing = false;
let audioUnlocked = false;

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
  try {
    chartData = JSON.parse(savedChart);
  } catch {}
}

// ================== UTIL ==================
function updateTimeLabel() {
  const current = Math.floor(currentTime);
  const total = audio.duration ? Math.floor(audio.duration * 1000) : 0;
  timeLabel.textContent = `Time: ${current} ms - ${total} ms`;
}

function stringifyChart(data) {
  const json = JSON.stringify(data, null, 2);
  return json.replace(
    /\[\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*(\[\])\s*\]/g,
    "[$1, $2, $3, $4]"
  );
}

function syncTextarea() {
  jsonInput.value = stringifyChart(chartData);
}

// textarea → chartData
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
  const defaultData = {
    version: "2.0.0",
    scrollSpeed: { easy: 1.8, normal: 2, hard: 2.2 },
    events: [],
    notes: { easy: [], normal: [], hard: [] },
    generatedBy: "VslicR5 - FNF v0.8.0"
  };

  chartData = defaultData;
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
    updateTimeLabel();
    drawChart();
  };
}

function playAudio() {
  unlockAudio();
  audio.play();
  playing = true;
}

function pauseAudio() {
  audio.pause();
  playing = false;
}

function stopAudio() {
  audio.pause();
  audio.currentTime = 0;
  currentTime = 0;
  playing = false;
  updateTimeLabel();
  drawChart();
}

function seekTime(ms) {
  unlockAudio();
  currentTime = Math.max(0, currentTime + ms);
  audio.currentTime = currentTime / 1000;
  updateTimeLabel();
  drawChart();
}

audio.addEventListener("timeupdate", () => {
  if (!playing) return;
  currentTime = audio.currentTime * 1000;
  updateTimeLabel();
  drawChart();
});

// ================== NOTES ==================
function addNote(lane) {
  const note = [
    Math.floor(currentTime),
    lane,
    0,
    []
  ];

  chartData.notes.easy.push([...note]);
  chartData.notes.normal.push([...note]);
  chartData.notes.hard.push([...note]);

  chartData.notes.normal.sort((a, b) => a[0] - b[0]);

  syncTextarea();
  drawChart();
}

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
    const t = n[0];
    const d = n[1];
    const l = n[2];
    if (l <= 0) continue;

    const x = d * 110 + 50;
    const y = centerY - (t - currentTime) * SCROLL_MULT;
    const holdHeight = l * SCROLL_MULT;
    const topY = y - holdHeight;

    if (y < 0 || topY > canvas.height) continue;

    const lane = d % 4;
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = laneColors[lane];
    ctx.fillRect(x - HOLD_WIDTH / 2, topY, HOLD_WIDTH, holdHeight);
    ctx.globalAlpha = 1;
  }

  for (const n of chartData.notes.normal) {
    const t = n[0];
    const d = n[1];
    const delta = Math.abs(t - currentTime);

    const x = d * 110 + 50;
    const y = centerY - (t - currentTime) * SCROLL_MULT;

    if (y < -ARROW_SIZE || y > canvas.height + ARROW_SIZE) continue;

    const lane = d % 4;
    let img = d < 4 ? playerImages[lane] : opponentImages[lane];

    if (delta <= HIT_WINDOW && hitImage.complete) {
      img = hitImage;
    }

    if (img.complete && img.naturalWidth) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotations[lane]);
      ctx.drawImage(img, -ARROW_HALF, -ARROW_HALF, ARROW_SIZE, ARROW_SIZE);
      ctx.restore();
    }
  }
}

updateTimeLabel();
drawChart();
