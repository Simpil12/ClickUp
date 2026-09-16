var gameData = {
    clicks: 0,
    clicksPerClick: 1,
    clicksPerClickCost: 10
}

var savegame = JSON.parse(localStorage.getItem("clicksUpSave"))
if (savegame !== null) {
    gameData = savegame
}

function clicksUp() {
    gameData.clicks += gameData.clicksPerClick
    document.getElementById("clicksUp").innerHTML = gameData.clicks + " Times Clicked"
}

function buyClicksPerClick() {
    if (gameData.clicks >= gameData.clicksPerClickCost) {
        gameData.clicks -= gameData.clicksPerClickCost
        gameData.clicksPerClick += 1
        gameData.clicksPerClickCost *= 2
        updateUI()
        localStorage.setItem("clicksUpSave", JSON.stringify(gameData))
    }
}

function updateUI() {
    var clickDisplay = document.getElementById("clicksUp");
    var perClickUpgrade = document.getElementById("perClickUpgrade");
    if (clickDisplay) {
        clickDisplay.innerHTML = gameData.clicks + " Times Clicked";
    }
    if (perClickUpgrade) {
        perClickUpgrade.innerHTML = "Upgrade Clicks (Currently Level " + gameData.clicksPerClick + ") Cost: " + gameData.clicksPerClickCost + " Clicks";
    }
}

var mainGameLoop = window.setInterval(function() {
    clicksUp()
}, 1000)

var saveGameLoop = window.setInterval(function() {
    localStorage.setItem("clicksUpSave", JSON.stringify(gameData))
}, 15000)

updateUI()