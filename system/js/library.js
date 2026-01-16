/* ================================
   LIBRARY WIDGET / MODAL (UPGRADED)
   Fixed square sizing + placeholders
   Works with openLibrary()
================================ */

(function () {

  /* -------- LIBRARY DATA -------- */
  const LIBRARY_ITEMS = [
    {
      name: "bf.png",
      type: "image",
      content: null
    },
    {
      name: "op.png",
      type: "image",
      content: null
    },
    {
      name: "random-chart.json",
      type: "text",
      content: null
    },
    {
      name: "Example Text",
      type: "text",
      content: "This is a preview of some text.\nYou can put chart data, notes, or descriptions here."
    }
  ];

  /* -------- CREATE MODAL -------- */
  const modal = document.createElement("div");
  modal.id = "library-modal";
  modal.innerHTML = `
    <div id="library-backdrop"></div>
    <div id="library-window">
      <div id="library-header">
        <span>Library</span>
        <button id="library-close">✕</button>
      </div>

      <div id="library-body">
        <div id="library-grid"></div>
        <div id="library-preview">
          <div id="library-preview-inner">
            <small>Select an item to preview</small>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  /* -------- STYLES -------- */
  const style = document.createElement("style");
  style.textContent = `
    #library-modal {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: none;
      font-family: monospace;
    }

    #library-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.6);
    }

    #library-window {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      max-width: 900px;
      height: 70%;
      background: #1a1a1a;
      border: 1px solid #444;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    #library-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: #222;
      border-bottom: 1px solid #333;
      color: #0f0;
    }

    #library-header button {
      background: none;
      border: none;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
    }

    #library-body {
      flex: 1;
      display: flex;
      gap: 10px;
      padding: 10px;
    }

    /* --- FIXED GRID --- */
    #library-grid {
      width: 40%;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      overflow-y: auto;
      align-content: flex-start;
    }

    .library-item {
      width: 100px;
      height: 120px;
      background: #222;
      border: 1px solid #444;
      border-radius: 6px;
      padding: 6px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .library-item:hover {
      background: #333;
    }

    /* --- TRUE SQUARE --- */
    .library-thumb {
      width: 88px;
      height: 88px;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-size: 10px;
      overflow: hidden;
      border-radius: 4px;
    }

    .library-thumb img {
      max-width: 100%;
      max-height: 100%;
      image-rendering: pixelated;
    }

    .library-name {
      margin-top: 4px;
      font-size: 11px;
      color: #0f0;
      text-align: center;
      word-break: break-word;
    }

    #library-preview {
      flex: 1;
      background: #111;
      border: 1px solid #333;
      border-radius: 6px;
      padding: 10px;
      overflow: auto;
      color: #eee;
    }

    #library-preview img {
      max-width: 100%;
      image-rendering: pixelated;
    }

    #library-preview pre {
      white-space: pre-wrap;
      word-break: break-word;
    }
  `;
  document.head.appendChild(style);

  /* -------- POPULATE GRID -------- */
  const grid = modal.querySelector("#library-grid");
  const preview = modal.querySelector("#library-preview-inner");

  LIBRARY_ITEMS.forEach(item => {
    const el = document.createElement("div");
    el.className = "library-item";

    const thumb = document.createElement("div");
    thumb.className = "library-thumb";

    if (item.type === "image") {
      if (item.content) {
        const img = document.createElement("img");
        img.src = item.content;
        thumb.appendChild(img);
      } else {
        thumb.textContent = "EMPTY IMG";
      }
    } else {
      thumb.textContent = "JSON";
    }

    const name = document.createElement("div");
    name.className = "library-name";
    name.textContent = item.name;

    el.appendChild(thumb);
    el.appendChild(name);

    el.onclick = () => {
      if (!item.content) {
        preview.innerHTML = `<small>Empty asset<br>No preview available.</small>`;
        return;
      }

      if (item.type === "image") {
        preview.innerHTML = `<img src="${item.content}">`;
      } else {
        preview.innerHTML = `<pre>${item.content}</pre>`;
      }
    };

    grid.appendChild(el);
  });

  /* -------- OPEN / CLOSE -------- */
  window.openLibrary = function () {
    modal.style.display = "block";
  };

  modal.querySelector("#library-close").onclick = close;
  modal.querySelector("#library-backdrop").onclick = close;

  function close() {
    modal.style.display = "none";
  }

})();
