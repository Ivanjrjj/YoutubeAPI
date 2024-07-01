const API_KEY = 'AIzaSyCHDY5-0YTZ86Y0qo10Ny6KokRaAbjkxbs';
const searchEndpoint = 'https://www.googleapis.com/youtube/v3/search';
const searchForm = document.getElementById('searchForm');
const queryInput = document.getElementById('query');
const resultsContainer = document.getElementById('results');
const favoritesContainer = document.getElementById('favorites');
const videosButton = document.getElementById('videosButton');
const favoritesButton = document.getElementById('favoritesButton');

let favoriteVideos = JSON.parse(localStorage.getItem('favoriteVideos')) || [];

// Função para salvar os favoritos no localStorage
function saveFavoritesToLocalStorage() {
    localStorage.setItem('favoriteVideos', JSON.stringify(favoriteVideos));
}

// Função para buscar vídeos no YouTube
async function searchYouTube(query) {
    try {
        const url = `${searchEndpoint}?part=snippet&q=${query}&key=${API_KEY}&type=video&maxResults=10`;  // Limita os resultados a 10 vídeos

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Erro ao buscar vídeos');
        }

        const data = await response.json();
        return data.items || [];  // Garante que sempre retornamos um array
    } catch (error) {
        console.error('Erro ao buscar vídeos:', error);
        return [];  // Retorna um array vazio em caso de erro
    }
}

// Função para renderizar os resultados da busca
function renderResults(items) {
    resultsContainer.innerHTML = '';
    const videosToShow = items.slice(0, 8); // Limita a exibição a 8 vídeos
    videosToShow.forEach(item => {
        const videoId = item.id.videoId;
        const videoTitle = item.snippet.title;
        const videoThumbnail = item.snippet.thumbnails.medium.url;

        const videoElement = document.createElement('div');
        videoElement.classList.add('video-item');
        videoElement.innerHTML = `
            <div class="video-thumbnail" data-video-id="${videoId}">
                <img src="${videoThumbnail}" alt="${videoTitle}">
            </div>
            <button class="add-favorite" data-video-id="${videoId}">☆</button>
            <h2>${videoTitle}</h2>
        `;
        resultsContainer.appendChild(videoElement);

        const addButton = videoElement.querySelector('.add-favorite');
        addButton.addEventListener('click', () => toggleFavorite(videoId, videoTitle, videoThumbnail));

        const thumbnail = videoElement.querySelector('.video-thumbnail');
        thumbnail.addEventListener('click', () => playVideo(videoId));

        // Atualiza o estado da estrela com base nos favoritos
        updateFavoriteButton(addButton, videoId);
    });
}

// Função para atualizar o botão de favoritos
function updateFavoriteButton(button, videoId) {
    if (favoriteVideos.some(video => video.id === videoId)) {
        button.textContent = '⭐';
        button.classList.add('favorite');
    } else {
        button.textContent = '☆';
        button.classList.remove('favorite');
    }
}

// Função para alternar a adição ou remoção de vídeos dos favoritos
function toggleFavorite(videoId, videoTitle, videoThumbnail) {
    const index = favoriteVideos.findIndex(video => video.id === videoId);
    if (index === -1) {
        if (favoriteVideos.length < 10) {
            favoriteVideos.push({ id: videoId, title: videoTitle, thumbnail: videoThumbnail });
        } else {
            alert('Você já adicionou 10 vídeos aos favoritos!');
            return;
        }
    } else {
        favoriteVideos.splice(index, 1);
    }

    // Atualiza o estado dos botões de favoritos na lista de resultados e na lista de favoritos
    const addButton = document.querySelector(`.video-item .add-favorite[data-video-id="${videoId}"]`);
    if (addButton) {
        updateFavoriteButton(addButton, videoId);
    }

    // Atualiza o estado dos botões de remover dos favoritos na lista de favoritos
    const removeButton = document.querySelector(`.favorite-item .remove-favorite[data-video-id="${videoId}"]`);
    if (removeButton) {
        updateFavoriteButton(removeButton, videoId);
    }

    renderFavorites();
    saveFavoritesToLocalStorage();
}

// Função para atualizar o botão de favoritos
function updateFavoriteButton(button, videoId) {
    if (favoriteVideos.some(video => video.id === videoId)) {
        button.textContent = '⭐';
        button.classList.add('favorite');
    } else {
        button.textContent = '☆';
        button.classList.remove('favorite');
    }
}

// Função para renderizar a lista de vídeos favoritos
function renderFavorites() {
    favoritesContainer.innerHTML = '';
    const videosToShow = favoriteVideos.slice(0, 8); // Limita a exibição a 8 vídeos
    videosToShow.forEach(video => {
        const favoriteElement = document.createElement('div');
        favoriteElement.classList.add('favorite-item');
        favoriteElement.innerHTML = `
            <div class="video-thumbnail" data-video-id="${video.id}">
                <img src="${video.thumbnail}" alt="${video.title}">
            </div>
            <button class="remove-favorite" data-video-id="${video.id}">☆</button>
            <h2>${video.title}</h2>

        `;
        favoritesContainer.appendChild(favoriteElement);

        const removeButton = favoriteElement.querySelector('.remove-favorite');
        removeButton.addEventListener('click', () => toggleFavorite(video.id, video.title, video.thumbnail));

        const thumbnail = favoriteElement.querySelector('.video-thumbnail');
        thumbnail.addEventListener('click', () => playVideo(video.id));

        // Atualiza o estado da estrela com base nos favoritos
        updateFavoriteButton(removeButton, video.id);
    });
}

// Função para abrir o vídeo em uma nova aba
function playVideo(videoId) {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
}

// Adiciona um ouvinte para o formulário de busca
searchForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const query = queryInput.value.trim();

    if (query) {
        try {
            const items = await searchYouTube(query);
            renderResults(items);
            favoritesButton.style.display = 'inline-block';
        } catch (error) {
            console.error('Erro ao buscar vídeos:', error);
        }
    }
});

// Adiciona um ouvinte para o botão de favoritos
favoritesButton.addEventListener('click', function () {
    videosButton.style.display = 'inline-block';
    document.querySelector('.favorites').style.display = 'block';
    document.querySelector('.videos').style.display = 'none';
    renderFavorites();
});

// Adiciona um ouvinte para o botão de vídeos
videosButton.addEventListener('click', function () {
    videosButton.style.display = 'none';
    document.querySelector('.favorites').style.display = 'none';
    document.querySelector('.videos').style.display = 'block';
});

// Executa quando a página é carregada
window.onload = function () {
    renderFavorites();
    document.querySelector('.favorites').style.display = 'none';
    document.querySelector('.videos h1').style.display = 'block';
};
