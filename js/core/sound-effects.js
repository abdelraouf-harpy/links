// ══════════════════════════════════════════════════════════════════
// HarpyOrder — Pure Web Audio Synthesizer Engine
// Decoupled Core Module: Zero MP3 dependencies, instant vibration & synthesized tones
// ══════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const SoundFX = {
    ctx: null,

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
    },

    _canPlaySound() {
      if (typeof window !== 'undefined' && window.Store && typeof window.Store.getSoundEnabled === 'function') {
        return window.Store.getSoundEnabled();
      }
      return true;
    },

    _ensureAudioContext() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    },

    // ── 1. Soft Pop Sound (Item added, category tab switched, button click) ──
    playPop() {
      if (!this._canPlaySound()) return;
      try {
        const ctx = this._ensureAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);

        if (navigator.vibrate) navigator.vibrate(20);
      } catch (e) {}
    },

    // ── 2. Melodic Chime Sound (Toasts, alert dialogs, success feedback) ──
    playChime() {
      if (!this._canPlaySound()) return;
      try {
        const ctx = this._ensureAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + (idx * 0.05));
          
          gain.gain.setValueAtTime(0.12, now + (idx * 0.05));
          gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.05) + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + (idx * 0.05));
          osc.stop(now + (idx * 0.05) + 0.26);
        });

        if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
      } catch (e) {}
    },

    // ── 3. Cash Register Bell Sound (Order placed, payment received) ──
    playCash() {
      if (!this._canPlaySound()) return;
      try {
        const ctx = this._ensureAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        [880, 1318.51, 1760].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + (idx * 0.07));
          
          gain.gain.setValueAtTime(0.18, now + (idx * 0.07));
          gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.07) + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + (idx * 0.07));
          osc.stop(now + (idx * 0.07) + 0.36);
        });

        if (navigator.vibrate) navigator.vibrate([30, 40, 50]);
      } catch (e) {}
    },

    // ── 4. Resonant Kitchen Bell (Incoming order alert for kitchen staff) ──
    _synthesizeBell(ctx, delaySec = 0) {
      try {
        const now = ctx.currentTime + delaySec;
        
        // Note 1: High crisp bell (880 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        gain1.gain.setValueAtTime(0.35, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.66);

        // Note 2: Lower resonant ringing bell (1174.66 Hz)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1174.66, now + 0.15);
        gain2.gain.setValueAtTime(0.4, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.96);
      } catch (e) {}
    },

    playKitchenChime() {
      try {
        const ctx = this._ensureAudioContext();
        if (!ctx) return;

        const triggerSound = () => {
          this._synthesizeBell(ctx, 0);
          // Second resonant chime for high audibility
          this._synthesizeBell(ctx, 1.1);

          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 400]);
          }
        };

        if (ctx.state === 'suspended') {
          ctx.resume().then(() => triggerSound()).catch(() => triggerSound());
        } else {
          triggerSound();
        }
      } catch (e) {}
    }
  };

  // Expose global backward compatibility hooks
  if (typeof window !== 'undefined') {
    window.SoundFX = SoundFX;
    window.playKitchenOrderChime = function() {
      SoundFX.playKitchenChime();
    };

    // Auto-unlock Web Audio on ANY user interaction (touch/click/keypress/pointer/focus)
    const unlockAudio = () => {
      try {
        SoundFX._ensureAudioContext();
      } catch(e) {}
    };
    ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown', 'focus'].forEach(evt => {
      window.addEventListener(evt, unlockAudio, { passive: true });
    });

    // Auto-resume whenever screen/tab becomes visible or wakes up
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        unlockAudio();
      }
    });

    // PWA & Standalone auto-init
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      unlockAudio();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundFX;
  }
})();
