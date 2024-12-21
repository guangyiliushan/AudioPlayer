var musicPath = "./music/";
var imagePath = "./images/";
var loopMode = 0;
var volumeValue = 100;
var songList = localStorage.getItem("songList") ? JSON.parse(localStorage.getItem("songList")) : [];
var currentSong = localStorage.getItem("currentSong") ? JSON.parse(localStorage.getItem("currentSong")) : {};
var currentIndex = localStorage.getItem("currentIndex") ? JSON.parse(localStorage.getItem("currentIndex")) : 0;
var playTime = localStorage.getItem("playTime") ? JSON.parse(localStorage.getItem("playTime")) : 0;

function setCookie(songName, artistName, days = 1) {
    const fileName = `${artistName} - ${songName}`;
    let recentSongs = getCookie("recentSong");
    if (!recentSongs.includes(fileName)) {
        recentSongs.push(fileName);
        recentSongs = recentSongs.slice(-10);
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = `recentSong=${recentSongs.join(",")}; ${expires}; path=/`;
    }
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            const value = cookie.substring(name.length + 1);
            return value.split(",");
        }
    }
    return [];
}

function initPlayer() {
    showCurrentSong();
    setupControls();
    initPlayList();
    $("#playlist-box").on("click", switchPlayList);
}

function initSong(){

}

function initSongTime(time, duration) {
    $("#timeslider-text-current").text(formatTime(time));
    $("#timeslider-text-total").text(formatTime(duration));
}

function showCurrentSong() {
    const { title, artist, duration } = currentSong;
    console.log(title, artist, duration);
    const audioUrl = `${musicPath}${artist} - ${title}.mp3`;
    const imageUrl = `${imagePath}${artist} - ${title}.jpg`;

    openSong(audioUrl, playTime);
    openPic(imageUrl);
    initSongTime(playTime, duration);
    updateSongInfo(title, artist);
    setCookie(title, artist);
}

function openSong(fileUrl, time) {
    const audio = new Audio(fileUrl);
    audio.currentTime = time;
    $("#audio-box").empty().append(audio).css("display", "none");
    audio.addEventListener("timeupdate", () => {
        $("#timeslider-text-current").text(formatTime(audio.currentTime));
        $("#timeslider-bar").val((audio.currentTime / audio.duration) * 100);
        localStorage.setItem("playTime", audio.currentTime);
    });
    audio.addEventListener("ended", () => {
        getNextSong();
        showCurrentSong();
        $("audio").trigger("play");
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
        const music = $("#audio-box > audio").get(0);
        music.volume = volumeValue / 100;
        if (loopMode === 2) {
            music.prop("loop", true); 置
        }
    });
    $("#prev").on("click", () => {
        getPrevSong();
        showCurrentSong();
        togglePlayPause();
        const music = $("#audio-box > audio").get(0);
        music.volume = volumeValue / 100;
        if (loopMode === 2) {
            music.prop("loop", true); 置
        }
    });
    $("#loop").on("click", () => {
        loopMode = (loopMode + 1) % 3;
        const loopIcon = $("#loop i");
        const loopModes = ["fa-bars", "fa-random", "fa-redo"];
        const currentLoopMode = loopModes[loopMode];
        loopIcon.removeClass(loopModes.join(" ")).addClass(currentLoopMode);
        if (loopMode === 0) {
            songList = localStorage.getItem("songList") ? JSON.parse(localStorage.getItem("songList")) : [];
            currentIndex = localStorage.getItem("currentIndex") ? JSON.parse(localStorage.getItem("currentIndex")) : 0;
        }
        if (loopMode === 1) {
            songList = songList.sort(() => 0.5 - Math.random());
            initPlayList();
        }
        if (loopMode === 2) {
            const music = $("#audio-box > audio");
            music.prop("loop", true);
        }
    });
    $("#voice").on("click", () => {
        if ($("#volume").css("display") === "flex") {
            $("#volume").css("display", "none");
            return;
        }
        else {
            $("#volume").css("display", "flex");
            return;
        }
    }).on("doubleclick", () => {
        $("#volume-bar").val(0);
        updateVolume(0);
        volumeValue = 0;
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
    const playIcon = $("#play i");
    audio.paused ? playIcon.removeClass("fa-pause").addClass("fa-play") : playIcon.removeClass("fa-play").addClass("fa-pause");
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
    currentSong = songList[currentIndex];
    playTime = 0;
    localStorage.setItem("currentSong", JSON.stringify(currentSong));
    localStorage.setItem("currentIndex", JSON.stringify(currentIndex));
    initPlayList();
}

function initPlayList() {
    $("#playlist").empty();
    songList.forEach((song, i) => {
        const { title, artist } = song;
        let songBox = $(`<div class="playlist-item"></div>`);
        let controls = $(`<div class="playlist-item-controls"></div>`);
        const songElement = $(`<div class="playlist-item-songname">${title} - ${artist}</div>`);
        let songUpElement = $(`<div class="playlist-item-controls-up"></div>`);
        let songDownElement = $(`<div class="playlist-item-controls-down"></div>`);
        let songRemoveElement = $(`<div class="playlist-item-controls-remove"></div>`);
        const upicon = $(`<i class="fas fa-arrow-up"></i>`);
        const downicon = $(`<i class="fas fa-arrow-down"></i>`);
        const removeicon = $(`<i class="fas fa-trash-alt"></i>`);
        songElement.on("click", () => {
            currentIndex = i;
            updateCurrentSong(currentIndex);
            showCurrentSong();
            togglePlayPause();
            const music = $("#audio-box > audio").get(0);
            music.volume = volumeValue / 100;
            if (loopMode === 2) {
                music.prop("loop", true); 置
            }
        });
        if (i === currentIndex) {
            songBox.addClass("active");
        }
        songUpElement.on("click", () => {
            if (i > 0) {
                [songList[i], songList[i - 1]] = [songList[i - 1], songList[i]];
                localStorage.setItem("songList", JSON.stringify(songList));
                currentIndex = (i === currentIndex) ? currentIndex - 1 : (currentIndex === i - 1) ? currentIndex + 1 : currentIndex;
                localStorage.setItem("currentIndex", JSON.stringify(currentIndex));
                initPlayList();
            }
        });

        songDownElement.on("click", () => {
            if (i < songList.length - 1) {
                [songList[i], songList[i + 1]] = [songList[i + 1], songList[i]];
                localStorage.setItem("songList", JSON.stringify(songList));
                currentIndex = (i === currentIndex) ? currentIndex + 1 : (currentIndex === i + 1) ? currentIndex - 1 : currentIndex;
                localStorage.setItem("currentIndex", JSON.stringify(currentIndex));
                initPlayList();
            }
        });

        songRemoveElement.on("click", () => {
            songList.splice(i, 1);
            localStorage.setItem("songList", JSON.stringify(songList));
            if (i === currentIndex) {
                currentIndex = 0;
                if (songList.length > 0) {
                    updateCurrentSong(currentIndex);
                }
            } else if (i < currentIndex) {
                currentIndex--;
            }
            localStorage.setItem("currentIndex", JSON.stringify(currentIndex));
            initPlayList();
        });
        songBox.append(songElement);
        songUpElement.append(upicon);
        songDownElement.append(downicon);
        songRemoveElement.append(removeicon);
        controls.append(songUpElement);
        controls.append(songDownElement);
        controls.append(songRemoveElement);
        songBox.append(controls);

        $("#playlist").append(songBox);
    });
}

function switchPlayList() {
    if ($("#playlist").css("display") === "block") {
        $("#playlist").css("display", "none");
        $("#playlist-close").css("display", "none");
    } else {
        $("#playlist").css("display", "block");
        $("#playlist-close").css("display", "flex");
    }
}

function updateVolume(value) {
    const audio = document.querySelector("#audio-box > audio");
    audio.volume = value / 100;;
    $("#volume-value span").text(`${value}%`);
    const volumeIcon = $("#voice i");
    volumeIcon.removeClass("fa-volume-up fa-volume-down fa-volume-mute");
    if (value == 0) {
        volumeIcon.addClass("fa-volume-mute");
    } else if (value > 50) {
        volumeIcon.addClass("fa-volume-up");
    } else if (value > 0) {
        volumeIcon.addClass("fa-volume-down");
    }
    volumeValue = value;
}

initPlayer();
