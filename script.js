var musicPath = "./music/";
var imagePath = "./images/";
var loopMode = 0;
var volumeValue = 100;
var songList = localStorage.getItem("songList") ? JSON.parse(localStorage.getItem("songList")) : [];
var currentSong = localStorage.getItem("currentSong") ? JSON.parse(localStorage.getItem("currentSong")) : {};
var currentIndex = localStorage.getItem("currentIndex") ? JSON.parse(localStorage.getItem("currentIndex")) : 0;
var playTime = localStorage.getItem("playTime") ? JSON.parse(localStorage.getItem("playTime")) : 0;
var listName = localStorage.getItem("listName") ? JSON.parse(localStorage.getItem("listName")) : [{ name: "default", songlist: songList }];
var currentListName = localStorage.getItem("currentListName") ? JSON.parse(localStorage.getItem("currentListName")) : "default";
var listIndex = localStorage.getItem("listIndex") ? JSON.parse(localStorage.getItem("listIndex")) : 0;

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
    initListName();
    initPlayList();
    $("#playlist-box").on("click", () => {
        $("#playlist").css("display", "block");
        $("#playlist-close").css("display", "flex");
        $("#playlist-control-box").css("display", "flex");
    });
    $("#playlist-close").on("click", () => {
        $("#playlist").hide(10);
        $("#playlist-close").hide(10);
        $("#playlist-control-box").hide(10);
    });
}

function initSong() {
    showCurrentSong();
    togglePlayPause();
    const music = $("#audio-box > audio").get(0);
    music.volume = volumeValue / 100;
    if (loopMode === 2) {
        music.prop("loop", true);
    }
    $("#disc-cover").css('animation', null);
    setTimeout(() => {
        $("#disc-cover").css('animation', '10s linear 0s infinite normal none running disc-rotate');
    }, 100);
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

    openPic(imageUrl);
    openSong(audioUrl, playTime);
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
    audio.addEventListener("pause", () => {
        $("#disc-cover").css("animation-play-state", "paused");
    });

    audio.addEventListener("play", () => {
        $("#disc-cover").css("animation-play-state", "running");
        if (!audio.visualizationInitialized) {
            visualize();
            audio.visualizationInitialized = true;
        }
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
        initSong();
    });
    $("#prev").on("click", () => {
        getPrevSong();
        initSong();
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
            initSong();
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

function initListName() {
    $("#playlist-name").empty();
    listName.forEach((list, i) => {
        let songBox = $(`<div class="playlist-name-item"></div>`);
        const songElement = $(`<div class="playlist-name-item-songname">${list.name}</div>`);
        if (list.name === currentListName && listIndex === i) {
            songBox.addClass("active");
        }
        songElement.on("click", () => {
            const currentList = listName.find(l => l.name === currentListName);
            if (currentList) {
                currentList.songlist = songList;
                localStorage.setItem("listName", JSON.stringify(listName));
            }
            currentIndex = (listIndex == i) ? currentIndex : 0;
            songList = list.songlist;
            listIndex = i;
            currentListName = list.name;
            localStorage.setItem("currentListName", JSON.stringify(currentListName));
            localStorage.setItem("listIndex", JSON.stringify(listIndex));
            localStorage.setItem("songList", JSON.stringify(songList));
            localStorage.setItem("currentIndex", JSON.stringify(currentIndex));
            initPlayList();
            initListName();
            initPlayList();
            if (songList.length > 0 ) {
                updateCurrentSong(currentIndex);
                initSong();
            }
        });
        songBox.append(songElement);
        $("#playlist-name").append(songBox);
    });

    $("#playlist-add").off("click").on("click", () => {
        $("#playlist-control-box").empty().css("display", "flex");
        let listNameAdd = $(`<div id="playlist-add-box"></div>`);
        const input = $(`<input type="text" id="playlist-add-input" placeholder="输入歌单名称">`);
        const confirm = $(`<button id="playlist-add-confirm">确认</button>`);
        const cancel = $(`<button id="playlist-add-cancel">取消</button>`);
        listNameAdd.append(input, confirm, cancel);
        $("#playlist-control-box").append(listNameAdd);

        $("#playlist-add-confirm").off("click").on("click", () => {
            const name = $("#playlist-add-input").val().trim();
            if (name && !listName.some(list => list.name === name)) {
                listName.push({ name: name, songlist: [] });
                localStorage.setItem("listName", JSON.stringify(listName));
                initListName();
            }
            $("#playlist-control-box").empty();
            recreatePlaylistControl();
        });

        $("#playlist-add-cancel").off("click").on("click", () => {
            $("#playlist-control-box").empty();
            recreatePlaylistControl();
        });
    });

    $("#playlist-delete").off("click").on("click", () => {
        listName = listName.filter(list => list.name !== currentListName);
        if (listName.length === 0) {
            listName.push({ name: "default", songlist: [] });
        }
        currentListName = listName[0].name;
        songList = listName[0].songlist;
        listIndex = 0;
        currentIndex = 0;
        localStorage.setItem("listName", JSON.stringify(listName));
        localStorage.setItem("listIndex", JSON.stringify(listIndex));
        localStorage.setItem("currentListName", JSON.stringify(currentListName));
        localStorage.setItem("songList", JSON.stringify(songList));
        localStorage.setItem("currentIndex", JSON.stringify(currentIndex));
        initListName();
        initPlayList();
        initSong();
    });
    listNameScroll();
}

function recreatePlaylistControl() {
    const playlistName = $(`<div id="playlist-name"></div>`);
    const playlistControl = $(`<div id="playlist-control"></div>`);
    const playlistAdd = $(`<div id="playlist-add"><i class="fas fa-plus"></i></div>`);
    const playlistDelete = $(`<div id="playlist-delete"><i class="fas fa-trash-alt"></i></div>`);
    playlistControl.append(playlistAdd, playlistDelete);
    $("#playlist-control-box").append(playlistName, playlistControl);
    initListName();
}

function listNameScroll() {
    document.querySelector('#playlist-name').addEventListener('wheel', function(event) {
        var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
        this.scrollLeft -= (delta * 40);
        event.preventDefault();
    }, false);
}

initPlayer();
