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
    automationUnlocked: false,
    robotLevel: 0,
    robotCost: 150,
    robotCPSContribution: 5
}

var isResetting = false;

function update(id, content) {
    var el = document.getElementById(id);
    if (el) {
        el.innerHTML = content;
    }
}

function saveGameData() {
    if (isResetting === true) return;
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
    update("buyRobots", "Buy Robots (Owned: " + format(gameData.clicksUpgradeLevel, "scientific") + ")<br>[Generates +5 Base CPS Each]<br>Cost: " + format(gameData.clicksUpgradeCost, "scientific") + " Clicks");

    update("cpsDisplay", format(gameData.clicksPerSecond, "scientific") + " Clicks/Sec");
    update("cpcDisplay", format(gameData.clicksPerClick, "scientific") + " Clicks/Click");
    
    update("robotUpgrade", "Overclock Robots (Level " + format(gameData.robotLevel, "scientific") + ")<br>[Doubles Robot Power]<br>Cost: " + format(gameData.robotCost, "scientific") + " Clicks");
    
    var unlockBtn = document.getElementById("unlockAutomationBtn");
    var upgradeBtn = document.getElementById("buyRobots");

    if (unlockBtn && upgradeBtn) {
        var robotBtn = document.getElementById("robotUpgrade");

        if (gameData.automationUnlocked === false) {
            unlockBtn.classList.remove("btn-disabled");
            unlockBtn.innerHTML = "Unlock Automation - Cost: 50 Clicks";
            unlockBtn.style.display = "inline-block";
            
            upgradeBtn.style.display = "none";
            if (robotBtn) robotBtn.style.display = "none";

            handleButtonState("unlockAutomationBtn", 50);
        } else {
            unlockBtn.classList.add("btn-disabled");
            unlockBtn.innerHTML = "Unlock Automation - Bought";
            unlockBtn.style.display = "inline-block";
            
            upgradeBtn.style.display = "inline-block";
            if (robotBtn) robotBtn.style.display = "inline-block";
            
            handleButtonState("buyRobots", gameData.clicksUpgradeCost);
            handleButtonState("robotUpgrade", gameData.robotCost);
        }
    }

    handleButtonState("perClickUpgrade", gameData.clicksPerClickCost);
}

function clicksUp(event) {
    gameData.clicks += gameData.clicksPerClick;
    updateUI();

    if (event && event.clientX && event.clientY) {
        createClickParticle(event.clientX, event.clientY, "+" + format(gameData.clicksPerClick, "scientific"));
    }
}

function createClickParticle(x, y, textValue) {
    var particle = document.createElement("div");
    particle.className = "click-particle";
    particle.innerText = textValue;

    particle.style.left = (x - 10) + "px";
    particle.style.top = (y - 20) + "px";

    document.body.appendChild(particle);

    setTimeout(function() {
        particle.remove();
    }, 800);
}

function recalculateCPS() {
    var robotPowerMultiplier = Math.pow(2, gameData.robotLevel); 
    var baseCPS = gameData.clicksUpgradeLevel * gameData.robotCPSContribution * robotPowerMultiplier;

    if (baseCPS > 1000000) {
        gameData.clicksPerSecond = 1000000 + Math.sqrt(baseCPS - 1000000);
    } else {
        gameData.clicksPerSecond = baseCPS;
    }
}

function buyClicksPerClick() {
    var nextCost = Math.floor(5 * Math.pow(1.5, gameData.clicksPerClick - 1));

    if (gameData.clicks >= nextCost) {
        gameData.clicks -= nextCost;
        gameData.clicksPerClick += 1;

        gameData.clicksPerClickCost = Math.floor(5 * Math.pow(1.5, gameData.clicksPerClick - 1));
        
        updateUI();
        saveGameData();
    }
}

function buyClicksUpgrade() {
    if (gameData.clicks >= gameData.clicksUpgradeCost) {
        gameData.clicks -= gameData.clicksUpgradeCost;
        gameData.clicksUpgradeLevel += 1;

        gameData.clicksUpgradeCost = Math.floor(10 * Math.pow(1.15, gameData.clicksUpgradeLevel));

        recalculateCPS(); 
        updateUI();
        saveGameData();
    }
}

function buyAutoRobot() {
    if (gameData.clicks >= gameData.robotCost) {
        gameData.clicks -= gameData.robotCost;
        gameData.robotLevel += 1;

        gameData.robotCost = Math.floor(150 * Math.pow(1.5, gameData.robotLevel));

        recalculateCPS();
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

    if (targetTab) {
        targetTab.style.display = "flex"; 
    }
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

    if (gameData.automationUnlocked === "false") gameData.automationUnlocked = false;
    if (gameData.automationUnlocked === "true") gameData.automationUnlocked = true;

    gameData.clicksPerClickCost = Math.floor(5 * Math.pow(1.5, gameData.clicksPerClick - 1));
    gameData.clicksUpgradeCost = Math.floor(10 * Math.pow(1.15, gameData.clicksUpgradeLevel));
    gameData.robotCost = Math.floor(150 * Math.pow(1.5, gameData.robotLevel));
    
    recalculateCPS();

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
        isResetting = true;

        localStorage.removeItem("clicksUpSave");
        
        gameData.clicks = 0;
        gameData.clicksPerSecond = 0;
        gameData.clicksPerClick = 1;
        gameData.clicksUpgradeLevel = 0;
        gameData.robotLevel = 0;
        recalculateCPS();
        gameData.automationUnlocked = false;
        window.location.href = window.location.pathname;
    }
}

window.addEventListener('beforeunload', () => {
    saveGameData();
});