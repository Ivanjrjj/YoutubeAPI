const API_KEY = 'AIzaSyCHDY5-0YTZ86Y0qo10Ny6KokRaAbjkxbs';


const searchEndpoint = 'https://www.googleapis.com/youtube/v3/search';

const searchForm = document.getElementById('searchForm');
const queryInput = document.getElementById('query');
const resultsContainer = document.getElementById('results');
const favoritesContainer = document.getElementById('favorites');
const videosButton = document.getElementById('videosButton');
const favoritesButton = document.getElementById('favoritesButton');

let favoriteVideos = JSON.parse(localStorage.getItem('favoriteVideos')) || [];

function saveFavoritesToLocalStorage() {
    localStorage.setItem('favoriteVideos', JSON.stringify(favoriteVideos));
}

async function searchYouTube(query) {
    try {
        const url = `${searchEndpoint}?part=snippet&q=${query}&key=${API_KEY}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Erro ao buscar vídeos');
        }

        const data = await response.json();
        return data.items; 
    } catch (error) {
        console.error('Erro ao buscar vídeos:', error);
        return []; 
    }
}

function renderResults(items) {
    resultsContainer.innerHTML = '';
    items.forEach(item => {
        const videoId = item.id.videoId;
        const videoTitle = item.snippet.title;
        const videoThumbnail = item.snippet.thumbnails.medium.url;

        const videoElement = document.createElement('div');
        videoElement.classList.add('video-item');
        videoElement.innerHTML = `
            <h2>${videoTitle}</h2>
            <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">
                <img src="${videoThumbnail}" alt="${videoTitle}">
            </a>
            <button class="add-favorite" data-video-id="${videoId}">Adicionar aos Favoritos</button>
        `;
        resultsContainer.appendChild(videoElement);

        const addButton = videoElement.querySelector('.add-favorite');
        addButton.addEventListener('click', () => addToFavorites(videoId, videoTitle, videoThumbnail));
    });
}

function addToFavorites(videoId, videoTitle, videoThumbnail) {
    const exists = favoriteVideos.some(video => video.id === videoId);
    if (!exists) {
        favoriteVideos.push({ id: videoId, title: videoTitle, thumbnail: videoThumbnail });
        renderFavorites();
        saveFavoritesToLocalStorage();
    } else {
        alert('Este vídeo já está nos favoritos.');
    }
}

function renderFavorites() {
    favoritesContainer.innerHTML = '';
    favoriteVideos.forEach(video => {
        const favoriteElement = document.createElement('div');
        favoriteElement.classList.add('favorite-item');
        favoriteElement.innerHTML = `
            <h2>${video.title}</h2>
            <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank">
                <img src="${video.thumbnail}" alt="${video.title}">
            </a>
        `;
        favoritesContainer.appendChild(favoriteElement);
    });
}

searchForm.addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const query = queryInput.value.trim(); 

    if (query) {
        const items = await searchYouTube(query);
        renderResults(items);
        favoritesButton.style.display = 'inline-block';
    } else {
        alert('Por favor, insira um termo de busca.');
    }
});

favoritesButton.addEventListener('click', function() {
    videosButton.style.display = 'inline-block';
    document.querySelector('.favorites').style.display = 'block';
    document.querySelector('.videos').style.display = 'none';
    document.querySelector('.videos h1').style.display = 'none';
    resultsContainer.innerHTML = '';
    renderFavorites();
});

videosButton.addEventListener('click', function() {
    videosButton.style.display = 'none';
    document.querySelector('.favorites').style.display = 'none';
    document.querySelector('.videos').style.display = 'block';
    document.querySelector('.videos h1').style.display = 'block'; 
    window.onload();
});

window.onload = function() {
    renderFavorites();
    document.querySelector('.favorites').style.display = 'none'; 
    document.querySelector('.videos h1').style.display = 'block'; 
};
