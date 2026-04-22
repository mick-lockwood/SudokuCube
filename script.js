const cube = document.getElementById('cube');
const faceNames = ['front', 'back', 'top', 'bottom', 'left', 'right'];

// 1. Setup
faceNames.forEach(face => {
    const faceEl = document.querySelector(`.face.${face}`);
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.contentEditable = true;
        if (face === 'back') cell.style.transform = 'rotate(180deg)';
        faceEl.appendChild(cell);
    }
});

const getCells = (face) => Array.from(document.querySelector(`.face.${face}`).children);

// 2. Horizontal Rotation
function rotateLayer(layer, direction = 'cw') {
    const f = getCells('front'), r = getCells('right'), b = getCells('back'), l = getCells('left');
    let fIdx = [], bIdx = [];

    if (layer === 'top') {
        fIdx = [0, 1, 2]; 
        bIdx = [0, 1, 2]; // Top row Front maps to Top row Back
        rotateFace(getCells('top'), direction === 'cw');
    } else if (layer === 'middle') {
        fIdx = [3, 4, 5]; 
        bIdx = [3, 4, 5];
    } else if (layer === 'bottom') {
        fIdx = [6, 7, 8]; 
        bIdx = [6, 7, 8];
        rotateFace(getCells('bottom'), direction !== 'cw');
    }

    if (fIdx.length === 0) return;

    const getVals = (cells, indices) => indices.map(i => cells[i].innerText);
    const setVals = (cells, indices, vals) => indices.forEach((idx, i) => cells[idx].innerText = vals[i]);

    const fVal = getVals(f, fIdx), rVal = getVals(r, fIdx), bVal = getVals(b, bIdx), lVal = getVals(l, fIdx);

    if (direction === 'cw') {
        // Front <- Right <- Back <- Left <- Front
        setVals(f, fIdx, rVal); setVals(r, fIdx, bVal); setVals(b, bIdx, lVal); setVals(l, fIdx, fVal);
    } else {
        // Front <- Left <- Back <- Right <- Front
        setVals(f, fIdx, lVal); setVals(l, fIdx, bVal); setVals(b, bIdx, rVal); setVals(r, fIdx, fVal);
    }

    document.querySelectorAll('.face.back .cell').forEach(c => c.style.transform = 'rotate(180deg)');
}

// 3. Vertical Rotation
function rotateVertical(col, direction = 'cw') {
    const f = getCells('front'), t = getCells('top'), b = getCells('back'), bm = getCells('bottom');
    let fIdx = [], bIdx = [];

    if (col === 'left') {
        fIdx = [0, 3, 6]; 
        // On the back face, the left column of the cube is physically 
        // the right side of the face (indices 2, 5, 8)
        bIdx = [8, 5, 2]; // Top of front lands on Bottom of back
        rotateFace(getCells('left'), direction === 'cw');
    } else if (col === 'middle') {
        fIdx = [1, 4, 7]; 
        bIdx = [7, 4, 1];
    } else if (col === 'right') {
        fIdx = [2, 5, 8]; 
        bIdx = [6, 3, 0]; // Top of front lands on Bottom of back
        rotateFace(getCells('right'), direction !== 'cw');
    }

    if (fIdx.length === 0) return;

    const fVal = getVals(f, fIdx), tVal = getVals(t, fIdx), bVal = getVals(b, bIdx), bmVal = getVals(bm, fIdx);

    if (direction === 'cw') {
        // Front <- Bottom <- Back <- Top <- Front
        setVals(f, fIdx, bmVal); setVals(bm, fIdx, bVal); setVals(b, bIdx, tVal); setVals(t, fIdx, fVal);
    } else {
        // Front <- Top <- Back <- Bottom <- Front
        setVals(f, fIdx, tVal); setVals(t, fIdx, bVal); setVals(b, bIdx, bmVal); setVals(bm, fIdx, fVal);
    }

    document.querySelectorAll('.face.back .cell').forEach(c => c.style.transform = 'rotate(180deg)');
}

// 4. Side Rotation
function rotateSide(face, direction = 'cw') {
    const t = getCells('top'), r = getCells('right'), bm = getCells('bottom'), l = getCells('left');
    
    let tIdx, rIdx, bmIdx, lIdx;

    if (face === 'front') {
        tIdx = [6, 7, 8]; rIdx = [0, 3, 6]; bmIdx = [2, 1, 0]; lIdx = [8, 5, 2];
        rotateFace(getCells('front'), direction === 'cw');
    } else if (face === 'middle') {
        tIdx = [3, 4, 5]; rIdx = [1, 4, 7]; bmIdx = [5, 4, 3]; lIdx = [7, 4, 1];
    } else if (face === 'back') {
        tIdx = [0, 1, 2]; rIdx = [2, 5, 8]; bmIdx = [8, 7, 6]; lIdx = [6, 3, 0];
        // INVERSION: To look CW from the front, the back face itself 
        // must rotate CCW from its own perspective.
        rotateFace(getCells('back'), direction !== 'cw'); 
    }

    const tVal = getVals(t, tIdx), rVal = getVals(r, rIdx), bmVal = getVals(bm, bmIdx), lVal = getVals(l, lIdx);

    // This part handles the "Ring" (the numbers on the side faces)
    // We want the ring to move in the same circular direction as the front
    if (direction === 'cw') {
        setVals(r, rIdx, tVal);
        setVals(bm, bmIdx, rVal);
        setVals(l, lIdx, bmVal);
        setVals(t, tIdx, lVal);
    } else {
        setVals(l, lIdx, tVal);
        setVals(bm, bmIdx, lVal);
        setVals(r, rIdx, bmVal);
        setVals(t, tIdx, rVal);
    }
    
    document.querySelectorAll('.face.back .cell').forEach(c => c.style.transform = 'rotate(180deg)');
}

// Helper for the new logic
function getVals(cells, indices) { return indices.map(i => cells[i].innerText); }
function setVals(cells, indices, vals) { indices.forEach((idx, i) => cells[idx].innerText = vals[i]); }

// 4. Face Rotation
function rotateFace(cells, clockwise) {
    if (!cells || cells.length !== 9) return;
    
    // 1. Grab current values
    const vals = cells.map(c => c.innerText);
    
    // 2. Define the transformation map
    // Clockwise: 6 goes to 0, 3 to 1, 0 to 2, etc.
    const map = clockwise 
        ? [6, 3, 0, 7, 4, 1, 8, 5, 2] 
        : [2, 5, 8, 1, 4, 7, 0, 3, 6];
    
    // 3. Apply values back to the cells in the new order
    map.forEach((oldIdx, newIdx) => {
        cells[newIdx].innerText = vals[oldIdx];
    });
}
// 5. Camera Controls
let rotX = -20, rotY = 30;
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') rotX += 10;
    if (e.key === 'ArrowDown') rotX -= 10;
    if (e.key === 'ArrowLeft') rotY -= 10;
    if (e.key === 'ArrowRight') rotY += 10;
    cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
});

// Styles for winning
const SOLVE_STYLES = {
    UNORDERED: 'unordered', // 1-9 once each face, any order
    ORDERED: 'ordered'      // 1-9 in 1,2,3... order
};

// Generate a Solved State
function generateSolvedCube(style = SOLVE_STYLES.ORDERED) {
    const faces = ['front', 'back', 'top', 'bottom', 'left', 'right'];
    
    faces.forEach(face => {
        const cells = getCells(face);
        let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        
        // Shuffle logic here if style is UNORDERED...

        cells.forEach((cell, i) => {
            cell.innerText = numbers[i];
            // No more manual style.transform = 'rotate(180deg)' here!
            // The CSS class handles it now.
        });
    });
}

// Scramble Engine
async function scrambleCube(difficulty) {
    // First, make sure we are starting from a solved state
    generateSolvedCube(SOLVE_STYLES.ORDERED);
    
    // Give the user a moment to see the reset before scrambling
    await new Promise(resolve => setTimeout(resolve, 300));

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
        const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        move();
        await new Promise(resolve => setTimeout(resolve, 80)); // Slightly slower to look better
    }
}
