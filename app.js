const PLAYLIST_ID =
  "PLe3s0j_-EO8cw2cwsBwzHgJrIZg5e7IGt";

let player = null;
let playerReady = false;
let tracks = [];


/* =========================
   YOUTUBE API
========================= */

function onYouTubeIframeAPIReady() {

  player = new YT.Player(
    "youtube-player",
    {

      width: "100%",
      height: "260",

      playerVars: {

        autoplay: 0,

        controls: 1,

        playsinline: 1,

        rel: 0,

        listType: "playlist",

        list: PLAYLIST_ID,

        origin: window.location.origin

      },

      events: {

        onReady: onPlayerReady,

        onStateChange: onPlayerStateChange,

        onError: onPlayerError

      }

    }
  );
}


/* =========================
   PLAYER READY
========================= */

function onPlayerReady() {

  playerReady = true;

  player.setVolume(80);

  setStatus("READY");

  loadPlaylist();

  updatePlayer();

}


/* =========================
   LOAD PLAYLIST
========================= */

function loadPlaylist() {

  /*
    Ask YouTube to load your playlist.
  */

  player.cuePlaylist({

    listType: "playlist",

    list: PLAYLIST_ID,

    index: 0

  });


  /*
    Wait for YouTube to return
    the playlist.
  */

  setTimeout(() => {

    const ids =
      player.getPlaylist();


    if (
      ids &&
      ids.length > 0
    ) {

      tracks =
        ids.map(
          (id, index) => ({

            id: id,

            index: index,

            title:
              "Workout Track " +
              (index + 1),

            thumbnail:
              "https://i.ytimg.com/vi/" +
              id +
              "/mqdefault.jpg"

          })
        );


      renderPlaylist();

      updateSong();

    }

    else {

      document.getElementById(
        "playlistList"
      ).innerHTML = `

        <div class="loading">

          YouTube playlist could not be loaded.

          <br><br>

          Please make sure the playlist
          is public.

        </div>

      `;

      setStatus(
        "PLAYLIST ERROR"
      );

    }

  }, 2000);

}


/* =========================
   PLAYER STATE
========================= */

function onPlayerStateChange(event) {

  const button =
    document.getElementById(
      "playBtn"
    );


  if (
    event.data ===
    YT.PlayerState.PLAYING
  ) {

    button.textContent = "⏸";

    setStatus("PLAYING");

  }


  else if (
    event.data ===
    YT.PlayerState.PAUSED
  ) {

    button.textContent = "▶";

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

    button.textContent = "▶";

    setStatus("ENDED");

  }


  updateSong();

  highlightCurrent();

}


/* =========================
   ERROR
========================= */

function onPlayerError(event) {

  console.log(
    "YouTube error:",
    event.data
  );

  setStatus(
    "YOUTUBE ERROR " +
    event.data
  );

}


/* =========================
   UPDATE SONG
========================= */

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


  highlightCurrent();

}


/* =========================
   UPDATE PLAYER
========================= */

function updatePlayer() {

  if (!playerReady) {
    return;
  }


  const current =
    player.getCurrentTime();


  const duration =
    player.getDuration();


  document.getElementById(
    "currentTime"
  ).textContent =
    formatTime(current);


  document.getElementById(
    "duration"
  ).textContent =
    formatTime(duration);


  if (
    duration > 0
  ) {

    document.getElementById(
      "seek"
    ).value =
      (
        current /
        duration
      ) * 100;

  }

}


/* =========================
   TIMER
========================= */

setInterval(
  updatePlayer,
  500
);


/* =========================
   FORMAT TIME
========================= */

function formatTime(seconds) {

  if (
    !isFinite(seconds)
  ) {

    return "0:00";

  }


  const minutes =
    Math.floor(
      seconds / 60
    );


  const secondsPart =
    Math.floor(
      seconds % 60
    )
      .toString()
      .padStart(2, "0");


  return (
    minutes +
    ":" +
    secondsPart
  );

}


/* =========================
   STATUS
========================= */

function setStatus(text) {

  const element =
    document.getElementById(
      "status"
    );


  if (element) {

    element.textContent =
      text;

  }

}


/* =========================
   PLAYLIST UI
========================= */

function renderPlaylist(
  search = ""
) {

  const container =
    document.getElementById(
      "playlistList"
    );


  if (
    tracks.length === 0
  ) {

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
    tracks.filter(
      song =>
        song.title
          .toLowerCase()
          .includes(query)
    );


  if (
    filtered.length === 0
  ) {

    container.innerHTML = `

      <div class="loading">
        No songs found.
      </div>

    `;

    return;

  }


  container.innerHTML =
    filtered
      .map(
        song => `

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

              YouTube • GYM MUSIC

            </div>

          </div>


          <div class="track-play">

            ▶

          </div>

        </div>

      `
      )
      .join("");


  document
    .querySelectorAll(
      ".track"
    )
    .forEach(
      element => {

        element.addEventListener(
          "click",
          () => {

            const index =
              Number(
                element.dataset.index
              );


            player.playVideoAt(
              index
            );

          }
        );

      }
    );


  highlightCurrent();

}


/* =========================
   HIGHLIGHT CURRENT
========================= */

function highlightCurrent() {

  if (!playerReady) {
    return;
  }


  const current =
    player.getPlaylistIndex();


  document
    .querySelectorAll(
      ".track"
    )
    .forEach(
      element => {

        const index =
          Number(
            element.dataset.index
          );


        element.classList.toggle(
          "active",
          index === current
        );

      }
    );

}


/* =========================
   PLAY / PAUSE
========================= */

document
  .getElementById(
    "playBtn"
  )
  .addEventListener(
    "click",
    () => {

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


/* =========================
   PREVIOUS
========================= */

document
  .getElementById(
    "prevBtn"
  )
  .addEventListener(
    "click",
    () => {

      if (playerReady) {

        player.previousVideo();

      }

    }
  );


/* =========================
   NEXT
========================= */

document
  .getElementById(
    "nextBtn"
  )
  .addEventListener(
    "click",
    () => {

      if (playerReady) {

        player.nextVideo();

      }

    }
  );


/* =========================
   SEEK
========================= */

document
  .getElementById(
    "seek"
  )
  .addEventListener(
    "input",
    event => {

      if (!playerReady) {
        return;
      }


      const duration =
        player.getDuration();


      player.seekTo(

        duration *
        Number(
          event.target.value
        ) /
        100,

        true

      );

    }
  );


/* =========================
   VOLUME
========================= */

document
  .getElementById(
    "volume"
  )
  .addEventListener(
    "input",
    event => {

      if (playerReady) {

        player.setVolume(
          Number(
            event.target.value
          )
        );

      }

    }
  );


/* =========================
   SEARCH
========================= */

document
  .getElementById(
    "search"
  )
  .addEventListener(
    "input",
    event => {

      renderPlaylist(
        event.target.value
      );

    }
  );


/* =========================
   HERO BUTTON
========================= */

document
  .getElementById(
    "heroPlay"
  )
  .addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "player"
        )
        .scrollIntoView({
          behavior: "smooth"
        });

    }
  );


/* =========================
   HTML ESCAPE
========================= */

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


      return entities[
        character
      ];

    }
  );

}
