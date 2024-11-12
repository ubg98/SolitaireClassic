//HomeState
var HomeState = {

    tws: [],
    bg: null,
    logo: null,
    buttonPlay: null,
    buttonGames: null,
    buttonStat: null,
    tutorialScreen: null,
    tutorialMode: false,

    //
    shutdown: function()
    {
        this.bg = null;
        this.logo = null;
        this.buttonPlay = null;
        this.buttonGames = null;
        this.buttonStat = null;
        if(this.tutorialScreen)
        {
            this.tutorialScreen.destroy();
            this.tutorialScreen = null;
        }
        this.tws.length = 0;
    },

    create: function()
    {
        if(forcedMode) {
            if(game.state.current == "home") {
                R.sceneTransition(200, 'play');
            }
        }
        
        if(game.skipTitle) {

            window.famobi.onRequest("startGame", function(){
                if(game.state.current == "home") {
                    R.sceneTransition(200, 'play');
                }
            });

            window.famobi.onRequest("enableAudio", function() {
                game.sound.mute = false;
            });

            window.famobi.onRequest("disableAudio", function() {
                game.sound.mute = true;
            });

        }

        window.famobi_analytics.trackScreen("SCREEN_HOME");
        window.famobi_analytics.trackEvent("EVENT_LIVESCORE", {liveScore: 0});

        if(this.tutorialMode)
        {
            this.tutorialScreen = new R.TutorialScreen();
            this.tutorialMode = false;
            R.playerData.isFirstStart = false;
        }
        else
        {
            this.bg = game.add.sprite(0, 0, 'bg_menu');

            this.logo = game.add.sprite(0, 0, 'load', 'logo');
            this.logo.anchor.set(0.5);
            this.logo.alpha = 0;

            //gui
            this.buttonPlay = game.add.button(0, 0, 'load', this.onPlayButton, this, 'play_big_button', 'play_big_button', 'play_big_button_pushed', 'play_big_button');
            this.buttonPlay.anchor.set(0.5);
            this.buttonPlay.scale.set(0.95);
            this.buttonPlay.alpha = 0;
            if(R.sfx.button) this.buttonPlay.setDownSound(R.sfx.button);

            this.buttonGames = game.add.button(0, 0, 'more_games', function(){window.famobi.moreGamesLink()});
            this.buttonGames.anchor.set(0.5);
            this.buttonGames.scale.set(0.4);
            this.buttonGames.alpha = 0;
            if(R.sfx.button) this.buttonGames.setDownSound(R.sfx.button);

            this.buttonStat = game.add.button(0, 0, 'gui', this.onStatButton, this, 'stat_button', 'stat_button', 'stat_button_pushed', 'stat_button');
            this.buttonStat.anchor.set(0.5);
            this.buttonStat.scale.set(0.95);
            this.buttonStat.alpha = 0;
            if(R.sfx.button) this.buttonStat.setDownSound(R.sfx.button);

            //tweens
            this.tws.push(game.add.tween(this.logo).to({ alpha: 1.0 }, 500, Phaser.Easing.Linear.None, false, 0));
            this.tws.push(game.add.tween(this.buttonPlay).to({ alpha: 1.0 }, 500, Phaser.Easing.Linear.None, false, 200));
            this.tws.push(game.add.tween(this.buttonPlay.scale).to({ x: 1.0, y: 1.0 }, 1000, Phaser.Easing.Linear.None, false, 200, -1, true));
            this.tws.push(game.add.tween(this.buttonStat).to({ alpha: 1.0 }, 500, Phaser.Easing.Linear.None, false, 400));
            this.tws.push(game.add.tween(this.buttonGames).to({ alpha: 1.0 }, 500, Phaser.Easing.Linear.None, false, 600));

            //
            this.shakePlayButton();
        }

        this.resize(game.width, game.height);

        if(!game.skipTitle) {
            R.sceneTransition(200, null);
        }
    },

    resize: function(width, height)
    {
        if(this.tutorialScreen)
        {
            this.tutorialScreen.resize(width, height);
            return;
        }

        this.logo.x = R.halfGameWidth;


        if(width > height)
        {
            this.bg.rotation = Math.PI * -0.5;
            this.bg.y = R.BASE_GAME_HEIGHT;
            this.logo.y = 120;
            this.buttonStat.position.set(R.halfGameWidth - 130, R.halfGameHeight + 30);
            this.buttonPlay.position.set(R.halfGameWidth + 130, this.buttonStat.y);
            this.buttonGames.position.set(R.halfGameWidth, height - 100);
        }
        else
        {
            this.bg.rotation = 0;
            this.bg.y = 0;
            this.logo.y = (R.halfGameHeight - 100) * 0.5;
            this.buttonPlay.position.set(R.halfGameWidth, R.halfGameHeight - 30);
            this.buttonGames.position.set(R.halfGameWidth, height - 75);
            this.buttonStat.position.set(R.halfGameWidth, this.buttonPlay.y + (this.buttonGames.y - this.buttonPlay.y) * 0.57);
        }
    },

    start: function()
    {
        for(var i in this.tws) this.tws[i].start();
    },

    shakePlayButton: function()
    {
        this.buttonPlay.rotation = 0;

        game.time.events.add(3000, function()
        {
            this.buttonPlay.rotation = -0.05;
            var tween = game.add.tween(this.buttonPlay).to({ rotation: 0.05 }, 50, Phaser.Easing.Linear.None, true, 0, 8, true);
            tween.onComplete.add(this.shakePlayButton, this);
        }, this);
    },

    onPlayButton: function()
    {
        let _this = this;
        window.famobi_analytics.trackEvent("EVENT_LEVELSTART", {levelName: ""}).then(function() {
            _this.buttonPlay.inputEnabled = false;
            _this.buttonStat.inputEnabled = false;

            if(false && R.playerData.isFirstStart)
            {
                _this.tutorialMode = true;
                R.sceneTransition(200, 'home');
            }
            else R.sceneTransition(200, 'play');
        });
    },

    onCloseTutotial: function()
    {
        R.sceneTransition(200, 'play');
    },

    onStatButton: function()
    {
        this.buttonPlay.inputEnabled = false;
        this.buttonStat.inputEnabled = false;
        R.sceneTransition(200, 'statistics');
    }
};
