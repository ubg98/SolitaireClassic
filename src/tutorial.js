var R = R || {};

//TutorialScreen
R.TutorialScreen = function()
{
    this.bg = game.add.sprite(0, 0, 'bg_menu');

    this.picture = game.add.sprite(0, 0, 'tutorial1');
    this.picture.anchor.set(0.5, 0.0);

    this.textField = R.createText(0, 0, parseInt(window.famobi.__("tutorial1_fontsize")), R.strings.tutorial1, '#ffffff', false, 0, true);
    this.textField.anchor.set(0.5, 0.0);
    this.textField.align = 'center';

    var nextButton = game.add.button(0, 0, 'gui', this.onNextButton, this, 'continue_button', 'continue_button', 'continue_button_pushed', 'continue_button');
    nextButton.anchor.set(0.5);
    nextButton.scale.set(0.5);

    this.nextButton = nextButton;

    var closeButton = game.add.button(0, 0, 'gui', this.onCloseButton, this, 'close_button', 'close_button', 'close_button_pushed', 'close_button');
    closeButton.anchor.set(0.5);
    closeButton.scale.set(1.34);



    if(R.sfx.button) closeButton.setDownSound(R.sfx.button);
    this.closeButton = closeButton;

    var previousButton = game.add.button(0, 0, 'gui', this.onPreviousButton, this, 'continue_button', 'continue_button', 'continue_button_pushed', 'continue_button');
    previousButton.anchor.set(0.5);
    previousButton.scale.set(-0.5, 0.5);

    this.previousButton = previousButton;

    this.previousButton.alpha = false?1:0.5;

    this.step = 0;

    //
    this.resize(game.width, game.height);
};

R.TutorialScreen.prototype = {

    resize: function(width, height)
    {
        this.picture.position.set(width * 0.5, 10);
        this.textField.position.set(this.picture.x, this.picture.y + 360);
        this.textField.wordWrapWidth = width - 10;

        if(width > height)
        {
            this.bg.rotation = Math.PI * -0.5;
            this.bg.y = R.BASE_GAME_HEIGHT;

            this.previousButton.position.set(width*0.2, height*0.5);
            this.closeButton.position.set(width * 0.8, height*0.25);
            this.nextButton.position.set(width * 0.8, this.previousButton.y);
        }
        else
        {
            this.bg.rotation = 0;
            this.bg.y = 0;

            this.previousButton.position.set(this.picture.x - 240, height - 100);
            this.closeButton.position.set(this.picture.x, this.previousButton.y);
            this.nextButton.position.set(this.picture.x + 240, this.previousButton.y);
        }
    },

    onNextButton: function()
    {
        /*
        if(this.step === 1) this.onCloseButton();
        else
        {
            this.step = 1;
            this.picture.loadTexture('tutorial2', 0);
            this.textField.text = R.strings.tutorial2;
        }*/
        this.step = 1;
        this.picture.loadTexture('tutorial2', 0);
        this.textField.text = R.strings.tutorial2;

        this.nextButton.alpha = false?1:0.5;
        this.previousButton.alpha = true?1:0.5;

        if(R.sfx.button) {
            this.nextButton.setDownSound(null);
            this.previousButton.setDownSound(R.sfx.button);
        }
    },

    onPreviousButton: function()
    {
        this.step = 0;
        this.picture.loadTexture('tutorial1', 0);
        this.textField.text = R.strings.tutorial1;

        this.nextButton.alpha = true?1:0.5;
        this.previousButton.alpha = false?1:0.5;

        if(R.sfx.button) {
            this.nextButton.setDownSound(R.sfx.button);
            this.previousButton.setDownSound(null);
        }
    },

    onCloseButton: function()
    {
        this.nextButton.inputEnabled = false;
        this.closeButton.inputEnabled = false;
        this.previousButton.inputEnabled = false;

        var currentState = game.state.getCurrentState();
        if('onCloseTutotial' in currentState) currentState.onCloseTutotial();
        else R.sceneTransition(200, 'home');
        PlayState.resize(game.width, game.height);
    },

    destroy: function()
    {
        this.previousButton.destroy(true);
        this.closeButton.destroy(true);
        this.nextButton.destroy(true);
        this.textField.destroy(true);
        this.picture.destroy(true);
        this.bg.destroy(true);
    }
};

R.TutorialScreen.prototype.constructor = R.TutorialScreen;