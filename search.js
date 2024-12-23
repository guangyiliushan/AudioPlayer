var allSongs = [];
$.getJSON("./all.json", function (data) {
    allSongs = data;
});
var category = [];
$.getJSON("./category.json", function (data) {
    category = data;
});

const search = (input) => {
    input = input.toLowerCase().trim();
    if (!input) {
        return recommendSong();
    }
    const results = allSongs.map(song => {
        const { title, artist, album } = song;
        const titleMatches = (title.toLowerCase().match(new RegExp(input, "g")) || []).length / title.length;
        const artistMatches = (artist.toLowerCase().match(new RegExp(input, "g")) || []).length / artist.length;
        const albumMatches = (album.toLowerCase().match(new RegExp(input, "g")) || []).length / album.length;
        const totalMatches = Math.max(titleMatches, artistMatches, albumMatches);
        return { ...song, totalMatches };
    }).filter(song => song.totalMatches > 0)
        .sort((a, b) => b.totalMatches - a.totalMatches);
    return results;
}

function showSearchResult(input) {
    $("#search-result").empty();
    const results = search(input);
    results.forEach(result => {
        const { title, artist, album, duration } = result;
        const songBox = $(`<div class="search-item"></div>`);
        const songElement = $(`<div class="search-item-songname">${title} - ${artist}</div>`);
        const albumElement = $(`<div class="search-item-album">${album}</div>`);
        songElement.on("click", () => {
            const existingSongIndex = songList.findIndex(song => song.title === title && song.artist === artist);
            if (existingSongIndex === -1) {
                addSong({ title, artist, album, duration });
            } else {
                currentIndex = existingSongIndex;
                updateCurrentSong(currentIndex);
                showCurrentSong();
                togglePlayPause();
            }
        });
        songBox.append(songElement);
        songBox.append(albumElement);
        $("#search-result").append(songBox);
    });
    $("#search-result").css("display", "flex");
}

$(document).ready(function () {
    $("#search-input").on("focus", function () {
        $(this).css("color", "#000");
        showSearchResult($(this).val());
    });

    $("#search-input").on("input", function () {
        showSearchResult($(this).val());
    });

    $(document).on("click", function (event) {
        if (!$(event.target).closest("#search").length) {
            $("#search-result").css("display", "none");
            $("#search-input").css("color", "#888");
            $("#reason").text("");
        }
    });
});

function addSong(song) {
    songList.push(song);
    localStorage.setItem("songList", JSON.stringify(songList));
    initPlayList();
}

function getRecentSongs() {
    const recentSongs = getCookie("recentSong");
    console.log(recentSongs);
    return recentSongs;
}

function getTopCategories(recentSongs) {
    const categoryCount = {};
    recentSongs.forEach(song => {
        category.forEach(cat => {
            if (cat.songs.includes(song)) {
                categoryCount[cat.category] = (categoryCount[cat.category] || 0) + 1;
            }
        });
    });
    const sortedCategories = Object.keys(categoryCount).sort((a, b) => categoryCount[b] - categoryCount[a]);
    return [sortedCategories[0], sortedCategories[1]];
}

function getTopArtists(recentSongs) {
    const artistCount = {};
    recentSongs.forEach(song => {
        const artist = song.split(" - ")[0];
        artistCount[artist] = (artistCount[artist] || 0) + 1;
    });
    const sortedArtists = Object.keys(artistCount).sort((a, b) => artistCount[b] - artistCount[a]);
    return [sortedArtists[0], sortedArtists[1]];
}

function getRecommendedSongs(topCategories, topArtists) {
    const recommendedSongs = [];
    topCategories.forEach(topCategory => {
        const categoryData = category.find(cat => cat.category === topCategory);
        if (categoryData) {
            const topCategorySongs = categoryData.songs;
            topCategorySongs.forEach(songName => {
                const song = allSongs.find(s => `${s.artist} - ${s.title}` === songName);
                if (song && !recommendedSongs.includes(song)) {
                    recommendedSongs.push(song);
                }
            });
        }
    });
    topArtists.forEach(artist => {
        const artistSongs = allSongs.filter(song => song.artist === artist);
        artistSongs.forEach(song => {
            if (!recommendedSongs.includes(song)) {
                recommendedSongs.push(song);
            }
        });
    });
    return recommendedSongs;
}

function recommendSong() {
    const recentSongs = getRecentSongs();
    const topCategories = getTopCategories(recentSongs);
    const topArtists = getTopArtists(recentSongs);
    $("#reason").text(`根据最近常听的${topCategories.join(",")}和${topArtists.join(",")}推荐`)
    return getRecommendedSongs(topCategories, topArtists);
}
