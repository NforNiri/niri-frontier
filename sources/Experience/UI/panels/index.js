import about from './AboutPanel.js';
import development from './DevelopmentPanel.js';
import genai from './GenAIPanel.js';
import creative from './CreativePanel.js';
import contact from './ContactPanel.js';
import resume from './ResumePanel.js';
import behindthescenes from './BehindTheScenesPanel.js';

const panels = { about, development, genai, creative, contact, resume, behindthescenes };

export function getContent(zoneId) {
    return panels[zoneId] || null;
}
