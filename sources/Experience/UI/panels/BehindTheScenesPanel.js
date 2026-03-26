export default {
    title: 'BEHIND THE SCENES',
    html: `
        <div class="panel-section">
            <h3>How This Was Built</h3>
            <p class="panel-subtitle">A 3D portfolio made with code, AI, and a lot of coffee ☕</p>
        </div>

        <div class="panel-section">
            <p>You're standing inside a fully interactive 3D world built from scratch. No templates, no page builders — just raw code, physics, and a vision. Here's how it all came together.</p>
        </div>

        <div class="panel-section">
            <h4>🛠 Tech Stack</h4>
            <div class="panel-tags">
                <span class="tag">Three.js</span>
                <span class="tag">Rapier 3D (WASM)</span>
                <span class="tag">Vite</span>
                <span class="tag">GSAP</span>
                <span class="tag">Howler.js</span>
                <span class="tag">GLSL Shaders</span>
                <span class="tag">JavaScript</span>
            </div>
        </div>

        <div class="panel-section">
            <h4>🤖 AI Tools Used</h4>
            <div class="panel-tags">
                <span class="tag">Google Antigravity</span>
                <span class="tag">Claude</span>
                <span class="tag">Meshy AI</span>
                <span class="tag">ChatGPT</span>
            </div>
            <p style="margin-top: 8px; font-size: 0.85rem; opacity: 0.75;">AI assisted with code generation, debugging, and 3D model creation. Every line was reviewed, tested, and integrated by hand.</p>
        </div>

        <div class="panel-section">
            <h4>🎮 3D Assets</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="padding: 4px 0;">🚀 <strong>Spaceship & Alien</strong> — Generated with Meshy AI, polished in Blender</li>
                <li style="padding: 4px 0;">🏗 <strong>35 Space Props</strong> — Kenney Space Kit (CC0 licensed)</li>
                <li style="padding: 4px 0;">🌿 <strong>Alien Vegetation</strong> — Procedural geometry + GLSL wind shaders</li>
                <li style="padding: 4px 0;">🛣 <strong>Neon Roads</strong> — CatmullRom spline ribbons with edge glow</li>
            </ul>
        </div>

        <div class="panel-section">
            <h4>⚡ Key Systems</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="padding: 4px 0;">🎯 <strong>Physics</strong> — Rapier 3D WASM engine with hover spring vehicle, pushable objects, ground collisions</li>
                <li style="padding: 4px 0;">📷 <strong>Camera</strong> — Smooth follow-cam with cinematic intro flyover</li>
                <li style="padding: 4px 0;">💡 <strong>Lighting</strong> — Directional + ambient + 40 neon accent point lights</li>
                <li style="padding: 4px 0;">🌸 <strong>Post-Processing</strong> — UnrealBloom for neon glow, ACES tone mapping</li>
                <li style="padding: 4px 0;">📱 <strong>Mobile</strong> — Virtual joystick touch controls, auto quality detection</li>
                <li style="padding: 4px 0;">🔊 <strong>Audio</strong> — Spatial audio via Howler.js with engine pitch scaling</li>
            </ul>
        </div>

        <div class="panel-stats">
            <div class="stat-item">
                <span class="stat-number">35</span>
                <span class="stat-label">3D Models</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">500</span>
                <span class="stat-label">Grass Blades</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">6</span>
                <span class="stat-label">Neon Roads</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">∞</span>
                <span class="stat-label">Passion</span>
            </div>
        </div>

        <div class="panel-section">
            <h4>🧠 What I Learned</h4>
            <p>Building this taught me real-time 3D rendering, WASM physics integration, GPU shader programming, and complex state management across multiple systems. It's the intersection of game dev, creative direction, and web engineering — exactly where I want to be.</p>
        </div>

        <div class="panel-section">
            <p style="text-align: center; font-style: italic; opacity: 0.7; margin-top: 16px;">"The best portfolio is one that's an experience in itself."</p>
        </div>
    `,
};
