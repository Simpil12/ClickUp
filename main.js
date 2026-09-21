var rawSave = localStorage.getItem("clicksUpSave");
var saveGame = rawSave !== null ? JSON.parse(rawSave) : null;

var gameData = {
    clicks: 0,
    clicksPerSecond: 0,
    clicksPerClick: 1,
    clicksPerClickCost: 5,
    clicksUpgradeCost: 10,
    clicksUpgradeLevel: 0,
    lastTick: Date.now(),

    automationUnlocked: false
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

function handleButtonState(id, cost) {
    var btn = document.getElementById(id);
    if (!btn) return;
    
    if (gameData.clicks < cost) {
        btn.classList.add("unaffordable");
    } else {
        btn.classList.remove("unaffordable");
    }
}

function updateUI() {
    update("clicksUp", format(gameData.clicks, "scientific") + " Times Clicked");
    update("perClickUpgrade", "Upgrade Click (Currently Level " + format(gameData.clicksPerClick, "scientific") + ")<br>Cost: " + format(gameData.clicksPerClickCost, "scientific") + " Clicks");
    update("clicksUpgrade", "Upgrade Idle Click Gain (Currently Level " + format(gameData.clicksUpgradeLevel, "scientific") + ")<br>Cost: " + format(gameData.clicksUpgradeCost, "scientific") + " Clicks");
    update("cpsDisplay", format(gameData.clicksPerSecond, "scientific") + " Clicks/Sec");
    update("cpcDisplay", format(gameData.clicksPerClick, "scientific") + " Clicks/Click");

    var unlockBtn = document.getElementById("unlockAutomationBtn");
    var upgradeBtn = document.getElementById("clicksUpgrade");

    if (unlockBtn && upgradeBtn) {
        if (gameData.automationUnlocked === false) {
            unlockBtn.classList.remove("btn-disabled");
            unlockBtn.innerHTML = "Unlock Automation - Cost: 50 Clicks";
            unlockBtn.style.display = "inline-block";
            
            upgradeBtn.style.display = "none";

            handleButtonState("unlockAutomationBtn", 50);
        } else {
            unlockBtn.classList.add("btn-disabled");
            unlockBtn.innerHTML = "Unlock Automation - Bought";
            unlockBtn.style.display = "inline-block";
            
            upgradeBtn.style.display = "inline-block";

            handleButtonState("clicksUpgrade", gameData.clicksUpgradeCost);
        }
    }

    handleButtonState("perClickUpgrade", gameData.clicksPerClickCost);
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
        gameData.clicks -= gameData.clicksUpgradeCost;

        if (gameData.clicksUpgradeLevel === 0) {
            gameData.clicksUpgradeLevel = 1;
            gameData.clicksPerSecond = 1;
        } else {
            gameData.clicksUpgradeLevel += 1;
            gameData.clicksPerSecond *= 2;
        }

        gameData.clicksUpgradeCost *= 2; 
        updateUI();
        saveGameData();
    }
}

function unlockAutomation() {
    if (gameData.automationUnlocked === true) return;

    var unlockCost = 50;

    if (gameData.clicks >= unlockCost) {
        gameData.clicks -= unlockCost;
        gameData.automationUnlocked = true;
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
    if (number < 0) return "-" + format(Math.abs(number), type);
    if (number === 0) return "0";
    if (number < 1) return number.toFixed(1);

    if (number < 1000000) {
        if (number % 1 === 0) {
            return Math.floor(number).toLocaleString(); 
        } else {
            return Math.floor(number).toLocaleString() + "." + (number % 1).toFixed(1).slice(2);
        }
    }

    const suffixes = [
        { limit: 1e12, div: 1e9, suffix: "B" },
        { limit: 1e9,  div: 1e6, suffix: "M" }
    ];

    for (const item of suffixes) {
        if (number >= item.div && number < item.limit) {
            return (number / item.div).toFixed(2) + item.suffix;
        }
    }

    let exponent = Math.floor(Math.log10(number));
    let mantissa = number / Math.pow(10, exponent);

    if (type === "engineering") {
        return (Math.pow(10, exponent % 3) * mantissa).toFixed(2) + "e" + (Math.floor(exponent / 3) * 3);
    }
    
    return mantissa.toFixed(2) + "e" + exponent;
}

if (saveGame !== null) {
    for (var key in gameData) {
        if (gameData.hasOwnProperty(key)) {
            if (typeof saveGame[key] !== "undefined") {
                gameData[key] = saveGame[key];
            }
        }
    }

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
    }, 50);

    window.setInterval(function() {
        saveGameData();
    }, 15000);
});

function closeOfflinePopup() {
    document.getElementById("offlinePopup").style.display = "none";
}

function hardReset() {
    if (confirm("Are you absolutely sure you want to delete your save file? This cannot be undone!")) {
        localStorage.removeItem("clicksUpSave");
        location.reload();
    }
}