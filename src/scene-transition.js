var R = R || {};

R.bitmapData = null;
R.bmdSize = 10;

R.sceneTransition = function(time, nextState)
{
    if(!R.bitmapData)
    {
        R.bitmapData = game.add.bitmapData(R.bmdSize, R.bmdSize);
        R.bitmapData.ctx.beginPath();
        R.bitmapData.ctx.rect(0, 0, R.bmdSize, R.bmdSize);
        R.bitmapData.ctx.fillStyle = '#000000';
        R.bitmapData.ctx.fill();
    }

    var curtain = game.add.sprite(0, 0, R.bitmapData);
    curtain.scale.set(game.width / R.bmdSize, game.height / R.bmdSize);
    if(nextState) curtain.alpha = 0.0;

    game.add.tween(curtain).to({ alpha: 1.0 - curtain.alpha }, time, Phaser.Easing.Linear.None, true).onComplete.add(function()
    {        
        if(nextState) game.state.start(nextState);
        else
        {           
            curtain.destroy();            
            var currentState = game.state.getCurrentState();
            if('start' in currentState && typeof currentState.start == 'function') currentState.start();
        }
    });    
};