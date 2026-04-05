class AudioManager {
  constructor() {
    this.ctx = null;
    this.oscillators = [];
    this.masterGain = null;
    this.isPlaying = false;
    this.currentTrack = null;
    this.initialized = false;
    
    this.createUI();
    this.setupClickHandler();
  }
  
  createUI() {
    const existing = document.getElementById('audio-indicator');
    if (existing) existing.remove();
    
    const indicator = document.createElement('div');
    indicator.id = 'audio-indicator';
    indicator.style.cssText = `
      position: absolute;
      bottom: 100px;
      right: 30px;
      background: rgba(0,0,0,0.9);
      border: 1px solid #e8c547;
      padding: 12px 16px;
      border-radius: 4px;
      color: #e8c547;
      font-size: 12px;
      display: none;
      align-items: center;
      gap: 10px;
      z-index: 100;
      font-family: 'Courier New', monospace;
    `;
    indicator.innerHTML = `
      <span id="audio-icon">♪</span>
      <div>
        <div id="audio-track" style="font-weight: bold;">No Track</div>
        <div id="audio-status" style="font-size: 10px; opacity: 0.7;">Click anywhere to enable</div>
      </div>
    `;
    document.body.appendChild(indicator);
  }
  
  setupClickHandler() {
    document.body.addEventListener('click', async () => {
      if (this.initialized) return;
      
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.05;
        this.masterGain.connect(this.ctx.destination);
        
        await this.ctx.resume();
        this.initialized = true;
        
        const status = document.getElementById('audio-status');
        if (status) status.textContent = 'Audio ready - find a disc!';
        
        if (this.pendingTrack) {
          this.play(this.pendingTrack);
          this.pendingTrack = null;
        }
      } catch (e) {
        console.error('Audio init failed:', e);
      }
    }, { once: true });
  }
  
  play(trackName) {
    console.log('Playing:', trackName, 'Init:', this.initialized);
    
    if (!this.initialized) {
      this.pendingTrack = trackName;
      this.showTrack(trackName, 'Click screen first, then try again');
      return;
    }
    
    // Stop previous
    this.stop();
    
    this.currentTrack = trackName;
    this.isPlaying = true;
    
    // Frequencies (Hz)
    const chords = {
      'Midnight Jazz': [220.00, 261.63, 329.63, 392.00],
      'Rainy Lofi':    [196.00, 233.08, 293.66, 349.23],
      'Urban Echoes':  [174.61, 207.65, 261.63, 311.13],
      'Street Symphony': [261.63, 329.63, 392.00, 493.88]
    };
    
    const freqs = chords[trackName] || chords['Midnight Jazz'];
    
    // Create and connect oscillators - SIMPLIFIED
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      // Louder individual notes
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      
      // Connect: osc -> gain -> master -> destination
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      this.oscillators.push(osc);
    });
    
    this.showTrack(trackName, 'Playing');
    this.animateIcon();
    console.log('Now playing:', trackName, 'Oscillators:', this.oscillators.length);
  }
  
  stop() {
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.oscillators = [];
    this.isPlaying = false;
    this.hideUI();
  }
  
  showTrack(name, status) {
    const indicator = document.getElementById('audio-indicator');
    const trackEl = document.getElementById('audio-track');
    const statusEl = document.getElementById('audio-status');
    
    if (indicator) indicator.style.display = 'flex';
    if (trackEl) trackEl.textContent = name;
    if (statusEl) statusEl.textContent = status;
  }
  
  hideUI() {
    const indicator = document.getElementById('audio-indicator');
    if (indicator) indicator.style.display = 'none';
  }
  
  animateIcon() {
    const icon = document.getElementById('audio-icon');
    if (!icon) return;
    
    let frame = 0;
    const frames = ['♪', '♫', '♬', '♭'];
    
    const interval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(interval);
        return;
      }
      icon.textContent = frames[frame % frames.length];
      frame++;
    }, 300);
  }
}

export const audioManager = new AudioManager();