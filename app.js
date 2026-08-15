const PLAYLIST_ID = "PLe3s0j_-EO8cw2cwsBwzHgJrIZg5e7IGt";
let player;
let playerReady = false;
let tracks = [];
let activeIndex = 0;
let timer;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    width: "100%",
    height: "100%",
    playerVars: {
      listType: "playlist",
      list: PLAYLIST_ID,
      playsinline: 1,
      rel: 0,
      modestbranding: 1
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onStateChange,
      onError: () => setStatus("YOUTUBE ERROR")
    }
  });
}

function onPlayerReady() {
  playerReady = true;
  document.getElementById("playerFallback").style.display = "none";
  player.setVolume(80);
  setStatus("READY");
  renderPlaylistFromPlayer();
  timer = setInterval(updateProgress, 500);
}

function renderPlaylistFromPlayer() {
  const list = player.getPlaylist() || [];
  tracks = list.map((id, i) => ({
    id,
    title: `Track ${i + 1}`,
    thumb: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
  }));
  renderTracks();
  updateActive();
}

function onStateChange(e) {
  const playBtn = document.getElementById("playBtn");
  if (e.data === YT.PlayerState.PLAYING) {
    playBtn.textContent = "⏸";
    setStatus("PLAYING");
  } else if (e.data === YT.PlayerState.PAUSED) {
    playBtn.textContent = "▶";
    setStatus("PAUSED");
  } else if (e.data === YT.PlayerState.ENDED) {
    playBtn.textContent = "▶";
    setStatus("ENDED");
  }
  updateNowPlaying();
  updateActive();
}

function setStatus(text) {
  document.getElementById("status").textContent = text;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateProgress() {
  if (!playerReady) return;
  const duration = player.getDuration() || 0;
  const current = player.getCurrentTime() || 0;
  document.getElementById("currentTime").textContent = formatTime(current);
  document.getElementById("duration").textContent = formatTime(duration);
  document.getElementById("seek").value = duration ? (current / duration) * 100 : 0;
  updateNowPlaying();
}

function updateNowPlaying() {
  if (!playerReady) return;
  const data = player.getVideoData ? player.getVideoData() : {};
  const title = data.title || "GYM MUSIC PLAYLIST";
  document.getElementById("songTitle").textContent = title;
}

function updateActive() {
  if (!playerReady) return;
  const idx = player.getPlaylistIndex ? player.getPlaylistIndex() : 0;
  activeIndex = Math.max(0, idx || 0);
  document.querySelectorAll(".track").forEach((el, i) => {
    el.classList.toggle("active", i === activeIndex);
  });
}

function renderTracks(filter = "") {
  const box = document.getElementById("playlist");
  const q = filter.toLowerCase();
  const visible = tracks.filter(t => t.title.toLowerCase().includes(q));
  if (!visible.length) {
    box.innerHTML = '<div class="loading">No matching tracks.</div>';
    return;
  }
  box.innerHTML = visible.map((t) => {
    const originalIndex = tracks.indexOf(t);
    return `<div class="track" data-index="${originalIndex}">
      <div class="track-num">${String(originalIndex + 1).padStart(2,"0")}</div>
      <img class="thumb" src="${t.thumb}" alt="">
      <div class="track-info"><div class="track-title">${escapeHtml(t.title)}</div><div class="track-meta">YouTube playlist</div></div>
      <div>▶</div>
    </div>`;
  }).join("");

  box.querySelectorAll(".track").forEach(el => {
    el.addEventListener("click", () => {
      const i = Number(el.dataset.index);
      player.playVideoAt(i);
      activeIndex = i;
      updateActive();
    });
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

document.getElementById("playBtn").addEventListener("click", () => {
  if (!playerReady) return;
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
});
document.getElementById("prevBtn").addEventListener("click", () => playerReady && player.previousVideo());
document.getElementById("nextBtn").addEventListener("click", () => playerReady && player.nextVideo());
document.getElementById("seek").addEventListener("input", e => {
  if (!playerReady) return;
  const duration = player.getDuration() || 0;
  player.seekTo(duration * Number(e.target.value) / 100, true);
});
document.getElementById("volume").addEventListener("input", e => {
  if (playerReady) player.setVolume(Number(e.target.value));
});
document.getElementById("search").addEventListener("input", e => renderTracks(e.target.value));
document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("bright-glow");
});
