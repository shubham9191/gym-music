const PLAYLIST_ID="PLe3s0j_-EO8cw2cwsBwzHgJrIZg5e7IGt";
let player, ready=false, tracks=[], timer;

function onYouTubeIframeAPIReady(){
  player=new YT.Player("player",{
    width:"1",height:"1",
    playerVars:{listType:"playlist",list:PLAYLIST_ID,playsinline:1,rel:0,modestbranding:1},
    events:{onReady:onReady,onStateChange:onStateChange,onError:()=>status("YOUTUBE ERROR")}
  });
}
function onReady(){
  ready=true;
  document.getElementById("fallback").classList.add("hidden");
  player.setVolume(80);
  status("READY");
  setTimeout(loadTracks,900);
  timer=setInterval(update,500);
}
function loadTracks(){
  const ids=player.getPlaylist()||[];
  tracks=ids.map((id,i)=>({id,title:`Track ${i+1}`,thumb:`https://i.ytimg.com/vi/${id}/mqdefault.jpg`}));
  render();
}
function onStateChange(e){
  const b=document.getElementById("playBtn");
  if(e.data===YT.PlayerState.PLAYING){b.textContent="⏸";status("PLAYING")}
  else if(e.data===YT.PlayerState.PAUSED){b.textContent="▶";status("PAUSED")}
  else if(e.data===YT.PlayerState.ENDED){b.textContent="▶";status("ENDED")}
  updateTitle();active();
}
function status(t){document.getElementById("status").textContent=t}
function fmt(s){if(!isFinite(s))return"0:00";return Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0")}
function update(){
  if(!ready)return;
  const d=player.getDuration()||0,c=player.getCurrentTime()||0;
  document.getElementById("currentTime").textContent=fmt(c);
  document.getElementById("duration").textContent=fmt(d);
  document.getElementById("seek").value=d?c/d*100:0;
  updateTitle();
}
function updateTitle(){
  if(!ready)return;
  const data=player.getVideoData?player.getVideoData():{};
  document.getElementById("songTitle").textContent=data.title||"GYM MUSIC PLAYLIST";
}
function active(){
  if(!ready)return;
  const i=player.getPlaylistIndex?player.getPlaylistIndex():0;
  document.querySelectorAll(".track").forEach((el)=>el.classList.toggle("active",Number(el.dataset.index)===i));
}
function render(filter=""){
  const q=filter.toLowerCase(), box=document.getElementById("playlistList");
  const list=tracks.map((t,i)=>({...t,i})).filter(t=>t.title.toLowerCase().includes(q));
  if(!list.length){box.innerHTML='<div class="loading">No matching songs.</div>';return}
  box.innerHTML=list.map(t=>`<div class="track" data-index="${t.i}">
    <div class="track-number">${String(t.i+1).padStart(2,"0")}</div>
    <img class="thumb" src="${t.thumb}" alt="">
    <div class="track-info"><div class="track-title">${esc(t.title)}</div><div class="track-meta">YouTube • GYM MUSIC</div></div>
    <div class="track-play">▶</div>
  </div>`).join("");
  box.querySelectorAll(".track").forEach(el=>el.onclick=()=>{player.playVideoAt(Number(el.dataset.index));active()});
}
function esc(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

document.getElementById("playBtn").onclick=()=>{
  if(!ready)return;
  player.getPlayerState()===YT.PlayerState.PLAYING?player.pauseVideo():player.playVideo();
};
document.getElementById("prevBtn").onclick=()=>ready&&player.previousVideo();
document.getElementById("nextBtn").onclick=()=>ready&&player.nextVideo();
document.getElementById("seek").oninput=e=>{if(ready)player.seekTo((player.getDuration()||0)*e.target.value/100,true)};
document.getElementById("volume").oninput=e=>{if(ready)player.setVolume(Number(e.target.value))};
document.getElementById("search").oninput=e=>render(e.target.value);
document.getElementById("heroPlay").onclick=()=>document.getElementById("player").scrollIntoView({behavior:"smooth"});
document.getElementById("miniToggle").onclick=()=>{
  const el=document.getElementById("miniPlayer"),b=document.getElementById("miniToggle");
  el.classList.toggle("hidden"); b.textContent=el.classList.contains("hidden")?"Show Video":"Hide Video";
};
