//
var BootState = {

    //
    init: function()
    {
        initForcedMode(false);
        
        window.famobi_analytics.trackScreen("SCREEN_SPLASH");

        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.forceOrientation(false, false);
        game.scale.onSizeChange.add(this.onSizeChange, this);
        game.scale.setResizeCallback(this.onResize, this);
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        // if(game.device.desktop && game.renderType === Phaser.WEBGL) game.canvas.style.boxShadow = "0 0 30px black";
        document.getElementsByTagName('body')[0].style.backgroundImage = "url(assets/dtile.png)";

        game.input.maxPointers = 1;
        game.stage.disableVisibilityChange = true;
        
        var hidden, visibilityChange, hasFocus;

        if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        } else if (typeof document.mozHidden !== "undefined") {
            hidden = "mozHidden";
            visibilityChange = "mozvisibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
        }

        document.addEventListener(visibilityChange, () => {
            if(PlayState && PlayState.labelTime) {
                PlayState.labelTime.pause(document[hidden]);
            }

            setTimeout(() => {
                game.sound.context.resume();
            }, 50);
        }, false);

        this.additionalAudioCheck();

        this.resizeGame();
    },

    preload: function()
    {
        game.load.atlas('load', 'assets/atlas_load.png', 'assets/atlas_load.json');
    },

    //
    create: function()
    {
        game.state.add('load', LoadState);
        game.state.add('home', HomeState);
        game.state.add('statistics', StatisticsState);
        game.state.add('play', PlayState);
        game.state.start('load');
    },

    onResize: function()
    {
        var ww = window.innerWidth;
        var wh = window.innerHeight;

        if(R.prevWindowWidth != ww || R.prevWindowHeight != wh) this.onSizeChange();

        var gameContainer = document.getElementById(game.parent);
        gameContainer.style.width = ww + "px";
        gameContainer.style.height = wh + "px";
        gameContainer.style.display = "block";
    },

    onSizeChange: function()
    {
        this.resizeGame();
        game.state.resize(R.gameWidth, R.gameHeight);
    },

    resizeGame: function()
    {
        var ww = window.innerWidth;
        var wh = window.innerHeight;

        R.prevWindowWidth = ww;
        R.prevWindowHeight = wh;

        if(ww > wh)
        {
            R.gameHeight = R.BASE_GAME_HEIGHT;
            R.gameWidth = R.gameHeight / wh * ww;

            if(R.gameWidth > R.MAX_GAME_WIDTH) R.gameWidth = R.MAX_GAME_WIDTH;
            else if(R.gameWidth < R.MIN_GAME_WIDTH) R.gameWidth = R.MIN_GAME_WIDTH;
        }
        else
        {
            R.gameWidth = R.BASE_GAME_HEIGHT;
            R.gameHeight = R.gameWidth / ww * wh;

            if(R.gameHeight > R.MAX_GAME_WIDTH) R.gameHeight = R.MAX_GAME_WIDTH;
            else if(R.gameHeight < R.MIN_GAME_HEIGHT) R.gameHeight = R.MIN_GAME_HEIGHT;
        }

        R.halfGameWidth = R.gameWidth * 0.5;
        R.halfGameHeight = R.gameHeight * 0.5;

        game.scale.setGameSize(R.gameWidth, R.gameHeight);
    },

    additionalAudioCheck: function()
    {
        //second check sound
        /*
            Sharp = SH-01F
            Fujitsu = F-01F
            Xperia A = SO-04E
            Sharp Mini = SHL24
            */

        function isStock()
        {
            var matches = window.navigator.userAgent.match(/Android.*AppleWebKit\/([\d.]+)/);
            return matches && matches[1] < 537;
        }

        var ua = navigator.userAgent; // Returns a string which tells you what device you're using
        var isSharpStock = ((/SHL24|SH-01F/i).test(ua)) && isStock(); // Checks if device is, Sharp(SH-01F) or Sharp Mini(SHL24)
        var isXperiaAStock = ((/SO-04E/i).test(ua)) && isStock(); // Checks if device is, Xperia A(SO-04E)
        var isFujitsuStock = ((/F-01F/i).test(ua)) && isStock(); // Checks if device is, Fujitsu(F-01F)

        if(isSharpStock || isXperiaAStock || isFujitsuStock) game.device.webAudio = false;
    }
};
