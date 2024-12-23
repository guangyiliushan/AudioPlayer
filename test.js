// localStorage.removeItem("songList");
// localStorage.removeItem("currentSong");
// localStorage.removeItem("currentIndex");
// var allSongs = [
//     {
//         "title": "Sleep the Clock Around",
//         "artist": "Belle & Sebastian",
//         "album": "The Boy With the Arab Strap",
//         "duration": 298.16163265306125
//     },
//     {
//         "title": "Печаль",
//         "artist": "Кино",
//         "album": "Звезда по имени Солнце",
//         "duration": 332.9044897959184
//     },
//     {
//         "title": "Солнце",
//         "artist": "Перемотка",
//         "album": "Солнце",
//         "duration": 165.98204081632653
//     },
//     {
//         "title": "Beetlebum",
//         "artist": "Blur",
//         "album": "Blur: The Best Of",
//         "duration": 305.18857142857144
//     },
//     {
//         "title": "南三环东路",
//         "artist": "DOUDOU",
//         "album": "南三环东路",
//         "duration": 376.128
//     }
// ];

// var currentSong = {
//     title: "The Narcissist",
//     artist: "Blur",
//     album: "The Narcissist",
//     duration: 245.26367346938775,
// };

// var currentIndex = 0;

// var songList = JSON.parse(localStorage.getItem("songList")) || [];

// function addSongsToLocalStorage(songs) {
//     songs.forEach(song => {
//         songList.push(song);
//     });
//     localStorage.setItem("songList", JSON.stringify(songList));
// }

// addSongsToLocalStorage(allSongs.slice(0, 5));
// localStorage.setItem("currentSong", JSON.stringify(currentSong));
// localStorage.setItem("currentIndex", JSON.stringify(currentIndex));

// function clearAllCookies() {
//     const cookies = document.cookie.split(";");

//     for (let i = 0; i < cookies.length; i++) {
//         const cookie = cookies[i];
//         const eqPos = cookie.indexOf("=");
//         const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
//         document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
//     }
// }

// clearAllCookies()

console.log(songList);
console.log(JSON.parse(localStorage.getItem("currentSong"))); 
console.log(JSON.parse(localStorage.getItem("currentIndex")));