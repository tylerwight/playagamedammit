let commonGames = []; 
let timerInterval;

async function fetchGames() {
  const steamId = document.getElementById('steamId').value;
  const gameList = document.getElementById('gameList');
  gameList.innerHTML = 'Loading...';

  try {
    const response = await fetch(`/games/${steamId}`);
    const games = await response.json();

    if (games.length > 0) {
      gameList.innerHTML = '<ul>' + games.map(game => `<li>${game.name}</li>`).join('') + '</ul>';
    } else {
      gameList.innerHTML = 'No games found or Steam ID is private.';
    }
  } catch (error) {
    gameList.innerHTML = 'Error fetching games. Please check the Steam ID and try again.';
    console.error(error);
  }
}



function generateInputFields() {
  const playerCount = document.getElementById('playerCount').value;
  const steamIdInputs = document.getElementById('steamIdInputs');
  steamIdInputs.innerHTML = ''; // Clear any existing inputs
  const formGroup = document.querySelector('.form-group');


  if (playerCount <= 0 || playerCount > 5) {
    steamIdInputs.innerHTML = '<p>Please enter a valid number of players. 1-4</p>';
    return;
  }

  for (let i = 1; i <= playerCount; i++) {
    steamIdInputs.innerHTML += `
      <div class="form-group">
        <label for="steamId${i}">Enter Steam ID for Player ${i}:</label>
        <input type="text" id="steamId${i}" placeholder="Steam ID for Player ${i}">
      </div>`;
  }

  steamIdInputs.innerHTML += `<button onclick="fetchGamesForAllPlayers(${playerCount})">Fetch Games</button>`;
  formGroup.style.display = 'none';
}


async function fetchGamesForAllPlayers(playerCount) {
  const gameList = document.getElementById('gameList');
  const steamIdInputs = document.querySelector('#steamIdInputs');
  
  gameList.innerHTML = 'Loading...';

  let playerGames = [];
  let errorOccurred = false;


  for (let i = 1; i <= playerCount; i++) {
    const steamId = document.getElementById(`steamId${i}`).value;

    try {

      const response = await fetch(`/games/${steamId}`);
      const games = await response.json();

      if (games.length > 0) {
        const gameNames = games.map(game => game.name);
        playerGames.push(gameNames);
      } else {
        gameList.innerHTML = `<h3>Player ${i} Games:</h3><p>No games found or Steam ID is private.</p>`;
        return; 
      }
    } catch (error) {
      console.error(`Error fetching games for player ${i}:`, error);
      errorOccurred = true;
      gameList.innerHTML = `<h3>Player ${i} Games:</h3><p>Error fetching games. Please check the Steam ID and try again.</p>`;
      return; 
    }
  }

  if (errorOccurred) {
    return; 
  }


  commonGames = playerGames.reduce((common, games) => common.filter(game => games.includes(game))).sort();


  if (commonGames.length > 0) {
    displayRandomGame();
    steamIdInputs.style.display = 'none';
  } else {
    gameList.innerHTML = '<p>No games are owned by all players.</p>';
  }
}


function displayRandomGame() {
  const gameList = document.getElementById('gameList');
  const randomGame = commonGames[Math.floor(Math.random() * commonGames.length)];

  gameList.innerHTML = `<h3>Everyone play:</h3><p><h2>${randomGame}</h2></p>`;
  gameList.innerHTML += `<button onclick="displayRandomGame()">Pick Another Game</button>`;

  gameList.innerHTML += `
    <div>
      <label for="timerInput">Enter time (in minutes):</label>
      <input type="number" id="timerInput" placeholder="Minutes">
      <button onclick="startTimer()">Start Timer</button>
    </div>
    <div id="timerDisplay"></div>
  `;
}


function startTimer() {
  const timerInput = document.getElementById('timerInput').value;
  const timerDisplay = document.getElementById('timerDisplay');

  let timeInSeconds = parseInt(timerInput) * 60;

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (timeInSeconds > 0) {
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = timeInSeconds % 60;

      timerDisplay.innerHTML = `<h1 style="text-align: center; font-size: 100px">Time left:<p> ${minutes}:${seconds < 10 ? '0' : ''}${seconds}</p></h1>`;
      
      timeInSeconds--;
    } else {
      // Timer has finished
      clearInterval(timerInterval);
      timerDisplay.innerHTML = "Time's up!";
      alarmSound.play();
    }
  }, 1000);
}