var rawSave = localStorage.getItem("clicksUpSave");
var saveGame = rawSave !== null ? JSON.parse(rawSave) : null;

var gameData = {
    clicks: 0,
    clicksPerSecond: 1,
    clicksPerClick: 1,
    clicksPerClickCost: 5,
    clicksUpgradeCost: 10,
    lastTick: Date.now()
}

function update(id, content) {
    var el = document.getElementById(id);
    if (el) {
        el.innerHTML = content;
    }
}

function saveGameData() {
    localStorage.setItem("clicksUpSave", JSON.stringify(gameData));
}

function updateUI() {
    update("clicksUp", format(gameData.clicks, "scientific") + " Times Clicked");
    update("perClickUpgrade", "Upgrade Click (Currently Level " + format(gameData.clicksPerClick, "scientific") + ")<br>Cost: " + format(gameData.clicksPerClickCost, "scientific") + " Clicks");
    update("clicksUpgrade", "Upgrade Idle Click Gain (Currently Level " + format(gameData.clicksPerSecond, "scientific") + ")<br>Cost: " + format(gameData.clicksUpgradeCost, "scientific") + " Clicks");
}

function clicksUp() {
    gameData.clicks += gameData.clicksPerClick
    updateUI()
}

function buyClicksPerClick() {
    if (gameData.clicks >= gameData.clicksPerClickCost) {
        gameData.clicks -= gameData.clicksPerClickCost
        gameData.clicksPerClick += 1
        gameData.clicksPerClickCost *= 2
        updateUI();
        saveGameData();
    }
}

function buyClicksUpgrade() {
    if (gameData.clicks >= gameData.clicksUpgradeCost) {
        gameData.clicks -= gameData.clicksUpgradeCost
        gameData.clicksPerSecond *= 2
        gameData.clicksUpgradeCost *= 2
        updateUI();
        saveGameData();
    }
}

function tab(tabId) {
    var clickMenu = document.getElementById("clickMenu");
    var upgradeMenu = document.getElementById("upgradeMenu");
    var targetTab = document.getElementById(tabId);

    if (clickMenu) clickMenu.style.display = "none";
    if (upgradeMenu) upgradeMenu.style.display = "none";
    if (targetTab) targetTab.style.display = "block";
    if (targetTab) targetTab.style.display = "flex"; 
}

function format(number, type) {
    if (number === 0) return "0.0";
    if (number < 1) return number.toFixed(1);
	let exponent = Math.floor(Math.log10(number))
	let mantissa = number / Math.pow(10, exponent)
    if (exponent < 3) {
        return number % 1 === 0 ? number.toFixed(0) : number.toFixed(1);
    }
	if (type == "scientific") return mantissa.toFixed(2) + "e" + exponent
	if (type == "engineering") return (Math.pow(10, exponent % 3) * mantissa).toFixed(2) + "e" + (Math.floor(exponent / 3) * 3)
}

if (saveGame !== null) {
    if (typeof saveGame.clicks !== "undefined") gameData.clicks = saveGame.clicks;
    if (typeof saveGame.clicksPerClick !== "undefined") gameData.clicksPerClick = saveGame.clicksPerClick;
    if (typeof saveGame.clicksPerClickCost !== "undefined") gameData.clicksPerClickCost = saveGame.clicksPerClickCost;
    if (typeof saveGame.lastTick !== "undefined") gameData.lastTick = saveGame.lastTick;
    if (typeof saveGame.clicksPerSecond !== "undefined") gameData.clicksPerSecond = saveGame.clicksPerSecond;
    if (typeof saveGame.clicksUpgradeCost !== "undefined") gameData.clicksUpgradeCost = saveGame.clicksUpgradeCost;
    if (typeof saveGame.lastTick !== "undefined") {
        var offlineTime = (Date.now() - parseFloat(saveGame.lastTick)) / 1000;

        if (offlineTime >= 5) {
            var completedSeconds = Math.floor(offlineTime);
            var earnedAmount = gameData.clicksPerSecond * completedSeconds;

            gameData.clicks += earnedAmount;

            if (earnedAmount > 0) {
                var formattedEarnings = format(earnedAmount, "scientific");
                document.getElementById("offlineReport").innerHTML = "You earned <strong>" + formattedEarnings + "</strong> Clicks while you were away for " + completedSeconds + " seconds!";
                document.getElementById("offlinePopup").style.display = "flex";
            }
        }
    }
}

gameData.lastTick = Date.now();

window.addEventListener("DOMContentLoaded", function() {
    tab("clickMenu");
    updateUI(); 

    window.setInterval(function() {
        var diff = Date.now() - gameData.lastTick;
        gameData.lastTick = Date.now();
        gameData.clicks += gameData.clicksPerSecond * (diff / 1000);
        updateUI();
    }, 1000);

    window.setInterval(function() {
        saveGameData();
    }, 15000);
});

function closeOfflinePopup() {
    document.getElementById("offlinePopup").style.display = "none";
}