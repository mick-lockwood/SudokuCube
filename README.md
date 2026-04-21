# SudokuCube
A 3D 'rubik's cube' style Sudoku puzzle creator

# 🧊 Interactive 3D Rubik's Cube Engine

A high-performance, vanilla JavaScript 3D Rubik's Cube simulation. This project focuses on solving the mathematical challenges of spatial orientation and 3D coordinate mapping within a web browser.

[Link to Live Demo (Once you enable GitHub Pages)]

## 🚀 Features

- **Full 3/3 Axis Control:** Supports X (Vertical), Y (Horizontal), and Z (Side/Front) rotations.
- **POV-Corrected Logic:** Back-face rotations and horizontal shifts are mathematically corrected to remain intuitive from the user's perspective.
- **Dynamic 3D Rendering:** Built using CSS3 `preserve-3d` transforms for a lightweight, "no-library" approach.
- **Interactive UI:** A mirrored dashboard layout that maps directly to the cube's physical layers.
- **Upright Legibility:** Custom logic ensures that numbers on the back face remain upright and legible regardless of orientation.

## 🛠️ Technical Challenges Solved

### The Back-Face Mirroring Problem
One of the primary challenges was ensuring that a horizontal rotation correctly mapped the "Front" to the "Back" without mirroring the sequence. I implemented a view-relative coordinate system that swaps indices $1-3$ for $9-7$ when values move to the rear plane, maintaining the sequence's integrity.

### Z-Axis Perspective
Implemented Front, Middle (Standing), and Back rotations that are POV-Corrected. This means "Clockwise" always appears clockwise to the user, even when the logic is manipulating the inverted back plane.

## 💻 Tech Stack

- **HTML5:** Semantic structure and UI.
- **CSS3:** 3D perspective, transforms, and transitions.
- **JavaScript (ES6):** Array manipulation, mapping logic, and DOM state management.

## 📖 How to Run
Simply open `index.html` in any modern web browser, or host it via GitHub Pages.
