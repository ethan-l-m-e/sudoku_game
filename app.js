const template_boards = {
    "Medium": [ // List of Medium difficulty data and solutions.
        {
            "data": [
                [0,8,0,5,0,0,6,7,0],
                [0,7,0,0,0,0,4,5,0],
                [0,0,0,8,0,0,3,0,0],
                [0,0,8,2,6,0,1,0,0],
                [4,0,0,0,0,0,0,3,5],
                [0,0,0,7,0,4,8,0,0],
                [7,1,5,0,2,0,0,0,3],
                [0,0,0,3,0,0,0,0,0],
                [0,2,0,0,0,8,0,0,0]
            ],
            "solution": [
                [3,8,4,5,9,1,6,7,2],
                [9,7,1,6,3,2,4,5,8],
                [2,5,6,8,4,7,3,9,1],
                [5,9,8,2,6,3,1,4,7],
                [4,6,7,1,8,9,2,3,5],
                [1,3,2,7,5,4,8,6,9],
                [7,1,5,4,2,6,9,8,3],
                [8,4,9,3,1,5,7,2,6],
                [6,2,3,9,7,8,5,1,4]
            ]
        }
    ],
    "Hard": [
        { // List of Hard difficulty data and solutions.
            "data":[
                [0,0,0,8,0,0,0,0,0],
                [0,0,9,4,6,0,7,1,0],
                [0,0,0,0,2,0,0,0,4],
                [0,0,0,0,0,0,0,9,0],
                [0,0,0,0,0,2,0,0,0],
                [0,0,0,0,0,0,0,0,5],
                [0,0,0,0,5,6,1,0,0],
                [0,0,0,0,8,0,5,0,0],
                [0,3,0,0,0,0,0,4,0]
            ],
            "solution": [
                [2,4,7,8,1,5,6,3,9],
                [5,8,9,4,6,3,7,1,2],
                [3,1,6,7,2,9,8,5,4],
                [7,6,4,5,3,8,2,9,1],
                [9,5,1,6,4,2,3,8,7],
                [8,2,3,1,9,7,4,6,5],
                [4,7,8,9,5,6,1,2,3],
                [1,9,2,3,8,4,5,7,6],
                [6,3,5,2,7,1,9,4,8]
            ]
        }
    ]
}

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
    const gameKeyboard = document.getElementById("game-keyboard");
    const puzzleSolvedSound = document.getElementById("sound-unit");
    let tileSelected = null;
    let numFilledTiles = 0;
    let currentBoard = null;
    let currentSolution = null;
    let currentPlayDifficulty = null;
    let previousDifficulty = null;
    let currentGameTime = { hours: 0, minutes: 0, seconds: 0 };
    let myPauseTimerFunction;
    let acceptInput = false;
    let gameSettings = loadSettings();

    // Player starts up the game.
    function loadSettings() {
        var s = JSON.parse(localStorage.getItem("game-settings"));
        if (!validateSettings(s)) {
            // Settings did not exist before.
            s = {
                "show-timer": true,
                "play-sound": true
            }
            localStorage.setItem("game-settings", JSON.stringify(s));
        }
        return s;
    }

    // Check if settings are in the correct format.
    function validateSettings(s) {
        if (s === null) return false;
        if ((typeof s["show-timer"]) !== 'boolean') return false;
        if ((typeof s["play-sound"]) !== 'boolean') return false;
        return true;
    }

    // When player changes a setting.
    function saveSettings(key, value) {
        gameSettings[key] = value;
        var s = JSON.stringify(gameSettings);
        localStorage.setItem("game-settings", s);
    }

    // Apply previously loaded settings. Does not save any settings.
    function applySettings() {
        // Timer checkbox.
        let timerSetting = document.getElementById("show-timer-setting");
        timerSetting.checked = gameSettings["show-timer"];
        if (timerSetting.checked) {
            document.getElementById("display-timer").classList.remove("hide-setting");
        } else {
            document.getElementById("display-timer").classList.add("hide-setting");
        }

        // Sound checkbox.
        let playSoundSetting = document.getElementById("play-sound-setting");
        playSoundSetting.checked = gameSettings["play-sound"];
    }

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

    // Handle player marks a candidate.
    function addCandidateListeners() {
        Array.from(document.getElementsByClassName("candidate")).forEach(candidate => {
            candidate.addEventListener("click", (e) => {
                e.target.classList.toggle("marked");
            });
        });
    }

    // Handle player clicks on game UI.
    function addUiListeners() {
        document.getElementById("medium-difficulty-button").addEventListener("click", () => {
            playGame("Medium")
        });
        document.getElementById("hard-difficulty-button").addEventListener("click", () => {
            playGame("Hard")
        });
        document.getElementById("back-button").addEventListener("click", () => {
            swapScreens("menu-container");
            stopTimer();
        });
        document.getElementById("display-timer").addEventListener("click", () => {
            openOverlay("pause-overlay");
            stopTimer();
        });
        document.getElementById("resume-button").addEventListener("click", () => {
            closeOverlay("pause-overlay");
            startTimer();
        });
        Array.from(document.getElementsByClassName("close-button")).forEach((x) => {
            x.addEventListener("click", () => {
                closeOverlay(x.parentElement.parentElement.id);
            });
        });
        Array.from(document.getElementsByClassName("clickable")).forEach((x) => {
            x.addEventListener("click", () => {
                closeOverlay(x.parentElement.id);
            });
        });
        document.getElementById("dropdown-button").addEventListener("click", () => {
            document.getElementById("dropdown-content").classList.toggle("shown");
        });
        document.getElementById("check-cell-button").addEventListener("click", () => {
            checkCell(gameTiles[tileSelected]);
            document.getElementById("dropdown-content").classList.remove("shown");
        });
        document.getElementById("check-puzzle-button").addEventListener("click", () => {
            checkPuzzle();
            document.getElementById("dropdown-content").classList.remove("shown");
        });
        document.getElementById("reveal-puzzle-button").addEventListener("click", (x) => {
            revealPuzzle();
            document.getElementById("dropdown-content").classList.remove("shown");
        });
        document.getElementById("reset-puzzle-button").addEventListener("click", () => {
            resetPuzzle();
            document.getElementById("dropdown-content").classList.remove("shown");
        });
        document.addEventListener("click", (e) => {
            // Clicking outside of dropdown to close it.
            if (!document.getElementById("dropdown-content").contains(e.target) && 
                e.target != document.getElementById("dropdown-button")) {
                document.getElementById("dropdown-content").classList.remove("shown");
            }
        });
        document.getElementById("continue-button").addEventListener("click", () => {
            nextGame();
            closeOverlay("win-overlay");
        });
        document.getElementById("settings-button").addEventListener("click", () => {
            openOverlay("settings-overlay");
        });
        document.getElementById("show-timer-setting").addEventListener("click", () => {
            if (document.getElementById("show-timer-setting").checked) {
                document.getElementById("display-timer").classList.remove("hide-setting");
                saveSettings("show-timer", true);;
            } else {
                document.getElementById("display-timer").classList.add("hide-setting");
                saveSettings("show-timer", false);
            }
        });
        document.getElementById("play-sound-setting").addEventListener("click", () => {
            if (document.getElementById("play-sound-setting").checked) {
                saveSettings("play-sound", true);;
            } else {
                saveSettings("play-sound", false);
            }
        });
        document.getElementById("input-normal-button").addEventListener("click", () => {
            let keyboard = document.getElementById("game-keyboard");
            keyboard.classList.remove("input-candidate");
            keyboard.classList.add("input-normal");
        });
        document.getElementById("input-candidate-button").addEventListener("click", () => {
            let keyboard = document.getElementById("game-keyboard");
            keyboard.classList.remove("input-normal");
            keyboard.classList.add("input-candidate");
        });
        Array.from(document.getElementsByClassName("number-pad-button-container")).forEach((numberPadButton) => {
            let num = numberPadButton.dataset.number;
            numberPadButton.addEventListener("click", () => {
                // Normal input mode
                if (gameKeyboard.classList.contains("input-normal")) {
                    setTile(num);
                // Candidate input mode
                } else if (gameKeyboard.classList.contains("input-candidate")) {
                    setCandidate(num);
                }
            });
        });
        document.getElementById("keyboard-delete-button").addEventListener("click", () => {
            clearTile();
        });
    }

    // Game changes the rendered screen.
    function swapScreens(screenName) {
        let screens = Array.from(document.getElementsByClassName("screen"));
        screens.forEach((screen) => {
            if (screen.classList.contains(screenName)) {
                if (!screen.classList.contains("rendering")) {
                    screen.classList.add("rendering");
                }
            } else {
                screen.classList.remove("rendering");
            }
        });
    }

    // When player clicks UI buttons.
    function closeOverlay(overlay) {
        let overlayWrapper = document.getElementById(overlay);
        // Animate closing.
        overlayWrapper.classList.add("close");
        window.setTimeout(() => {
            overlayWrapper.classList.remove("shown"); // Hide overlay before close animation.
            overlayWrapper.classList.remove("close"); // Close animation class.
        }, 200);
    }

    function openOverlay(overlay) {
        let overlayWrapper = document.getElementById(overlay);
        overlayWrapper.classList.add("shown");
    }

    // Player clicks on a tile.
    function selectTile(e) {
        if (!acceptInput) return;

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

    // Player presses the arrow keys.
    function moveSelection(key) {
        let currentTile = Number(tileSelected);
        let row = Math.floor(currentTile / 9);
        let col = currentTile % 9;
        switch (key) {
            case "ArrowLeft":
                if (col === 0) { return; }
                gameTiles[currentTile - 1].click();
                break;
            case "ArrowUp":
                if (row === 0) { return; }
                gameTiles[currentTile - 9].click();
                break;
            case "ArrowRight":
                if (col === 8) { return; }
                gameTiles[currentTile + 1].click();
                break;
            case "ArrowDown":
                if (row === 8) { return; }
                gameTiles[currentTile + 9].click();
                break;
            default:
                return;
        }
    }

    // Player presses the keyboard.
    function onKeyDown(e) {
        e.preventDefault(); // WARNING: disables browser shortcuts.

        if (!acceptInput) return;

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
                // Normal input mode
                if (gameKeyboard.classList.contains("input-normal")) {
                    setTile(e.key);
                // Candidate input mode
                } else if (gameKeyboard.classList.contains("input-candidate")) {
                    setCandidate(e.key);
                }
                break;
            case "ArrowLeft":
            case "ArrowUp":
            case "ArrowRight":
            case "ArrowDown":
                moveSelection(e.key);
                break;
            default:
                // Do nothing.
        }
    }

    // Player presses a number from 1–9.
    function setTile(key) {
        if (!acceptInput) return;

        let currentTile = gameTiles[tileSelected];

        // Tile is part of puzzle.
        if (currentTile.classList.contains("prefilled")) return;

        // Tile correct answer has been revealed.
        if (currentTile.classList.contains("revealed")) return;

        // Tile already has the same value.
        if (currentTile.innerHTML === key) return;

        // Tile was empty.
        if (currentTile.innerHTML === "") numFilledTiles++;

        currentTile.innerHTML = key;
        currentTile.classList.add("guessed");
        currentTile.classList.remove("incorrect");

        // Check if player inputted invalid value.
        gameTiles.forEach(tile => {
            checkConflict(tile.dataset.tile);
        });

        // Board is filled.
        if (numFilledTiles == 81) checkSolution();
    }

    // Player clicks the number pad in candidate mode.
    function setCandidate(num) {
        if (!acceptInput) return;

        let currentTile = gameTiles[tileSelected];

        // Tile is part of puzzle.
        if (currentTile.classList.contains("prefilled")) return;

        // Revealed tile cannot be modified again.
        if (currentTile.classList.contains("revealed")) return;

        // Remove current guess in tile, if any.
        if (currentTile.classList.contains("guessed")) clearTile();

        let numberToSet = Number(num);

        let siblingCandidates = Array.from(currentTile.nextElementSibling.children);

        // Stop transition effect when adding candidate tile.
        siblingCandidates[numberToSet - 1].classList.add("no-transition");
        siblingCandidates[numberToSet - 1].classList.toggle("marked"); // Index is num - 1.
        setTimeout(() => { 
            siblingCandidates[numberToSet - 1].classList.remove("no-transition");
        }, 1000);
    }

    // Player presses backspace.
    function clearTile() {
        if (!acceptInput) return;

        let currentTile = gameTiles[tileSelected];

        // Revealed tile cannot be cleared.
        if (currentTile.classList.contains("revealed")) return;

        // Tile is part of puzzle and cannot be cleared, or tile is already empty.
        if (currentTile.classList.contains("prefilled")) return;

        // Tile was empty.
        if (currentTile.innerHTML === "") {
            let siblingCandidateTile = currentTile.nextElementSibling;
            Array.from(siblingCandidateTile.children).forEach((candidateTile) => {
                if (candidateTile.classList.contains("marked")) {
                    // Stop transition effect when deleting candidate tile.
                    candidateTile.classList.add("no-transition");
                    candidateTile.classList.remove("marked");
                    setTimeout(() => { 
                        candidateTile.classList.remove("no-transition");
                    }, 1000);
                }
            });
        }

        // No guesses to clear.
        if (!currentTile.classList.contains("guessed")) return;

        numFilledTiles--;
        currentTile.innerHTML = "";
        currentTile.classList.remove("guessed");
        currentTile.classList.remove("incorrect");

        // Update conflicts
        gameTiles.forEach(tile => {
            checkConflict(tile.dataset.tile);
        });
    }

    // Call to external api.
    function requestPuzzle(difficulty) {
        async function api() {
            const url = 'https://sudoku-api.vercel.app/api/dosuku';
            var result;
            do {
                const response = await fetch(url);
                result = await response.json();
            } while (result.newboard.grids[0].difficulty !== difficulty);
            return result;
        }

        // Async request has finished.
        function proceedToGame() {
            document.getElementById("display-difficulty").innerHTML = currentPlayDifficulty;
            populateGameBoard(currentBoard);
            swapScreens("game-container");
            startTimer();
        }

        api().then((result) => {
            currentBoard = result.newboard.grids[0].value;
            currentSolution = result.newboard.grids[0].solution;
            currentPlayDifficulty = result.newboard.grids[0].difficulty;
            proceedToGame();
        }).catch(error => {
            console.log(error);
            // Retrieve from list of precomputed boards.
            currentBoard = template_boards[difficulty][0].data;
            currentSolution = template_boards[difficulty][0].solution;
            currentPlayDifficulty = difficulty;
            proceedToGame();
        });
    }

    // Fill in tiles based on current data.
    function populateGameBoard(board) {
        let row_count = 0;
        board.forEach(row => {
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
        gameTiles.forEach(tile => {
            if (tile.classList.contains("conflicted")) found = false;
        });
        if (found) gameOver();
    }

    // Player enters a number that conflicts with another tile.
    function checkConflict(tileId) {
        let tileToCheck = gameTiles[tileId];

        // Look at row.
        const row = Math.floor(tileId / 9);
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
        const col = tileId % 9;
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
        
        // Look at 3x3 subGrid.
        let subGridRow = 0;
        let subGridCol = 0;
        
        // Find the top left tile of the subGrid.
        if (row < 3) {
            subGridRow = 0; // Top row.
        } else if (row < 6) {
            subGridRow = 3; // Middle row.
        } else {
            subGridRow = 6; // Bottom row.
        }
        if (col < 3) { 
            subGridCol = 0; // Left column. 
        } else if (col < 6) {
            subGridCol = 3; // Middle column.
        } else {
            subGridCol = 6; // Right column.
        }

        // Look through all tiles in the subGrid.
        for (var r = subGridRow; r < (subGridRow + 3); r++) {
            for (var c = subGridCol; c < (subGridCol + 3); c++) {
                let currentTile = gameTiles[(r * 9) + c];
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
        }

        // No conflicts were found.
        if (tileToCheck.classList.contains("conflicted")) {
            tileToCheck.classList.remove("conflicted");
        }
    }

    // Player starts or resumes playing.
    function startTimer() {
        // Update time:
        // Add to s every 1000ms.
        // Add to m when s becomes 60, set s to 0
        // Add to h when m becomes 60, set m to 0
        // Show the time on screen.
        // TODO: Stop updating time when player leaves game / or when paused:
        myPauseTimerFunction = setInterval(updateTimer, 1000);
    }

    // A second of time passes.
    function updateTimer() {
        let h = currentGameTime.hours;
        let m = currentGameTime.minutes;
        let s = currentGameTime.seconds;
        s++;
        if (s >= 60) { m++; s = 0; } // Carry over to minutes.
        if (m >= 60) { h++; m = 0; } // Carry over to hour.
        // Update game variable.
        currentGameTime.seconds = s;
        currentGameTime.minutes = m;
        currentGameTime.hours = h;
        // Show the time on screen.
        document.getElementById("timer-unit").innerHTML = getTime();
    }

    // Current time played.
    function getTime() {
         // Append zero.
         function formatTime(time) {
            if (time < 10) {
                return "0" + time;
            }
            return time;
        }
        let h = currentGameTime.hours;
        let m = currentGameTime.minutes;
        let s = currentGameTime.seconds;
        return `${h}:${formatTime(m)}:${formatTime(s)}`;
    }

    // Player left the game screen.
    function stopTimer() {
        window.clearInterval(myPauseTimerFunction);
    }

    // New timer for new game.
    function resetTimer() {
        currentGameTime.seconds = 0;
        currentGameTime.minutes = 0;
        currentGameTime.hours = 0;
    }

    // Player begins a game.
    function playGame(difficulty) {
        // Player returns to existing game.
        if (currentPlayDifficulty !== difficulty) {
            resetTimer();
            clearBoard();
            requestPuzzle(difficulty);
            swapScreens("loading-screen");
        } else {
            startTimer();
            swapScreens("game-container");
        }
        previousDifficulty = difficulty;
        acceptInput = true;
        document.getElementById("dropdown-content").classList.remove("game-over");
        document.getElementById("display-timer").classList.remove("game-over");
        gameTiles[0].click();
    }

    // Puzzle is solved.
    function gameOver() {
        stopTimer();
        showWinningMessage();
        playSound();
        previousDifficulty = currentPlayDifficulty;
        currentPlayDifficulty = null;
        acceptInput = false;
        document.getElementById("dropdown-content").classList.add("game-over");
        document.getElementById("display-timer").classList.add("game-over");
    }

    // Displays the game stats.
    function showWinningMessage() {
        let a = "an"; // Use 'an' for 'an Easy'
        if (currentPlayDifficulty === "Medium" || currentPlayDifficulty === "Hard") {
            a = "a"
        }
        document.getElementById("winning-message").innerHTML = 
            `You finished ${a} ${currentPlayDifficulty} puzzle in ${getTime()}.`;
        openOverlay("win-overlay");
    }

    // Jingle when the player wins.
    function playSound() {
        if (gameSettings["play-sound"]) {
            puzzleSolvedSound.play();
        }
    }

    // Tear down.
    function clearBoard() {
        gameTiles.forEach((tile) => {
            tile.classList.remove("prefilled");
            tile.classList.remove("guessed");
            tile.classList.remove("conflicted");
            tile.classList.remove("selected");
            tile.classList.remove("revealed");
            tile.innerHTML = "";
        });
        Array.from(document.getElementsByClassName("candidate")).forEach(candidateTile => {
            candidateTile.classList.remove("marked");
        });
        document.getElementById("timer-unit").innerHTML = "0:00:00";
        numFilledTiles = 0;
        tileSelected = null;
    }

    // Player wants to see if tile is correct.
    function checkCell(currentTile) {

        // Revealed tile is already correct.
        if (currentTile.classList.contains("revealed")) return;

        // Prefilled tile does not need to be checked.
        if (currentTile.classList.contains("prefilled")) return;

        if (currentTile.classList.contains("guessed")) {
            let row = Math.floor(tileSelected / 9);
            let col = tileSelected % 9;
            if (Number(currentTile.innerHTML) === currentSolution[row][col]) {
                currentTile.classList.add("revealed");
            } else {
                currentTile.classList.add("incorrect");
            }
        }
    }

    // Player wants to check all tiles.
    function checkPuzzle() {
        gameTiles.forEach((tile) => {
            checkCell(tile);
        });
    }

    // Player wants to get the answer.
    function revealPuzzle() {
        let row_count = 0;
        currentSolution.forEach(row => {
            for (var i = 0; i < row.length; i++) {
                let currentTile = gameTiles[i + (row_count * 9)];
                if (currentTile.classList.contains("prefilled")) continue;

                // Put the correct answer in the current tile.
                tileSelected = i + (row_count * 9);
                let answer = String(row[i]);
                setTile(answer);

                // Highlight the revealed cell in blue.
                currentTile.classList.add("revealed");
            }
            row_count++;
        });
    }

    // Player wants to start same puzzle from scratch.
    function resetPuzzle() {
        stopTimer();
        resetTimer();
        clearBoard();
        populateGameBoard(currentBoard);
        startTimer();
        currentPlayDifficulty = previousDifficulty;
        document.getElementById("dropdown-content").classList.remove("game-over");
        document.getElementById("display-timer").classList.remove("game-over");
        acceptInput = true;
        gameTiles[0].click();
    }

    // Player presses continue from winning screen.
    function nextGame() {
        playGame("Hard");
    }

    // Setup the game.
    function initGame() {
        applySettings();
        setupGameTileIds();
        addGameTileListeners();
        addKeyboardListeners();
        addCandidateListeners();
        addUiListeners();
    }

    initGame();
}