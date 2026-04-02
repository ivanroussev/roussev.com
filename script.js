/* Theme toggle */
function toggleTheme() {
    const html = document.documentElement;
    const isLight = html.getAttribute('data-theme') === 'light';
    if (isLight) {
        html.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

/* Load saved theme */
(function () {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();

/* GitHub-style contribution graph (simulated) */
(function () {
    const graph = document.getElementById('github-graph');
    if (!graph) return;

    // Generate 52 weeks × 7 days of activity
    const weeks = 52;
    const days = 7;
    for (let w = 0; w < weeks; w++) {
        const col = document.createElement('div');
        col.style.display = 'flex';
        col.style.flexDirection = 'column';
        col.style.gap = '3px';
        for (let d = 0; d < days; d++) {
            const cell = document.createElement('div');
            cell.className = 'gh-cell';
            // Weighted random: more 0s, fewer 4s
            const r = Math.random();
            let level = 0;
            if (r > 0.55) level = 1;
            if (r > 0.72) level = 2;
            if (r > 0.85) level = 3;
            if (r > 0.93) level = 4;
            cell.setAttribute('data-level', level);
            col.appendChild(cell);
        }
        graph.appendChild(col);
    }
})();
