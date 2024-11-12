var R = R || {};

//Clock
R.Clock = function(x, y, size, fill)
{
    Phaser.Text.call(this, game, x, y, '0:00');

    this.font = R.fontName;
    this.anchor.set(1.0, 0.5);
    this.align = 'right';
    this.fontSize = size;
    this.fill = fill;
    this.fontWeight = '100';

    this.minutes = 0;
    this.seconds = 0;
    
    this.timer = game.time.add(new Phaser.Timer(game, true));
    this.timer.loop(1000, this.updateTime, this);
    this.timer.stop(false);    
};

R.Clock.prototype = Object.create(Phaser.Text.prototype);
R.Clock.prototype.constructor = R.Clock;

R.Clock.prototype.reset = function(start)
{
    this.seconds = this.minutes = 0;
    if(start)
    {
        this.timer.start();
        this.text = '0:00';
    }
};

R.Clock.prototype.updateTime = function()
{    
    if(++this.seconds === 60)
    {
        this.seconds = 0;
        ++this.minutes;
    }

    var str = this.minutes.toString() + ':';    
    if(this.seconds < 10) str += '0';
    str += this.seconds.toString();
    this.text = str;
};

R.Clock.prototype.stopTick = function()
{
    this.timer.stop(false);
};

R.Clock.prototype.pause = function(p)
{    
    if(p) this.timer.pause();
    else this.timer.resume();
};

R.Clock.prototype.getTotalSeconds = function()
{
    return this.minutes * 60 + this.seconds;
};