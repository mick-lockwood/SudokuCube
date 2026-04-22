const cube = document.getElementById('cube');
const faceNames = ['front', 'back', 'top', 'bottom', 'left', 'right'];

// 1. Setup
faceNames.forEach(face => {
    const faceEl = document.querySelector(`.face.${face}`);
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.contentEditable = true;
        // REMOVED: manual rotate(180deg) here
        faceEl.appendChild(cell);
    }
});

const getCells = (face) => Array.from(document.querySelector(`.face.${face}`).children);
const getVals = (cells, indices) => indices.map(i => cells[i].innerText);
const setVals = (cells, indices, vals) => indices.forEach((idx, i) => cells[idx].innerText = vals[i]);

// 2. Horizontal Rotation (Front maps directly to Back in mirrored space)
function rotateLayer(layer, direction = 'cw') {
    const f = getCells('front'), r = getCells('right'), b = getCells('back'), l = getCells('left');
    let fIdx = []; 

    if (layer === 'top') { fIdx = [0, 1, 2]; rotateFace(getCells('top'), direction === 'cw'); }
    else if (layer === 'middle') { fIdx = [3, 4, 5]; }
    else if (layer === 'bottom') { fIdx = [6, 7, 8]; rotateFace(getCells('bottom'), direction !== 'cw'); }

    if (fIdx.length === 0) return;

    const fVal = getVals(f, fIdx), rVal = getVals(r, fIdx), bVal = getVals(b, fIdx), lVal = getVals(l, fIdx);

    if (direction === 'cw') {
        setVals(f, fIdx, rVal); setVals(r, fIdx, bVal); setVals(b, fIdx, lVal); setVals(l, fIdx, fVal);
    } else {
        setVals(f, fIdx, lVal); setVals(l, fIdx, bVal); setVals(b, fIdx, rVal); setVals(r, fIdx, fVal);
    }
    // REMOVED: All manual rotate(180deg) loops
}

// 3. Vertical Rotation (Pure Geometric Mapping)
function rotateVertical(col, direction = 'cw') {
    const f = getCells('front'), t = getCells('top'), b = getCells('back'), bm = getCells('bottom');
    let fIdx = [], tIdx = [], bIdx = [], bmIdx = [];

    if (col === 'left') {
        fIdx = [0, 3, 6]; tIdx = [0, 3, 6]; bIdx = [8, 5, 2]; bmIdx = [6, 3, 0];
        rotateFace(getCells('left'), direction === 'cw');
    } else if (col === 'middle') {
        fIdx = [1, 4, 7]; tIdx = [1, 4, 7]; bIdx = [7, 4, 1]; bmIdx = [7, 4, 1];
    } else if (col === 'right') {
        fIdx = [2, 5, 8]; tIdx = [2, 5, 8]; bIdx = [6, 3, 0]; bmIdx = [8, 5, 2];
        rotateFace(getCells('right'), direction !== 'cw');
    }

    if (fIdx.length === 0) return;

    const fVal = getVals(f, fIdx), tVal = getVals(t, tIdx), bVal = getVals(b, bIdx), bmVal = getVals(bm, bmIdx);

    // Flow: Front -> Top -> Back -> Bottom -> Front
    if (direction === 'cw') {
        setVals(t, tIdx, fVal); setVals(b, bIdx, tVal); setVals(bm, bmIdx, bVal); setVals(f, fIdx, bmVal);
    } else {
        setVals(bm, bmIdx, fVal); setVals(b, bIdx, bmVal); setVals(t, tIdx, bVal); setVals(f, fIdx, tVal);
    }
}

// 4. Side Rotation (With visual inversion for the back face)
function rotateSide(face, direction = 'cw') {
    const t = getCells('top'), r = getCells('right'), bm = getCells('bottom'), l = getCells('left');
    let tIdx, rIdx, bmIdx, lIdx;
    
    // We isolate the ring direction so we can invert it for the back face
    let ringDir = direction;

    if (face === 'front') {
        tIdx = [6, 7, 8]; rIdx = [0, 3, 6]; bmIdx = [2, 1, 0]; lIdx = [8, 5, 2];
        rotateFace(getCells('front'), direction === 'cw');
    } else if (face === 'back') {
        tIdx = [2, 1, 0]; rIdx = [2, 5, 8]; bmIdx = [0, 1, 2]; lIdx = [0, 3, 6];
        rotateFace(getCells('back'), direction === 'cw'); 
        // Invert the ring direction so "CW" visually goes clockwise to the user
        ringDir = direction === 'cw' ? 'ccw' : 'cw';
    } else if (face === 'middle') {
        tIdx = [3, 4, 5]; rIdx = [1, 4, 7]; bmIdx = [5, 4, 3]; lIdx = [7, 4, 1];
    }

    const tVal = getVals(t, tIdx), rVal = getVals(r, rIdx), bmVal = getVals(bm, bmIdx), lVal = getVals(l, lIdx);

    if (ringDir === 'cw') {
        setVals(r, rIdx, tVal); setVals(bm, bmIdx, rVal); setVals(l, lIdx, bmVal); setVals(t, tIdx, lVal);
    } else {
        setVals(l, lIdx, tVal); setVals(bm, bmIdx, lVal); setVals(r, rIdx, bmVal); setVals(t, tIdx, rVal);
    }
}
function rotateFace(cells, clockwise) {
    const vals = cells.map(c => c.innerText);
    const map = clockwise ? [6, 3, 0, 7, 4, 1, 8, 5, 2] : [2, 5, 8, 1, 4, 7, 0, 3, 6];
    map.forEach((oldIdx, newIdx) => { cells[newIdx].innerText = vals[oldIdx]; });
}

// --- CAMERA CONTROLS (ORBIT) ---
let rotX = -20, rotY = 30;

document.addEventListener('keydown', (e) => {
    const cubeEl = document.getElementById('cube');
    if (!cubeEl) return;

    if (e.key === 'ArrowUp') rotX += 10;
    if (e.key === 'ArrowDown') rotX -= 10;
    if (e.key === 'ArrowLeft') rotY -= 10;
    if (e.key === 'ArrowRight') rotY += 10;
    
    cubeEl.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
});

// --- RESET LOGIC ---
function generateSolvedCube(style = 'ordered') {
    const faces = ['front', 'back', 'top', 'bottom', 'left', 'right'];
    
    faces.forEach(face => {
        const cells = getCells(face);
        let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        cells.forEach((cell, i) => {
            cell.innerText = numbers[i];
        });
    });
}

// Scramble engine
async function scrambleCube(difficulty) {
    generateSolvedCube('ordered');
    await new Promise(r => setTimeout(r, 300));

    const movesMap = { 'easy': 5, 'medium': 15, 'hard': 30, 'expert': 60 };
    const moveCount = movesMap[difficulty] || 15;

    const possibleMoves = [
        () => rotateLayer('top', Math.random() > 0.5 ? 'cw' : 'ccw'),
        () => rotateLayer('middle', Math.random() > 0.5 ? 'cw' : 'ccw'),
        () => rotateLayer('bottom', Math.random() > 0.5 ? 'cw' : 'ccw'),
        () => rotateVertical('left', Math.random() > 0.5 ? 'cw' : 'ccw'),
        () => rotateVertical('middle', Math.random() > 0.5 ? 'cw' : 'ccw'),
        () => rotateVertical('right', Math.random() > 0.5 ? 'cw' : 'ccw'),
        () => rotateSide('front', Math.random() > 0.5 ? 'cw' : 'ccw'),
        () => rotateSide('middle', Math.random() > 0.5 ? 'cw' : 'ccw'),
        () => rotateSide('back', Math.random() > 0.5 ? 'cw' : 'ccw')
    ];

    for (let i = 0; i < moveCount; i++) {
        possibleMoves[Math.floor(Math.random() * possibleMoves.length)]();
        await new Promise(r => setTimeout(r, 80));
    }
}
