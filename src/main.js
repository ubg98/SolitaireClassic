var R = R || {};

R.BASE_GAME_WIDTH = 1138;
R.BASE_GAME_HEIGHT = 640;

R.MAX_GAME_WIDTH = 1138;
R.MIN_GAME_WIDTH = 830;
R.MIN_GAME_HEIGHT = 780;

//
R.gameWidth = R.BASE_GAME_WIDTH;
R.gameHeight = R.BASE_GAME_HEIGHT;
R.halfGameWidth = R.gameWidth * 0.5;
R.halfGameHeight = R.gameHeight * 0.5;

R.prevWindowWidth = 0;
R.prevWindowHeight = 0;

//
R.fontName = 'Helvetica';

R.language = 'en';

R.strings = null;

R.sfx = {};

R.playerData = {

    isFirstStart: true,

    gamesWon1: 0,
    gamesPlayed1: 0,
    bestScore1: 0,
    leastMoves1: 0,
    bestTime1: 0,
    totalTime1: 0,

    gamesWon3: 0,
    gamesPlayed3: 0,
    bestScore3: 0,
    leastMoves3: 0,
    bestTime3: 0,
    totalTime3: 0
};

R.trackableStats = {
    cards_placed: 0,
    cards_drawn: 0,
    moves_reversed: 0,
    moves_total: 0,
    games_won: 0,
    score_total: 0
};

R.saveGame = function()
{
    if(window.famobi.localStorage) window.famobi.localStorage.setItem('SolitaireClassicSaveSata', JSON.stringify(R.playerData));
};

R.loadGame = function()
{
    if(window.famobi.localStorage)
    {
        var saveData = window.famobi.localStorage.getItem('SolitaireClassicSaveSata');
        if(saveData) R.playerData = JSON.parse(saveData);
    }
};

//
var game = null;

window.famobi_onload = function()
{
    var renderType = Phaser.AUTO;
    var ua = detect.parse(window.navigator.userAgent);
    if(ua.device.family == 'SM-T110' || ua.device.family == 'SM-T111') renderType = Phaser.CANVAS;

    game = new Phaser.Game(R.BASE_GAME_WIDTH, R.BASE_GAME_HEIGHT, renderType, 'gameContainer', BootState);
    game.skipTitle = window.famobi.hasFeature("skip_title");
    // game.skipTitle = true;
};
