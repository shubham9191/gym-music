const PLAYLIST_ID = "PLe3s0j_-EO8cw2cwsBwzHgJrIZg5e7IGt";

let player = null;
let playerReady = false;
let tracks = [];
let playlistTimer = null;


/* =========================================
   YOUTUBE API
========================================= */

function onYouTubeIframeAPIReady() {

    player = new YT.Player("player", {

        width: "1",
        height: "1",

        playerVars: {
            autoplay: 0,
            controls: 0,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            listType: "playlist",
            list: PLAYLIST_ID,
            origin: window.location.origin
        },

        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError
        }

    });
}


/* =========================================
   PLAYER READY
========================================= */

function onPlayerReady() {

    playerReady = true;

    player.setVolume(80);

    setStatus("LOADING");

    /*
      Explicitly load the playlist.
      This is the important fix.
    */

    player.cuePlaylist({
        listType: "playlist",
        list: PLAYLIST_ID
    });

    /*
      Give YouTube time to load the playlist.
    */

    waitForPlaylist();

}


/* =========================================
   WAIT FOR PLAYLIST
========================================= */

function waitForPlaylist() {

    let attempts = 0;

    playlistTimer = setInterval(() => {

        attempts++;

        if (!playerReady) {
            return;
        }

        const playlist = player.getPlaylist();

        console.log(
            "YouTube playlist:",
            playlist
        );


        if (
            playlist &&
            playlist.length > 0
        ) {

            clearInterval(playlistTimer);

            buildPlaylist(playlist);

            setStatus("READY");

            updateSong();

            return;

        }


        /*
          Try loading the playlist again
          if YouTube hasn't returned it.
        */

        if (attempts === 5) {

            player.cuePlaylist({
                listType: "playlist",
                list: PLAYLIST_ID
            });

        }


        /*
          Stop after 20 attempts.
        */

        if (attempts >= 20) {

            clearInterval(playlistTimer);

            setStatus("PLAYLIST ERROR");

            document.getElementById(
                "playlistList"
            ).innerHTML = `

                <div class="loading">

                    Unable to load the YouTube playlist.

                    <br><br>

                    Please check that the playlist
                    is Public and allows embedding.

                </div>

            `;

        }

    }, 1000);

}


/* =========================================
   BUILD PLAYLIST
========================================= */

function buildPlaylist(videoIds) {

    tracks = videoIds.map((videoId, index) => {

        return {

            id: videoId,

            index: index,

            title: "Loading song...",

            thumbnail:
                "https://i.ytimg.com/vi/" +
                videoId +
                "/mqdefault.jpg"

        };

    });


    renderPlaylist();


    /*
      Get titles from YouTube.
    */

    loadTitles();

}


/* =========================================
   GET TITLES
========================================= */

function loadTitles() {

    if (!playerReady) {
        return;
    }


    const currentIndex =
        player.getPlaylistIndex();


    /*
      Move through playlist items so
      YouTube gives us their metadata.
    */

    if (
        currentIndex >= 0 &&
        tracks[currentIndex]
    ) {

        const data =
            player.getVideoData();


        if (
            data &&
            data.title
        ) {

            tracks[currentIndex].title =
                data.title;

            renderPlaylist();

        }

    }

}


/* =========================================
   PLAYER STATE
========================================= */

function onPlayerStateChange(event) {

    const playButton =
        document.getElementById("playBtn");


    if (
        event.data ===
        YT.PlayerState.PLAYING
    ) {

        playButton.textContent = "⏸";

        setStatus("PLAYING");

    }


    else if (
        event.data ===
        YT.PlayerState.PAUSED
    ) {

        playButton.textContent = "▶";

        setStatus("PAUSED");

    }


    else if (
        event.data ===
        YT.PlayerState.BUFFERING
    ) {

        setStatus("BUFFERING");

    }


    else if (
        event.data ===
        YT.PlayerState.ENDED
    ) {

        playButton.textContent = "▶";

        setStatus("ENDED");

    }


    updateSong();

    highlightCurrentSong();

}


/* =========================================
   ERROR
========================================= */

function onPlayerError(event) {

    console.log(
        "YouTube error:",
        event.data
    );

    setStatus("YOUTUBE ERROR");

}


/* =========================================
   CURRENT SONG
========================================= */

function updateSong() {

    if (!playerReady) {
        return;
    }


    const data =
        player.getVideoData();


    if (
        data &&
        data.title
    ) {

        document.getElementById(
            "songTitle"
        ).textContent =
            data.title;


        const index =
            player.getPlaylistIndex();


        if (
            tracks[index]
        ) {

            tracks[index].title =
                data.title;

            renderPlaylist();

        }

    }


    highlightCurrentSong();

}


/* =========================================
   UPDATE PROGRESS
========================================= */

function updatePlayer() {

    if (!playerReady) {
        return;
    }


    const current =
        player.getCurrentTime() || 0;


    const duration =
        player.getDuration() || 0;


    document.getElementById(
        "currentTime"
    ).textContent =
        formatTime(current);


    document.getElementById(
        "duration"
    ).textContent =
        formatTime(duration);


    if (duration > 0) {

        document.getElementById(
            "seek"
        ).value =
            (current / duration) * 100;

    }


    updateSong();

}


/* =========================================
   TIMER
========================================= */

setInterval(
    updatePlayer,
    500
);


/* =========================================
   TIME FORMAT
========================================= */

function formatTime(seconds) {

    if (
        !isFinite(seconds)
    ) {

        return "0:00";

    }


    const minutes =
        Math.floor(seconds / 60);


    const secs =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");


    return minutes + ":" + secs;

}


/* =========================================
   STATUS
========================================= */

function setStatus(text) {

    const element =
        document.getElementById("status");


    if (element) {

        element.textContent =
            text;

    }

}


/* =========================================
   PLAYLIST UI
========================================= */

function renderPlaylist(
    search = ""
) {

    const container =
        document.getElementById(
            "playlistList"
        );


    if (!tracks.length) {

        container.innerHTML = `
            <div class="loading">
                Loading playlist...
            </div>
        `;

        return;

    }


    const query =
        search.toLowerCase();


    const filtered =
        tracks.filter(song =>

            song.title
                .toLowerCase()
                .includes(query)

        );


    if (!filtered.length) {

        container.innerHTML = `
            <div class="loading">
                No songs found.
            </div>
        `;

        return;

    }


    container.innerHTML =
        filtered.map(song => `

            <div
                class="track"
                data-index="${song.index}"
            >

                <div class="track-number">

                    ${String(
                        song.index + 1
                    ).padStart(2, "0")}

                </div>


                <img
                    class="thumb"
                    src="${song.thumbnail}"
                    alt=""
                >


                <div class="track-info">

                    <div class="track-title">

                        ${escapeHTML(
                            song.title
                        )}

                    </div>


                    <div class="track-meta">

                        GYM MUSIC • YouTube

                    </div>

                </div>


                <div class="track-play">
                    ▶
                </div>

            </div>

        `).join("");


    document
        .querySelectorAll(".track")
        .forEach(track => {

            track.addEventListener(
                "click",
                function() {

                    const index =
                        Number(
                            this.dataset.index
                        );


                    playSong(index);

                }
            );

        });


    highlightCurrentSong();

}


/* =========================================
   PLAY SONG
========================================= */

function playSong(index) {

    if (!playerReady) {
        return;
    }


    player.playVideoAt(index);


    setTimeout(() => {

        updateSong();

        highlightCurrentSong();

    }, 700);

}


/* =========================================
   HIGHLIGHT
========================================= */

function highlightCurrentSong() {

    if (!playerReady) {
        return;
    }


    const current =
        player.getPlaylistIndex();


    document
        .querySelectorAll(".track")
        .forEach(track => {

            const index =
                Number(
                    track.dataset.index
                );


            track.classList.toggle(
                "active",
                index === current
            );

        });

}


/* =========================================
   PLAY / PAUSE
========================================= */

document
    .getElementById("playBtn")
    .addEventListener(
        "click",
        function() {

            if (!playerReady) {
                return;
            }


            const state =
                player.getPlayerState();


            if (
                state ===
                YT.PlayerState.PLAYING
            ) {

                player.pauseVideo();

            }

            else {

                player.playVideo();

            }

        }
    );


/* =========================================
   PREVIOUS
========================================= */

document
    .getElementById("prevBtn")
    .addEventListener(
        "click",
        function() {

            if (playerReady) {

                player.previousVideo();

            }

        }
    );


/* =========================================
   NEXT
========================================= */

document
    .getElementById("nextBtn")
    .addEventListener(
        "click",
        function() {

            if (playerReady) {

                player.nextVideo();

            }

        }
    );


/* =========================================
   SEEK
========================================= */

document
    .getElementById("seek")
    .addEventListener(
        "input",
        function() {

            if (!playerReady) {
                return;
            }


            const duration =
                player.getDuration();


            player.seekTo(
                duration *
                Number(this.value) /
                100,
                true
            );

        }
    );


/* =========================================
   VOLUME
========================================= */

document
    .getElementById("volume")
    .addEventListener(
        "input",
        function() {

            if (playerReady) {

                player.setVolume(
                    Number(this.value)
                );

            }

        }
    );


/* =========================================
   SEARCH
========================================= */

document
    .getElementById("search")
    .addEventListener(
        "input",
        function() {

            renderPlaylist(
                this.value
            );

        }
    );


/* =========================================
   HERO BUTTON
========================================= */

document
    .getElementById("heroPlay")
    .addEventListener(
        "click",
        function() {

            document
                .getElementById("player")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHTML(text) {

    return text.replace(
        /[&<>"']/g,
        function(character) {

            const entities = {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"

            };


            return entities[
                character
            ];

        }
    );

}
