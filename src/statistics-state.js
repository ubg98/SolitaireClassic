//StatisticsState
var StatisticsState = {

    bg: null,
    gLabels: null,
    gLeft: 0,
    buttonBack: null,

    //
    shutdown: function()
    {
        this.bg = null;
        this.gLabels = null;
        this.buttonBack = null;
    },

    create: function()
    {
        window.famobi_analytics.trackScreen("SCREEN_OTHER", "SCREEN_STATISTICS");
        this.bg = game.add.sprite(0, 0, 'bg_menu');

        this.gLabels = game.add.group();

        var gfx = game.add.graphics(0, 0);
        this.gLabels.add(gfx);


        var size = 28;
        var fill = '#ffffff';
        var statNames = ['games_won', 'games_played', 'best_score', 'least_moves', 'best_time', 'total_time'];
        var y = 136;
        var maxWidth = 0;
        var labelsStat = [];

        for(var i in statNames)
        {
            var label = this.createLabel(0, y, size, fill, R.strings[statNames[i]]);
            if(label.width > maxWidth) maxWidth = label.width;
            labelsStat.push(label);
            y += 50;
        }

        var card1 = this.createLabel(maxWidth, 90, size, fill, R.strings.card1);
        var card3 = this.createLabel(card1.x + 150, card1.y, size, fill, R.strings.card3);

        var statProperties = ['gamesWon', 'gamesPlayed', 'bestScore', 'leastMoves', 'bestTime', 'totalTime'];

        var left = maxWidth * -0.5 - 10;
        var right = card3.x + card3.width * 0.5 + 10;

        var statistics = this.createLabel(this.gLabels.width * 0.5 + left + 10, 30, size, fill, R.strings.statistics);

        size = 24;
        for(var i in labelsStat)
        {
            var value1 = R.playerData[statProperties[i] + '1'];
            var value2 = R.playerData[statProperties[i] + '3'];

            if(i == 4 || i == 5)
            {
                value1 = this.getTimeString(value1);
                value2 = this.getTimeString(value2);
            }

            this.createLabel(card1.x, labelsStat[i].y, size, fill, value1.toString());
            this.createLabel(card3.x, labelsStat[i].y, size, fill, value2.toString());
        }

        //lines
        var y0 = statistics.y + 30;
        var y1 = this.gLabels.height;
        var x = card1.x * 0.5 + 30;

        gfx.lineStyle(4, 0x00b800);
        gfx.moveTo(left, y0);
        gfx.lineTo(right, y0);
        gfx.moveTo(x, y0);
        gfx.lineTo(x, y1);
        x = card1.x + (card1.width + (card3.x - card3.width * 0.5 - card1.x - card1.width * 0.5)) * 0.5;
        gfx.moveTo(x, y0);
        gfx.lineTo(x, y1);

        gfx.lineStyle(2, 0xffffff);
        gfx.moveTo(left, 0);
        gfx.lineTo(right, 0);
        gfx.lineTo(right, y1);
        gfx.lineTo(left, y1);
        gfx.lineTo(left, 0);

        //button
        var buttonBack = game.add.button(0, 0, 'gui', this.onBackButton, this, 'continue_button', 'continue_button', 'continue_button_pushed', 'continue_button');
        buttonBack.scale.set(-0.76, 0.76);
        if(R.sfx.button) buttonBack.setDownSound(R.sfx.button);
        this.buttonBack = buttonBack;

        //
        this.gLeft = -left;
        this.resize(game.width, game.height);
        R.sceneTransition(200, null);
    },

    getTimeString: function(value)
    {
        var floatHours = value / 3600;
        var hours = Math.floor(floatHours);
        var floatMinutes = (floatHours - hours) * 60;
        var minutes = Math.floor(floatMinutes);
        var seconds = Math.floor((floatMinutes - minutes) * 60 + 0.5);
        var time = hours.toString() + ':';
        if(minutes < 10) time += '0';
        time += minutes.toString() + ':';
        if(seconds < 10) time += '0';
        time += seconds.toString();
        return time;
    },

    createLabel: function(x, y, size, fill, text)
    {
        var label = R.createText(x, y, size, text, fill, false, 0, false);
        label.anchor.set(0.5);
        label.align = 'center';
        this.gLabels.add(label);
        return label;
    },

    resize: function(width, height)
    {
        this.gLabels.x = (width - this.gLabels.width) * 0.5 + this.gLeft;
        this.buttonBack.x = 10;


        if(width > height)
        {
            this.buttonBack.anchor.set(1, 0.5);
            this.buttonBack.y = height * 0.5;
            this.bg.rotation = Math.PI * -0.5;
            this.bg.y = R.BASE_GAME_HEIGHT;
            this.gLabels.y = 10;
        }
        else
        {
            this.buttonBack.anchor.set(1, 0);
            this.buttonBack.y = height - this.buttonBack.height - 10;
            this.bg.rotation = 0;
            this.bg.y = 0;
            this.gLabels.y = (height - this.gLabels.height) * 0.5 - 100;
        }
    },

    onBackButton: function()
    {
        this.buttonBack.inputEnabled = false;
        R.sceneTransition(200, 'home');
    }
};
