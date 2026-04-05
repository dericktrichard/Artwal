export function updateWeatherDisplay(text) {
  const el = document.getElementById('weather');
  if (el) el.textContent = text;
}

export function showDiscovery(type, content, author) {
  const panel = document.getElementById('discovery');
  const typeEl = document.getElementById('type');
  const contentEl = document.getElementById('content');
  const authorEl = document.getElementById('author');
  
  if (panel) {
    panel.classList.remove('hidden');
    panel.classList.add('visible');
  }
  if (typeEl) typeEl.textContent = type;
  if (contentEl) contentEl.innerHTML = content;
  if (authorEl) authorEl.textContent = author;
}

export function hideDiscovery() {
  const panel = document.getElementById('discovery');
  if (panel) {
    panel.classList.remove('visible');
    panel.classList.add('hidden');
  }
}

export function updateMusic(trackName) {
  const trackEl = document.getElementById('track');
  const bar = document.getElementById('track-progress-bar');
  const player = document.getElementById('music-player');
  
  if (trackEl) trackEl.textContent = '♪ ' + trackName;
  if (player) player.style.display = 'block'; // Show when playing
  if (bar) bar.style.width = '0%';
}

export function updateMusicProgress(percent) {
  const bar = document.getElementById('track-progress-bar');
  if (bar) bar.style.width = percent + '%';
}

export function resetMusic() {
  const trackEl = document.getElementById('track');
  const bar = document.getElementById('track-progress-bar');
  const player = document.getElementById('music-player');
  
  if (trackEl) trackEl.textContent = '♪ No Track';
  if (bar) bar.style.width = '0%';
  if (player) player.style.display = 'none'; // HIDE when no track
}

export function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.opacity = '0';
    setTimeout(() => loading.remove(), 500);
  }
}