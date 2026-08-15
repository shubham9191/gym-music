/* ==========================================
   GYM MUSIC
   YouTube Music / YouTube Playlist Player
   ========================================== */


/* ==========================================
   YOUR PLAYLIST ID

   Change ONLY this value when you want
   to use another playlist.
   ========================================== */

const PLAYLIST_ID =
  "ABC123";


let player = null;

let playerReady = false;

let currentVideo = 0;


/* ==========================================
   YOUTUBE IFRAME API
   ========================================== */

function onYouTubeIframeAPIReady() {

  player = new YT.Player(
    "youtube-player",
    {

      /*
       * Keep the player visible enough for
       * YouTube's embedded-player requirements.
       */

      width: "320",

      height: "220",


      playerVars: {

        autoplay: 0,

        controls: 1,

        playsinline: 1,

        rel: 0,

        modestbranding: 1,

        listType: "playlist",

        list: PLAYLIST_ID,

        origin:
          window.location.origin

      },


      events: {

        onReady:
          onPlayerReady,

        onStateChange:
          onPlayerStateChange,

        onError:
          onPlayerError

      }

    }
  );

}


/* ==========================================
   PLAYER READY
   ========================================== */

function onPlayerReady() {

  playerReady = true;


  player.setVolume(80);


  setStatus("READY");


  updateSong();


  /*
   * Load playlist
   */

  player.cuePlaylist({

    listType: "playlist",

    list: PLAYLIST_ID,

    index: 0

  });

}


/* ==========================================
   PLAYER STATE
   ========================================== */

function onPlayerStateChange(event) {


  const playButton =
    document.getElementById(
      "playBtn"
    );


  /* PLAYING */

  if (
    event.data ===
    YT.PlayerState.PLAYING
  ) {

    playButton.textContent =
      "⏸";

    setStatus(
      "PLAYING"
    );

    updateSong();

  }


  /* PAUSED */

  else if (
    event.data ===
    YT.PlayerState.PAUSED
  ) {

    playButton.textContent =
      "▶";

    setStatus(
      "PAUSED"
    );

  }


  /* BUFFERING */

  else if (
    event.data ===
    YT.PlayerState.BUFFERING
  ) {

    setStatus(
      "BUFFERING"
    );

  }


  /* ENDED */

  else if (
    event.data ===
    YT.PlayerState.ENDED
  ) {

    playButton.textContent =
      "▶";

    setStatus(
      "ENDED"
    );

  }

}


/* ==========================================
   YOUTUBE ERROR
   ========================================== */

function onPlayerError(event) {

  console.log(
    "YouTube error:",
    event.data
  );


  setStatus(
    "YOUTUBE ERROR"
  );

}


/* ==========================================
   GET SONG NAME
   ========================================== */

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

  }

}


/* ==========================================
   PLAY / PAUSE
   ========================================== */

document
  .getElementById(
    "playBtn"
  )
  .addEventListener(
    "click",
    function () {


      if (!playerReady) {

        return;

      }


      const state =
        player.getPlayerState();


      /* Pause */

      if (
        state ===
        YT.PlayerState.PLAYING
      ) {

        player.pauseVideo();

      }


      /* Play */

      else {

        player.playVideo();

      }

    }
  );


/* ==========================================
   PREVIOUS SONG
   ========================================== */

document
  .getElementById(
    "prevBtn"
  )
  .addEventListener(
    "click",
    function () {


      if (!playerReady) {

        return;

      }


      player.previousVideo();


      setTimeout(
        updateSong,
        500
      );

    }
  );


/* ==========================================
   NEXT SONG
   ========================================== */

document
  .getElementById(
    "nextBtn"
  )
  .addEventListener(
    "click",
    function () {


      if (!playerReady) {

        return;

      }


      player.nextVideo();


      setTimeout(
        updateSong,
        500
      );

    }
  );


/* ==========================================
   VOLUME
   ========================================== */

document
  .getElementById(
    "volume"
  )
  .addEventListener(
    "input",
    function () {


      if (!playerReady) {

        return;

      }


      player.setVolume(
        Number(
          this.value
        )
      );

    }
  );


/* ==========================================
   PROGRESS BAR
   ========================================== */

document
  .getElementById(
    "seek"
  )
  .addEventListener(
    "input",
    function () {


      if (!playerReady) {

        return;

      }


      const duration =
        player.getDuration();


      if (
        duration <= 0
      ) {

        return;

      }


      const position =
        duration *
        Number(
          this.value
        ) /
        100;


      player.seekTo(
        position,
        true
      );

    }
  );


/* ==========================================
   UPDATE PROGRESS
   ========================================== */

setInterval(
  function () {


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
      formatTime(
        current
      );


    document.getElementById(
      "duration"
    ).textContent =
      formatTime(
        duration
      );


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


    updateSong();


  },
  500
);


/* ==========================================
   TIME FORMAT
   ========================================== */

function formatTime(
  seconds
) {


  if (
    !isFinite(
      seconds
    )
  ) {

    return "0:00";

  }


  const minutes =
    Math.floor(
      seconds / 60
    );


  const remaining =
    Math.floor(
      seconds % 60
    )
      .toString()
      .padStart(
        2,
        "0"
      );


  return (
    minutes +
    ":" +
    remaining
  );

}


/* ==========================================
   STATUS
   ========================================== */

function setStatus(
  text
) {


  const status =
    document.getElementById(
      "status"
    );


  if (
    status
  ) {

    status.textContent =
      text;

  }

}


/* ==========================================
   HERO BUTTON
   ========================================== */

const heroButton =
  document.getElementById(
    "heroPlay"
  );


if (
  heroButton
) {

  heroButton.addEventListener(
    "click",
    function () {


      document
        .getElementById(
          "player"
        )
        .scrollIntoView({

          behavior:
            "smooth"

        });

    }
  );

}
