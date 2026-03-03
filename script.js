document.addEventListener('DOMContentLoaded', () => {

    // ========================================
    // 1. Section Fade-In on Scroll
    // ========================================
    const sections = document.querySelectorAll('.stage-section');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    sections.forEach(section => sectionObserver.observe(section));

    // ========================================
    // 2. Pipeline Stage Highlighting on Scroll
    // ========================================
    const stageNodes = document.querySelectorAll('.stage-node');
    const connectors = document.querySelectorAll('.stage-connector');
    const stageIds = ['about', 'skills', 'experience', 'projects', 'contact'];

    function updatePipeline() {
        const scrollPos = window.scrollY + window.innerHeight * 0.35;
        let activeIndex = 0;

        stageIds.forEach((id, i) => {
            const section = document.getElementById(id);
            if (section && section.offsetTop <= scrollPos) {
                activeIndex = i;
            }
        });

        stageNodes.forEach((node, i) => {
            node.classList.remove('active', 'passed');
            if (i < activeIndex) {
                node.classList.add('passed');
            } else if (i === activeIndex) {
                node.classList.add('active');
            }
        });

        connectors.forEach((conn, i) => {
            if (i <= activeIndex - 1) {
                conn.classList.add('active');
            } else {
                conn.classList.remove('active');
            }
        });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updatePipeline();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Initial pipeline state
    updatePipeline();

    // ========================================
    // 3. Smooth Scroll on Stage Node Click
    // ========================================
    stageNodes.forEach(node => {
        node.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = node.getAttribute('data-stage');
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ========================================
    // 4. Dynamic Duration Counter
    // ========================================
    const durationEl = document.querySelector('.duration');
    if (durationEl) {
        const start = Date.now();
        setInterval(() => {
            const elapsed = Math.floor((Date.now() - start) / 1000);
            const mins = Math.floor(elapsed / 60);
            const secs = elapsed % 60;
            durationEl.textContent = `⏱ ${mins}m ${secs.toString().padStart(2, '0')}s`;
        }, 1000);
    }

    // ========================================
    // 5. Pipeline ID Randomizer (fun touch)
    // ========================================
    const pipelineIdEl = document.querySelector('.pipeline-id');
    if (pipelineIdEl) {
        const randomId = Math.floor(Math.random() * 900) + 100;
        pipelineIdEl.textContent = `Pipeline #${randomId}`;
    }

    const commitEl = document.querySelector('.commit-hash');
    if (commitEl) {
        const chars = '0123456789abcdef';
        let hash = '';
        for (let i = 0; i < 7; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        commitEl.textContent = hash;
    }

});
