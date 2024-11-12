//
var LoadState = {

    loadText: null,
    logo: null,
    loading: null,
    loadingBar: null,

    //
    init: function()
    {
        game.load.onFileComplete.add(this.fileComplete, this);
        game.load.onLoadComplete.add(this.loadComplete, this);
        //game.stage.disableVisibilityChange = true;
    },

    //
    create: function()
    {
        game.load.json('strings', 'assets/strings.json');
        game.load.image('more_games', window.famobi.getMoreGamesButtonImage());
        game.load.image('bg_menu', 'assets/'+(window.famobi_theme ? window.famobi_theme : '')+'bg/bg_menu.png');
        game.load.image('bg_main', 'assets/'+(window.famobi_theme ? window.famobi_theme : '')+'bg/bg_main.png');
        game.load.image('bg_options', 'assets/'+(window.famobi_theme ? window.famobi_theme : '')+'bg/bg_options.png');
        game.load.atlas('gui', 'assets/'+(window.famobi_theme ? window.famobi_theme : '')+'atlas_gui.png', 'assets/atlas_gui.json');
        game.load.image('card_skin1', 'assets/'+(window.famobi_theme ? window.famobi_theme : '')+'skin/card_skin1.png');
        game.load.image('tutorial1', 'assets/tutorial1.png');
        game.load.image('tutorial2', 'assets/tutorial2.png');

        for(var s in R.suits)
        {
            for(var v in R.values)
            {
                var name = R.values[v] + R.suits[s];
                game.load.image(name, 'assets/'+(window.famobi_theme ? window.famobi_theme : '')+'deck/' + name + '.png');
            }
        }

        if(game.device.webAudio)
        {
            var sfx_key = ['error', 'card', 'pick_card', 'place_card', 'card_to_base', 'button', 'win', 'new_game'];
            for(var i in sfx_key) game.load.audio(sfx_key[i], ['assets/sfx/' + sfx_key[i] + '.mp3', 'assets/sfx/' + sfx_key[i] + '.ogg']);
        }

        this.createEnvironment();

        //
        game.load.start();
    },

    shutdown: function()
    {
        this.loadText = null;
        this.logo = null;
        this.loading = null;
        this.loadingBar = null;
    },

    createEnvironment: function()
    {
        game.stage.backgroundColor = '#004b03';

        this.logo = game.add.sprite(0, 0, 'load', 'logo');
        this.logo.anchor.set(0.5);

        this.loading = game.add.sprite(0, 0, 'load', 'loading');
        this.loading.anchor.set(0.5);

        this.loadingBar = game.add.sprite(0, 0, 'load', 'loading-bar');
        var cropRect = new Phaser.Rectangle(0, 0, 0, 32);
        this.loadingBar.crop(cropRect);

        this.loadText = game.add.text(0, 0, '', { fill: '#00b800' });
        this.loadText.font = R.fontName;
        this.loadText.fontSize = 28;
        this.loadText.anchor.set(0.5);
        this.loadText.align = 'center';

        this.resize(game.width, game.height);
    },

    resize: function(width, height)
    {
        this.logo.x = R.halfGameWidth;
        this.logo.y = R.halfGameHeight - 100;

        this.loading.x = R.halfGameWidth;
        this.loading.y = R.halfGameHeight + 150;

        this.loadingBar.x = this.loading.x - 227;
        this.loadingBar.y = this.loading.y - 13;

        this.loadText.x = R.halfGameWidth;
        this.loadText.y = this.loading.y + 4;
    },

    //
    fileComplete: function(progress, cacheKey, success, totalLoaded, totalFiles)
    {
        this.loadingBar.cropRect.width = 456 * progress * 0.01;
        this.loadingBar.updateCrop();
        window.famobi.setPreloadProgress(progress);
        this.loadText.setText(progress.toString() + '%');
    },

    //
    loadComplete: function()
    {
        //sfx
        if(game.device.webAudio)
        {
            R.sfx.button = game.add.audio('button');
            R.sfx.new_game = game.add.audio('new_game');
            R.sfx.win = game.add.audio('win');
            R.sfx.error = game.add.audio('error');
            R.sfx.card_to_base = game.add.audio('card_to_base');
            R.sfx.place_card = game.add.audio('place_card');
            R.sfx.pick_card = game.add.audio('pick_card');
            R.sfx.card = game.add.audio('card');
        }

        //strings and language
        var currLanguage = window.navigator.language;
        currLanguage = currLanguage ? currLanguage : window.navigator.browserLanguage;
        currLanguage = currLanguage ? currLanguage.split("-")[0] : 'en';
        var stringsJson = game.cache.getJSON('strings');

        R.language = currLanguage in stringsJson ? currLanguage : 'en';
        R.strings = stringsJson['en'];

        var help = null;
        for(var key in R.strings){
            help = window.famobi.__(key);
            if(help){
                R.strings[key] = help;
            }
        }

        if(window.famobi.localStorage.getItem("muted")){
            game.sound.mute = true;
        }

        if(typeof window.famobi.gamesnacks_audio == "undefined" || window.famobi.gamesnacks_audio.isEnabled()){
            game.sound.mute = false;
        }
        else{
            game.sound.mute = true;
        }

        if(famobi != null && window.famobi.getVolume != null && typeof(window.famobi.getVolume) == "function"){
            game.sound.volume = window.famobi.getVolume();
        }

        window.famobi.onRequest("changeVolume", function(vol) {
            game.sound.volume = window.famobi.getVolume();
        });

        //start
        R.loadGame();
        R.sceneTransition(200, 'home');
        window.famobi.gameReady();
    }
};
