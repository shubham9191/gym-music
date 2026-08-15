const PLAYLIST_ID = "PLe3s0j_-EO8cw2cwsBwzHgJrIZg5e7IGt";

let player;
let playerReady = false;
let tracks = [];
let timer = null;


/* ==============================
   YOUTUBE PLAYER
   ============================== */

function onYouTubeIframeAPIReady() {

    player = new YT.Player("player", {

        width: "1",
        height: "1",

        playerVars: {
            listType: "playlist",
            list: PLAYLIST_ID,
            playsinline: 1,
            rel: 0,
            modestbranding: 1
        },

        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError
        }

    });

}


/* ==============================
   PLAYER READY
   ============================== */

function onPlayerReady() {

    playerReady = true;

    player.setVolume(80);

    setStatus("READY");

    loadPlaylist();

    timer = setInterval(updatePlayer, 500);

}


/* ==============================
   LOAD PLAYLIST
   ============================== */

function loadPlaylist() {

    setTimeout(() => {

        const playlist = player.getPlaylist();

        if (!playlist || playlist.length === 0) {

            document.getElementById("playlistList").innerHTML =
                `<div class="loading">
                    Unable to load playlist.
                    <br>
                    Please refresh the page.
                </div>`;

            return;

        }

        tracks = playlist.map((videoId, index) => {

            return {
                id: videoId,
                title: "Loading song...",
                index: index,
                thumbnail:
                    `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
            };

        });

        renderPlaylist();

        getFirstSongTitle();

    }, 1000);

}


/* ==============================
   GET CURRENT SONG
   ============================== */

function getFirstSongTitle() {

    if (!playerReady) return;

    const data = player.getVideoData();

    if (data && data.title) {

        document.getElementById("songTitle").textContent =
            data.title;

        if (tracks.length > 0) {

            tracks[0].title = data.title;

            renderPlaylist();

        }

    }

}


/* ==============================
   PLAYER STATE
   ============================== */

function onPlayerStateChange(event) {

    const playButton =
        document.getElementById("playBtn");


    if (event.data === YT.PlayerState.PLAYING) {

        playButton.textContent = "⏸";

        setStatus("PLAYING");

    }


    else if (event.data === YT.PlayerState.PAUSED) {

        playButton.textContent = "▶";

        setStatus("PAUSED");

    }


    else if (event.data === YT.PlayerState.ENDED) {

        playButton.textContent = "▶";

        setStatus("ENDED");

    }


    updateSong();

    highlightCurrentSong();

}


/* ==============================
   PLAYER ERROR
   ============================== */

function onPlayerError() {

    setStatus("YOUTUBE ERROR");

}


/* ==============================
   SONG INFORMATION
   ============================== */

function updateSong() {

    if (!playerReady) return;

    const data = player.getVideoData();

    if (!data) return;

    if (data.title) {

        document.getElementById("songTitle").textContent =
            data.title;

        const index = player.getPlaylistIndex();

        if (
            index >= 0 &&
            tracks[index]
        ) {

            tracks[index].title = data.title;

            renderPlaylist();

        }

    }

}


/* ==============================
   UPDATE PLAYER
   ============================== */

function updatePlayer() {

    if (!playerReady) return;

    const current =
        player.getCurrentTime() || 0;

    const duration =
        player.getDuration() || 0;


    document.getElementById("currentTime").textContent =
        formatTime(current);


    document.getElementById("duration").textContent =
        formatTime(duration);


    if (duration > 0) {

        document.getElementById("seek").value =
            (current / duration) * 100;

    }


    updateSong();

    highlightCurrentSong();

}


/* ==============================
   FORMAT TIME
   ============================== */

function formatTime(seconds) {

    if (!isFinite(seconds)) {

        return "0:00";

    }

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");

    return `${minutes}:${secs}`;

}


/* ==============================
   STATUS
   ============================== */

function setStatus(text) {

    const status =
        document.getElementById("status");

    if (status) {

        status.textContent = text;

    }

}


/* ==============================
   PLAYLIST UI
   ============================== */

function renderPlaylist(search = "") {

    const container =
        document.getElementById("playlistList");

    const query =
        search.toLowerCase();


    const filtered =
        tracks.filter(song =>
            song.title
                .toLowerCase()
                .includes(query)
        );


    if (filtered.length === 0) {

        container.innerHTML =
            `<div class="loading">
                No songs found.
            </div>`;

        return;

    }


    container.innerHTML =
        filtered.map(song => {

            return `

                <div
                    class="track"
                    data-index="${song.index}"
                >

                    <div class="track-number">
                        ${String(song.index + 1).padStart(2, "0")}
                    </div>


                    <img
                        class="thumb"
                        src="${song.thumbnail}"
                        alt=""
                    >


                    <div class="track-info">

                        <div class="track-title">
                            ${escapeHTML(song.title)}
                        </div>

                        <div class="track-meta">
                            GYM MUSIC • YouTube
                        </div>

                    </div>


                    <div class="track-play">
                        ▶
                    </div>

                </div>

            `;

        }).join("");


    document
        .querySelectorAll(".track")
        .forEach(track => {

            track.addEventListener(
                "click",
                () => {

                    const index =
                        Number(track.dataset.index);

                    playSong(index);

                }
            );

        });


    highlightCurrentSong();

}


/* ==============================
   PLAY SONG
   ============================== */

function playSong(index) {

    if (!playerReady) return;

    player.playVideoAt(index);

    setTimeout(() => {

        updateSong();

        highlightCurrentSong();

    }, 500);

}


/* ==============================
   HIGHLIGHT SONG
   ============================== */

function highlightCurrentSong() {

    if (!playerReady) return;

    const current =
        player.getPlaylistIndex();


    document
        .querySelectorAll(".track")
        .forEach(track => {

            const index =
                Number(track.dataset.index);

            track.classList.toggle(
                "active",
                index === current
            );

        });

}


/* ==============================
   PLAY / PAUSE
   ============================== */

document
    .getElementById("playBtn")
    .addEventListener("click", () => {

        if (!playerReady) return;


        const state =
            player.getPlayerState();


        if (
            state ===
            YT.PlayerState.PLAYING
        ) {

            player.pauseVideo();

        } else {

            player.playVideo();

        }

    });


/* ==============================
   PREVIOUS
   ============================== */

document
    .getElementById("prevBtn")
    .addEventListener("click", () => {

        if (playerReady) {

            player.previousVideo();

        }

    });


/* ==============================
   NEXT
   ============================== */

document
    .getElementById("nextBtn")
    .addEventListener("click", () => {

        if (playerReady) {

            player.nextVideo();

        }

    });


/* ==============================
   PROGRESS BAR
   ============================== */

document
    .getElementById("seek")
    .addEventListener("input", event => {

        if (!playerReady) return;

        const duration =
            player.getDuration();


        player.seekTo(
            duration *
            Number(event.target.value) /
            100,
            true
        );

    });


/* ==============================
   VOLUME
   ============================== */

document
    .getElementById("volume")
    .addEventListener("input", event => {

        if (playerReady) {

            player.setVolume(
                Number(event.target.value)
            );

        }

    });


/* ==============================
   SEARCH
   ============================== */

document
    .getElementById("search")
    .addEventListener("input", event => {

        renderPlaylist(
            event.target.value
        );

    });


/* ==============================
   HERO BUTTON
   ============================== */

document
    .getElementById("heroPlay")
    .addEventListener("click", () => {

        document
            .getElementById("player")
            .scrollIntoView({
                behavior: "smooth"
            });

    });


/* ==============================
   HTML SECURITY
   ============================== */

function escapeHTML(text) {

    return text.replace(
        /[&<>"']/g,
        character => {

            const entities = {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"

            };

            return entities[character];

        }
    );

}
