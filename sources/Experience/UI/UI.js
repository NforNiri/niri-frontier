import Experience from '../Experience.js';
import Panel from './Panel.js';
import { getContent } from './panels/index.js';

export default class UI {
    constructor() {
        this.experience = Experience.getInstance();
        this.panel = new Panel();
        this.exitTimeout = null;

        this.experience.on('zone:enter', (zoneId) => {
            this.onZoneEnter(zoneId);
        });

        this.experience.on('zone:exit', (zoneId) => {
            this.onZoneExit(zoneId);
        });

        console.log('✅ UI system initialized');
    }

    onZoneEnter(zoneId) {
        // Cancel pending exit
        if (this.exitTimeout) {
            clearTimeout(this.exitTimeout);
            this.exitTimeout = null;
        }

        const content = getContent(zoneId);
        if (content) {
            this.panel.show(zoneId, content);
        }
    }

    onZoneExit(zoneId) {
        // Delay exit to prevent flicker on brief flyovers
        this.exitTimeout = setTimeout(() => {
            this.panel.hide();
            this.exitTimeout = null;
        }, 500);
    }
}
