const contact = window.PORTFOLIO_CONTACT || {};
const links = document.getElementById('contact-links');
function addLink(label, url) {
  const a = document.createElement('a');
  a.textContent = label; a.href = url;
  if (url.startsWith('https:')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
  links.append(a);
}
if (contact.discordUsername) {
  if (/^\d+$/.test(contact.discordUserId)) addLink(`Discord: ${contact.discordUsername}`, `https://discord.com/users/${contact.discordUserId}`);
  else { const text = document.createElement('span'); text.textContent = `Discord: ${contact.discordUsername}`; links.append(text); }
}
if (/^\d+$/.test(contact.robloxUserId)) addLink('Roblox', `https://www.roblox.com/users/${contact.robloxUserId}/profile`);
if (/^[a-zA-Z0-9-]+$/.test(contact.githubUsername)) addLink('GitHub', `https://github.com/${contact.githubUsername}`);
if (contact.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) addLink('Email', `mailto:${contact.email}`);
const icons = {
  play: '<path d="m8 5 11 7-11 7Z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  sound: '<path d="M11 5 6 9H3v6h3l5 4ZM15 8c3 2 3 6 0 8M18 5c5 4 5 10 0 14"/>',
  muted: '<path d="M11 5 6 9H3v6h3l5 4ZM16 9l6 6m0-6-6 6"/>',
  full: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
const formatTime = value => { const s = Math.floor(Number.isFinite(value) ? value : 0); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
document.querySelectorAll('video').forEach((video, index) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'player';
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', video.getAttribute('aria-label') || `Video ${index + 1}`);
  video.before(wrapper);
  wrapper.innerHTML = `<div class="player-stage"><button class="big-play" aria-label="Play video">${icon('play')}</button></div><div class="player-controls"><input class="seek" type="range" min="0" max="100" step="0.1" value="0" aria-label="Seek video" disabled><button class="toggle" aria-label="Play">${icon('play')}</button><time>0:00 / 0:00</time><button class="mute" aria-label="Mute">${icon('sound')}</button><input class="volume" type="range" min="0" max="1" step="0.05" value="1" aria-label="Volume"><button class="fullscreen" aria-label="Enter fullscreen">${icon('full')}</button></div><p class="player-message" role="status" hidden></p>`;
  const $ = selector => wrapper.querySelector(selector);
  $('.player-stage').prepend(video);
  const seek = $('.seek'), toggle = $('.toggle'), overlay = $('.big-play'), mute = $('.mute'), volume = $('.volume'), full = $('.fullscreen'), message = $('.player-message');
  function report(text) { message.textContent = text; message.hidden = !text; }
  async function playPause() {
    if (!video.paused) { video.pause(); return; }
    report('');
    try { await video.play(); } catch (error) { if (error.name !== 'AbortError') report('Unable to play this clip. Try again or open the video directly.'); }
  }
  function syncPlay() { const paused = video.paused; toggle.innerHTML = icon(paused ? 'play' : 'pause'); toggle.setAttribute('aria-label', paused ? 'Play' : 'Pause'); overlay.hidden = !paused; }
  function syncTime() {
    const ready = Number.isFinite(video.duration) && video.duration > 0;
    seek.disabled = !ready; seek.max = ready ? video.duration : 100; seek.value = video.currentTime || 0;
    seek.setAttribute('aria-valuetext', `${formatTime(video.currentTime)} of ${formatTime(video.duration)}`);
    $('time').textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
  }
  toggle.addEventListener('click', playPause); overlay.addEventListener('click', playPause); video.addEventListener('click', playPause);
  video.addEventListener('play', () => { document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); }); syncPlay(); });
  ['pause', 'ended'].forEach(event => video.addEventListener(event, syncPlay));
  ['loadedmetadata', 'durationchange', 'timeupdate', 'emptied'].forEach(event => video.addEventListener(event, syncTime));
  seek.addEventListener('input', () => { if (Number.isFinite(video.duration)) { video.currentTime = Number(seek.value); syncTime(); } });
  mute.addEventListener('click', () => { video.muted = !video.muted; if (!video.muted && video.volume === 0) video.volume = 1; });
  volume.addEventListener('input', () => { video.volume = Number(volume.value); video.muted = video.volume === 0; });
  video.addEventListener('volumechange', () => { const quiet = video.muted || video.volume === 0; mute.innerHTML = icon(quiet ? 'muted' : 'sound'); mute.setAttribute('aria-label', quiet ? 'Unmute' : 'Mute'); volume.value = quiet ? 0 : video.volume; });
  if (!wrapper.requestFullscreen && !video.webkitEnterFullscreen) full.hidden = true;
  full.addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else if (wrapper.requestFullscreen) await wrapper.requestFullscreen(); else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen(); } catch { report('Fullscreen is unavailable in this browser.'); }
  });
  document.addEventListener('fullscreenchange', () => full.setAttribute('aria-label', document.fullscreenElement === wrapper ? 'Exit fullscreen' : 'Enter fullscreen'));
  video.addEventListener('error', () => { report('This clip could not be loaded.'); video.controls = true; });
  // Native controls remain available if JavaScript is disabled or setup fails.
  video.controls = false;
  syncPlay(); syncTime();
});
