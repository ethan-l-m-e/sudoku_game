// Test board and solution.
const board = [[0,8,0,5,0,0,6,7,0],[0,7,0,0,0,0,4,5,0],[0,0,0,8,0,0,3,0,0],[0,0,8,2,6,0,1,0,0],[4,0,0,0,0,0,0,3,5],[0,0,0,7,0,4,8,0,0],[7,1,5,0,2,0,0,0,3],[0,0,0,3,0,0,0,0,0],[0,2,0,0,0,8,0,0,0]];
const solution = [[3,8,4,5,9,1,6,7,2],[9,7,1,6,3,2,4,5,8],[2,5,6,8,4,7,3,9,1],[5,9,8,2,6,3,1,4,7],[4,6,7,1,8,9,2,3,5],[1,3,2,7,5,4,8,6,9],[7,1,5,4,2,6,9,8,3],[8,4,9,3,1,5,7,2,6],[6,2,3,9,7,8,5,1,4]];

// Ensure html has been loaded.
if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", ready);
} else {
    ready();
}

// Main function
function ready() {

    // GAME VARIABLES.
    const gameTiles = document.querySelectorAll("div[data-tile]");
    let tileSelected = null;

    // Set tile ids.
    function setupGameTileIds() {
        let count = 0;
        gameTiles.forEach(tile => {
            tile.dataset.tile = count;
            count++;
        });
    }

    // Add game tile event listeners.
    function addGameTileListeners() {
        gameTiles.forEach(tile => {
            tile.addEventListener("click", selectTile);
        });
    }

    // Player clicks on a tile.
    function selectTile(e) {
        let t = e.target;

        // If tile is already selected, stop.
        if (t.dataset.tile === tileSelected) return;
    
        // Deselect old tile.
        if (tileSelected !== null) gameTiles[tileSelected].classList.remove("selected");

        // Update game variable.
        tileSelected = t.dataset.tile;

        // Select new tile.
        t.classList.add("selected");
    }

    // Setup the game.
    function initGame() {
        setupGameTileIds();
        addGameTileListeners();
        gameTiles[0].click();
    }

    initGame();
}

