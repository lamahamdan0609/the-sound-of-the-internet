
// SOUND OF THE INTERNET
// Live music discovery using the iTunes Search API

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const musicGrid = document.getElementById("musicGrid");
const statusMessage = document.getElementById("status");
const resultCount = document.getElementById("resultCount");
const resultsTitle = document.getElementById("resultsTitle");

const audioPlayer = document.getElementById("audioPlayer");
const playButton = document.getElementById("playButton");
const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const playerImage = document.getElementById("playerImage");
const playerPlaceholder = document.getElementById("playerPlaceholder");
const appleLink = document.getElementById("appleLink");
const progressBar = document.getElementById("progressBar");
const playerTime = document.getElementById("playerTime");
const surpriseButton = document.getElementById("surpriseButton");

let currentSongs = [];
let currentGenre = "pop";

// Search for music using the iTunes API
async function searchMusic(term) {

    statusMessage.textContent = "Discovering new music...";
    resultCount.textContent = "Searching...";
    musicGrid.innerHTML = "";

    try {

        // Create the API URL
        const url =
            `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=24&country=CA`;

        // Fetch live music data
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to connect to the music library.");
        }

        // Convert the response into JSON
        const data = await response.json();

        // Store the returned songs
        currentSongs = data.results;

        // Display the results
        displaySongs(currentSongs);

        resultsTitle.textContent = `Sounds like "${term}"`;

    } catch (error) {

        statusMessage.textContent =
            "Something went wrong. Please try again.";

        resultCount.textContent = "No results";

        console.error(error);

    }
}


// Display the retrieved songs on the webpage
function displaySongs(songs) {

    musicGrid.innerHTML = "";

    // Check if the API returned any songs
    if (!songs || songs.length === 0) {

        statusMessage.textContent =
            "No songs found. Try another search.";

        resultCount.textContent = "0 songs";

        return;
    }

    statusMessage.textContent = "";

    resultCount.textContent = `${songs.length} discoveries`;

    // Create a card for every song
    songs.forEach((song) => {

        const card = document.createElement("article");
        card.className = "music-card";

        // Album artwork
        const artworkContainer = document.createElement("div");
        artworkContainer.className = "album-art";

        const image = document.createElement("img");
        image.src = song.artworkUrl100 || "";
        image.alt = `Album artwork for ${song.trackName}`;
        image.loading = "lazy";

        const cardPlay = document.createElement("button");
        cardPlay.className = "card-play";
        cardPlay.textContent = "▶";
        cardPlay.setAttribute("aria-label", `Preview ${song.trackName}`);

        cardPlay.addEventListener("click", () => {
            playSong(song);
        });

        artworkContainer.appendChild(image);
        artworkContainer.appendChild(cardPlay);

        // Song title
        const title = document.createElement("h3");
        title.className = "song-title";
        title.textContent = song.trackName;

        // Artist name
        const artist = document.createElement("p");
        artist.className = "song-artist";
        artist.textContent = song.artistName;

        // Genre
        const genre = document.createElement("p");
        genre.className = "song-genre";
        genre.textContent = song.primaryGenreName || "Music";

        // Apple Music link
        const storeLink = document.createElement("a");
        storeLink.href = song.trackViewUrl || "https://music.apple.com/";
        storeLink.target = "_blank";
        storeLink.rel = "noopener noreferrer";
        storeLink.textContent = "View on Apple Music ↗";
        storeLink.style.display = "inline-block";
        storeLink.style.fontSize = "10px";
        storeLink.style.color = "#c5a4f3";
        storeLink.style.marginTop = "9px";

        // Add everything to the card
        card.appendChild(artworkContainer);
        card.appendChild(title);
        card.appendChild(artist);
        card.appendChild(genre);
        card.appendChild(storeLink);

        musicGrid.appendChild(card);

    });

}


// Play a song preview
function playSong(song) {

    // Check whether a preview is available
    if (!song.previewUrl) {

        statusMessage.textContent =
            "A preview isn't available for this song. Try another one.";

        return;
    }

    // Stop the previous song
    audioPlayer.pause();

    // Update the music player with the selected song
    audioPlayer.src = song.previewUrl;

    playerTitle.textContent = song.trackName;
    playerArtist.textContent = song.artistName;

    playerImage.src = song.artworkUrl100 || "";
    playerImage.classList.remove("hidden");
    playerPlaceholder.classList.add("hidden");

    // Link to the original Apple Music listing
    appleLink.href = song.trackViewUrl || "https://music.apple.com/";

    // Play the preview
    audioPlayer.play()
        .then(() => {
            playButton.textContent = "Ⅱ";
            statusMessage.textContent = "";
        })
        .catch(() => {
            statusMessage.textContent =
                "Unable to play this preview. Try another song.";
            playButton.textContent = "▶";
        });

}


// Play and pause using the main player
playButton.addEventListener("click", () => {

    if (!audioPlayer.src) {
        statusMessage.textContent =
            "Choose a song first!";
        return;
    }

    if (audioPlayer.paused) {

        audioPlayer.play()
            .then(() => {
                playButton.textContent = "Ⅱ";
            })
            .catch(() => {
                statusMessage.textContent =
                    "Unable to play this preview.";
            });

    } else {

        audioPlayer.pause();
        playButton.textContent = "▶";

    }

});


// Update the progress bar while a preview plays
audioPlayer.addEventListener("timeupdate", () => {

    if (audioPlayer.duration) {

        const progress =
            (audioPlayer.currentTime / audioPlayer.duration) * 100;

        progressBar.style.width = `${progress}%`;

        const seconds = Math.floor(audioPlayer.currentTime);

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        playerTime.textContent =
            `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
    }

});


// Reset player when preview ends
audioPlayer.addEventListener("ended", () => {

    playButton.textContent = "▶";
    progressBar.style.width = "0%";

});


// Search when the user submits the search bar
searchForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const searchTerm = searchInput.value.trim();

    if (searchTerm) {

        removeActiveGenre();

        searchMusic(searchTerm);

    }

});


// Remove the active appearance from genre buttons
function removeActiveGenre() {

    document.querySelectorAll(".genre").forEach((button) => {
        button.classList.remove("active");
    });

}


// Filter songs using genre buttons
document.querySelectorAll(".genre").forEach((button) => {

    button.addEventListener("click", () => {

        const genre = button.dataset.genre;

        currentGenre = genre;

        // Highlight the selected genre
        removeActiveGenre();
        button.classList.add("active");

        // Retrieve music for the selected genre
        searchMusic(genre);

    });

});


// Surprise me: randomly select a genre
surpriseButton.addEventListener("click", () => {

    const genres = [
        "pop",
        "r&b",
        "hip hop",
        "indie",
        "alternative",
        "afrobeats",
        "electronic",
        "rock",
        "soul",
        "dance"
    ];

    // Select a random genre
    const randomGenre =
        genres[Math.floor(Math.random() * genres.length)];

    currentGenre = randomGenre;

    // Update the selected genre button if available
    removeActiveGenre();

    const matchingButton =
        document.querySelector(`[data-genre="${randomGenre}"]`);

    if (matchingButton) {
        matchingButton.classList.add("active");
    }

    // Search for the randomly selected genre
    searchInput.value = "";
    searchMusic(randomGenre);

});


// Automatically load music when the website opens
searchMusic("pop");
