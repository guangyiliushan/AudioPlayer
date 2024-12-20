var songList = localStorage.getItem("songList") ? JSON.parse(localStorage.getItem("songList")) : [];
var currentSong = localStorage.getItem("currentSong") ? JSON.parse(localStorage.getItem("currentSong")) : {};
var playTime = localStorage.getItem("playTime") ? JSON.parse(localStorage.getItem("playTime")) : 0;
var currentIndex = 0;
var currentDuration = 100;

function initPlayer() {
    showCurrentSong();
    setupControls();
}

function initSongTime(time = 0) {
    $("#slider-time-current").text(formatTime(time));
    $("#slider-time-total").text(formatTime(currentDuration));
}

function showCurrentSong() {
    initSongTime(time);
    updateSongInfo(title, artist);
}

function openSong(fileUrl, time) {
    const audio = new Audio(fileUrl);
    audio.currentTime = time;
    $("#audio-box").empty().append(audio).css("display", "none");
    audio.addEventListener("timeupdate", () => {
        $("#slider-time-current").text(formatTime(audio.currentTime));
        $("#slider-bar").val((audio.currentTime / currentDuration) * 100);
    });
    audio.addEventListener("ended", () => {
        getNextSong();
        showCurrentSong();
        audio.play();
    });
}

function openPic(fileUrl) {
    const styles = {
        backgroundImage: `url("${fileUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
    };
    $("body").css({ ...styles, backgroundAttachment: "fixed", zIndex: "0" });
    $("#disc-cover").css(styles);
}

function checkOverflowAndScroll(element) {
    if (element.scrollWidth > element.clientWidth) {
        $(element).css({
            'animation': 'scroll 10s linear infinite'
        });
    } else {
        $(element).css({
            'animation': 'none'
        });
    }
}

function updateSongInfo(title, artist) {
    $("#current-name-content").text(title);
    $("#current-artist-content").text(artist);
    checkOverflowAndScroll(document.getElementById('current-name-content'));
    checkOverflowAndScroll(document.getElementById('current-artist-content'));
}

function setupControls() {
    $("#play").on("click", togglePlayPause);
    $("#next").on("click", () => {
        getNextSong();
        showCurrentSong();
        togglePlayPause();
    });
    $("#prev").on("click", () => {
        getPrevSong();
        showCurrentSong();
        togglePlayPause();
    });
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

function togglePlayPause() {
    const audio = document.querySelector("#audio-box > audio");
    audio.paused ? audio.play() : audio.pause();
}

function updateCurrentTime(value) {
    const audio = document.querySelector("#audio-box > audio");
    audio.currentTime = (value / 100) * audio.duration;
}

function getNextSong() {
    currentIndex = (currentIndex + 1) % songList.length;
    updateCurrentSong(currentIndex);
}

function getPrevSong() {
    currentIndex = (currentIndex - 1 + songList.length) % songList.length;
    updateCurrentSong(currentIndex);
}

function updateCurrentSong(currentIndex) {
    const currentSong = songList[currentIndex];
    currentSong.time = 0;
}

initPlayer();

$("#playlist-Box").on("click",function () {
    $("#playlist-Box").css("display","none");
});