/**
 * EFFECTS.JS - UZAY OYUNU PROGRESS BAR
 */

const Effects = {
    confettiColors: ['#00f0ff', '#ff00aa', '#00ff88', '#ffee00', '#aa00ff'],

    init() {
        this.setupEnergyParticles();
        this.setupRocketEngine();
        this.setupMilestones();
    },

    setupEnergyParticles() {
        const progressBar = document.getElementById('progress-bar');
        if (!progressBar || progressBar.querySelector('.energy-particles')) return;

        // Energy particles container
        const particles = document.createElement('div');
        particles.className = 'energy-particles';

        // Create 5 flowing particles
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particles.appendChild(particle);
        }

        progressBar.appendChild(particles);
    },

    setupRocketEngine() {
        const progressBar = document.getElementById('progress-bar');
        if (!progressBar) return;

        // Remove old elements
        progressBar.querySelectorAll('.rocket-engine, .sparkler-container, .shimmer-wrapper').forEach(el => el.remove());

        // Rocket engine exhaust
        const engine = document.createElement('div');
        engine.className = 'rocket-engine';

        // Core
        const core = document.createElement('div');
        core.className = 'engine-core';
        engine.appendChild(core);

        // Energy ring
        const ring = document.createElement('div');
        ring.className = 'energy-ring';
        engine.appendChild(ring);

        // 16 exhaust flames
        for (let i = 0; i < 16; i++) {
            const exhaust = document.createElement('div');
            exhaust.className = 'exhaust';
            engine.appendChild(exhaust);
        }

        progressBar.appendChild(engine);
    },

    setupMilestones() {
        const container = document.querySelector('.progress-bar-container');
        if (!container || container.querySelector('.progress-milestones')) return;

        const milestonesDiv = document.createElement('div');
        milestonesDiv.className = 'progress-milestones';
        milestonesDiv.innerHTML = `
            <div class="milestone" data-percent="25"></div>
            <div class="milestone" data-percent="50"></div>
            <div class="milestone" data-percent="75"></div>
            <div class="milestone" data-percent="100"></div>
        `;
        container.appendChild(milestonesDiv);
    },

    updateProgress(percent) {
        document.querySelectorAll('.milestone').forEach(m => {
            const mPercent = parseInt(m.dataset.percent);
            const wasReached = m.classList.contains('reached');
            const isReached = percent >= mPercent;

            m.classList.toggle('reached', isReached);

            if (isReached && !wasReached) {
                this.celebrateMilestone(mPercent);
            }
        });
    },

    celebrateMilestone(percent) {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.classList.add('celebrating');
            setTimeout(() => progressBar.classList.remove('celebrating'), 2000);
        }

        if (percent === 50 || percent === 100) {
            this.launchConfetti();
        }

        // Extra blast effect
        this.energyBurst();
    },

    energyBurst() {
        const engine = document.querySelector('.rocket-engine');
        if (!engine) return;

        const rect = engine.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Create energy burst
        for (let i = 0; i < 24; i++) {
            const burst = document.createElement('div');
            const color = this.confettiColors[i % this.confettiColors.length];
            burst.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: ${4 + Math.random() * 4}px;
                height: ${4 + Math.random() * 4}px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                box-shadow: 0 0 10px ${color};
            `;
            document.body.appendChild(burst);

            const angle = (i / 24) * Math.PI * 2;
            const velocity = 100 + Math.random() * 100;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            let posX = 0, posY = 0, opacity = 1;
            const animate = () => {
                posX += vx * 0.012;
                posY += vy * 0.012;
                opacity -= 0.012;

                burst.style.transform = `translate(${posX}px, ${posY}px) scale(${opacity})`;
                burst.style.opacity = opacity;

                if (opacity > 0) requestAnimationFrame(animate);
                else burst.remove();
            };
            requestAnimationFrame(animate);
        }
    },

    launchConfetti() {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        for (let i = 0; i < 60; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            if (Math.random() > 0.5) confetti.style.borderRadius = '50%';
            container.appendChild(confetti);
        }

        setTimeout(() => container.remove(), 4000);
    }
};

window.Effects = Effects;
