import gsap from 'gsap';

export default class Panel {
    constructor() {
        this.isVisible = false;
        this.currentZone = null;
        this.createElement();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.id = 'panel';
        this.element.innerHTML = `
            <div class="panel-accent"></div>
            <button class="panel-close">&times;</button>
            <div class="panel-header">
                <h2 class="panel-title"></h2>
            </div>
            <div class="panel-content"></div>
        `;
        document.body.appendChild(this.element);

        // Close button
        this.element.querySelector('.panel-close').addEventListener('click', () => {
            this.hide();
        });

        // Initial state: hidden off-screen
        gsap.set(this.element, { x: '100%', opacity: 0 });
    }

    show(zoneId, content) {
        if (this.currentZone === zoneId && this.isVisible) return;

        this.currentZone = zoneId;
        const title = this.element.querySelector('.panel-title');
        const contentEl = this.element.querySelector('.panel-content');

        title.textContent = content.title;
        contentEl.innerHTML = content.html;

        this.element.style.display = 'flex';
        this.isVisible = true;

        gsap.killTweensOf(this.element);
        gsap.to(this.element, {
            x: '0%',
            opacity: 1,
            duration: 0.5,
            ease: 'power3.out',
        });

        // Stagger animate children
        const children = contentEl.children;
        if (children.length) {
            gsap.fromTo(children,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, delay: 0.2, ease: 'power2.out' }
            );
        }
    }

    hide() {
        if (!this.isVisible) return;
        this.isVisible = false;

        gsap.killTweensOf(this.element);
        gsap.to(this.element, {
            x: '100%',
            opacity: 0,
            duration: 0.4,
            ease: 'power3.in',
            onComplete: () => {
                this.element.style.display = 'none';
                this.currentZone = null;
            },
        });
    }
}
