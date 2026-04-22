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

// 3. Vertical Rotation (Standard Physical Mapping)
function rotateVertical(col, direction = 'cw') {
    const f = getCells('front'), t = getCells('top'), b = getCells('back'), bm = getCells('bottom');
    let fIdx = [], bIdx = [];

    if (col === 'left') {
        fIdx = [0, 3, 6]; 
        // In a book-flip, the Left side of the cube is the Left side of the back face
        // But Top of front maps to Bottom of back [6, 3, 0]
        bIdx = [6, 3, 0]; 
        rotateFace(getCells('left'), direction === 'cw');
    } else if (col === 'middle') {
        fIdx = [1, 4, 7]; 
        bIdx = [7, 4, 1];
    } else if (col === 'right') {
        fIdx = [2, 5, 8]; 
        bIdx = [8, 5, 2]; 
        rotateFace(getCells('right'), direction !== 'cw');
    }

    if (fIdx.length === 0) return;

    const fVal = getVals(f, fIdx), tVal = getVals(t, fIdx), bVal = getVals(b, bIdx), bmVal = getVals(bm, fIdx);

    if (direction === 'cw') {
        // Front -> Top -> Back -> Bottom -> Front
        setVals(t, fIdx, fVal); 
        setVals(b, bIdx, tVal); 
        setVals(bm, fIdx, bVal); 
        setVals(f, fIdx, bmVal);
    } else {
        // Front -> Bottom -> Back -> Top -> Front
        setVals(bm, fIdx, fVal); 
        setVals(b, bIdx, bmVal); 
        setVals(t, fIdx, bVal); 
        setVals(f, fIdx, tVal);
    }
}

// 4. Side Rotation
function rotateSide(face, direction = 'cw') {
    const t = getCells('top'), r = getCells('right'), bm = getCells('bottom'), l = getCells('left');
    let tIdx, rIdx, bmIdx, lIdx;

    if (face === 'front') {
        tIdx = [6, 7, 8]; rIdx = [0, 3, 6]; bmIdx = [2, 1, 0]; lIdx = [8, 5, 2];
        rotateFace(getCells('front'), direction === 'cw');
    } else if (face === 'back') {
        tIdx = [0, 1, 2]; rIdx = [2, 5, 8]; bmIdx = [8, 7, 6]; lIdx = [6, 3, 0];
        rotateFace(getCells('back'), direction !== 'cw'); 
    } else if (face === 'middle') {
        tIdx = [3, 4, 5]; rIdx = [1, 4, 7]; bmIdx = [5, 4, 3]; lIdx = [7, 4, 1];
    }

    const tVal = getVals(t, tIdx), rVal = getVals(r, rIdx), bmVal = getVals(bm, bmIdx), lVal = getVals(l, lIdx);

    if (direction === 'cw') {
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
        
        if (style === 'unordered') {
            for (let i = numbers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
            }
        }

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
