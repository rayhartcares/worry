/**
 * WORRY SHRINKER LAB — script.js
 * Password gate + Benne Hart intro + hamburger menu with full pagination.
 * v2 — 51 scenes with interactive practice layer.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     ACCESS CONTROL
     NOTE: This is a soft counselor/teacher gate —
     it prevents casual access by children without
     their counselor present. It is not a server-side
     security system and is not intended to protect
     sensitive personal data.
     The password is stored as a SHA-256 hash only.
     Plain-text password is never present in this file.
  ───────────────────────────────────────────── */
  const PW_HASH         = '1b849a332d393e40b555a0b02804cbfad09432c28cd266f4ce5ecf789f8f03db';
  const LS_ACCESS_KEY   = 'bfl_wsl_access';
  const LS_PROGRESS_KEY = 'bfl_wsl_progress';

  // Practice state keys — saved by interactive scenes, read by summary/certificate scenes
  const LS_WORRY_THOUGHT_KEY = 'bfl_wsl_worry_thought';
  const LS_BRAVE_THOUGHT_KEY = 'bfl_wsl_brave_thought';
  const LS_BRAVE_STEP_KEY    = 'bfl_wsl_brave_step';
  const LS_WORRY_RATING_KEY  = 'bfl_wsl_worry_rating';

  async function hashInput (str) {
    const buf  = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(str)
    );
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /* ─────────────────────────────────────────────
     PRACTICE STATE HELPERS
  ───────────────────────────────────────────── */
  function getSavedWorryThought () {
    return localStorage.getItem(LS_WORRY_THOUGHT_KEY) || 'What if I mess up?';
  }
  function getSavedBraveThought () {
    return localStorage.getItem(LS_BRAVE_THOUGHT_KEY) || 'I might feel nervous, and I can still try.';
  }
  function getSavedBraveStep () {
    return localStorage.getItem(LS_BRAVE_STEP_KEY) || 'Try even if I feel nervous';
  }
  function getSavedWorryRating () {
    return localStorage.getItem(LS_WORRY_RATING_KEY) || '';
  }

  function escapeHTML (str) {
    return String(str ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function replacePlanText (text) {
    return String(text)
      .replace('[saved worry thought]', escapeHTML(getSavedWorryThought()))
      .replace('[saved brave thought]', escapeHTML(getSavedBraveThought()))
      .replace('[saved brave step]',   escapeHTML(getSavedBraveStep()));
  }

  /* ─────────────────────────────────────────────
     SVG FALLBACKS
  ───────────────────────────────────────────── */
  // 51 fallbacks — original 42 preserved exactly, 9 new ones inserted at matching positions
  const SVG_FALLBACKS = [
    /* s01 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#2E3440"/><rect x="0" y="200" width="480" height="100" fill="#272C38"/><rect x="60" y="190" width="80" height="8" rx="3" fill="#3B4252" opacity="0.9"/><rect x="200" y="190" width="80" height="8" rx="3" fill="#3B4252" opacity="0.9"/><rect x="340" y="190" width="80" height="8" rx="3" fill="#3B4252" opacity="0.9"/><ellipse cx="240" cy="110" rx="18" ry="18" fill="#4A9E8E" opacity="0.7"/><rect x="224" y="128" width="32" height="44" rx="6" fill="#4A9E8E" opacity="0.5"/><ellipse cx="240" cy="160" rx="60" ry="20" fill="#C9A84C" opacity="0.08"/><circle cx="240" cy="60" r="4" fill="#C9A84C" opacity="0.6"/><line x1="240" y1="64" x2="240" y2="90" stroke="#C9A84C" stroke-width="1" opacity="0.4"/></svg>`,
    /* s02 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><circle cx="240" cy="150" r="110" fill="none" stroke="#4A9E8E" stroke-width="1" opacity="0.15"/><circle cx="240" cy="150" r="80" fill="none" stroke="#4A9E8E" stroke-width="1.2" opacity="0.22"/><circle cx="240" cy="150" r="52" fill="none" stroke="#4A9E8E" stroke-width="1.5" opacity="0.30"/><circle cx="240" cy="150" r="28" fill="#4A9E8E" opacity="0.18"/><circle cx="240" cy="150" r="12" fill="#4A9E8E" opacity="0.45"/><polyline points="140,150 175,150 185,128 195,172 205,150 240,150 250,135 260,165 270,150 340,150" fill="none" stroke="#C4786A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/></svg>`,
    /* s03 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#2E3440"/><ellipse cx="240" cy="220" rx="200" ry="60" fill="#4A9E8E" opacity="0.07"/><ellipse cx="240" cy="210" rx="120" ry="35" fill="#C9A84C" opacity="0.06"/><line x1="100" y1="120" x2="380" y2="120" stroke="rgba(255,255,255,0.08)" stroke-width="1"/><line x1="120" y1="150" x2="360" y2="150" stroke="rgba(255,255,255,0.06)" stroke-width="1"/><line x1="140" y1="180" x2="340" y2="180" stroke="rgba(255,255,255,0.04)" stroke-width="1"/><ellipse cx="240" cy="150" rx="36" ry="36" fill="none" stroke="#4A9E8E" stroke-width="1.2" opacity="0.35"/><ellipse cx="240" cy="150" rx="14" ry="14" fill="#4A9E8E" opacity="0.22"/></svg>`,
    /* s04 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><path d="M200,180 C165,178 148,160 150,138 C152,118 168,108 182,112 C180,96 190,84 205,84 C212,72 226,68 238,74 C248,62 264,62 274,72 C286,68 300,76 302,90 C318,90 330,104 326,120 C338,132 336,150 322,158 C326,174 314,186 298,184 C288,196 270,200 256,194 C244,202 224,202 212,194 C204,196 198,190 200,180Z" fill="#4A9E8E" opacity="0.15" stroke="#4A9E8E" stroke-width="1.4" stroke-opacity="0.4"/><rect x="228" y="124" width="8" height="36" rx="3" fill="#4A9E8E" opacity="0.55"/><rect x="244" y="124" width="8" height="36" rx="3" fill="#4A9E8E" opacity="0.55"/><circle cx="340" cy="132" r="4" fill="#C9A84C" opacity="0.5"/><circle cx="355" cy="132" r="4" fill="#C9A84C" opacity="0.3"/><circle cx="370" cy="132" r="4" fill="#C9A84C" opacity="0.15"/></svg>`,
    /* s05 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#F9F1DC"/><circle cx="240" cy="150" r="28" fill="#C9A84C" opacity="0.18"/><circle cx="240" cy="150" r="12" fill="#C9A84C" opacity="0.35"/></svg>`,
    /* s06 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><line x1="100" y1="150" x2="380" y2="150" stroke="#4A9E8E" stroke-width="1.5" opacity="0.2"/><circle cx="100" cy="150" r="20" fill="#4A9E8E" opacity="0.9"/><circle cx="193" cy="150" r="20" fill="#4A9E8E" opacity="0.55"/><circle cx="287" cy="150" r="20" fill="#4A9E8E" opacity="0.35"/><circle cx="380" cy="150" r="20" fill="#4A9E8E" opacity="0.2"/><text x="100" y="156" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="14" fill="white" font-weight="500">1</text><text x="193" y="156" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="14" fill="#4A9E8E" font-weight="500">2</text><text x="287" y="156" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="14" fill="#4A9E8E" font-weight="500">3</text><text x="380" y="156" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="14" fill="#4A9E8E" font-weight="500">4</text></svg>`,
    /* s07 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#4A9E8E"/><circle cx="240" cy="150" r="120" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/><circle cx="240" cy="150" r="85" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/><circle cx="240" cy="150" r="52" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/><circle cx="240" cy="150" r="26" fill="rgba(255,255,255,0.15)"/><text x="240" y="157" text-anchor="middle" font-family="Lora,Georgia,serif" font-style="italic" font-size="17" fill="rgba(255,255,255,0.88)">You did it.</text></svg>`,
    /* A1 — new: "There is a way through this" */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#F9F1DC"/><path d="M80,220 Q160,120 240,160 Q320,200 400,80" fill="none" stroke="#C9A84C" stroke-width="2" opacity="0.32" stroke-linecap="round"/><circle cx="80" cy="220" r="6" fill="#C4786A" opacity="0.35"/><circle cx="240" cy="160" r="6" fill="#4A9E8E" opacity="0.42"/><circle cx="400" cy="80" r="10" fill="#C9A84C" opacity="0.45"/><line x1="400" y1="64" x2="400" y2="48" stroke="#C9A84C" stroke-width="1.4" opacity="0.38" stroke-linecap="round"/><ellipse cx="400" cy="44" rx="10" ry="10" fill="#C9A84C" opacity="0.30"/></svg>`,
    /* s08 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#2E3440"/><ellipse cx="160" cy="100" rx="52" ry="22" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="1.2"/><ellipse cx="280" cy="80" rx="44" ry="18" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/><ellipse cx="340" cy="130" rx="56" ry="20" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1"/><ellipse cx="240" cy="195" rx="16" ry="16" fill="#4A9E8E" opacity="0.35"/><rect x="227" y="211" width="26" height="38" rx="5" fill="#4A9E8E" opacity="0.25"/></svg>`,
    /* s09 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><line x1="240" y1="260" x2="240" y2="180" stroke="#4A9E8E" stroke-width="1.4" opacity="0.3"/><line x1="240" y1="200" x2="160" y2="140" stroke="#4A9E8E" stroke-width="1.2" opacity="0.25"/><line x1="240" y1="200" x2="320" y2="140" stroke="#4A9E8E" stroke-width="1.2" opacity="0.25"/><line x1="160" y1="140" x2="100" y2="90" stroke="#4A9E8E" stroke-width="1" opacity="0.18"/><line x1="160" y1="140" x2="200" y2="85" stroke="#4A9E8E" stroke-width="1" opacity="0.18"/><line x1="320" y1="140" x2="280" y2="85" stroke="#4A9E8E" stroke-width="1" opacity="0.18"/><line x1="320" y1="140" x2="380" y2="90" stroke="#4A9E8E" stroke-width="1" opacity="0.18"/><circle cx="240" cy="200" r="8" fill="#4A9E8E" opacity="0.50"/><circle cx="160" cy="140" r="6" fill="#4A9E8E" opacity="0.38"/><circle cx="320" cy="140" r="6" fill="#4A9E8E" opacity="0.38"/><circle cx="100" cy="90" r="5" fill="#C4786A" opacity="0.35"/><circle cx="200" cy="85" r="5" fill="#C4786A" opacity="0.35"/><circle cx="280" cy="85" r="5" fill="#C4786A" opacity="0.35"/><circle cx="380" cy="90" r="5" fill="#C4786A" opacity="0.35"/></svg>`,
    /* s10 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#2E3440"/><ellipse cx="240" cy="240" rx="100" ry="18" fill="#C9A84C" opacity="0.08"/><rect x="222" y="190" width="36" height="28" rx="4" fill="#4A9E8E" opacity="0.55"/><polygon points="180,60 300,60 340,190 140,190" fill="rgba(255,255,255,0.04)"/></svg>`,
    /* s11 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><ellipse cx="120" cy="230" rx="9" ry="5" fill="#4A9E8E" opacity="0.28" transform="rotate(-10,120,230)"/><ellipse cx="178" cy="208" rx="9" ry="5" fill="#4A9E8E" opacity="0.28" transform="rotate(-8,178,208)"/><ellipse cx="244" cy="190" rx="9" ry="5" fill="#4A9E8E" opacity="0.28" transform="rotate(-8,244,190)"/><ellipse cx="314" cy="174" rx="9" ry="5" fill="#4A9E8E" opacity="0.28" transform="rotate(-8,314,174)"/></svg>`,
    /* B1 — new: "What is my worry saying?" */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><ellipse cx="240" cy="120" rx="68" ry="36" fill="none" stroke="#4A9E8E" stroke-width="1.4" opacity="0.28"/><line x1="206" y1="113" x2="274" y2="113" stroke="#4A9E8E" stroke-width="1.5" stroke-linecap="round" opacity="0.22"/><line x1="214" y1="125" x2="266" y2="125" stroke="#4A9E8E" stroke-width="1.5" stroke-linecap="round" opacity="0.16"/><circle cx="240" cy="195" r="14" fill="#C9A84C" opacity="0.22"/></svg>`,
    /* B2 — new: "A worry thought is not always a true thought" */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><rect x="60" y="60" width="360" height="180" rx="10" fill="none" stroke="#4A9E8E" stroke-width="1" opacity="0.12"/><ellipse cx="118" cy="208" rx="10" ry="10" fill="#4A9E8E" opacity="0.38"/><rect x="109" y="218" width="18" height="24" rx="4" fill="#4A9E8E" opacity="0.28"/></svg>`,
    /* s12 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#2E3440"/><ellipse cx="240" cy="120" rx="68" ry="36" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.4"/><line x1="206" y1="113" x2="274" y2="113" stroke="rgba(255,255,255,0.14)" stroke-width="1.5" stroke-linecap="round"/><line x1="214" y1="125" x2="266" y2="125" stroke="rgba(255,255,255,0.10)" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="240" cy="222" rx="14" ry="14" fill="#4A9E8E" opacity="0.28"/><rect x="228" y="236" width="24" height="32" rx="5" fill="#4A9E8E" opacity="0.20"/></svg>`,
    /* s13 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><rect x="60" y="60" width="360" height="180" rx="10" fill="none" stroke="#4A9E8E" stroke-width="1" opacity="0.12"/><ellipse cx="118" cy="208" rx="10" ry="10" fill="#4A9E8E" opacity="0.38"/><rect x="109" y="218" width="18" height="24" rx="4" fill="#4A9E8E" opacity="0.28"/></svg>`,
    /* s14 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#F9F1DC"/><circle cx="240" cy="145" r="72" fill="none" stroke="#C9A84C" stroke-width="1.4" opacity="0.30"/><circle cx="240" cy="145" r="46" fill="none" stroke="#C9A84C" stroke-width="1" opacity="0.22"/><ellipse cx="240" cy="145" rx="10" ry="10" fill="#C9A84C" opacity="0.28"/><rect x="232" y="155" width="16" height="22" rx="4" fill="#C9A84C" opacity="0.20"/></svg>`,
    /* s15 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><circle cx="240" cy="150" r="100" fill="none" stroke="#4A9E8E" stroke-width="1" opacity="0.12"/><circle cx="240" cy="150" r="70" fill="none" stroke="#4A9E8E" stroke-width="1.2" opacity="0.18"/><circle cx="240" cy="150" r="44" fill="none" stroke="#4A9E8E" stroke-width="1.4" opacity="0.26"/><circle cx="240" cy="150" r="22" fill="#4A9E8E" opacity="0.20"/><path d="M200,175 Q240,130 280,175" fill="none" stroke="#C9A84C" stroke-width="1.4" opacity="0.35" stroke-linecap="round"/></svg>`,
    /* s16 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><ellipse cx="240" cy="105" rx="22" ry="22" fill="none" stroke="#4A9E8E" stroke-width="1.4" opacity="0.40"/><circle cx="240" cy="165" r="10" fill="#C9A84C" opacity="0.20"/></svg>`,
    /* C1 — new: "Now I slow my body" */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#4A9E8E"/><circle cx="240" cy="150" r="80" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/><circle cx="240" cy="150" r="52" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/><circle cx="240" cy="150" r="28" fill="rgba(255,255,255,0.14)"/><path d="M200,160 Q240,120 280,160" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    /* C2 — new: "What changed in my body?" */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><path d="M60,120 Q120,170 180,140 Q240,110 300,148 Q360,185 420,160" fill="none" stroke="#4A9E8E" stroke-width="1.6" opacity="0.24" stroke-linecap="round"/><line x1="60" y1="200" x2="420" y2="200" stroke="#4A9E8E" stroke-width="1.4" opacity="0.18" stroke-linecap="round"/></svg>`,
    /* s17 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#F9F1DC"/><path d="M100,180 Q140,100 180,180" fill="none" stroke="#C9A84C" stroke-width="1.6" opacity="0.35" stroke-linecap="round"/><line x1="200" y1="180" x2="240" y2="180" stroke="#C9A84C" stroke-width="1.4" opacity="0.28" stroke-linecap="round"/><path d="M260,180 Q300,260 340,180" fill="none" stroke="#C9A84C" stroke-width="1.6" opacity="0.35" stroke-linecap="round"/><circle cx="240" cy="148" r="16" fill="#C9A84C" opacity="0.15"/><circle cx="240" cy="148" r="7" fill="#C9A84C" opacity="0.30"/></svg>`,
    /* s18 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><path d="M60,150 Q120,110 180,150 Q240,190 300,150 Q360,110 420,150" fill="none" stroke="#4A9E8E" stroke-width="1.8" opacity="0.30" stroke-linecap="round"/><circle cx="240" cy="120" r="18" fill="#4A9E8E" opacity="0.14"/><circle cx="240" cy="120" r="8" fill="#4A9E8E" opacity="0.28"/></svg>`,
    /* s19 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><ellipse cx="240" cy="110" rx="72" ry="40" fill="none" stroke="#4A9E8E" stroke-width="1.4" opacity="0.28"/><line x1="196" y1="84" x2="284" y2="136" stroke="#C4786A" stroke-width="1" opacity="0.18" stroke-linecap="round"/><line x1="284" y1="84" x2="196" y2="136" stroke="#C4786A" stroke-width="1" opacity="0.18" stroke-linecap="round"/></svg>`,
    /* s20 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><path d="M160,110 L300,110 L320,150 L300,190 L160,190 L160,110Z" fill="none" stroke="#4A9E8E" stroke-width="1.4" opacity="0.28"/><circle cx="172" cy="150" r="6" fill="#4A9E8E" opacity="0.22"/><line x1="192" y1="150" x2="286" y2="150" stroke="#4A9E8E" stroke-width="1.2" opacity="0.16" stroke-linecap="round"/><line x1="330" y1="150" x2="370" y2="150" stroke="#C9A84C" stroke-width="1.4" opacity="0.30" stroke-linecap="round"/></svg>`,
    /* s21 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#F9F1DC"/><ellipse cx="160" cy="130" rx="56" ry="32" fill="none" stroke="#C4786A" stroke-width="1.2" opacity="0.22"/><ellipse cx="320" cy="130" rx="56" ry="32" fill="none" stroke="#C9A84C" stroke-width="1.4" opacity="0.34"/><line x1="222" y1="130" x2="258" y2="130" stroke="#C9A84C" stroke-width="1.4" opacity="0.38" stroke-linecap="round"/></svg>`,
    /* D1 — new: "What will I say back to worry?" */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#F9F1DC"/><ellipse cx="150" cy="130" rx="70" ry="40" fill="none" stroke="#C4786A" stroke-width="1.2" opacity="0.22"/><ellipse cx="320" cy="150" rx="16" ry="16" fill="#C9A84C" opacity="0.35"/><rect x="306" y="166" width="28" height="36" rx="5" fill="#C9A84C" opacity="0.25"/><line x1="346" y1="168" x2="390" y2="168" stroke="#C9A84C" stroke-width="1.6" opacity="0.32" stroke-linecap="round"/></svg>`,
    /* s22 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><polyline points="80,230 80,190 160,190 160,155 240,155 240,120 320,120 320,88 400,88" fill="none" stroke="#4A9E8E" stroke-width="2" opacity="0.30" stroke-linecap="round" stroke-linejoin="round"/><circle cx="80" cy="190" r="5" fill="#4A9E8E" opacity="0.40"/><circle cx="160" cy="155" r="5" fill="#4A9E8E" opacity="0.40"/><circle cx="240" cy="120" r="5" fill="#4A9E8E" opacity="0.40"/><circle cx="320" cy="88" r="5" fill="#4A9E8E" opacity="0.40"/><circle cx="400" cy="88" r="14" fill="#C9A84C" opacity="0.15"/><circle cx="400" cy="88" r="6" fill="#C9A84C" opacity="0.28"/></svg>`,
    /* s23 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#2E3440"/><ellipse cx="200" cy="185" rx="14" ry="14" fill="#4A9E8E" opacity="0.38"/><rect x="188" y="199" width="24" height="36" rx="5" fill="#4A9E8E" opacity="0.28"/><line x1="200" y1="199" x2="200" y2="148" stroke="#4A9E8E" stroke-width="6" stroke-linecap="round" opacity="0.35"/><ellipse cx="200" cy="145" rx="30" ry="20" fill="#C9A84C" opacity="0.07"/></svg>`,
    /* s24 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><polyline points="100,150 120,138 136,162 152,132 168,168 184,140 200,158 216,145 232,155 248,148 264,153 280,149 296,151 320,150 360,150" fill="none" stroke="#4A9E8E" stroke-width="1.8" opacity="0.32" stroke-linecap="round" stroke-linejoin="round"/><circle cx="100" cy="150" r="5" fill="#C9A84C" opacity="0.35"/></svg>`,
    /* E1 — new: "What is my brave step?" */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><ellipse cx="110" cy="158" rx="12" ry="12" fill="#4A9E8E" opacity="0.28"/><ellipse cx="190" cy="158" rx="12" ry="12" fill="#4A9E8E" opacity="0.28"/><ellipse cx="290" cy="158" rx="12" ry="12" fill="#4A9E8E" opacity="0.28"/><ellipse cx="370" cy="158" rx="12" ry="12" fill="#4A9E8E" opacity="0.28"/><path d="M110,152 Q240,90 370,152" fill="none" stroke="#4A9E8E" stroke-width="1.2" opacity="0.18" stroke-linecap="round"/></svg>`,
    /* s25 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><rect x="160" y="80" width="160" height="140" rx="6" fill="none" stroke="#4A9E8E" stroke-width="1.2" opacity="0.22"/><line x1="185" y1="120" x2="295" y2="120" stroke="#C4786A" stroke-width="1.4" opacity="0.28" stroke-linecap="round"/><line x1="185" y1="148" x2="295" y2="148" stroke="#4A9E8E" stroke-width="1.2" opacity="0.22" stroke-linecap="round"/><polyline points="286,170 295,182 314,158" fill="none" stroke="#C9A84C" stroke-width="1.6" opacity="0.36" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    /* s26 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><ellipse cx="120" cy="150" rx="12" ry="12" fill="#4A9E8E" opacity="0.22"/><ellipse cx="200" cy="150" rx="12" ry="12" fill="#4A9E8E" opacity="0.22"/><ellipse cx="360" cy="150" rx="12" ry="12" fill="#4A9E8E" opacity="0.22"/><ellipse cx="280" cy="150" rx="13" ry="13" fill="#C9A84C" opacity="0.25"/></svg>`,
    /* s27 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#F9F1DC"/><path d="M80,190 Q160,240 240,190" fill="none" stroke="#C4786A" stroke-width="1.4" opacity="0.22" stroke-linecap="round"/><path d="M240,190 Q320,130 400,170" fill="none" stroke="#C9A84C" stroke-width="1.6" opacity="0.34" stroke-linecap="round"/><circle cx="240" cy="190" r="6" fill="#C9A84C" opacity="0.30"/></svg>`,
    /* s28 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><ellipse cx="140" cy="205" rx="11" ry="11" fill="#4A9E8E" opacity="0.25"/><ellipse cx="240" cy="190" rx="13" ry="13" fill="#4A9E8E" opacity="0.32"/><ellipse cx="345" cy="172" rx="15" ry="15" fill="#4A9E8E" opacity="0.42"/></svg>`,
    /* s29 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#F9F1DC"/><ellipse cx="150" cy="120" rx="70" ry="40" fill="none" stroke="#C4786A" stroke-width="1.2" opacity="0.22"/><ellipse cx="310" cy="155" rx="16" ry="16" fill="#C9A84C" opacity="0.35"/><rect x="296" y="171" width="28" height="40" rx="5" fill="#C9A84C" opacity="0.25"/><line x1="332" y1="175" x2="380" y2="175" stroke="#C9A84C" stroke-width="1.6" opacity="0.32" stroke-linecap="round"/></svg>`,
    /* E2 — new: "This is what I do when worry shows up" */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#4A9E8E"/><circle cx="240" cy="150" r="100" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/><circle cx="240" cy="150" r="68" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/><circle cx="240" cy="150" r="38" fill="rgba(255,255,255,0.12)"/><text x="240" y="157" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="13" fill="rgba(255,255,255,0.82)" font-weight="500">My Plan</text></svg>`,
    /* s30 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><path d="M100,180 Q140,140 180,180" fill="none" stroke="#4A9E8E" stroke-width="1.5" opacity="0.28" stroke-linecap="round"/><path d="M200,180 Q240,130 280,180" fill="none" stroke="#4A9E8E" stroke-width="1.5" opacity="0.28" stroke-linecap="round"/><line x1="300" y1="180" x2="400" y2="180" stroke="#4A9E8E" stroke-width="1.5" opacity="0.24" stroke-linecap="round"/><ellipse cx="240" cy="108" rx="14" ry="14" fill="#4A9E8E" opacity="0.32"/></svg>`,
    /* s31 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><path d="M60,200 Q120,100 180,170 Q240,240 300,150 Q360,60 420,160" fill="none" stroke="#4A9E8E" stroke-width="1.8" opacity="0.28" stroke-linecap="round"/><line x1="60" y1="220" x2="420" y2="220" stroke="#4A9E8E" stroke-width="1" opacity="0.12"/></svg>`,
    /* s32 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#F9F1DC"/><ellipse cx="240" cy="130" rx="16" ry="16" fill="#C9A84C" opacity="0.40"/><circle cx="240" cy="155" r="50" fill="none" stroke="#C9A84C" stroke-width="1.2" opacity="0.18"/><circle cx="240" cy="155" r="72" fill="none" stroke="#C9A84C" stroke-width="1" opacity="0.12"/></svg>`,
    /* s33 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><path d="M290,150 A70,70 0 1,1 240,80" fill="none" stroke="#4A9E8E" stroke-width="1.6" opacity="0.28" stroke-linecap="round"/><circle cx="240" cy="150" r="10" fill="#4A9E8E" opacity="0.22"/><circle cx="240" cy="150" r="4" fill="#4A9E8E" opacity="0.40"/></svg>`,
    /* s34 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#F9F1DC"/><circle cx="240" cy="240" r="12" fill="#C9A84C" opacity="0.28"/><line x1="240" y1="228" x2="240" y2="120" stroke="#C9A84C" stroke-width="2" opacity="0.28" stroke-linecap="round"/><path d="M240,170 Q200,148 196,120 Q220,136 240,155" fill="#4A9E8E" opacity="0.22"/><path d="M240,150 Q280,128 284,100 Q260,116 240,135" fill="#4A9E8E" opacity="0.22"/><circle cx="240" cy="108" r="18" fill="#C9A84C" opacity="0.18"/><circle cx="240" cy="108" r="8" fill="#C9A84C" opacity="0.32"/></svg>`,
    /* s35 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><ellipse cx="110" cy="158" rx="12" ry="12" fill="#4A9E8E" opacity="0.28"/><ellipse cx="190" cy="158" rx="12" ry="12" fill="#4A9E8E" opacity="0.28"/><ellipse cx="290" cy="158" rx="12" ry="12" fill="#4A9E8E" opacity="0.28"/><ellipse cx="370" cy="158" rx="12" ry="12" fill="#4A9E8E" opacity="0.28"/><path d="M110,152 Q240,90 370,152" fill="none" stroke="#4A9E8E" stroke-width="1.2" opacity="0.18" stroke-linecap="round"/></svg>`,
    /* s36 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><ellipse cx="200" cy="155" rx="12" ry="12" fill="#4A9E8E" opacity="0.30"/><ellipse cx="285" cy="142" rx="16" ry="16" fill="#4A9E8E" opacity="0.38"/><path d="M212,158 Q242,138 270,150" fill="none" stroke="#C9A84C" stroke-width="1.4" opacity="0.30" stroke-linecap="round"/></svg>`,
    /* s37 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><circle cx="130" cy="150" r="10" fill="#4A9E8E" opacity="0.30"/><path d="M148,150 Q180,118 212,150" fill="none" stroke="#4A9E8E" stroke-width="1.4" opacity="0.26" stroke-linecap="round"/><circle cx="240" cy="150" r="16" fill="none" stroke="#4A9E8E" stroke-width="1.2" opacity="0.24"/><line x1="258" y1="150" x2="310" y2="150" stroke="#4A9E8E" stroke-width="1.4" opacity="0.22" stroke-linecap="round"/></svg>`,
    /* s38 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#F9F1DC"/><ellipse cx="260" cy="148" rx="15" ry="15" fill="#C9A84C" opacity="0.40"/><rect x="247" y="163" width="26" height="38" rx="5" fill="#C9A84C" opacity="0.30"/><ellipse cx="175" cy="160" rx="10" ry="10" fill="#C4786A" opacity="0.16"/><line x1="290" y1="178" x2="340" y2="178" stroke="#C9A84C" stroke-width="1.6" opacity="0.32" stroke-linecap="round"/></svg>`,
    /* s39 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#F9F1DC"/><ellipse cx="240" cy="150" rx="14" ry="14" fill="#C9A84C" opacity="0.38"/><circle cx="240" cy="162" r="48" fill="none" stroke="#C9A84C" stroke-width="1.2" opacity="0.18"/><circle cx="240" cy="162" r="72" fill="none" stroke="#C9A84C" stroke-width="1" opacity="0.12"/><ellipse cx="292" cy="118" rx="8" ry="8" fill="#4A9E8E" opacity="0.22"/><ellipse cx="188" cy="118" rx="8" ry="8" fill="#4A9E8E" opacity="0.22"/></svg>`,
    /* s40 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><path d="M60,120 Q120,170 180,140 Q240,110 300,148 Q360,185 420,160" fill="none" stroke="#4A9E8E" stroke-width="1.6" opacity="0.24" stroke-linecap="round"/><line x1="60" y1="200" x2="420" y2="200" stroke="#4A9E8E" stroke-width="1.4" opacity="0.18" stroke-linecap="round"/></svg>`,
    /* s41 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#EAF5F3"/><line x1="60" y1="200" x2="420" y2="200" stroke="#4A9E8E" stroke-width="1" opacity="0.16"/><path d="M120,200 A120,120 0 0,1 360,200" fill="none" stroke="#C9A84C" stroke-width="1.4" opacity="0.24" stroke-linecap="round"/><line x1="240" y1="80" x2="240" y2="60" stroke="#C9A84C" stroke-width="1.2" opacity="0.22" stroke-linecap="round"/><ellipse cx="240" cy="178" rx="10" ry="10" fill="#4A9E8E" opacity="0.30"/></svg>`,
    /* F1 — new: "My plan for next time" */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#F9F1DC"/><path d="M60,240 Q120,200 180,210 Q240,220 300,170 Q360,120 420,90" fill="none" stroke="#C9A84C" stroke-width="2" opacity="0.28" stroke-linecap="round"/><circle cx="60" cy="240" r="5" fill="#C4786A" opacity="0.28"/><circle cx="180" cy="210" r="5" fill="#4A9E8E" opacity="0.30"/><circle cx="300" cy="170" r="5" fill="#4A9E8E" opacity="0.34"/><circle cx="420" cy="90" r="8" fill="#C9A84C" opacity="0.38"/><ellipse cx="420" cy="68" rx="10" ry="10" fill="#C9A84C" opacity="0.36"/></svg>`,
    /* s42 */
    `<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="300" fill="#F9F1DC"/><path d="M60,240 Q120,200 180,210 Q240,220 300,170 Q360,120 420,90" fill="none" stroke="#C9A84C" stroke-width="2" opacity="0.28" stroke-linecap="round"/><circle cx="60" cy="240" r="5" fill="#C4786A" opacity="0.28"/><circle cx="180" cy="210" r="5" fill="#4A9E8E" opacity="0.30"/><circle cx="300" cy="170" r="5" fill="#4A9E8E" opacity="0.34"/><circle cx="420" cy="90" r="8" fill="#C9A84C" opacity="0.38"/><ellipse cx="420" cy="68" rx="10" ry="10" fill="#C9A84C" opacity="0.36"/></svg>`
  ];

  /* ─────────────────────────────────────────────
     SCENE DATA  (51 screens)
     Original 42 preserved exactly.
     9 new scenes inserted at auditor-specified positions.
  ───────────────────────────────────────────── */
  const SCENES = [
    // ── PHASE: The First Strike ──────────────────────────────────────────
    { id:'my-teacher-called-on-me', phase:'The First Strike', image:'assets/images/s01.webp', imageAlt:'A child in class suddenly being called on by the teacher.', sceneCaption:null, sceneStyle:'dark', label:'Where it started', title:'My teacher called on me.', bodyType:'prose', body:['I was sitting in class,\ntrying to stay small and quiet.','Then my teacher said my name.','In one quick moment,\neverything inside me changed.'] },
    { id:'everything-inside-me-reacted', phase:'The First Strike', image:'assets/images/s02.webp', imageAlt:'A child feeling a sudden rush of worry in the body.', sceneCaption:null, sceneStyle:'light', label:'What happened inside me', title:'Everything inside me reacted.', bodyType:'mixed', body:['My body reacted before I could even think.','My heart felt fast.\nMy chest felt tight.\nMy stomach did not feel steady.','It all happened so quickly.'], quotes:['My heart started racing.','My chest felt tight.','My stomach felt strange.'], bodyAfter:['It was like my body had sounded an alarm.'] },
    { id:'my-mind-went-blank', phase:'The First Strike', image:'assets/images/s03.webp', imageAlt:'A child in class feeling frozen and unable to think clearly.', sceneCaption:null, sceneStyle:'dark', label:'What happened to my thoughts', title:'My mind went blank.', bodyType:'prose', body:['I wanted to think,\nbut the words would not come.','What I knew a moment ago suddenly felt far away.','That blank feeling made the moment even scarier.'] },
    { id:'it-felt-like-everyone-was-looking-at-me', phase:'The First Strike', image:'assets/images/s04.webp', imageAlt:'A child feeling watched by classmates during an anxious moment.', sceneCaption:null, sceneStyle:'dark', label:'What it felt like around me', title:'It felt like everyone was looking at me.', bodyType:'prose', body:['The whole room suddenly felt different.','Faces,\nvoices,\nand even silence started to feel heavy.','It felt like everyone could see that I was struggling.'] },
    { id:'i-wanted-the-moment-to-end', phase:'The First Strike', image:'assets/images/s05.webp', imageAlt:'A child wanting to hide or escape during an anxious classroom moment.', sceneCaption:null, sceneStyle:'gold', label:'What I wanted to do', title:'I wanted the moment to end.', bodyType:'prose', body:['Part of me wanted to disappear.','I wanted to look down,\nstay quiet,\nor somehow get out of the moment.','When worry hits hard,\nescape can feel like the safest thing.'] },
    { id:'the-worry-stayed-with-me', phase:'The First Strike', image:'assets/images/s06.webp', imageAlt:'A child after class still carrying the uneasy feeling of worry.', sceneCaption:null, sceneStyle:'teal', label:'What happened after', title:'The worry stayed with me.', bodyType:'prose', body:['Even after that moment was over,\nit did not feel fully over inside me.','The class moved on,\nbut the uneasy feeling stayed.','That is how I started realizing the worry was not finished yet.'] },
    { id:'i-did-not-know-what-was-happening-to-me', phase:'The First Strike', image:'assets/images/s07.webp', imageAlt:'A child sitting quietly afterward, confused by what was happening inside.', sceneCaption:null, sceneStyle:'dark', label:'The confused feeling', title:'I did not know what was happening to me.', bodyType:'prose', body:['That may be one of the hardest parts at first.','Something real is happening inside,\nbut the child does not yet have words for it.','The worry has arrived,\nbut it has not yet been understood.'] },

    // ── NEW SCENE A1 — inserted after Scene 7 ───────────────────────────
    { id:'there-is-a-way-through-this', phase:'The First Strike', image:'assets/images/sA1.webp', imageAlt:'A student beginning to see that worry can be handled one step at a time.', sceneCaption:null, sceneStyle:'gold', label:'A way through', title:'There is a way through this.', bodyType:'methodIntro', body:['Worry can feel sudden.','It can feel loud.','It can feel bigger than everything else.','When worry shows up, it can make my body tense, my thoughts race, and my courage feel far away.','But worry is not the end of the story.','I can learn a way through it.'], steps:['Notice what is happening.','Name the worry.','Slow my body.','Choose what is true.','Step forward bravely.','Remember what helped.'], bodyAfter:['I do not have to do every step perfectly.\nI only have to begin.'], groundedNote:'This page is based on cognitive behavioral therapy, which teaches practical skills for noticing thoughts, feelings, and actions and learning new ways to respond.' },

    // ── PHASE: Worry Reveals Its Many Faces ─────────────────────────────
    { id:'worry-started-talking', phase:'Worry Reveals Its Many Faces', image:'assets/images/s08.webp', imageAlt:'A child sitting quietly, lost in worried thoughts.', sceneCaption:null, sceneStyle:'dark', label:'What started happening next', title:'Worry started talking in my head.', bodyType:'mixed', body:['After that moment in class, the worry did not stay quiet.','It started saying things inside my head.','Sometimes the words came fast.\nSometimes they came softly.\nBut they kept coming.'], quotes:['"What if it happens again?"','"What if I freeze next time too?"','"What if people think I am not smart?"'], bodyAfter:['It was like worry had found a voice.'] },
    { id:'what-if-thoughts-multiplied', phase:'Worry Reveals Its Many Faces', image:'assets/images/s09.webp', imageAlt:'A child overwhelmed by many what-if thoughts.', sceneCaption:null, sceneStyle:'light', label:'How worry grows', title:'"What if" thoughts started multiplying.', bodyType:'mixed', body:['One worried thought did not stay by itself.','It quickly brought more with it.','My mind started jumping ahead to things that had not even happened.'], quotes:['"What if I get called on again?"','"What if I mess up in front of everyone?"','"What if something goes wrong tomorrow too?"'], bodyAfter:['The more I listened, the bigger everything started to feel.'] },
    { id:'small-things-felt-big', phase:'Worry Reveals Its Many Faces', image:'assets/images/s10.webp', imageAlt:'A child looking at an ordinary moment that feels too big.', sceneCaption:null, sceneStyle:'dark', label:'What worry does', title:'Small things started feeling big.', bodyType:'prose', body:['Things that used to feel normal started feeling heavy.','A question.\nA worksheet.\nA turn to speak.\nEven small moments began to feel too big inside me.','It was not because those moments had changed.\nIt was because worry was making them feel larger than they really were.'] },
    { id:'worry-followed-me', phase:'Worry Reveals Its Many Faces', image:'assets/images/s11.webp', imageAlt:'A child carrying worry into different parts of the day.', sceneCaption:null, sceneStyle:'light', label:'Where worry went', title:'Worry started following me into other places.', bodyType:'prose', body:['It was not only in that one classroom moment anymore.','I could feel it before reading.\nBefore group work.\nBefore answering.\nSometimes even before school started.','It felt like worry was beginning to follow me.'] },

    // ── NEW SCENE B1 — inserted after Scene 11 ──────────────────────────
    { id:'what-is-my-worry-saying', phase:'Worry Reveals Its Many Faces', image:'assets/images/sB1.webp', imageAlt:'A student pausing to notice and name a worried thought.', sceneCaption:null, sceneStyle:'light', label:'Name it', title:'What is my worry saying?', bodyType:'worryChoice', body:['Worry often talks in "what if" sentences.','It tries to pull me into scary guesses.\nIt tries to make me believe that something bad is already about to happen.','One worried thought can grow very fast when I do not stop to notice it.'], prompt:'Pick the worry thought that sounds most like yours right now.', choices:['What if I mess up?','What if people laugh?','What if I freeze again?','What if I cannot do it?'], customChoiceLabel:'Type my own worry thought', followup:['This is a worry thought.','It feels strong, but that does not make it automatically true.'], groundedNote:'CBT commonly teaches children to identify anxious thoughts so they can work with them more clearly instead of getting swept away by them.' },

    // ── NEW SCENE B2 — inserted immediately after B1 ─────────────────────
    { id:'worry-is-not-always-truth', phase:'Worry Reveals Its Many Faces', image:'assets/images/sB2.webp', imageAlt:'A student learning to separate worry from facts.', sceneCaption:null, sceneStyle:'light', label:'Truth check', title:'A worry thought is not always a true thought.', bodyType:'truthCheck', body:['A worried thought can feel very real.','Sometimes it feels so strong that it sounds like a fact.\nBut a feeling is not the same thing as proof.'], promptA:'My worry thought is mostly:', choicesA:['Something I know for sure','Something I am worried might happen'], correctA:1, promptB:'What do I know for sure right now?', choicesB:['I am having a worried feeling','I am definitely unsafe','Everyone thinks badly of me'], correctB:0, closing:['I can feel worried and still look for what is actually true.'], groundedNote:'This page uses a standard CBT idea: anxious thoughts can be extreme or unrealistic, so it helps to check whether a thought is evidence or fear.' },

    { id:'started-staying-quiet', phase:'Worry Reveals Its Many Faces', image:'assets/images/s12.webp', imageAlt:'A child wanting to speak but holding back.', sceneCaption:null, sceneStyle:'dark', label:'What I began to do', title:'I started staying quiet.', bodyType:'prose', body:['Sometimes I wanted to say something,\nbut I held it in.','Sometimes I wanted to try,\nbut I stayed back instead.','Being quiet started to feel safer than taking the chance.'] },
    { id:'began-to-feel-smaller', phase:'Worry Reveals Its Many Faces', image:'assets/images/s13.webp', imageAlt:'A child feeling small in a large space.', sceneCaption:null, sceneStyle:'light', label:'What it felt like inside', title:'I began to feel smaller.', bodyType:'prose', body:['The worry was not only affecting what I did.','It was starting to affect how I felt about myself.','I felt less brave.\nLess ready.\nLess sure of myself than before.'] },
    { id:'something-wrong-with-me', phase:'Worry Reveals Its Many Faces', image:'assets/images/s14.webp', imageAlt:'A child alone, wondering if something is wrong with them.', sceneCaption:null, sceneStyle:'gold', label:'The painful question', title:'I started wondering if something was wrong with me.', bodyType:'mixed', body:['After a while, a harder thought started to grow.','It was no longer only about the moment.\nIt started to feel like it might be about me.','That thought can feel very lonely.'], quotes:['"Why am I like this?"','"Why is this so hard for me?"','"What if I am just not good at things like other kids are?"'], bodyAfter:['This is where worry starts to hurt deeply.\nNot just in the body.\nNot just in the mind.\nBut in the heart.'] },

    // ── PHASE: Awareness Begins ──────────────────────────────────────────
    { id:'maybe-this-is-worry', phase:'Awareness Begins', image:'assets/images/s15.webp', imageAlt:'A child pausing, beginning to notice their thoughts.', sceneCaption:null, sceneStyle:'light', label:'A small realization', title:'Maybe this feeling has a name.', bodyType:'prose', body:['Something began to change.','I started noticing what was happening inside me.','The thoughts.\nThe feelings.\nThe tightness.','Maybe this was not just "me."\nMaybe it was something happening to me.'] },
    { id:'worry-is-a-signal', phase:'Awareness Begins', image:'assets/images/s16.webp', imageAlt:'A child noticing their body and thoughts calmly.', sceneCaption:null, sceneStyle:'light', label:'Understanding starts', title:'Worry is something my body and mind do.', bodyType:'prose', body:['Worry can feel strong, but it is not who I am.','It is something my body does.\nSomething my mind does.','And that means it can be understood.'] },

    // ── NEW SCENE C1 — inserted after Scene 16 ──────────────────────────
    { id:'now-i-slow-my-body', phase:'Awareness Begins', image:'assets/images/sC1.webp', imageAlt:'A student practicing slow breathing to help the body settle.', sceneCaption:null, sceneStyle:'teal', label:'Slow my body', title:'Now I slow my body.', bodyType:'breathing', body:['When worry gets loud, my body can feel fast.','My heart may pound.\nMy breathing may get tight.\nMy shoulders may tense.\nMy stomach may twist.\nMy whole body may feel ready to run.','That does not always mean I am in danger.\nIt means my body needs help settling.','If it helps, I can place a hand on my chest or stomach while I breathe.','A slow breath helps teach my body:\n"This moment is hard, and I can still handle it."'], inhaleLabel:'Breathe in slowly', inhaleCount:4, exhaleLabel:'Breathe out gently', exhaleCount:6, rounds:3, supportLine:'I can put a hand on my chest or stomach if that helps me feel steady.', groundedNote:'NHS guidance recommends breathing exercises for stress, anxiety, and panic. NIMH notes that psychotherapy can use relaxation and breathing techniques to help manage distress.' },

    // ── NEW SCENE C2 — inserted immediately after C1 ─────────────────────
    { id:'what-changed-in-my-body', phase:'Awareness Begins', image:'assets/images/sC2.webp', imageAlt:'A student noticing small changes after practicing a calming breath.', sceneCaption:null, sceneStyle:'light', label:'Notice the change', title:'What changed in my body?', bodyType:'ratingCheck', body:['Sometimes one slow breath helps a little.','Sometimes it helps a lot.','Sometimes my body still feels stirred up and needs more time.','All of those are okay.','The goal is not to become perfectly calm in one second.\nThe goal is to begin helping my body.'], ratingPrompt:'How big does the worry feel right now?', ratingLabels:['1 — very small','2','3','4','5 — very big'], checkPrompt:'What changed a little?', checks:['My breathing feels easier','My heart slowed a little','My body still feels tight','I want another slow breath'], closing:['I do not need the feeling to disappear completely to know I am helping myself.','Even a small change matters.'], groundedNote:'Anxiety treatment often teaches coping and tolerating discomfort rather than expecting all anxious feelings to vanish immediately.' },

    // ── PHASE: First Tool ────────────────────────────────────────────────
    { id:'pause-and-breathe', phase:'First Tool', image:'assets/images/s17.webp', imageAlt:'A child taking a slow breath calmly.', sceneCaption:null, sceneStyle:'gold', label:'First small step', title:'I can pause and take a slow breath.', bodyType:'steps', intro:'Here is what I can do:', steps:[{num:1,strong:'Breathe in slowly.',detail:null},{num:2,strong:'Hold for a moment.',detail:null},{num:3,strong:'Let it out gently.',detail:null},{num:4,strong:'Do it again.',detail:null}], bodyAfter:['Even one slow breath can help my body begin to settle.'] },
    { id:'body-can-calm', phase:'First Tool', image:'assets/images/s18.webp', imageAlt:'A child becoming physically calmer.', sceneCaption:null, sceneStyle:'light', label:'What happens next', title:'My body can begin to calm down.', bodyType:'prose', body:['The tight feeling does not have to stay forever.','When I slow down my breathing,\nmy body begins to feel different.','A little calmer.\nA little steadier.'] },

    // ── PHASE: Thinking Clearly ──────────────────────────────────────────
    { id:'thoughts-are-not-always-true', phase:'Thinking Clearly', image:'assets/images/s19.webp', imageAlt:'A student observing their thoughts calmly.', sceneCaption:null, sceneStyle:'light', label:'New understanding', title:'Not every thought is true.', bodyType:'prose', body:['Worry can say many things.','But that does not mean those things are true.','Thoughts are not always facts.'] },
    { id:'name-the-thought', phase:'Thinking Clearly', image:'assets/images/s20.webp', imageAlt:'A student identifying a worried thought.', sceneCaption:null, sceneStyle:'light', label:'A helpful step', title:'I can notice what the thought is saying.', bodyType:'mixed', body:['I can listen carefully to the thought.','Then I can name it.'], quotes:['"This is a what-if thought."','"This is a worry thought."'] },
    { id:'choose-a-better-thought', phase:'Thinking Clearly', image:'assets/images/s21.webp', imageAlt:'A student thinking with more confidence.', sceneCaption:null, sceneStyle:'gold', label:'A new choice', title:'I can choose a more helpful thought.', bodyType:'mixed', body:['I do not have to believe every worried thought.','I can choose a different one.'], quotes:['"I can try one small step."','"I don\'t have to be perfect."'] },

    // ── NEW SCENE D1 — inserted after Scene 21 ──────────────────────────
    { id:'what-will-i-say-back', phase:'Thinking Clearly', image:'assets/images/sD1.webp', imageAlt:'A student choosing a brave thought to answer worry.', sceneCaption:null, sceneStyle:'gold', label:'Answer back', title:'What will I say back to worry?', bodyType:'braveThoughtChoice', body:['Worry talks loudly.\nBut I can answer it.','I do not have to argue with worry forever.\nI do not have to find perfect words.\nI only need one steady, helpful thought.'], prompt:'My brave thought is:', choices:['I might feel nervous, and I can still try.','This feeling is hard, but it will pass.','I do not have to be perfect.','I can ask for help.'], customChoiceLabel:'Type my own brave thought', closing:['A brave thought does not need to sound big.','It needs to sound true and steady.'], groundedNote:'This page reflects CBT\'s use of coping thoughts and thought-challenging to respond to anxious thinking more helpfully.' },

    { id:'small-steps-matter', phase:'Thinking Clearly', image:'assets/images/s22.webp', imageAlt:'A student taking a small step forward.', sceneCaption:null, sceneStyle:'light', label:'Moving forward', title:'Small steps are enough.', bodyType:'prose', body:['I do not have to solve everything at once.','One small step is already something strong.'] },

    // ── PHASE: Taking Action ─────────────────────────────────────────────
    { id:'try-even-if-scared', phase:'Taking Action', image:'assets/images/s23.webp', imageAlt:'A student hesitantly raising a hand in class.', sceneCaption:null, sceneStyle:'dark', label:'A brave moment', title:'I can try, even if I feel scared.', bodyType:'prose', body:['The feeling may still be there.','The tightness.\nThe thoughts.\nThe hesitation.','But I can still try anyway.','Trying does not mean I feel ready.\nIt means I take a step even if I do not.'] },
    { id:'voice-might-shake', phase:'Taking Action', image:'assets/images/s24.webp', imageAlt:'A student speaking softly in class.', sceneCaption:null, sceneStyle:'light', label:'What it feels like', title:'My voice might shake \u2014 and that is okay.', bodyType:'prose', body:['My voice might feel unsteady.','I might not say everything perfectly.','That does not mean I am failing.','It means I am doing something brave.'] },

    // ── NEW SCENE E1 — inserted after Scene 24 ──────────────────────────
    { id:'what-is-my-brave-step', phase:'Taking Action', image:'assets/images/sE1.webp', imageAlt:'A student deciding on one real brave step to take.', sceneCaption:null, sceneStyle:'light', label:'Brave step', title:'What is my brave step?', bodyType:'braveStepChoice', body:['Bravery does not mean I never feel worried.','Bravery means doing one helpful thing even while worry is nearby.','I do not have to do the biggest thing.\nI do not have to do everything at once.\nI can do the next brave thing.','Even a small brave action helps me grow stronger than the worry.'], prompt:'My brave step today is:', choices:['Raise my hand once','Answer with one short sentence','Stay in the moment for 10 more seconds','Ask for help','Try even if I feel nervous'], customChoiceLabel:'Type my own brave step', closing:['One real step teaches me more than a hundred scared guesses.'], groundedNote:'Child anxiety treatment often uses exposure in small steps, helping children face feared situations a little at a time instead of avoiding them.' },

    { id:'mistakes-are-allowed', phase:'Taking Action', image:'assets/images/s25.webp', imageAlt:'A student making a small mistake but continuing.', sceneCaption:null, sceneStyle:'light', label:'A new rule', title:'Mistakes are allowed.', bodyType:'prose', body:['Worry tells me I must get everything right.','But that is not true.','Mistakes are part of learning.','They are not something to fear.'] },
    { id:'others-noticing-less', phase:'Taking Action', image:'assets/images/s26.webp', imageAlt:'Classmates calmly focused on their own work.', sceneCaption:null, sceneStyle:'light', label:'Something surprising', title:'People are not watching as much as I thought.', bodyType:'prose', body:['It can feel like everyone is watching.','But most people are thinking about themselves.','They are not focused on every little thing I do.','That makes trying a little easier.'] },
    { id:'feeling-after-trying', phase:'Taking Action', image:'assets/images/s27.webp', imageAlt:'A student feeling relief after trying.', sceneCaption:null, sceneStyle:'gold', label:'After the moment', title:'Trying feels different than avoiding.', bodyType:'prose', body:['Before I try, the worry feels bigger.','After I try, something shifts.','Even if it was not perfect,\nI feel a little stronger inside.'] },
    { id:'confidence-growing', phase:'Taking Action', image:'assets/images/s28.webp', imageAlt:'A student standing more confidently.', sceneCaption:null, sceneStyle:'light', label:'Growing strength', title:'I am becoming a little braver.', bodyType:'prose', body:['Bravery does not come all at once.','It grows step by step.','Each time I try,\nI build something new inside me.'] },
    { id:'worry-not-in-control', phase:'Taking Action', image:'assets/images/s29.webp', imageAlt:'A student steady despite worry.', sceneCaption:null, sceneStyle:'gold', label:'Big realization', title:'Worry is not in charge of me.', bodyType:'prose', body:['Worry can still show up.','But it does not decide what I do.','I can feel it\u2026\nand still choose my actions.'] },

    // ── NEW SCENE E2 — inserted after Scene 29 ──────────────────────────
    { id:'this-is-what-i-do-when-worry-shows-up', phase:'Taking Action', image:'assets/images/sE2.webp', imageAlt:'A student reviewing a personal step-by-step plan for handling worry.', sceneCaption:null, sceneStyle:'teal', label:'My plan', title:'This is what I do when worry shows up.', bodyType:'planSummary', body:['Now I have a plan I can use.','When worry shows up, I can say:'], planSteps:[{lead:'Notice',text:'My body is getting worried.'},{lead:'Name',text:'My worry says: [saved worry thought]'},{lead:'Slow',text:'I can take one slow breath.'},{lead:'Choose',text:'My brave thought is: [saved brave thought]'},{lead:'Step',text:'My brave step is: [saved brave step]'}], closing:['I do not have to do it perfectly.\nI only have to remember the steps and begin.','This is how worry starts to get smaller.\nNot because I never feel it again, but because I know what to do when it comes.'], groundedNote:'This combines CBT coping skills with gradual action: notice the anxious pattern, respond with a steadier thought, and take a manageable step instead of avoiding.' },

    // ── PHASE: Resolution ────────────────────────────────────────────────
    { id:'i-can-handle-this', phase:'Resolution', image:'assets/images/s30.webp', imageAlt:'A student calm and steady.', sceneCaption:null, sceneStyle:'light', label:'New belief', title:'I can handle this.', bodyType:'prose', body:['I may still feel nervous sometimes.','But now I know I can do something with that feeling.','I can pause.\nI can breathe.\nI can keep going.','That means I can handle this.'] },
    { id:'worry-comes-and-goes', phase:'Resolution', image:'assets/images/s31.webp', imageAlt:'A student noticing that worry passes.', sceneCaption:null, sceneStyle:'light', label:'A calming truth', title:'Worry comes and goes.', bodyType:'prose', body:['The feeling can rise strongly.','But it does not stay forever.','It changes.\nIt moves.\nIt passes.','That helps me remember I do not have to be afraid of every feeling.'] },
    { id:'i-am-still-me', phase:'Resolution', image:'assets/images/s32.webp', imageAlt:'A student grounded and steady in identity.', sceneCaption:null, sceneStyle:'gold', label:'Who I am', title:'I am still me.', bodyType:'prose', body:['Worry can feel loud.','But it does not get to decide who I am.','I am still me.\nStill learning.\nStill growing.','A feeling does not define my whole story.'] },
    { id:'i-can-try-again', phase:'Resolution', image:'assets/images/s33.webp', imageAlt:'A student ready to try again after a hard moment.', sceneCaption:null, sceneStyle:'light', label:'Another chance', title:'I can always try again.', bodyType:'prose', body:['Some moments will still feel hard.','Some tries will go better than others.','That does not mean I am back at the beginning.','It only means I get another chance to practice.'] },
    { id:'i-am-growing', phase:'Resolution', image:'assets/images/s34.webp', imageAlt:'A student growing in quiet confidence.', sceneCaption:null, sceneStyle:'gold', label:'What is changing', title:'I am growing stronger.', bodyType:'prose', body:['Strength does not always look big.','Sometimes it looks like one small brave choice.','Sometimes it looks like trying again.','That is how I know I am growing stronger.'] },
    { id:'others-feel-this-too', phase:'Resolution', image:'assets/images/s35.webp', imageAlt:'Students together, showing that no one is completely alone in hard feelings.', sceneCaption:null, sceneStyle:'light', label:'Connection', title:'I am not the only one.', bodyType:'prose', body:['Sometimes worry makes me feel different.','But other people have hard feelings too.','That means I am not strange.\nAnd I am not alone in this.'] },
    { id:'i-can-ask-for-help', phase:'Resolution', image:'assets/images/s36.webp', imageAlt:'A student talking to a caring adult for support.', sceneCaption:null, sceneStyle:'light', label:'Support', title:'I can ask for help.', bodyType:'prose', body:['I do not have to carry every hard feeling by myself.','I can talk to someone safe.','Asking for help is not weakness.','It is one more brave step.'] },
    { id:'i-am-learning', phase:'Resolution', image:'assets/images/s37.webp', imageAlt:'A student practicing calm responses and learning new skills.', sceneCaption:null, sceneStyle:'light', label:'Practice', title:'I am learning new ways to respond.', bodyType:'prose', body:['I am still learning.','Each time I pause,\nbreathe,\nnotice,\nand try again,\nI am practicing something important.','That practice is changing me.'] },
    { id:'i-can-be-brave', phase:'Resolution', image:'assets/images/s38.webp', imageAlt:'A student standing with quiet courage.', sceneCaption:null, sceneStyle:'gold', label:'Courage', title:'I can be brave.', bodyType:'prose', body:['Brave does not mean I never feel afraid.','Brave means I do not let fear decide everything for me.','It means I can still take one small step forward.'] },
    { id:'i-am-not-alone', phase:'Resolution', image:'assets/images/s39.webp', imageAlt:'A student feeling supported and not alone.', sceneCaption:null, sceneStyle:'gold', label:'Reassurance', title:'I am not alone.', bodyType:'prose', body:['There are people who care about me.','There are safe voices,\nhelpful words,\nand steady support around me.','I do not have to face every hard moment all by myself.'] },
    { id:'calm-can-return', phase:'Resolution', image:'assets/images/s40.webp', imageAlt:'A student calm and peaceful after worry begins to settle.', sceneCaption:null, sceneStyle:'light', label:'Peace', title:'Calm can come back.', bodyType:'prose', body:['The strong feeling can fade.','My body can settle.\nMy mind can clear.\nMy heart can feel lighter again.','Calm can come back.'] },
    { id:'i-can-face-tomorrow', phase:'Resolution', image:'assets/images/s41.webp', imageAlt:'A student looking ahead to a new day with readiness.', sceneCaption:null, sceneStyle:'light', label:'Looking ahead', title:'I can face tomorrow.', bodyType:'prose', body:['Tomorrow may still have hard moments.','But tomorrow also gives me another chance to use what I am learning.','I do not have to know everything at once to be ready.'] },

    // ── NEW SCENE F1 — inserted after Scene 41, before Scene 42 ─────────
    { id:'my-plan-for-next-time', phase:'Resolution', image:'assets/images/sF1.webp', imageAlt:'A student carrying a clear plan forward for the next time worry shows up.', sceneCaption:null, sceneStyle:'gold', label:'Next time', title:'My plan for next time.', bodyType:'nextTimePlan', body:['Overcoming worry does not mean I never feel it again.','It means I know what to do when it shows up.'], steps:['Notice it.','Name my worry thought.','Slow my body.','Choose my brave thought.','Step forward bravely.','Remember that I can try again.'], summaryLabels:{worryThought:'My worry thought',braveThought:'My brave thought',braveStep:'My brave step'}, closing:['Worry may visit again.\nBut now I have a way through it.','That means I am not starting from nothing anymore.\nI have practiced.\nI have words.\nI have steps.\nI have a plan.'], groundedNote:'Based on child anxiety treatment approaches from organizations like NIMH, APA, and Child Mind Institute.' },

    { id:'this-is-my-story', phase:'Resolution', image:'assets/images/s42.webp', imageAlt:'A student walking forward with quiet confidence and growth.', sceneCaption:null, sceneStyle:'gold', label:'Ending', title:'This is my story \u2014 and I am growing.', bodyType:'closing', body:['Worry may still come sometimes.','But now I know more about what is happening,\nand I know I can respond differently.','I am learning.\nI am growing.\nAnd I can keep moving forward.'], anchor:'One small brave step still matters.' },
    { id:'your-certificate', phase:'Resolution', image:null, imageAlt:null, sceneCaption:null, sceneStyle:'gold', label:'Certificate', title:'You Did It!', subtitle:'Certificate', bodyType:'certificate', body:[] }
  ];

  const TOTAL = SCENES.length; // 52 (51 content + certificate)

  /* ─────────────────────────────────────────────
     BENNE HART NOTES  (one per scene, index 0–50)
  ───────────────────────────────────────────── */
  const BENNE_NOTES = [
    /* 00 s01  */ 'That moment when your name is called — I know how quickly everything can change inside.',
    /* 01 s02  */ 'Your body was trying to protect you. It does that sometimes, even when you did not ask it to.',
    /* 02 s03  */ 'A blank mind in a hard moment is not a sign that something is wrong with you.',
    /* 03 s04  */ 'It can feel like everyone is watching. But that feeling is not the same as what is actually happening.',
    /* 04 s05  */ 'Wanting to escape a hard moment is something every person feels. It makes sense.',
    /* 05 s06  */ 'Feelings do not always end when the moment ends. That is something worth understanding.',
    /* 06 s07  */ 'Not having words for what is happening inside you is okay. That is part of why we are here.',
    /* 07 A1   */ 'We are not only talking about worry now. We are learning what to do with it.',
    /* 08 s08  */ 'Worry loves to talk. But remember — a voice inside your head is not the same as the truth.',
    /* 09 s09  */ 'One worried thought can invite many more. You are not doing anything wrong when that happens.',
    /* 10 s10  */ 'Worry can make small things feel enormous. That distortion is something we can work with.',
    /* 11 s11  */ 'When worry follows you into different places, it is telling you it wants attention. We can give it the right kind.',
    /* 12 B1   */ 'When you name a worry thought clearly, it becomes easier to work with.',
    /* 13 B2   */ 'A thought that feels true is not always true. That is a powerful thing to learn.',
    /* 14 s12  */ 'Staying quiet to stay safe is something a lot of children do. I understand why.',
    /* 15 s13  */ 'Worry can make you feel smaller than you are. That is one of the things I want to help you see through.',
    /* 16 s14  */ 'That painful question — "What is wrong with me?" — is not the truth. It is worry speaking.',
    /* 17 s15  */ 'Noticing that something has a name is the first step toward understanding it. You are already doing that.',
    /* 18 s16  */ 'Worry is something that happens to you. It is not who you are.',
    /* 19 C1   */ 'One slow breath is not tiny. It is training.',
    /* 20 C2   */ 'You do not need the feeling to disappear completely to know you are helping your body.',
    /* 21 s17  */ 'One slow breath is not a small thing. It tells your body that you are safe enough to breathe.',
    /* 22 s18  */ 'Your body knows how to settle. Sometimes it just needs a little help from you.',
    /* 23 s19  */ 'A thought that feels true is not always a thought that is true. That difference matters.',
    /* 24 s20  */ 'Naming a worried thought takes some of its power away. Try it and notice what happens.',
    /* 25 s21  */ 'You do not have to believe every thought that shows up. You get to choose which ones you listen to.',
    /* 26 D1   */ 'You do not have to argue with worry forever. You only need one true, steady answer.',
    /* 27 s22  */ 'One small step is not giving up on something big. It is how big things actually get done.',
    /* 28 s23  */ 'Trying while afraid is not weakness. That is exactly what courage looks like.',
    /* 29 s24  */ 'A shaky voice that still speaks is braver than silence. I want you to remember that.',
    /* 30 E1   */ 'Bravery does not need to be huge. It needs to be real.',
    /* 31 s25  */ 'Mistakes are not evidence that something is wrong with you. They are evidence that you are trying.',
    /* 32 s26  */ 'Most people are far more focused on themselves than on what you are doing. That is freeing when you really see it.',
    /* 33 s27  */ 'After a try — even an imperfect one — something inside you shifts. Pay attention to that feeling.',
    /* 34 s28  */ 'Bravery is not a character you are born with. It is something you build, one step at a time.',
    /* 35 s29  */ 'Worry can be present without being in charge. You are the one who decides what happens next.',
    /* 36 E2   */ 'This is your plan beginning to take shape.',
    /* 37 s30  */ 'You now have real tools. Pause. Breathe. Notice. That is enough to begin.',
    /* 38 s31  */ 'Feelings move. They rise, they peak, and they pass. You do not have to fix them — only let them move.',
    /* 39 s32  */ 'A feeling visited you. But it does not get to stay as your identity. You are still you.',
    /* 40 s33  */ 'A hard moment is not the end of your story. It is just one page. Turn it.',
    /* 41 s34  */ 'Strength grows quietly, in the small choices no one else sees. I see them.',
    /* 42 s35  */ 'You are not the only one who has felt this. Many children carry this quietly. You are not alone.',
    /* 43 s36  */ 'Asking for help is one of the most intelligent and courageous things a person can do.',
    /* 44 s37  */ 'Every time you pause and try again, you are building something that will stay with you.',
    /* 45 s38  */ 'You do not have to feel ready to be brave. Brave just means you go anyway.',
    /* 46 s39  */ 'There are people who care about you — and I am one of them. You are not doing this alone.',
    /* 47 s40  */ 'Calm always finds its way back. You can trust that it will come again.',
    /* 48 s41  */ 'Tomorrow is not a threat. It is another chance to use what you are learning.',
    /* 49 F1   */ 'This is how a hard moment becomes a practiced skill.',
    /* 50 s42  */ 'I am proud of you for going through this. Keep going — one small brave step at a time.',
    /* 51 cert */ 'This certificate belongs to you. You earned every word on it.'
  ];

  /* ─────────────────────────────────────────────
     STATE
  ───────────────────────────────────────────── */
  let current     = 0;
  let isAnimating = false;

  /* ─────────────────────────────────────────────
     DOM REFS — gate
  ───────────────────────────────────────────── */
  const gate          = document.getElementById('passwordGate');
  const app           = document.getElementById('app');
  const passwordInput = document.getElementById('passwordInput');
  const passwordToggle= document.getElementById('passwordToggle');
  const gateError     = document.getElementById('gateError');
  const gateSubmit    = document.getElementById('gateSubmit');

  /* ─────────────────────────────────────────────
     DOM REFS — app
  ───────────────────────────────────────────── */
  const container    = document.getElementById('screenContainer');
  const progressFill = document.getElementById('progressFill');
  const stepLabel    = document.getElementById('stepLabel');
  const btnBack      = document.getElementById('btnBack');
  const btnNext      = document.getElementById('btnNext');
  const navDots      = document.getElementById('navDots');

  /* ─────────────────────────────────────────────
     DOM REFS — menu
  ───────────────────────────────────────────── */
  const menuToggle   = document.getElementById('menuToggle');
  const sideMenu     = document.getElementById('sideMenu');
  const menuClose    = document.getElementById('menuClose');
  const menuBackdrop = document.getElementById('menuBackdrop');
  const menuPageList = document.getElementById('menuPageList');
  const jumpSelect   = document.getElementById('jumpSelect');
  const jumpBtn      = document.getElementById('jumpBtn');
  const btnRestart   = document.getElementById('btnRestart');
  const btnLogOff    = document.getElementById('btnLogOff');
  const btnExit      = document.getElementById('btnExit');
  const benneBar     = document.getElementById('benneBar');
  const benneNote    = document.getElementById('benneNote');

  /* ─────────────────────────────────────────────
     PASSWORD GATE
  ───────────────────────────────────────────── */
  function unlockApp () {
    localStorage.setItem(LS_ACCESS_KEY, '1');
    gate.style.display = 'none';
    app.classList.remove('app-hidden');
    sideMenu.classList.remove('is-open');
    sideMenu.setAttribute('aria-hidden', 'true');
    menuBackdrop.classList.remove('is-visible');
    menuToggle.setAttribute('aria-expanded', 'false');
    const saved = parseInt(localStorage.getItem(LS_PROGRESS_KEY), 10);
    const startAt = (Number.isFinite(saved) && saved >= 0 && saved < TOTAL) ? saved : -1;
    buildAllScreens();
    hydratePracticeInputs();
    wirePracticeInteractions();
    buildDots();
    buildMenu();
    btnBack.addEventListener('click', goBack);
    btnNext.addEventListener('click', goNext);
    render(startAt, 'none');
  }

  async function checkPassword () {
    const val = passwordInput.value.trim();
    if (!val) return;
    const hash = await hashInput(val);
    if (hash === PW_HASH) {
      gateError.textContent = '';
      passwordInput.classList.remove('is-error');
      unlockApp();
    } else {
      gateError.textContent = 'Incorrect access code. Please try again.';
      passwordInput.classList.add('is-error');
      passwordInput.value = '';
      setTimeout(() => passwordInput.classList.remove('is-error'), 600);
    }
  }

  passwordToggle.addEventListener('click', () => {
    const isText = passwordInput.type === 'text';
    passwordInput.type = isText ? 'password' : 'text';
    passwordToggle.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
  });

  gateSubmit.addEventListener('click', checkPassword);
  passwordInput.addEventListener('keydown', e => { if (e.key === 'Enter') checkPassword(); });

  if (localStorage.getItem(LS_ACCESS_KEY) === '1') {
    unlockApp();
  }

  /* ─────────────────────────────────────────────
     HAMBURGER MENU
  ───────────────────────────────────────────── */
  function openMenu () {
    sideMenu.classList.add('is-open');
    sideMenu.setAttribute('aria-hidden', 'false');
    menuBackdrop.classList.add('is-visible');
    menuToggle.setAttribute('aria-expanded', 'true');
    updateMenuActive();
  }

  function closeMenu () {
    sideMenu.classList.remove('is-open');
    sideMenu.setAttribute('aria-hidden', 'true');
    menuBackdrop.classList.remove('is-visible');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle.addEventListener('click', openMenu);
  menuClose.addEventListener('click', closeMenu);
  menuBackdrop.addEventListener('click', closeMenu);

  function buildMenu () {
    jumpSelect.innerHTML = '';
    SCENES.forEach((s, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `Page ${i + 1} \u2014 ${s.title.length > 34 ? s.title.slice(0, 34) + '\u2026' : s.title}`;
      jumpSelect.appendChild(opt);
    });

    jumpBtn.addEventListener('click', () => {
      const idx = parseInt(jumpSelect.value, 10);
      if (Number.isFinite(idx)) { closeMenu(); goTo(idx); }
    });

    menuPageList.innerHTML = '';
    let lastPhase = null;
    SCENES.forEach((s, i) => {
      if (s.phase !== lastPhase) {
        lastPhase = s.phase;
        const li = document.createElement('li');
        li.className = 'menu-phase-header';
        li.textContent = s.phase;
        menuPageList.appendChild(li);
      }
      const li = document.createElement('li');
      li.className = 'menu-page-item';
      li.dataset.index = i;
      li.innerHTML = `<span class="menu-page-num">${i + 1}</span><span class="menu-page-title">${s.title}</span>`;
      li.addEventListener('click', () => { closeMenu(); goTo(i); });
      menuPageList.appendChild(li);
    });
  }

  function updateMenuActive () {
    menuPageList.querySelectorAll('.menu-page-item').forEach(el => {
      el.classList.toggle('is-current', parseInt(el.dataset.index, 10) === current);
    });
    jumpSelect.value = current >= 0 ? current : 0;
    const activeEl = menuPageList.querySelector('.menu-page-item.is-current');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
  }

  btnRestart.addEventListener('click', () => {
    closeMenu();
    localStorage.removeItem(LS_PROGRESS_KEY);
    localStorage.removeItem('bfl_wsl_complete');
    goTo(-1);
  });

  btnLogOff.addEventListener('click', () => {
    closeMenu();
    localStorage.removeItem(LS_ACCESS_KEY);
    localStorage.removeItem(LS_PROGRESS_KEY);
    localStorage.removeItem('bfl_wsl_complete');
    app.classList.add('app-hidden');
    gate.style.display = '';
    passwordInput.value = '';
    gateError.textContent = '';
    passwordInput.classList.remove('is-error');
  });

  btnExit.addEventListener('click', () => {
    if (confirm('Exit and reset all progress? This cannot be undone.')) {
      closeMenu();
      localStorage.removeItem(LS_ACCESS_KEY);
      localStorage.removeItem(LS_PROGRESS_KEY);
      localStorage.removeItem('bfl_wsl_complete');
      localStorage.removeItem(LS_WORRY_THOUGHT_KEY);
      localStorage.removeItem(LS_BRAVE_THOUGHT_KEY);
      localStorage.removeItem(LS_BRAVE_STEP_KEY);
      localStorage.removeItem(LS_WORRY_RATING_KEY);
      app.classList.add('app-hidden');
      gate.style.display = '';
      passwordInput.value = '';
      gateError.textContent = '';
      passwordInput.classList.remove('is-error');
    }
  });

  /* ─────────────────────────────────────────────
     IMAGE AREA BUILDER
  ───────────────────────────────────────────── */
  function buildImageArea (scene, index) {
    const styleMap = { dark:'scene-area--dark', light:'scene-area--light', gold:'scene-area--gold', teal:'scene-area--teal' };
    const cls = styleMap[scene.sceneStyle] || 'scene-area--dark';
    const captionHTML = scene.sceneCaption ? `<div class="scene-caption">${scene.sceneCaption}</div>` : '';
    const pullHTML    = scene.pullQuote    ? `<blockquote class="counselor-pull">${scene.pullQuote.replace(/\n/g,'<br>')}</blockquote>` : '';
    return `
      <div class="scene-area ${cls}">
        ${pullHTML}
        <div class="scene-img-wrap" data-idx="${index}">
          <img src="${scene.image}" alt="${scene.imageAlt}" class="scene-image"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/>
          <div class="svg-fallback" style="display:none;">${SVG_FALLBACKS[index] || ''}</div>
        </div>
        ${captionHTML}
        ${scene.sceneStyle === 'dark' ? '<div class="scene-overlay"></div>' : ''}
      </div>`;
  }

  /* ─────────────────────────────────────────────
     BODY BUILDERS — original five
  ───────────────────────────────────────────── */
  function buildProse (paragraphs) {
    return paragraphs.map(p => `<p class="screen-body">${p.replace(/\n/g,'<br>')}</p>`).join('');
  }

  function buildMixed (scene) {
    let html = buildProse(scene.body);
    if (scene.quotes) html += `<ul class="feel-list">${scene.quotes.map(q=>`<li>${q}</li>`).join('')}</ul>`;
    if (scene.bodyAfter) html += buildProse(scene.bodyAfter);
    return html;
  }

  function buildSteps (scene) {
    let html = `<p class="screen-body">${scene.intro}</p><ol class="action-list">`;
    scene.steps.forEach(s => {
      const detail = s.detail ? `<p>${s.detail.replace(/\n/g,'<br>')}</p>` : '';
      html += `<li class="action-item"><span class="action-num">${s.num}</span><div><strong>${s.strong}</strong>${detail}</div></li>`;
    });
    html += `</ol>`;
    if (scene.bodyAfter) html += buildProse(scene.bodyAfter);
    return html;
  }

  function buildScripture (scene) {
    return `<div class="scripture-block"><p class="scripture-ref">${scene.scriptureRef}</p><p class="scripture-text">${scene.scriptureText.replace(/\n/g,'<br>')}</p><p class="scripture-translation">${scene.scriptureTranslation}</p></div>` + buildProse(scene.body);
  }

  function buildClosing (scene) {
    return buildProse(scene.body) + `<div class="anchor-phrase">${scene.anchor}</div>`;
  }

  /* ─────────────────────────────────────────────
     BODY BUILDERS — 9 new types
  ───────────────────────────────────────────── */

  // Helper: small closing text block
  function buildClosingLines (lines) {
    if (!Array.isArray(lines) || !lines.length) return '';
    return `<div class="practice-closing">${lines.map(l => `<p>${escapeHTML(l)}</p>`).join('')}</div>`;
  }

  // Helper: grounded note — shown below practice blocks on the 9 new scenes
  function buildGroundedNote (note) {
    if (!note) return '';
    return `<p class="grounded-note">${escapeHTML(note)}</p>`;
  }

  // A1 — method overview with named steps
  function buildMethodIntro (scene) {
    const stepsHTML = (scene.steps || []).map((s, i) =>
      `<div class="method-step"><span class="method-step-num">${i + 1}</span><span>${escapeHTML(s)}</span></div>`
    ).join('');
    return buildProse(scene.body) +
      `<div class="method-steps-block">${stepsHTML}</div>` +
      (scene.bodyAfter ? buildProse(scene.bodyAfter) : '') +
      buildGroundedNote(scene.groundedNote);
  }

  // B1 — choose a worry thought and save it
  function buildWorryChoice (scene) {
    const saved = getSavedWorryThought();
    const choicesHTML = (scene.choices || []).map((c) =>
      `<label class="choice-card">
        <input type="radio" name="worry-choice-${escapeHTML(scene.id)}"
          value="${escapeHTML(c)}" data-store-key="${LS_WORRY_THOUGHT_KEY}"
          ${saved === c ? 'checked' : ''} />
        <span>${escapeHTML(c)}</span>
      </label>`
    ).join('');
    return buildProse(scene.body) +
      `<div class="practice-block" data-practice="worry-choice">
        <p class="practice-prompt">${escapeHTML(scene.prompt || '')}</p>
        <div class="choice-list">${choicesHTML}</div>
        <div class="custom-choice-wrap">
          <label class="custom-choice-label" for="custom-worry-${escapeHTML(scene.id)}">${escapeHTML(scene.customChoiceLabel || 'Type my own')}</label>
          <input id="custom-worry-${escapeHTML(scene.id)}" class="practice-input" type="text"
            maxlength="140" placeholder="Type your own worry thought"
            data-custom-store="${LS_WORRY_THOUGHT_KEY}" />
        </div>
      </div>` +
      buildClosingLines(scene.followup) +
      buildGroundedNote(scene.groundedNote);
  }

  // B2 — truth check with feedback
  function buildTruthCheck (scene) {
    const choicesA = (scene.choicesA || []).map((c, i) =>
      `<label class="choice-card">
        <input type="radio" name="truth-a-${escapeHTML(scene.id)}" value="${i}" ${i === 0 ? 'checked' : ''} />
        <span>${escapeHTML(c)}</span>
      </label>`
    ).join('');
    const choicesB = (scene.choicesB || []).map((c, i) =>
      `<label class="choice-card">
        <input type="radio" name="truth-b-${escapeHTML(scene.id)}" value="${i}" ${i === 0 ? 'checked' : ''} />
        <span>${escapeHTML(c)}</span>
      </label>`
    ).join('');
    return buildProse(scene.body) +
      `<div class="practice-block" data-practice="truth-check">
        <div class="reflection-card">
          <span class="reflection-label">My worry says:</span>
          <p class="reflection-value">"${escapeHTML(getSavedWorryThought())}"</p>
        </div>
        <p class="practice-prompt">${escapeHTML(scene.promptA || '')}</p>
        <div class="choice-list choice-list--stacked" data-truth-group="a" data-correct="${scene.correctA}">${choicesA}</div>
        <p class="practice-prompt">${escapeHTML(scene.promptB || '')}</p>
        <div class="choice-list choice-list--stacked" data-truth-group="b" data-correct="${scene.correctB}">${choicesB}</div>
        <div class="truth-feedback" aria-live="polite"></div>
      </div>` +
      buildClosingLines(scene.closing) +
      buildGroundedNote(scene.groundedNote);
  }

  // C1 — guided breathing with timer
  function buildBreathing (scene) {
    return buildProse(scene.body) +
      `<div class="practice-block practice-block--breathing" data-practice="breathing"
          data-rounds="${parseInt(scene.rounds, 10) || 3}"
          data-inhale-count="${parseInt(scene.inhaleCount, 10) || 4}"
          data-exhale-count="${parseInt(scene.exhaleCount, 10) || 6}"
          data-inhale-label="${escapeHTML(scene.inhaleLabel || 'Breathe in slowly')}"
          data-exhale-label="${escapeHTML(scene.exhaleLabel || 'Breathe out gently')}">
        <div class="breathing-orb" aria-hidden="true"></div>
        <div class="breathing-panel">
          <p class="breathing-phase" data-breath-phase>${escapeHTML(scene.inhaleLabel || 'Breathe in slowly')}</p>
          <p class="breathing-count" data-breath-count>${parseInt(scene.inhaleCount, 10) || 4}</p>
          <p class="breathing-round" data-breath-round>Round 1 of ${parseInt(scene.rounds, 10) || 3}</p>
        </div>
        <button class="practice-btn" type="button" data-breath-start>Start breathing practice</button>
        <p class="practice-support">${escapeHTML(scene.supportLine || '')}</p>
      </div>` +
      buildGroundedNote(scene.groundedNote);
  }

  // C2 — body rating + multi-check
  function buildRatingCheck (scene) {
    const savedRating = getSavedWorryRating();
    const ratingsHTML = (scene.ratingLabels || []).map((lbl, i) =>
      `<label class="rating-pill">
        <input type="radio" name="rating-${escapeHTML(scene.id)}" value="${i + 1}"
          data-store-key="${LS_WORRY_RATING_KEY}"
          ${String(i + 1) === savedRating ? 'checked' : ''} />
        <span>${escapeHTML(lbl)}</span>
      </label>`
    ).join('');
    const checksHTML = (scene.checks || []).map(c =>
      `<label class="choice-card choice-card--checkbox">
        <input type="checkbox" value="${escapeHTML(c)}" />
        <span>${escapeHTML(c)}</span>
      </label>`
    ).join('');
    return buildProse(scene.body) +
      `<div class="practice-block" data-practice="rating-check">
        <p class="practice-prompt">${escapeHTML(scene.ratingPrompt || '')}</p>
        <div class="rating-row">${ratingsHTML}</div>
        <p class="practice-prompt">${escapeHTML(scene.checkPrompt || '')}</p>
        <div class="choice-list choice-list--stacked">${checksHTML}</div>
      </div>` +
      buildClosingLines(scene.closing) +
      buildGroundedNote(scene.groundedNote);
  }

  // D1 — choose a brave thought and save it
  function buildBraveThoughtChoice (scene) {
    const saved = getSavedBraveThought();
    const choicesHTML = (scene.choices || []).map(c =>
      `<label class="choice-card">
        <input type="radio" name="brave-thought-${escapeHTML(scene.id)}"
          value="${escapeHTML(c)}" data-store-key="${LS_BRAVE_THOUGHT_KEY}"
          ${saved === c ? 'checked' : ''} />
        <span>${escapeHTML(c)}</span>
      </label>`
    ).join('');
    return buildProse(scene.body) +
      `<div class="practice-block" data-practice="brave-thought-choice">
        <div class="reflection-card">
          <span class="reflection-label">My worry says:</span>
          <p class="reflection-value">"${escapeHTML(getSavedWorryThought())}"</p>
        </div>
        <p class="practice-prompt">${escapeHTML(scene.prompt || '')}</p>
        <div class="choice-list">${choicesHTML}</div>
        <div class="custom-choice-wrap">
          <label class="custom-choice-label" for="custom-brave-thought-${escapeHTML(scene.id)}">${escapeHTML(scene.customChoiceLabel || 'Type my own')}</label>
          <input id="custom-brave-thought-${escapeHTML(scene.id)}" class="practice-input" type="text"
            maxlength="140" placeholder="Type your own brave thought"
            data-custom-store="${LS_BRAVE_THOUGHT_KEY}" />
        </div>
      </div>` +
      buildClosingLines(scene.closing) +
      buildGroundedNote(scene.groundedNote);
  }

  // E1 — choose a brave step and save it
  function buildBraveStepChoice (scene) {
    const saved = getSavedBraveStep();
    const choicesHTML = (scene.choices || []).map(c =>
      `<label class="choice-card">
        <input type="radio" name="brave-step-${escapeHTML(scene.id)}"
          value="${escapeHTML(c)}" data-store-key="${LS_BRAVE_STEP_KEY}"
          ${saved === c ? 'checked' : ''} />
        <span>${escapeHTML(c)}</span>
      </label>`
    ).join('');
    return buildProse(scene.body) +
      `<div class="practice-block" data-practice="brave-step-choice">
        <p class="practice-prompt">${escapeHTML(scene.prompt || '')}</p>
        <div class="choice-list">${choicesHTML}</div>
        <div class="custom-choice-wrap">
          <label class="custom-choice-label" for="custom-brave-step-${escapeHTML(scene.id)}">${escapeHTML(scene.customChoiceLabel || 'Type my own')}</label>
          <input id="custom-brave-step-${escapeHTML(scene.id)}" class="practice-input" type="text"
            maxlength="140" placeholder="Type your own brave step"
            data-custom-store="${LS_BRAVE_STEP_KEY}" />
        </div>
      </div>` +
      buildClosingLines(scene.closing) +
      buildGroundedNote(scene.groundedNote);
  }

  // E2 — display personalized plan summary
  function buildPlanSummary (scene) {
    const planHTML = (scene.planSteps || []).map(step =>
      `<div class="plan-step">
        <strong class="plan-step-lead">${escapeHTML(step.lead)}</strong>
        <p>${replacePlanText(step.text)}</p>
      </div>`
    ).join('');
    return buildProse(scene.body) +
      `<div class="practice-block practice-block--plan">
        <div class="plan-summary">${planHTML}</div>
      </div>` +
      buildClosingLines(scene.closing) +
      buildGroundedNote(scene.groundedNote);
  }

  // F1 — next-time plan with saved choices displayed
  function buildNextTimePlan (scene) {
    const stepsHTML = (scene.steps || []).map((s, i) =>
      `<div class="action-item">
        <span class="action-num">${i + 1}</span>
        <p>${escapeHTML(s)}</p>
      </div>`
    ).join('');
    const labels = scene.summaryLabels || {};
    return buildProse(scene.body) +
      `<div class="practice-block practice-block--next-time">
        <div class="action-list">${stepsHTML}</div>
        <div class="plan-recap">
          <div class="reflection-card">
            <span class="reflection-label">${escapeHTML(labels.worryThought || 'My worry thought')}</span>
            <p class="reflection-value">${escapeHTML(getSavedWorryThought())}</p>
          </div>
          <div class="reflection-card">
            <span class="reflection-label">${escapeHTML(labels.braveThought || 'My brave thought')}</span>
            <p class="reflection-value">${escapeHTML(getSavedBraveThought())}</p>
          </div>
          <div class="reflection-card">
            <span class="reflection-label">${escapeHTML(labels.braveStep || 'My brave step')}</span>
            <p class="reflection-value">${escapeHTML(getSavedBraveStep())}</p>
          </div>
        </div>
      </div>` +
      buildClosingLines(scene.closing) +
      buildGroundedNote(scene.groundedNote);
  }

  /* ─────────────────────────────────────────────
     CERTIFICATE BUILDER  (updated with plan summary)
  ───────────────────────────────────────────── */
  function buildCertificate () {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
    return `
      <div class="cert-name-row">
        <label class="cert-name-label" for="certNameInput">Your name for the certificate:</label>
        <div class="cert-name-field-wrap">
          <input id="certNameInput" class="cert-name-input" type="text"
            placeholder="Type your name here" maxlength="40" autocomplete="off" />
        </div>
      </div>
      <div class="cert-wrap" id="certWrap">
        <div class="cert-header">
          <div class="cert-header-brand">BRAVE FEELINGS LAB</div>
          <div class="cert-header-sub">Overcome Worry &bull; Certificate of Brave Practice</div>
        </div>
        <div class="cert-body">
          <div class="cert-seal"><div class="cert-seal-inner">
            <span class="cert-seal-text">GOLD<br>SEAL</span>
          </div></div>
          <div class="cert-top">
            <div class="cert-trophy" aria-hidden="true">&#127942;</div>
            <p class="cert-title-text">Certificate of Brave Practice</p>
            <p class="cert-presented">This certificate is awarded to</p>
            <p class="cert-name" id="certDisplayName">&#8203;</p>
          </div>
          <div class="cert-mid">
            <div class="cert-divider"></div>
            <p class="cert-for">For practicing brave steps when worry shows up<br>and trying, even when it feels hard.</p>
            <p class="cert-program-name">Notice. Name. Slow. Choose. Step.</p>
            <p class="cert-quote">&ldquo;You only have to begin.&rdquo;</p>
            <div class="cert-divider"></div>
          </div>
          <div class="cert-footer">
            <div class="cert-footer-left">
              <span class="cert-date-label">Date:</span>
              <span class="cert-date-val">${dateStr}</span>
              <div class="cert-url-inline">worry.bravefeelings.com</div>
            </div>
            <div class="cert-footer-right">
              <div class="cert-sig">Benne Hart</div>
              <div class="cert-sig-rule"></div>
              <div class="cert-sig-title">Guide &amp; Mentor</div>
            </div>
          </div>
        </div>
      </div>
      <div class="cert-grounded">
        Grounded in CBT skills used by child anxiety specialists
      </div>
      <div class="cert-actions">
        <button class="completion-btn completion-btn--download" id="certDownloadBtn">
          &#128196; View &amp; Save Certificate
        </button>
        <button class="completion-btn completion-btn--secondary" id="certReviewPlanBtn">
          Review My Plan
        </button>
        <button class="completion-btn completion-btn--primary" id="certRestartBtn">
          Start Again
        </button>
      </div>`;
  }

  /* ─────────────────────────────────────────────
     CONTENT BODY ROUTER
  ───────────────────────────────────────────── */
  function buildContentBody (scene) {
    switch (scene.bodyType) {
      case 'prose':              return buildProse(scene.body);
      case 'mixed':              return buildMixed(scene);
      case 'steps':              return buildSteps(scene);
      case 'scripture':          return buildScripture(scene);
      case 'closing':            return buildClosing(scene);
      case 'certificate':        return buildCertificate();
      case 'methodIntro':        return buildMethodIntro(scene);
      case 'worryChoice':        return buildWorryChoice(scene);
      case 'truthCheck':         return buildTruthCheck(scene);
      case 'breathing':          return buildBreathing(scene);
      case 'ratingCheck':        return buildRatingCheck(scene);
      case 'braveThoughtChoice': return buildBraveThoughtChoice(scene);
      case 'braveStepChoice':    return buildBraveStepChoice(scene);
      case 'planSummary':        return buildPlanSummary(scene);
      case 'nextTimePlan':       return buildNextTimePlan(scene);
      default:                   return buildProse(scene.body);
    }
  }

  /* ─────────────────────────────────────────────
     INTRO SCREEN
  ───────────────────────────────────────────── */
  function buildIntroScreen () {
    return `
      <section class="screen screen--intro" data-screen="-1" id="screen-intro" aria-hidden="true">
        <div class="intro-card">
          <div class="intro-brand">BRAVE FEELINGS LAB</div>
          <div class="intro-avatar-wrap">
            <img src="assets/images/benne-hart-avatar.webp" alt="Benne Hart"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
            <div class="intro-avatar-fallback" style="display:none;">B</div>
          </div>
          <div class="intro-name-tag">Benne Hart &middot; Mentor</div>
          <h1 class="intro-title">Overcome Worry</h1>
          <p class="intro-body">
            A guided program to help you understand worry,
            calm your body, think more clearly, and take brave steps forward.
          </p>
          <div class="intro-speech">
            Hello. My name is Benne Hart, and I am glad you are here.<br><br>
            This program is for you. We are going to go through this together,
            one small step at a time. There is nothing you need to get right.
            You only need to keep going.
          </div>
        </div>
      </section>`;
  }

  /* ─────────────────────────────────────────────
     SCREEN RENDERER
  ───────────────────────────────────────────── */
  function buildScreen (scene, index) {
    if (scene.bodyType === 'certificate') {
      const subtitleHTML = scene.subtitle
        ? `<p class="screen-subtitle">${scene.subtitle}</p>`
        : '';
      return `
        <section class="screen screen--cert" data-screen="${index}" id="screen-${index}" aria-hidden="true">
          <div class="content-area content-area--cert">
            <p class="screen-label">${scene.label}</p>
            <h2 class="screen-title">${scene.title}</h2>
            ${subtitleHTML}
            ${buildContentBody(scene)}
          </div>
        </section>`;
    }
    const closingCls = scene.bodyType === 'closing' ? 'content-area--closing' : '';
    return `
      <section class="screen" data-screen="${index}" id="screen-${index}" aria-hidden="true">
        ${buildImageArea(scene, index)}
        <div class="content-area ${closingCls}">
          <p class="screen-label">${scene.label}</p>
          <h2 class="screen-title">${scene.title}</h2>
          ${buildContentBody(scene)}
        </div>
      </section>`;
  }

  /* ─────────────────────────────────────────────
     INIT RENDER
  ───────────────────────────────────────────── */
  function buildAllScreens () {
    container.innerHTML = buildIntroScreen() + SCENES.map(buildScreen).join('');
    const certIndex = SCENES.findIndex(s => s.bodyType === 'certificate');
    if (certIndex >= 0) wireCertButtons();
  }

  function wireCertButtons () {
    const nameInput = document.getElementById('certNameInput');
    const certName  = document.getElementById('certDisplayName');
    if (nameInput && certName) {
      nameInput.addEventListener('input', () => {
        certName.textContent = nameInput.value.trim() || '\u200B';
      });
    }

    const dlBtn = document.getElementById('certDownloadBtn');
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        const certEl = document.getElementById('certWrap');
        const name   = (nameInput && nameInput.value.trim()) || 'Graduate';

        dlBtn.textContent = 'Preparing\u2026';
        dlBtn.disabled    = true;

        const loadH2C = (cb) => {
          if (window.html2canvas) { cb(); return; }
          const existing = document.getElementById('_h2cScript');
          if (existing) { cb(); return; }
          const s   = document.createElement('script');
          s.id      = '_h2cScript';
          s.src     = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          s.onload  = cb;
          s.onerror = () => {
            dlBtn.innerHTML = '&#128196; View &amp; Save Certificate';
            dlBtn.disabled    = false;
          };
          document.head.appendChild(s);
        };

        loadH2C(() => {
          // US Letter: 8.5 × 11 inches at 96dpi = 816 × 1056px
          // Render at 3× scale → 2448 × 3168px for crisp print quality
          const LETTER_W = 816;
          const LETTER_H = 1056;
          const SCALE    = 3;

          // Build a temporary letter-size wrapper off-screen
          const wrapper       = document.createElement('div');
          wrapper.style.cssText = [
            'position:fixed',
            'left:-9999px',
            'top:0',
            `width:${LETTER_W}px`,
            `height:${LETTER_H}px`,
            'background:#F9F5EF',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'padding:48px 56px',
            'box-sizing:border-box'
          ].join(';');

          // Clone the cert card into the wrapper at full width
          const clone        = certEl.cloneNode(true);
          clone.style.cssText = 'width:100%;max-width:100%;box-shadow:none;';
          wrapper.appendChild(clone);
          document.body.appendChild(wrapper);

          html2canvas(wrapper, {
            scale:           SCALE,
            useCORS:         true,
            backgroundColor: '#F9F5EF',
            width:           LETTER_W,
            height:          LETTER_H,
            logging:         false
          }).then(canvas => {
            document.body.removeChild(wrapper);

            canvas.toBlob(blob => {
              const url      = URL.createObjectURL(blob);
              const safeName = name.replace(/\s+/g, '_');

              // Open preview popup — two buttons only: Save and Print
              const preview = window.open(
                '', '_blank',
                'width=940,height=820,scrollbars=yes,resizable=yes'
              );

              if (!preview) {
                // Popup blocked — fall back to direct download
                const a      = document.createElement('a');
                a.href       = url;
                a.download   = `Certificate-${safeName}.png`;
                a.click();
              } else {
                preview.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Certificate &mdash; ${name}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #1a1a2e;
      font-family: system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 36px 24px 48px;
      gap: 24px;
      min-height: 100vh;
    }
    .brand {
      font-size: 0.62rem;
      letter-spacing: 0.20em;
      text-transform: uppercase;
      color: #C9A84C;
      font-weight: 600;
    }
    h2 {
      color: white;
      font-size: 1.3rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    p {
      color: rgba(255,255,255,0.55);
      font-size: 0.85rem;
      text-align: center;
      line-height: 1.65;
      max-width: 540px;
    }
    .cert-preview {
      max-width: 820px;
      width: 100%;
      border-radius: 12px;
      box-shadow: 0 12px 60px rgba(0,0,0,0.60);
      border: 2px solid rgba(201,168,76,0.35);
    }
    .actions {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      justify-content: center;
    }
    a.btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 32px;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      letter-spacing: 0.03em;
      transition: opacity 0.18s;
    }
    a.btn:hover { opacity: 0.88; }
    .btn-save {
      background: #C9A84C;
      color: white;
    }
    .btn-print {
      background: rgba(255,255,255,0.10);
      color: rgba(255,255,255,0.85);
      border: 1.5px solid rgba(255,255,255,0.22);
    }
    @media print {
      body { background: white; padding: 0; gap: 0; }
      .brand, h2, p, .actions { display: none; }
      .cert-preview { max-width: 100%; border: none; box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <span class="brand">Brave Feelings Lab</span>
  <h2>Certificate Ready</h2>
  <p>Your certificate for <strong style="color:#C9A84C">${name}</strong> is ready.<br>
     Use the buttons below to save it as an image or print it.</p>
  <img class="cert-preview" src="${url}" alt="Certificate for ${name}" />
  <div class="actions">
    <a class="btn btn-save" href="${url}" download="Certificate-${safeName}.png">
      &#8659; Save Certificate
    </a>
    <a class="btn btn-print" href="javascript:window.print()">
      &#128438; Print
    </a>
  </div>
</body>
</html>`);
                preview.document.close();
              }

              dlBtn.innerHTML = '&#128196; View &amp; Save Certificate';
              dlBtn.disabled    = false;
            }, 'image/png');

          }).catch(() => {
            document.body.removeChild(wrapper);
            dlBtn.innerHTML = '&#128196; View &amp; Save Certificate';
            dlBtn.disabled    = false;
          });
        });
      });
    }

    const reviewPlanBtn = document.getElementById('certReviewPlanBtn');
    if (reviewPlanBtn) {
      reviewPlanBtn.addEventListener('click', () => {
        const targetIndex = SCENES.findIndex(s => s.id === 'my-plan-for-next-time');
        if (targetIndex >= 0) goTo(targetIndex);
      });
    }

    const restartBtn = document.getElementById('certRestartBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        localStorage.removeItem(LS_PROGRESS_KEY);
        localStorage.removeItem('bfl_wsl_complete');
        localStorage.removeItem(LS_WORRY_THOUGHT_KEY);
        localStorage.removeItem(LS_BRAVE_THOUGHT_KEY);
        localStorage.removeItem(LS_BRAVE_STEP_KEY);
        localStorage.removeItem(LS_WORRY_RATING_KEY);
        goTo(-1);
      });
    }
  }

  /* ─────────────────────────────────────────────
     PRACTICE INTERACTIONS
  ───────────────────────────────────────────── */

  // Re-render only the content area of the current screen so
  // plan summaries (E2, F1, certificate) pick up newly saved values.
  function refreshContentArea () {
    if (current < 0) return;
    const scene = SCENES[current];
    if (!scene) return;
    // Only refresh summary-type scenes (reading stored values)
    const summaryTypes = ['planSummary','nextTimePlan','truthCheck','braveThoughtChoice','braveStepChoice'];
    if (!summaryTypes.includes(scene.bodyType)) return;
    const screenEl = container.querySelector(`.screen[data-screen="${current}"]`);
    if (!screenEl) return;
    const contentArea = screenEl.querySelector('.content-area');
    if (!contentArea) return;
    const closingCls = scene.bodyType === 'closing' ? 'content-area--closing' : '';
    contentArea.className = `content-area ${closingCls}`.trim();
    contentArea.innerHTML =
      `<p class="screen-label">${scene.label}</p>` +
      `<h2 class="screen-title">${scene.title}</h2>` +
      buildContentBody(scene);
    hydratePracticeInputs();
  }

  // Set radio/checkbox states from localStorage on first paint
  function hydratePracticeInputs () {
    container.querySelectorAll(`input[data-store-key="${LS_WORRY_THOUGHT_KEY}"]`).forEach(el => {
      el.checked = el.value === getSavedWorryThought();
    });
    container.querySelectorAll(`input[data-store-key="${LS_BRAVE_THOUGHT_KEY}"]`).forEach(el => {
      el.checked = el.value === getSavedBraveThought();
    });
    container.querySelectorAll(`input[data-store-key="${LS_BRAVE_STEP_KEY}"]`).forEach(el => {
      el.checked = el.value === getSavedBraveStep();
    });
    container.querySelectorAll(`input[data-store-key="${LS_WORRY_RATING_KEY}"]`).forEach(el => {
      el.checked = el.value === getSavedWorryRating();
    });
  }

  function wirePracticeInteractions () {
    // Radio: save on change
    container.addEventListener('change', e => {
      const t = e.target;

      if (t.matches('input[type="radio"][data-store-key]')) {
        localStorage.setItem(t.dataset.storeKey, t.value);
        refreshContentArea();
      }

      // Truth check feedback
      const truthBlock = t.closest('[data-practice="truth-check"]');
      if (truthBlock) {
        const selA = truthBlock.querySelector('[data-truth-group="a"] input:checked');
        const selB = truthBlock.querySelector('[data-truth-group="b"] input:checked');
        const feedback = truthBlock.querySelector('.truth-feedback');
        if (selA && selB && feedback) {
          const cA = String(truthBlock.querySelector('[data-truth-group="a"]').dataset.correct);
          const cB = String(truthBlock.querySelector('[data-truth-group="b"]').dataset.correct);
          const ok = selA.value === cA && selB.value === cB;
          feedback.textContent = ok
            ? 'Yes. Worry can feel real without telling the full truth.'
            : 'Look again gently. What do you actually know for sure right now?';
          feedback.className = 'truth-feedback ' + (ok ? 'truth-feedback--correct' : 'truth-feedback--nudge');
        }
      }
    });

    // Text input: save on input (debounced)
    let customTimer = null;
    container.addEventListener('input', e => {
      const t = e.target;
      if (t.matches('input[data-custom-store]')) {
        clearTimeout(customTimer);
        customTimer = setTimeout(() => {
          const val = t.value.trim();
          if (val) {
            localStorage.setItem(t.dataset.customStore, val);
            refreshContentArea();
          }
        }, 400);
      }
    });

    // Breathing start button
    container.addEventListener('click', e => {
      const startBtn = e.target.closest('[data-breath-start]');
      if (!startBtn) return;
      const block = startBtn.closest('[data-practice="breathing"]');
      if (block) startBreathingPractice(block);
    });
  }

  function startBreathingPractice (block) {
    const phaseEl = block.querySelector('[data-breath-phase]');
    const countEl = block.querySelector('[data-breath-count]');
    const roundEl = block.querySelector('[data-breath-round]');
    const startBtn = block.querySelector('[data-breath-start]');
    const orb      = block.querySelector('.breathing-orb');
    if (!phaseEl || !countEl || !roundEl || !startBtn) return;

    const inhaleCount  = parseInt(block.dataset.inhaleCount, 10)  || 4;
    const exhaleCount  = parseInt(block.dataset.exhaleCount, 10)  || 6;
    const totalRounds  = parseInt(block.dataset.rounds, 10)       || 3;
    const inhaleLabel  = block.dataset.inhaleLabel || 'Breathe in slowly';
    const exhaleLabel  = block.dataset.exhaleLabel || 'Breathe out gently';

    startBtn.disabled = true;
    startBtn.textContent = 'Breathing\u2026';
    if (orb) orb.classList.add('is-inhaling');

    let round     = 1;
    let phase     = 'inhale';
    let remaining = inhaleCount;

    phaseEl.textContent = inhaleLabel;
    countEl.textContent = remaining;
    roundEl.textContent = `Round ${round} of ${totalRounds}`;

    const timer = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) { countEl.textContent = remaining; return; }

      if (phase === 'inhale') {
        phase = 'exhale';
        remaining = exhaleCount;
        phaseEl.textContent = exhaleLabel;
        countEl.textContent = remaining;
        if (orb) { orb.classList.remove('is-inhaling'); orb.classList.add('is-exhaling'); }
        return;
      }

      if (round < totalRounds) {
        round += 1;
        phase = 'inhale';
        remaining = inhaleCount;
        roundEl.textContent = `Round ${round} of ${totalRounds}`;
        phaseEl.textContent = inhaleLabel;
        countEl.textContent = remaining;
        if (orb) { orb.classList.remove('is-exhaling'); orb.classList.add('is-inhaling'); }
        return;
      }

      clearInterval(timer);
      phaseEl.textContent = 'Well done.';
      countEl.textContent = '\u2713';
      roundEl.textContent = 'You finished the breathing practice.';
      startBtn.disabled = false;
      startBtn.textContent = 'Start again';
      if (orb) { orb.classList.remove('is-inhaling','is-exhaling'); }
    }, 1000);
  }

  /* ─────────────────────────────────────────────
     NAV DOTS
  ───────────────────────────────────────────── */
  function buildDots () {
    navDots.innerHTML = '';
    const total = TOTAL + 1;
    for (let i = 0; i < total; i++) {
      const d = document.createElement('div');
      d.className = 'nav-dot';
      d.setAttribute('aria-hidden', 'true');
      navDots.appendChild(d);
    }
  }

  /* ─────────────────────────────────────────────
     STATE UPDATE
     current: -1 = intro, 0..(TOTAL-1) = scenes
  ───────────────────────────────────────────── */
  function render (index, direction) {
    current = index;
    const dotIndex = index + 1;

    const pct = index < 0 ? 0 : ((index + 1) / TOTAL) * 100;
    progressFill.style.width = pct + '%';
    stepLabel.textContent = index < 0 ? 'Intro' : `${index + 1} / ${TOTAL}`;

    const dots = navDots.querySelectorAll('.nav-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === dotIndex));

    const allScreens = container.querySelectorAll('.screen');
    allScreens.forEach(s => {
      const si = parseInt(s.dataset.screen, 10);
      s.classList.remove('active', 'exit-left');
      s.setAttribute('aria-hidden', 'true');
      if (si === index) {
        s.classList.add('active');
        s.setAttribute('aria-hidden', 'false');
      } else if (direction === 'forward' && si < index) {
        s.classList.add('exit-left');
      }
    });

    btnBack.disabled = index === -1;

    const isLast = index === TOTAL - 1;
    const svgNext = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M7 4l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    if (isLast) {
      btnNext.innerHTML = 'Done';
      btnNext.classList.add('is-last');
    } else {
      btnNext.innerHTML = `Next ${svgNext}`;
      btnNext.classList.remove('is-last');
    }

    if (index >= 0) localStorage.setItem(LS_PROGRESS_KEY, index);

    if (index < 0) {
      benneBar.classList.add('is-hidden');
    } else {
      benneBar.classList.remove('is-hidden');
      if (benneBar._noteTimer) clearTimeout(benneBar._noteTimer);
      benneNote.style.opacity = '0';
      benneNote.style.transform = 'translateY(4px)';
      benneBar._noteTimer = setTimeout(() => {
        benneNote.textContent = BENNE_NOTES[index] || '';
        benneNote.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
        benneNote.style.opacity = '1';
        benneNote.style.transform = 'translateY(0)';
      }, 80);
    }

    updateMenuActive();
  }

  /* ─────────────────────────────────────────────
     NAVIGATION
  ───────────────────────────────────────────── */
  function goTo (index) {
    if (isAnimating) return;
    isAnimating = true;
    const dir = index > current ? 'forward' : 'back';
    render(index, dir);
    setTimeout(() => { isAnimating = false; }, 420);
  }

  function goNext () {
    if (isAnimating) return;
    if (current === TOTAL - 1) { handleDone(); return; }
    goTo(current + 1);
  }

  function handleDone () {
    localStorage.setItem(LS_PROGRESS_KEY, TOTAL - 1);
    localStorage.setItem('bfl_wsl_complete', '1');
    const certIndex = SCENES.findIndex(s => s.bodyType === 'certificate');
    if (certIndex >= 0) {
      goTo(certIndex);
      setTimeout(() => {
        const inp = document.getElementById('certNameInput');
        if (inp) inp.focus();
      }, 450);
    }
  }

  function goBack () {
    if (isAnimating || current === -1) return;
    goTo(current - 1);
  }

  /* ─────────────────────────────────────────────
     KEYBOARD + SWIPE
  ───────────────────────────────────────────── */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goBack();
    if (e.key === 'Escape') closeMenu();
  });

  let tx = 0, ty = 0;
  document.addEventListener('touchstart', e => {
    tx = e.changedTouches[0].clientX;
    ty = e.changedTouches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
      if (dx < 0) goNext(); else goBack();
    }
  }, { passive: true });

})();
