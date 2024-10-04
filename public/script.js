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

