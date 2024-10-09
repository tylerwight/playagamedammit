let commonGames = []; 
let timerInterval;
let playerCount = 0;
let randomGame = [];

async function fetchGames() {
  const steamId = document.getElementById('steamId').value;
  const gameAreaUpper = document.getElementById('gameAreaUpper');
  gameAreaUpper.innerHTML = 'Loading...';

  try {
    const response = await fetch(`/games/${steamId}`);
    const games = await response.json();

    if (games.length > 0) {
      gameAreaUpper.innerHTML = '<ul>' + games.map(game => `<li>${game.name}</li>`).join('') + '</ul>';
    } else {
      gameAreaUpper.innerHTML = 'No games found or Steam ID is private.';
    }
  } catch (error) {
    gameAreaUpper.innerHTML = 'Error fetching games. Please check the Steam ID and try again.';
    console.error(error);
  }
}



function savePlayerInputs(playerCount) {
  for (let i = 1; i <= playerCount; i++) {
    const steamId = document.getElementById(`steamId${i}`).value;
    localStorage.setItem(`steamId${i}`, steamId);
  }
}

function populatePlayerInputs(playerCount) {
  for (let i = 1; i <= playerCount; i++) {
    const savedSteamId = localStorage.getItem(`steamId${i}`);
    if (savedSteamId) {
      document.getElementById(`steamId${i}`).value = savedSteamId;
    }
  }
}


function generateInputFields() {
  playerCount = document.getElementById('playerCount').value;
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

  populatePlayerInputs(playerCount);
}


async function fetchGamesForAllPlayers(playerCount) {
  savePlayerInputs(playerCount); 
  const gameAreaUpper = document.getElementById('gameAreaUpper');
  const steamIdInputs = document.querySelector('#steamIdInputs');
  
  gameAreaUpper.innerHTML = 'Loading...';

  let playerGames = [];
  let errorOccurred = false;

  for (let i = 1; i <= playerCount; i++) {
    const steamId = document.getElementById(`steamId${i}`).value;

    try {
      const response = await fetch(`/games/${steamId}`);
      const games = await response.json();

      if (games.length > 0) {
        const gameData = games.map(game => ({
          name: game.name,
          appid: game.appid
        }));
        playerGames.push(gameData);
      } else {
        gameAreaUpper.innerHTML = `<h3>Player ${i} Games:</h3><p>No games found or Steam ID is private.</p>`;
        return; 
      }
    } catch (error) {
      console.error(`Error fetching games for player ${i}:`, error);
      errorOccurred = true;
      gameAreaUpper.innerHTML = `<h3>Player ${i} Games:</h3><p>Error fetching games. Please check the Steam ID and try again.</p>`;
      return; 
    }
  }

  if (errorOccurred) {
    return;
  }

  commonGames = playerGames.reduce((common, games) => 
    common.filter(game => games.some(g => g.name === game.name && g.appid === game.appid))
  ).sort((a, b) => a.name.localeCompare(b.name));

  if (commonGames.length > 0) {
    steamIdInputs.style.display = 'none';
    startGame();
    
  } else {
    gameAreaUpper.innerHTML = '<p>No games are owned by all players.</p>';
  }
}


function startGame(){
  const gameAreaUpper = document.getElementById('gameAreaUpper');
  const gameAreaLower = document.getElementById('gameAreaLower');
  const gameAreaButtons = document.getElementById('gameAreaButtons');

  
  gameAreaUpper.innerHTML = '<h3> YOU ROLLED </h3>';
  displayRandomGame();
  gameAreaLower.innerHTML = `<h3> Does this game support ${playerCount} players?`;
  gameAreaButtons.innerHTML = `<button onclick="startTimer()">Yes</button><button onclick="displayRandomGame()">No</button>`;
}

function displayRandomGame() {
  const chosenGame = document.getElementById('chosenGame');
  
  randomGame = commonGames[Math.floor(Math.random() * commonGames.length)];
  
  const steamStoreUrl = `https://store.steampowered.com/app/${randomGame.appid}`;
  
  chosenGame.innerHTML = `
    <p><h2 style="text-align: center;">${randomGame.name}</h2></p>
    <p style="text-align: center;"><a href="${steamStoreUrl}" target="_blank" style="text-align: center;">Steam Store Page</a></p>
  `;
  
}


function startTimer() {
  const gameAreaUpper = document.getElementById('gameAreaUpper');
  const gameAreaLower = document.getElementById('gameAreaLower');
  const gameAreaButtons = document.getElementById('gameAreaButtons');

  gameAreaUpper.innerHTML = '<h3> Everyone play: </h3>';
  gameAreaLower.innerHTML = `<h3> for 20 minutes </h3>`;
  gameAreaLower.innerHTML += `<div id="timerDisplay"></div>`;
  gameAreaButtons.innerHTML = '';
  const timerDisplay = document.getElementById('timerDisplay');



  let timeInSeconds = 20 * 60; //20 minutes

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
      
      restartGame();
      alarmSound.play();
    }
  }, 1000);
}


function restartGame(){
  const timerDisplay = document.getElementById('timerDisplay');
  let timeInSeconds = 10

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (timeInSeconds > 0) {
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = timeInSeconds % 60;
      timerDisplay.innerHTML = `<h1 style="text-align: center; font-size: 100px">Time's up!</h1>`;
      timerDisplay.innerHTML += `<h1 style="text-align: center; font-size: 100px">New game in:<p> ${minutes}:${seconds < 10 ? '0' : ''}${seconds}</p></h1>`;
      
      timeInSeconds--;
    } else {
      // Timer has finished
      clearInterval(timerInterval);
      startGame();
    }
  }, 1000);
}
