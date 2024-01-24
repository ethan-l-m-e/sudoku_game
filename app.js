// Test board and solution.
const board_data = [
    [0,8,0,5,0,0,6,7,0],
    [0,7,0,0,0,0,4,5,0],
    [0,0,0,8,0,0,3,0,0],
    [0,0,8,2,6,0,1,0,0],
    [4,0,0,0,0,0,0,3,5],
    [0,0,0,7,0,4,8,0,0],
    [7,1,5,0,2,0,0,0,3],
    [0,0,0,3,0,0,0,0,0],
    [0,2,0,0,0,8,0,0,0]];

const board_solution = [
    [3,8,4,5,9,1,6,7,2],
    [9,7,1,6,3,2,4,5,8],
    [2,5,6,8,4,7,3,9,1],
    [5,9,8,2,6,3,1,4,7],
    [4,6,7,1,8,9,2,3,5],
    [1,3,2,7,5,4,8,6,9],
    [7,1,5,4,2,6,9,8,3],
    [8,4,9,3,1,5,7,2,6],
    [6,2,3,9,7,8,5,1,4]];

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
    let numFilledTiles = 0;

    // Set tile ids.
    function setupGameTileIds() {
        let count = 0;
        gameTiles.forEach(tile => {
            tile.dataset.tile = count;
            count++;
        });
    }

    // Handle player click on tile.
    function addGameTileListeners() {
        gameTiles.forEach(tile => {
            tile.addEventListener("click", selectTile);
        });
    }

    // Handle player keyboard input.
    function addKeyboardListeners() {
        document.addEventListener("keydown", onKeyDown);
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

    // Player presses the keyboard.
    function onKeyDown(e) {
        e.preventDefault(); // WARNING: disables browser shortcuts.

        switch (e.key) {
            case "Backspace":
                clearTile();
                break;
            case "1": // Player enters a number from 1–9.
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                setTile(e.key);
                break;
            default:
                // Do nothing.
        }

        // Check if player inputs invalid value.
        gameTiles.forEach(tile => {
            checkConflict(tile.dataset.tile);
        });
    }

    // Player presses a number from 1–9.
    function setTile(key) {
        let currentTile = gameTiles[tileSelected];

        // Tile already has the same value.
        if (currentTile.innerHTML === key) return;

        // Tile was empty.
        if (currentTile.innerHTML === "") numFilledTiles++;

        currentTile.innerHTML = key;

        // Board is filled.
        if (numFilledTiles == 81) checkSolution();
    }

    // Player presses backspace.
    function clearTile() {
        let currentTile = gameTiles[tileSelected];

        // Tile is part of puzzle and cannot be cleared, or tile is already empty.
        if (currentTile.classList.contains("prefilled") || currentTile.innerHTML == "") return;

        numFilledTiles--;
        currentTile.innerHTML = "";
    }

    // Fill in tiles based on current data.
    function populateGameBoard() {
        let row_count = 0;
        board_data.forEach(row => {
            for (var i = 0; i < row.length; i++) {
                let currentTile = gameTiles[i + (row_count * 9)];

                // When data is not empty.
                if (row[i] !== 0) {
                    currentTile.innerHTML = String(row[i]);
                    currentTile.classList.add("prefilled"); // Class to identify initial tiles.
                    numFilledTiles++;
                }
            }
            row_count++;
        });
    }

    // Player has completed the puzzle.
    function checkSolution() {
        let found = true;
        let row_count = 0;
        board_solution.forEach(row => {
            for (var i = 0; i < row.length; i++) {
                let currentTile = gameTiles[i + (row_count * 9)];

                if (currentTile.innerHTML != row[i]) {
                    found = false;
                }
            }
            row_count++;
        });
        
        if (found) {
            document.getElementById("game-status").innerHTML = "You Win!"
        } else {
            document.getElementById("game-status").innerHTML = "Wrong Answer!"
        }
    }

    // Player enters a number that conflicts with another tile.
    function checkConflict(tileId) {
        let tileToCheck = gameTiles[tileId];

        // Look at row.
        let row = Math.floor(tileId / 9);
        for (var i = 0; i < 9; i++) {
            let currentTile = gameTiles[(row * 9) + i];
            let currentTileId = currentTile.dataset.tile;
            
            // Skip same tile as self.
            if (currentTileId === tileId) { continue; }

            // Conflict found.
            if (currentTile.innerHTML === tileToCheck.innerHTML && tileToCheck.innerHTML !== "") {
                if (!tileToCheck.classList.contains("conflicted")) {
                    tileToCheck.classList.add("conflicted");
                }
                return; // Can stop checking.
            }
        }

        // Look at column.
        let col = tileId % 9;
        for (var j = 0; j < 9; j++) {
            let currentTile = gameTiles[(j * 9) + col];
            let currentTileId = currentTile.dataset.tile;

            //  Skip same tile as self.
            if (currentTileId === tileId) { continue; }

            // Conflict found.
            if (currentTile.innerHTML === tileToCheck.innerHTML && tileToCheck.innerHTML !== "") {
                if (!tileToCheck.classList.contains("conflicted")) {
                    tileToCheck.classList.add("conflicted");
                }
                return; // Can stop checking.
            }
        }
        
        // Look at 3x3 grid.
        
        // No conflicts were found.
        if (tileToCheck.classList.contains("conflicted")) {
            tileToCheck.classList.remove("conflicted");
        }
    }

    // Setup the game.
    function initGame() {
        setupGameTileIds();
        addGameTileListeners();
        gameTiles[0].click();
        populateGameBoard();
        addKeyboardListeners();
    }

    initGame();
}

