let cards = [];
let flippedCards = [];
let matchedCards = [];
let timer;
let timeLeft = 60;
let score = 0;
let playerName = '';
let difficulty = 'easy';

const startButton = document.getElementById('start-btn');
const gameBoard = document.getElementById('game-board');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const playerNameInput = document.getElementById('player-name');
const gameInfo = document.getElementById('game-info');
const playerInfo = document.getElementById('player-info');
const difficultySelect = document.getElementById('difficulty');
const rankingTable = document.querySelector('#ranking tbody');
const rankingSection = document.getElementById('ranking');
const deleteRankingButton = document.getElementById('delete-ranking-btn');

// Modal
const gameOverModal = document.getElementById('game-over-modal');
const gameOverMessage = document.getElementById('game-over-message');
const closeModalButton = document.getElementById('close-modal-btn');

const imageUrls = [
    './imagem/carta1.png', 
    './imagem/carta2.png', 
    './imagem/carta3.png', 
    './imagem/carta4.png', 
    './imagem/carta5.png', 
    './imagem/carta6.png', 
    './imagem/carta7.png', 
    './imagem/carta8.png'  
];

difficultySelect.addEventListener('change', (e) => difficulty = e.target.value);

function shuffleCards(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function startGame() {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert('Por favor, insira seu nome!');
        return;
    }

    if (!/^[a-zA-Z\s]+$/.test(playerName)) {
        alert('O nome deve conter apenas letras e espaços!');
        return;
    }

    let numPairs;
    switch (difficulty) {
        case 'easy':
            numPairs = 4;
            timeLeft = 60;
            gameBoard.style.gridTemplateColumns = 'repeat(4, 120px)';
            break;
        case 'medium':
            numPairs = 6;
            timeLeft = 45;
            gameBoard.style.gridTemplateColumns = 'repeat(5, 120px)';
            break;
        case 'hard':
            numPairs = 8;
            timeLeft = 30;
            gameBoard.style.gridTemplateColumns = 'repeat(8, 120px)';
            break;
    }

    cards = shuffleCards([...imageUrls.slice(0, numPairs), ...imageUrls.slice(0, numPairs)]);

    gameBoard.innerHTML = '';
    matchedCards = [];
    flippedCards = [];
    score = 0;
    scoreDisplay.textContent = `Pontuação: ${score}`;

    cards.forEach((card) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.card = card;
        cardElement.style.backgroundImage = `url('imagem/cartaTraseira.png')`; 
        cardElement.addEventListener('click', flipCard);
        gameBoard.appendChild(cardElement);
    });

    gameInfo.classList.remove('hidden');
    playerInfo.classList.add('hidden');
    rankingSection.classList.add('hidden');
    gameBoard.classList.add('animated');
    setTimeout(() => gameBoard.classList.remove('animated'), 1000);
    startTimer();
}

function flipCard(event) {
    const clickedCard = event.target;

    if (flippedCards.length === 2 || clickedCard.classList.contains('flipped') || matchedCards.includes(clickedCard)) {
        return;
    }

    clickedCard.classList.add('flipped');
    clickedCard.style.backgroundImage = `url('${clickedCard.dataset.card}')`; 

    flippedCards.push(clickedCard);

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.card === card2.dataset.card) {
        matchedCards.push(card1, card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        score += 10;
        scoreDisplay.textContent = `Pontuação: ${score}`;
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.style.backgroundImage = `url('imagem/cartaTraseira.png')`;
            card2.style.backgroundImage = `url('imagem/cartaTraseira.png')`;
        }, 1000);
    }

    flippedCards = [];
    checkGameOver();
}

function checkGameOver() {
    if (matchedCards.length === cards.length) {
        clearInterval(timer);
        showGameOverMessage('Parabéns! Você venceu!');
        updateRanking(playerName, score, 60 - timeLeft);
        resetGame();
    }
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Tempo: ${timeLeft}s`;

        if (timeLeft === 10) {
            timerDisplay.classList.add('warning');
        }

        if (timeLeft === 0) {
            clearInterval(timer);
            showGameOverMessage('Tempo esgotado! Você perdeu!');
            resetGame();
        }
    }, 1000);
}

function showGameOverMessage(message) {
    gameOverMessage.textContent = message;
    gameOverModal.classList.remove('hidden');  // Exibe o modal
    gameOverModal.classList.add('show');      // Torna o modal visível
}

function closeModal() {
    gameOverModal.classList.remove('show');  // Esconde o modal
    gameOverModal.classList.add('hidden');   // Deixa o modal oculto
}

// Fechar o modal quando o jogador clicar no botão "Fechar"
closeModalButton.addEventListener('click', closeModal);

function updateRanking(playerName, score, timeTaken) {
    const rankings = JSON.parse(localStorage.getItem('rankings')) || [];
    rankings.push({ player: playerName, score, timeTaken });
    rankings.sort((a, b) => a.timeTaken - b.timeTaken || b.score - a.score);
    localStorage.setItem('rankings', JSON.stringify(rankings));
    displayRanking();
}

function displayRanking() {
    const rankings = JSON.parse(localStorage.getItem('rankings')) || [];
    rankingTable.innerHTML = rankings.map((entry, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${entry.player}</td>
            <td>${entry.score}</td>
            <td>${entry.timeTaken}s</td>
        </tr>
    `).join('');
    rankingSection.classList.remove('hidden');
}

function resetGame() {
    timeLeft = 60;
    gameBoard.innerHTML = '';
    gameInfo.classList.add('hidden');
    playerInfo.classList.remove('hidden');
}

function deleteRanking() {
    if (confirm('Tem certeza que deseja apagar o ranking?')) {
        localStorage.removeItem('rankings');
        displayRanking(); // Atualiza a interface depois de apagar
    }
}

deleteRankingButton.addEventListener('click', deleteRanking);

startButton.addEventListener('click', startGame);
