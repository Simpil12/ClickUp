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
    rebootMenuUnlocked: false,
    robotLevel: 0,
    robotCost: 150,
    robotCPSContribution: 5,
    reboots: 0,
    rebootCost: 10000000,
    rebootMultiplier: 1,
    totalMultiplier: 1,
    effectiveCPS: 0,
    effectiveCPC: 0,
}

var defaultGameData = {
    clicks: 0,
    clicksPerSecond: 0,
    clicksPerClick: 1,
    clicksPerClickCost: 5,
    clicksUpgradeCost: 10,
    clicksUpgradeLevel: 0,
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
    update("buyRobots", "Buy Robots (Owned: " + format(gameData.clicksUpgradeLevel, "scientific") + ")<br>[Generates 5 CPS Each]<br>Cost: " + format(gameData.clicksUpgradeCost, "scientific") + " Clicks");
    update("cpsDisplay", format(gameData.effectiveCPS, "scientific") + " Clicks/Sec");
    update("cpcDisplay", format(gameData.effectiveCPC, "scientific") + " Clicks/Click");
    update("robotUpgrade", "Overclock Robots (Level " + format(gameData.robotLevel, "scientific") + ")<br>[Doubles Robot Power]<br>Cost: " + format(gameData.robotCost, "scientific") + " Clicks");
    update("buyRebirth", "Conduct Reboot " + format(gameData.reboots + 1, "scientific") + "<br> [Multiplies Previous Stats At Cost Of Resetting Everything]<br>Cost:" + format(gameData.rebootCost, "scientific") + " Clicks");

    var rebirthTab = document.getElementById("rebirthTab");
    var rebirthButton = document.getElementById("buyRebirth");
    if (rebirthTab && rebirthButton) {
        var rebirthUnlocked = gameData.rebootMenuUnlocked === true;
        rebirthTab.style.display = rebirthUnlocked ? "inline-block" : "none";
        rebirthButton.style.display = rebirthUnlocked ? "flex" : "none";
    }

    var unlockBtn = document.getElementById("unlockAutomationBtn");
    var upgradeBtn = document.getElementById("buyRobots");

    if (unlockBtn && upgradeBtn) {
        var robotBtn = document.getElementById("robotUpgrade");

        if (gameData.automationUnlocked === false) {
            unlockBtn.classList.remove("btn-disabled");
            unlockBtn.innerHTML = "Unlock Automation - Cost: 50 Clicks";
            unlockBtn.style.display = "inline-block";
            
            upgradeBtn.style.display = "none";
            document.getElementById('automationMenu').style.display = 'none';
            if (robotBtn) robotBtn.style.display = "none";

            handleButtonState("unlockAutomationBtn", 50);
        } else {
            unlockBtn.classList.add("btn-disabled");
            unlockBtn.innerHTML = "Unlock Automation - Bought";
            unlockBtn.style.display = "inline-block";
            
            upgradeBtn.style.display = "inline-block";
            document.getElementById('automationMenu').style.display = 'inline-block';
            if (robotBtn) robotBtn.style.display = "inline-block";
            
            handleButtonState("buyRobots", gameData.clicksUpgradeCost);
            handleButtonState("robotUpgrade", gameData.robotCost);
        }
    }

    handleButtonState("perClickUpgrade", gameData.clicksPerClickCost);
}

function recalculateMulti() {
    gameData.rebootMultiplier = 1 + Math.sqrt(gameData.reboots);
    gameData.totalMultiplier = gameData.rebootMultiplier;
    calculateCPC();
    calculateCPS();
    updateUI();
}

function addClicks(amount) {
    gameData.clicks += amount * gameData.totalMultiplier;
    updateUI();
}

function calculateCPS() {
    gameData.effectiveCPS = gameData.clicksPerSecond * gameData.totalMultiplier;
}

function calculateCPC() {
    gameData.effectiveCPC = gameData.clicksPerClick * gameData.totalMultiplier;
}

function clicksUp(event) {
    addClicks(gameData.clicksPerClick)

    if (event && event.clientX && event.clientY) {
        createClickParticle(event.clientX, event.clientY, "+" + format(gameData.effectiveCPC, "scientific"));
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

function baseCPS() {
    var robotPowerMultiplier = Math.pow(2, gameData.robotLevel); 
    var baseCPS = gameData.clicksUpgradeLevel * gameData.robotCPSContribution * robotPowerMultiplier;

    if (baseCPS > 1000000) {
        gameData.clicksPerSecond = 1000000 + Math.sqrt(baseCPS - 1000000);
    } else {
        gameData.clicksPerSecond = baseCPS;
    }
    calculateCPS();
}

function buyClicksPerClick() {
    var nextCost = Math.floor(5 * Math.pow(1.5, gameData.clicksPerClick - 1));

    if (gameData.clicks >= nextCost) {
        gameData.clicks -= nextCost;
        gameData.clicksPerClick += 1;

        gameData.clicksPerClickCost = Math.floor(5 * Math.pow(1.5, gameData.clicksPerClick - 1));
        
        calculateCPC();
        updateUI();
        saveGameData();
    }
}

function buyClicksUpgrade() {
    if (gameData.clicks >= gameData.clicksUpgradeCost) {
        gameData.clicks -= gameData.clicksUpgradeCost;
        gameData.clicksUpgradeLevel += 1;

        gameData.clicksUpgradeCost = Math.floor(10 * Math.pow(1.15, gameData.clicksUpgradeLevel));

        baseCPS(); 
        updateUI();
        saveGameData();
    }
}

function buyAutoRobot() {
    if (gameData.clicks >= gameData.robotCost) {
        gameData.clicks -= gameData.robotCost;
        gameData.robotLevel += 1;

        gameData.robotCost = Math.floor(150 * Math.pow(1.5, gameData.robotLevel));

        baseCPS();
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

function reboot() {
    var rebootCost = 10000000 * Math.pow(1.5, gameData.reboots);
    gameData.rebootCost = rebootCost;

    if (gameData.clicks < rebootCost) return;

    for (var key in defaultGameData) {
        gameData[key] = defaultGameData[key];
    }
    gameData.reboots += 1;

    recalculateMulti();
    saveGameData();
    updateUI();
}

function rebootUnlock() {
    if (gameData.rebootMenuUnlocked === true) return;

    if (gameData.clicks >= 1000000) {
        gameData.rebootMenuUnlocked = true;
        saveGameData();
        updateUI();
    }
}

function tab(tabId) {
    var clickMenu = document.getElementById("clickMenu");
    var upgradeMenu = document.getElementById("upgradeMenu");
    var rebirthMenu = document.getElementById("rebirthMenu");
    var unlocksMenu = document.getElementById("unlocksTab");
    var targetTab = document.getElementById(tabId);

    if (clickMenu) clickMenu.style.display = "none";
    if (upgradeMenu) upgradeMenu.style.display = "none";
    if (rebirthMenu) rebirthMenu.style.display = "none";

    if (targetTab) {
        targetTab.style.display = "flex"; 
    }

    if (unlocksMenu) {
        if (tabId === 'clickMenu') {
            unlocksMenu.style.display = "inline-block";
        } else {
            unlocksMenu.style.display = "none";
        }
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

    baseCPS();
    recalculateMulti();

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
        
        addClicks(gameData.clicksPerSecond * (diff / 1000));
        rebootUnlock();
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
        baseCPS();
        gameData.automationUnlocked = false;
        window.location.href = window.location.pathname;
    }
}

window.addEventListener('beforeunload', () => {
    saveGameData();
});