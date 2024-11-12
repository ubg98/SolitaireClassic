var R = R || {};

window.famobi_onMuteRequested = function(){
    game.sound.mute = true;
    window.famobi_analytics.trackEvent("EVENT_VOLUMECHANGE", {bgmVolume: game.sound.mute ? 0 : 1, sfxVolume: game.sound.mute ? 0 : 1});

    window.famobi.localStorage.setItem("muted", true);
    console.log(game.sound.mute);

};

window.famobi_onUnmuteRequested = function(){
    game.sound.mute = false;
    window.famobi_analytics.trackEvent("EVENT_VOLUMECHANGE", {bgmVolume: game.sound.mute ? 0 : 1, sfxVolume: game.sound.mute ? 0 : 1});

    window.famobi.localStorage.removeItem("muted");
    console.log(game.sound.mute);
};


//GUI
R.createText = function(x, y, size, text, fill, isStroke, strokeThicknes, isWrap)
{
    var label = game.add.text(x, y, text);
    label.font = R.fontName;
    label.anchor.set(1.0, 0.5);
    label.align = 'right';
    label.fontSize = size;
    label.fill = fill;
    label.fontWeight = '100';
    if(isStroke)
    {
        label.stroke = '#000000';
        label.strokeThickness = strokeThicknes;
    }
    if(isWrap)
    {
        label.wordWrap = true;
        label.wordWrapWidth = game.width;
    }
    return label;
};

//SoundButton
R.SoundButton = function(x, y, frameOn, frameOff)
{
    Phaser.Button.call(this, game, x, y, 'gui', this.onClick, this, frameOn, frameOn, 'sound_button_pushed', frameOn);

    this.anchor.set(0.5);

    this.frameOn = frameOn;
    this.frameOff = frameOff;

    this.checkFrame();

    if(R.sfx.button) this.setDownSound(R.sfx.button);

    this.exists = game.device.webAudio;
};

R.SoundButton.prototype = Object.create(Phaser.Button.prototype);
R.SoundButton.prototype.constructor = R.SoundButton;

R.SoundButton.prototype.checkFrame = function()
{
    var frame = game.sound.mute ? this.frameOff : this.frameOn;
    this.setFrames(frame, frame, 'sound_button_pushed', frame);

};

R.SoundButton.prototype.onClick = function()
{
    game.sound.mute = !game.sound.mute;
    window.famobi_analytics.trackEvent("EVENT_VOLUMECHANGE", {bgmVolume: game.sound.mute ? 0 : 1, sfxVolume: game.sound.mute ? 0 : 1});

    if(game.sound.mute){
        window.famobi.localStorage.setItem("muted", true);
    }else{
        window.famobi.localStorage.removeItem("muted", true);
    }
    this.checkFrame();
};

//OptionsScreen
R.OptionsScreen = function()
{
    Phaser.Sprite.call(this, game, 0, 0, null);

    this.bg = game.add.sprite(0, 0, 'bg_options');
    this.bg.anchor.set(0.5);
    this.addChild(this.bg);

    this.optionsIcon = game.add.sprite(0, 0, 'gui', 'options_icon');
    this.optionsIcon.anchor.set(0.5);
    this.addChild(this.optionsIcon);

    var layoutButton = game.add.button(0, 0, 'gui', this.onLayoutButton, this, 'hand_right_button', 'hand_right_button', 'hand_button_pushed', 'hand_right_button');
    layoutButton.anchor.set(0.5);
    if(R.sfx.button) layoutButton.setDownSound(R.sfx.button);
    this.addChild(layoutButton);
    this.layoutButton = layoutButton;

    if(!forcedMode){
        var modeButton = game.add.button(0, 0, 'gui', this.onModeButton, this, 'mode1_button', 'mode1_button', 'mode_button_pushed', 'mode1_button');
        modeButton.anchor.set(0.5);
        if(R.sfx.button) modeButton.setDownSound(R.sfx.button);
        this.addChild(modeButton);
        this.modeButton = modeButton;
    }
    
    if(typeof window.famobi.gamesnacks_audio == "undefined" || window.famobi.gamesnacks_audio.hasControls()){
        if(!window.famobi.hasFeature("external_mute")){
            this.soundButton = new R.SoundButton(0, 0, 'sound_button_on', 'sound_button_off');
            this.addChild(this.soundButton);
        }
        
    }

    var homeButton = (game.skipTitle || forcedMode) ? game.add.button(0, 0, 'gui', this.onTutorialButton, this, 'tutorial_button', 'tutorial_button', 'tutorial_button_pushed', 'tutorial_button') : game.add.button(0, 0, 'gui', this.onHomeButton, this, 'home_button', 'home_button', 'home_button_pushed', 'home_button');

    homeButton.anchor.set(0.5);
    if(R.sfx.button) homeButton.setDownSound(R.sfx.button);
    this.addChild(homeButton);
    this.homeButton = homeButton;

    if(!forcedMode){
        var restartButton = game.add.button(0, 0, 'gui', this.onRestartButton, this, 'replay_button', 'replay_button', 'replay_button_pushed', 'replay_button');
        restartButton.anchor.set(0.5);
        if(R.sfx.button) restartButton.setDownSound(R.sfx.button);
        this.addChild(restartButton);
        this.restartButton = restartButton;
    }

    var continueButton = game.add.button(0, 0, 'gui', this.onContinueButton, this, 'continue_button', 'continue_button', 'continue_button_pushed', 'continue_button');
    continueButton.anchor.set(0.5);
    if(R.sfx.button) continueButton.setDownSound(R.sfx.button);
    this.addChild(continueButton);
    this.continueButton = continueButton;

    var tutorialButton = game.add.button(0, 0, 'gui', this.onTutorialButton, this, 'tutorial_button', 'tutorial_button', 'tutorial_button_pushed', 'tutorial_button');
    tutorialButton.anchor.set(0.5);
    if(R.sfx.button) tutorialButton.setDownSound(R.sfx.button);
    this.addChild(tutorialButton);
    this.tutorialButton = tutorialButton;

    if(game.skipTitle || forcedMode) {
        homeButton.scale.set(1.7);
        tutorialButton.visible = false;
    }

    this.label = R.createText(0, 0, 30, R.strings.restart_warning, '#ffffff', false, 0, true);
    this.label.anchor.set(0.5);
    this.label.align = 'center';
    this.addChild(this.label);
    this.label.visible = false;

    this.tutorialScreen = null;
    this.modeBefore = 0;

    this.exists = false;

    window.famobi.onRequest("resumeGameplay", function() {
        if(this.exists) {
            this.onContinueButton();
        }
    }.bind(this));
};

R.OptionsScreen.prototype = Object.create(Phaser.Sprite.prototype);
R.OptionsScreen.prototype.constructor = R.OptionsScreen;

R.OptionsScreen.prototype.resize = function(width, height)
{
    this.bg.position.set(width * 0.5, height * 0.5);
    this.optionsIcon.x = this.bg.x;


    if(width > height)
    {
        let xoffset = width*0.075;

        this.bg.rotation = Math.PI * 0.5;

        this.optionsIcon.y = height*0.25;
        this.optionsIcon.x = R.halfGameWidth - width*0.2 - xoffset;

        this.tutorialButton.position.set(R.halfGameWidth - width*0.2 - xoffset, height*0.5);

        this.layoutButton.position.set(R.halfGameWidth - width*0.2 + xoffset, height*0.25);
        if(this.modeButton != null){
            this.modeButton.position.set(R.halfGameWidth + xoffset, height*0.25 );
        }
        if(this.soundButton != null){
            this.soundButton.position.set(R.halfGameWidth + width*0.2 + xoffset, height*0.25);
        }
        this.homeButton.position.set(R.halfGameWidth - width*0.2 + xoffset, height*0.5);
        if(this.restartButton != null){
            this.restartButton.position.set(R.halfGameWidth + xoffset, height*0.5);
        }
        
        this.continueButton.position.set(R.halfGameWidth + width*0.2 + xoffset, height*0.5);
    }
    else
    {
        this.bg.rotation = 0;
        this.optionsIcon.y = this.bg.y - 320;
        this.layoutButton.position.set(R.halfGameWidth - 150, R.halfGameHeight - 130);
        if(this.modeButton != null){
            this.modeButton.position.set(R.halfGameWidth + 150, R.halfGameHeight - 130);
        }
        if(this.soundButton != null){
            this.soundButton.position.set(R.halfGameWidth - 150, R.halfGameHeight + 60);
        }
        this.homeButton.position.set(R.halfGameWidth + 150, R.halfGameHeight + 60);
        if(this.restartButton != null){
            this.restartButton.position.set(R.halfGameWidth - 150, R.halfGameHeight + 250);
        }
        this.continueButton.position.set(R.halfGameWidth + 150, R.halfGameHeight + 250);
        this.tutorialButton.position.set(R.halfGameWidth + 178, R.halfGameHeight - 290);
    }
    /*
if(width > height)
    {
        this.bg.rotation = Math.PI * 0.5;
        this.optionsIcon.y = 90;
        this.layoutButton.position.set(R.halfGameWidth - 238, R.halfGameHeight - 50);
        this.modeButton.position.set(R.halfGameWidth, R.halfGameHeight - 50);
        if(this.soundButton != null){
            this.soundButton.position.set(R.halfGameWidth + 238, R.halfGameHeight - 50);
        }
        this.homeButton.position.set(R.halfGameWidth - 238, R.halfGameHeight + 135);
        this.restartButton.position.set(R.halfGameWidth, R.halfGameHeight + 135);
        this.continueButton.position.set(R.halfGameWidth + 238, R.halfGameHeight + 135);
        this.tutorialButton.position.set(R.halfGameWidth + 268, R.halfGameHeight - 205);
    }
    else
    {
        this.bg.rotation = 0;
        this.optionsIcon.y = this.bg.y - 320;
        this.layoutButton.position.set(R.halfGameWidth - 150, R.halfGameHeight - 130);
        this.modeButton.position.set(R.halfGameWidth + 150, R.halfGameHeight - 130);
        if(this.soundButton != null){
            this.soundButton.position.set(R.halfGameWidth - 150, R.halfGameHeight + 60);
        }
        this.homeButton.position.set(R.halfGameWidth + 150, R.halfGameHeight + 60);
        this.restartButton.position.set(R.halfGameWidth - 150, R.halfGameHeight + 250);
        this.continueButton.position.set(R.halfGameWidth + 150, R.halfGameHeight + 250);
        this.tutorialButton.position.set(R.halfGameWidth + 178, R.halfGameHeight - 290);
    }
    */

    this.label.position.set(this.bg.x, this.continueButton.y + 120);
};

R.OptionsScreen.prototype.enableButtons = function(enable)
{
    this.layoutButton.inputEnabled = enable;
    if(this.modeButton != null){
        this.modeButton.inputEnabled = enable;
    }
    if(this.soundButton != null){
        this.soundButton.inputEnabled = enable;
    }
    this.homeButton.inputEnabled = enable;
    if(this.restartButton != null){
        this.restartButton.inputEnabled = enable;
    }
    this.continueButton.inputEnabled = enable;
    this.tutorialButton.inputEnabled = enable;
};

R.OptionsScreen.prototype.open = function()
{
    window.famobi_analytics.trackScreen("SCREEN_SETTINGS");

    R.layoutRight = !R.layoutRight;
    this.onLayoutButton();

    this.modeBefore = R.deck.mode;
    
    if(!forcedMode){
      
        R.deck.mode = R.deck.mode === 1 ? 3 : 1;
   
        this.onModeButton();
    }
    
    if(this.soundButton != null){
        this.soundButton.checkFrame();
    }

    game.world.add(this);
    this.exists = true;
    this.resize(game.width, game.height);

    this.enableButtons(true);
};

R.OptionsScreen.prototype.onLayoutButton = function()
{
    R.layoutRight = !R.layoutRight;
    var frame = R.layoutRight ? 'hand_right_button' : 'hand_left_button';
    this.layoutButton.setFrames(frame, frame, 'hand_button_pushed', frame);
};

R.OptionsScreen.prototype.onModeButton = function()
{
    R.deck.mode = R.deck.mode === 1 ? 3 : 1;
    var frame = R.deck.mode === 1 ? 'mode1_button' : 'mode3_button';
    this.modeButton.setFrames(frame, frame, 'mode_button_pushed', frame);
    this.label.visible = this.modeBefore !== R.deck.mode;
};

R.OptionsScreen.prototype.onHomeButton = function()
{
    window.famobi_analytics.trackEvent("EVENT_LEVELFAIL", {levelName: R.deck.mode.toString(), reason: "quit"}).then(
        function() {
            this.enableButtons(false);
            R.sceneTransition(200, 'home');
        }.bind(this),
        function() {
            this.enableButtons(false);
            R.sceneTransition(200, 'home');
        }.bind(this)
    );
};

R.OptionsScreen.prototype.onStatButton = function()
{
    this.enableButtons(false);
    R.sceneTransition(200, 'statistics');
};

R.OptionsScreen.prototype.onRestartButton = function()
{
    window.famobi_analytics.trackEvent("EVENT_LEVELRESTART", {levelName: R.deck.mode.toString()}).then(
        function() {
            this.enableButtons(false);
            R.sceneTransition(200, 'play');
        }.bind(this),
        function() {
            this.enableButtons(false);
            R.sceneTransition(200, 'play');
        }.bind(this)
    );
};

R.OptionsScreen.prototype.onContinueButton = function()
{
    this.enableButtons(false);
    this.exists = false;
    game.world.remove(this);

    if(this.tutorialScreen)
    {
        this.tutorialScreen.destroy();
        this.tutorialScreen = null;
    }

    if(this.modeBefore === R.deck.mode) PlayState.onCloseOptionsScreen();
    else
    {
        PlayState.totalStatTracking(this.modeBefore);
        R.sceneTransition(200, 'play');
    }
};

R.OptionsScreen.prototype.onTutorialButton = function()
{
    window.famobi_analytics.trackScreen("SCREEN_TUTORIAL");
    this.exists = false;
    game.world.remove(this);
    this.tutorialScreen = new R.TutorialScreen();
};

R.OptionsScreen.prototype.closeTutorial = function()
{
    window.famobi_analytics.trackScreen("SCREEN_SETTINGS");
    game.world.removeAll();
    this.exists = true;
    game.world.add(this);
};
