var rawSave = localStorage.getItem("clicksUpSave");
var saveGame = rawSave !== null ? JSON.parse(rawSave) : null;

var gameData = {
    clicks: 0,
    clicksPerClick: 1,
    clicksPerClickCost: 10,
    lastTick: Date.now()
}

function update(id, content) {
  document.getElementById(id).innerHTML = content;
}

function updateUI() {
    update("clicksUp", format(gameData.clicks, "scientific") + " Times Clicked");
    update("perClickUpgrade", "Upgrade Clicks Per Click (Currently Level " + format(gameData.clicksPerClick, "scientific") + ") Cost: " + format(gameData.clicksPerClickCost, "scientific") + " Clicks");
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
        updateUI()
    }
}

function tab(tab) {
    document.getElementById("clickMenu").style.display = "none";
    document.getElementById("upgradeMenu").style.display = "none";
    document.getElementById(tab).style.display = "inline-block";
}

tab("clickMenu")

var mainGameLoop = window.setInterval(function() {
    diff = Date.now() - gameData.lastTick;
    gameData.lastTick = Date.now();
    gameData.clicks += gameData.clicksPerClick * (diff / 1000);
    updateUI()
}, 1000)

var saveGameLoop = window.setInterval(function() {
    localStorage.setItem("clicksUpSave", JSON.stringify(gameData))
}, 15000)

function format(number, type) {
	let exponent = Math.floor(Math.log10(number))
	let mantissa = number / Math.pow(10, exponent)
	if (exponent < 3) return number.toFixed(1)
	if (type == "scientific") return mantissa.toFixed(2) + "e" + exponent
	if (type == "engineering") return (Math.pow(10, exponent % 3) * mantissa).toFixed(2) + "e" + (Math.floor(exponent / 3) * 3)
}

if (saveGame !== null) {
    if (typeof saveGame.clicks !== "undefined") gameData.clicks = saveGame.clicks;
    if (typeof saveGame.clicksPerClick !== "undefined") gameData.clicksPerClick = saveGame.clicksPerClick;
    if (typeof saveGame.clicksPerClickCost !== "undefined") gameData.clicksPerClickCost = saveGame.clicksPerClickCost;
    if (typeof saveGame.lastTick !== "undefined") gameData.lastTick = saveGame.lastTick;
}

updateUI()