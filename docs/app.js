(function () {
  "use strict";

  const BOARD = [
    [1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0],
  ];

  const MONTH_COORDS = {
    1: [0, 0],
    2: [0, 1],
    3: [0, 2],
    4: [0, 3],
    5: [0, 4],
    6: [0, 5],
    7: [1, 0],
    8: [1, 1],
    9: [1, 2],
    10: [1, 3],
    11: [1, 4],
    12: [1, 5],
  };

  const DAY_COORDS = {
    1: [2, 0],
    2: [2, 1],
    3: [2, 2],
    4: [2, 3],
    5: [2, 4],
    6: [2, 5],
    7: [2, 6],
    8: [3, 0],
    9: [3, 1],
    10: [3, 2],
    11: [3, 3],
    12: [3, 4],
    13: [3, 5],
    14: [3, 6],
    15: [4, 0],
    16: [4, 1],
    17: [4, 2],
    18: [4, 3],
    19: [4, 4],
    20: [4, 5],
    21: [4, 6],
    22: [5, 0],
    23: [5, 1],
    24: [5, 2],
    25: [5, 3],
    26: [5, 4],
    27: [5, 5],
    28: [5, 6],
    29: [6, 0],
    30: [6, 1],
    31: [6, 2],
  };

  const PIECES = [
    [
      [1, 1],
      [1, 0],
      [1, 1],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [1, 1, 0],
    ],
    [
      [1, 1],
      [1, 1],
      [1, 1],
    ],
    [
      [1, 0],
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    [
      [1, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 1],
    ],
    [
      [1, 0],
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
  ];

  const PIECE_COLORS = [
    "",
    "#ef4444",
    "#f59e0b",
    "#84cc16",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#a855f7",
    "#ec4899",
  ];

  function normalizePiece(piece) {
    const rows = piece.length;
    const cols = piece[0].length;
    const ones = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (piece[r][c] === 1) ones.push([r, c]);
      }
    }
    if (!ones.length) throw new Error("Piece has no 1 cells.");
    let minR = Infinity,
      maxR = -Infinity,
      minC = Infinity,
      maxC = -Infinity;
    for (const [r, c] of ones) {
      minR = Math.min(minR, r);
      maxR = Math.max(maxR, r);
      minC = Math.min(minC, c);
      maxC = Math.max(maxC, c);
    }
    const out = [];
    for (let r = minR; r <= maxR; r++) {
      const row = [];
      for (let c = minC; c <= maxC; c++) row.push(piece[r][c]);
      out.push(row);
    }
    return out;
  }

  function rotate90(piece) {
    const rows = piece.length;
    const cols = piece[0].length;
    const out = [];
    for (let c = 0; c < cols; c++) {
      const row = [];
      for (let r = rows - 1; r >= 0; r--) row.push(piece[r][c]);
      out.push(row);
    }
    return out;
  }

  function flipH(piece) {
    return piece.map((row) => [...row].reverse());
  }

  function gridKey(p) {
    return JSON.stringify(p);
  }

  function pieceVariants(piece) {
    const seen = new Set();
    const out = [];
    function add(p) {
      const n = normalizePiece(p);
      const k = gridKey(n);
      if (!seen.has(k)) {
        seen.add(k);
        out.push(n);
      }
    }
    let p = piece;
    for (let i = 0; i < 4; i++) {
      add(p);
      add(flipH(p));
      p = rotate90(p);
    }
    return out;
  }

  function pieceCells(piece) {
    const cells = [];
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece[r].length; c++) {
        if (piece[r][c] === 1) cells.push([r, c]);
      }
    }
    return cells;
  }

  function emptyOccupiedLike(boardMask) {
    return boardMask.map((row) => row.map(() => 0));
  }

  function buildBoardMask(baseMask, blocked) {
    if (!blocked || blocked.size === 0) return baseMask.map((row) => [...row]);
    const out = [];
    for (let r = 0; r < baseMask.length; r++) {
      const row = [];
      for (let c = 0; c < baseMask[r].length; c++) {
        const key = r + "," + c;
        row.push(blocked.has(key) ? 0 : baseMask[r][c]);
      }
      out.push(row);
    }
    return out;
  }

  function boardCells(boardMask) {
    const cells = [];
    for (let r = 0; r < boardMask.length; r++) {
      for (let c = 0; c < boardMask[r].length; c++) {
        if (boardMask[r][c] === 1) cells.push([r, c]);
      }
    }
    return cells;
  }

  function coordKey(r, c) {
    return r + "," + c;
  }

  function blockedForDate(month, day) {
    const m = MONTH_COORDS[month];
    const d = DAY_COORDS[day];
    if (!m || !d) throw new Error("Érvénytelen dátum.");
    const set = new Set();
    set.add(coordKey(m[0], m[1]));
    set.add(coordKey(d[0], d[1]));
    return set;
  }

  function solve(boardMask, pieces) {
    const variantsPerPiece = pieces.map((p) => pieceVariants(p));
    const occupied = emptyOccupiedLike(boardMask);
    const targetCells = boardCells(boardMask);
    const targetCount = targetCells.length;
    let pieceArea = 0;
    for (const p of pieces) {
      for (const row of normalizePiece(p)) {
        for (const v of row) pieceArea += v;
      }
    }
    if (pieceArea !== targetCount) return null;

    const br = boardMask.length;
    const bc = boardMask[0].length;
    const placements = [];

    for (let pi = 0; pi < variantsPerPiece.length; pi++) {
      const vars_ = variantsPerPiece[pi];
      const pieceOpts = [];
      for (let vi = 0; vi < vars_.length; vi++) {
        const variant = vars_[vi];
        const pr = variant.length;
        const pc = variant[0].length;
        const cells = pieceCells(variant);
        for (let top = 0; top <= br - pr; top++) {
          for (let left = 0; left <= bc - pc; left++) {
            let ok = true;
            const absCells = [];
            for (const [r, c] of cells) {
              const rr = top + r;
              const cc = left + c;
              if (boardMask[rr][cc] !== 1) {
                ok = false;
                break;
              }
              absCells.push([rr, cc]);
            }
            if (ok) pieceOpts.push({ pi, vi, top, left, absCells });
          }
        }
      }
      placements.push(pieceOpts);
    }

    const cellToMoves = {};
    for (const cell of targetCells) {
      cellToMoves[coordKey(cell[0], cell[1])] = [];
    }
    for (let pi = 0; pi < placements.length; pi++) {
      for (let mi = 0; mi < placements[pi].length; mi++) {
        const absCells = placements[pi][mi].absCells;
        for (const cell of absCells) {
          const k = coordKey(cell[0], cell[1]);
          if (cellToMoves[k]) cellToMoves[k].push([pi, mi]);
        }
      }
    }

    const usedPiece = new Array(pieces.length).fill(false);
    const solution = [];

    function findNextCell() {
      let bestCell = null;
      let bestLen = 1e9;
      for (const [r, c] of targetCells) {
        if (occupied[r][c] !== 0) continue;
        const moves = cellToMoves[coordKey(r, c)].filter(([pi, mi]) => {
          if (usedPiece[pi]) return false;
          const absCells = placements[pi][mi].absCells;
          return absCells.every(([rr, cc]) => occupied[rr][cc] === 0);
        });
        if (!moves.length) return [r, c];
        if (moves.length < bestLen) {
          bestLen = moves.length;
          bestCell = [r, c];
          if (bestLen === 1) return bestCell;
        }
      }
      return bestCell;
    }

    function backtrack(filled) {
      if (filled === targetCount) return true;
      const cell = findNextCell();
      if (!cell) return false;
      const [r, c] = cell;
      const candidateMoves = cellToMoves[coordKey(r, c)].filter(([pi, mi]) => {
        if (usedPiece[pi]) return false;
        const absCells = placements[pi][mi].absCells;
        return absCells.every(([rr, cc]) => occupied[rr][cc] === 0);
      });
      if (!candidateMoves.length) return false;

      for (const [pi, mi] of candidateMoves) {
        const { absCells } = placements[pi][mi];
        usedPiece[pi] = true;
        for (const [rr, cc] of absCells) occupied[rr][cc] = pi + 1;
        solution.push(placements[pi][mi]);

        if (backtrack(filled + absCells.length)) return true;

        solution.pop();
        for (const [rr, cc] of absCells) occupied[rr][cc] = 0;
        usedPiece[pi] = false;
      }
      return false;
    }

    const ok = backtrack(0);
    return ok ? solution : null;
  }

  function renderSolution(boardMask, solutionList, pieces) {
    const variantsPerPiece = pieces.map((p) => pieceVariants(p));
    const occ = emptyOccupiedLike(boardMask);
    for (const pl of solutionList) {
      const piece = variantsPerPiece[pl.pi][pl.vi];
      const top = pl.top;
      const left = pl.left;
      const pr = piece.length;
      const pc = piece[0].length;
      for (let r = 0; r < pr; r++) {
        for (let c = 0; c < pc; c++) {
          if (piece[r][c] === 1) occ[top + r][left + c] = pl.pi + 1;
        }
      }
    }
    return occ;
  }

  function solveForDate(month, day) {
    const blocked = blockedForDate(month, day);
    const boardMask = buildBoardMask(BOARD, blocked);
    const sol = solve(boardMask, PIECES);
    if (!sol) return { blocked, boardMask, occupied: null };
    const occupied = renderSolution(boardMask, sol, PIECES);
    return { blocked, boardMask, occupied };
  }

  /** DOM */
  const boardEl = document.getElementById("board");
  const monthSel = document.getElementById("month");
  const daySel = document.getElementById("day");
  const btnSolve = document.getElementById("solve");
  const btnClear = document.getElementById("clear");
  const statusEl = document.getElementById("status");

  const monthsHu = [
    "",
    "Jan",
    "Feb",
    "Már",
    "Ápr",
    "Máj",
    "Jún",
    "Júl",
    "Aug",
    "Sze",
    "Okt",
    "Nov",
    "Dec",
  ];

  /** Csak játszható cellák (BOARD === 1); a többi üres rácshely, nincs elem */
  const cellMap = new Map();
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (BOARD[r][c] !== 1) continue;
      const div = document.createElement("div");
      div.className = "cell";
      div.dataset.r = String(r);
      div.dataset.c = String(c);
      div.style.gridRow = String(r + 1);
      div.style.gridColumn = String(c + 1);
      boardEl.appendChild(div);
      cellMap.set(coordKey(r, c), div);
    }
  }

  function cellAt(r, c) {
    return cellMap.get(coordKey(r, c));
  }

  function drawEmpty() {
    const cssEmpty = getComputedStyle(document.documentElement).getPropertyValue("--empty").trim() || "#f1f5f9";
    cellMap.forEach((el) => {
      el.title = "";
      el.style.background = cssEmpty;
    });
    statusEl.textContent = "Válassz dátumot, majd: Megoldás.";
    statusEl.classList.remove("error");
  }

  function draw(month, day, occupied) {
    const blocked = blockedForDate(month, day);
    const boardMask = buildBoardMask(BOARD, blocked);
    const cssEmpty = getComputedStyle(document.documentElement).getPropertyValue("--empty").trim() || "#f1f5f9";
    const cssBlocked = getComputedStyle(document.documentElement).getPropertyValue("--blocked").trim() || "#000";

    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (BOARD[r][c] !== 1) continue;
        const el = cellAt(r, c);
        if (!el) continue;
        const key = coordKey(r, c);
        el.title = "";

        if (boardMask[r][c] === 0 && blocked.has(key)) {
          el.style.background = cssBlocked;
          el.title = "Dátum (üres hely)";
          continue;
        }
        if (!occupied) {
          el.style.background = cssEmpty;
          continue;
        }
        const pid = occupied[r][c];
        el.style.background = pid ? PIECE_COLORS[pid] : cssEmpty;
        if (pid) el.title = "Elem " + pid;
      }
    }
  }

  function fillMonthDaySelects() {
    for (let m = 1; m <= 12; m++) {
      const opt = document.createElement("option");
      opt.value = String(m);
      opt.textContent = m + " – " + monthsHu[m];
      monthSel.appendChild(opt);
    }
    monthSel.value = "5";
    for (let d = 1; d <= 31; d++) {
      const opt = document.createElement("option");
      opt.value = String(d);
      opt.textContent = String(d);
      daySel.appendChild(opt);
    }
    daySel.value = "6";
  }

  fillMonthDaySelects();
  drawEmpty();

  btnClear.addEventListener("click", drawEmpty);

  btnSolve.addEventListener("click", () => {
    const month = parseInt(monthSel.value, 10);
    const day = parseInt(daySel.value, 10);
    try {
      blockedForDate(month, day);
    } catch (e) {
      statusEl.textContent = "Érvénytelen dátum.";
      statusEl.classList.add("error");
      return;
    }

    btnSolve.disabled = true;
    statusEl.classList.remove("error");
    statusEl.textContent = "Számolok…";
    draw(month, day, null);

    const start = performance.now();
    setTimeout(() => {
      let result;
      try {
        result = solveForDate(month, day);
      } catch (e) {
        statusEl.textContent = "Hiba: " + e.message;
        statusEl.classList.add("error");
        btnSolve.disabled = false;
        return;
      }

      const ms = Math.round(performance.now() - start);
      if (!result.occupied) {
        statusEl.textContent = "Nincs megoldás erre a dátumra. (" + ms + " ms)";
        statusEl.classList.add("error");
        draw(month, day, null);
      } else {
        statusEl.textContent = "Kész: " + month + ". " + day + ". (" + ms + " ms)";
        draw(month, day, result.occupied);
      }
      btnSolve.disabled = false;
    }, 50);
  });
})();
