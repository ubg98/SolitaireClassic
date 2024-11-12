var R = R || {};

//data and settings
R.suits = ['c', 'd', 'h', 's'];

R.values = ['a', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'];

R.layoutRight = true;

R.wCard = 86;
R.hCard = 118;
R.xColumnDistance = 5;
R.hCardOffsetClose = 12;
R.hCardOffsetOpen = 30;
R.flyCards = 0;

//statistics
R.score = 0;

R.scoreChange = function(score)
{
    score = Math.floor(score * (fm_getOverride("score_multiplier") ? fm_getOverride("score_multiplier") : 1));

    R.score += score;
    if(R.score < 0) R.score = 0;
};

//Card Data
R.CardData = function(s, v)
{
    this.si = s * 1;
    this.vi = v * 1;

    this.suit = R.suits[s];
    this.value = R.values[v];

    this.name = this.value + this.suit;
};

R.CardData.prototype = {};

R.CardData.prototype.constructor = R.CardData;

//Card
R.Card = function(cardData)
{
    Phaser.Sprite.call(this, game, 0, 0, 'card_skin1');

    this.cardData = cardData;
    this.isOpen = false

    this.under = null;
    this.over = null;

    this.column = null;
    this.prevOwner = null;

    this.isColumnNotMoved = true;
    this.isHomeNotMoved = true;

    this.tween = null;
};

R.Card.prototype = Object.create(Phaser.Sprite.prototype);
R.Card.prototype.constructor = R.Card;

R.Card.prototype.open = function(isOpen, isAnim)
{
    this.isOpen = isOpen;

    if(isAnim)
    {
        this.anchor.set(0.5);
        this.x += this.width * 0.5;
        this.y += this.height * 0.5;
        this.tween = game.add.tween(this.scale).to({ x: 0.1, y: 1.2 }, 100, Phaser.Easing.Linear.None, true);
        this.tween.onComplete.add(function(isOpen)
        {
            this.loadTexture(isOpen ? this.cardData.name : 'card_skin1');
            this.tween = game.add.tween(this.scale).to({ x: 1.0, y: 1.0 }, 100, Phaser.Easing.Linear.None, true);
            this.tween.onComplete.add(function() { this.tween = null; this.anchor.set(0); this.x -= this.width * 0.5; this.y -= this.height * 0.5; }, this);
        }, this, isOpen);
    }
    else {
        this.loadTexture(isOpen ? this.cardData.name : 'card_skin1');
    }
};

R.Card.prototype.add = function(card)
{
    card.under = this;
    this.over = card;
    card.makeTween(this.x, this.y + (this.isOpen ? R.hCardOffsetOpen : R.hCardOffsetClose), 0);
};

R.Card.prototype.makeTween = function(x, y, delay)
{
    var dst = {x: x, y: y};
    var duration = Phaser.Point.distance(this, dst) / 1.6;
    if(duration < 1) duration = 1;

    this.tween = game.add.tween(this).to(dst, duration, Phaser.Easing.Linear.None, true, delay);
    this.tween.onComplete.add(function() { this.tween = null; }, this);

    if(this.over) this.oversToChildren();

    if(R.sfx.card) this.tween.onStart.add(function() { R.sfx.card.play(); }, this);
    if(R.sfx.place_card) this.tween.onComplete.add(function() { R.sfx.place_card.play(); }, this);
};

R.Card.prototype.oversToChildren = function()
{
    var over = this.over;
    var i = 1;
    while(over)
    {
        over.position.set(0, R.hCardOffsetOpen * i++);
        this.addChild(over);
        over = over.over;
    }
    this.tween.onComplete.add(this.recoverOvers, this);
};

R.Card.prototype.recoverOvers = function()
{
    this.removeChildren();
    var over = this.over;
    while(over)
    {
        game.world.add(over);
        over = over.over;
    }
    this.setPosition(this.x, this.y);
};

R.Card.prototype.setPosition = function(x, y)
{
    if(this.tween)
    {
        this.bringToTop();
        this.tween.stop(true);
    }
    this.position.set(x, y);
    var over = this.over;
    while(over)
    {
        if(over.tween)
        {
            over.bringToTop();
            over.tween.stop(true);
        }
        over.position.set(x, over.under.y + (over.under.isOpen ? R.hCardOffsetOpen : R.hCardOffsetClose));
        over = over.over;
    }
};

R.Card.prototype.setOnTop = function()
{
    this.bringToTop();
    var over = this.over;
    while(over)
    {
        over.bringToTop();
        over = over.over;
    }
};

R.Card.prototype.startWinAnim = function()
{
    this.vY = -3;
    this.vX = R.layoutRight ? 1.5 : -1.5;

    this.anchor.x = 0.5;
    this.x += this.width * 0.5;

    ++R.flyCards;
    game.world.addAt(this, 15);
    this.update = this.updateWinAnim;
};

R.Card.prototype.updateWinAnim = function()
{
    this.x += this.vX;
    this.y += this.vY;

    this.vY += 0.1;

    var bottom = this.y + this.height * this.scale.y;
    if(bottom > game.height)
    {
        this.scale.y = (this.height * this.scale.y - bottom + game.height) / this.height;
        if(this.scale.y < 0.5)
        {
            var i = game.device.desktop ? (this.cardData.vi * 1 + 1) : 1;
            while(i--) new R.ParticleSuit(this);
            --R.flyCards;
            game.world.remove(this, true);
        }
        this.scale.x = 2 - this.scale.y;
    }
};

//Column
R.Column = function()
{
    Phaser.Sprite.call(this, game, 0, 0, 'gui', 'card_place');

    this.bottomCard = null;
    this.topCard = null;

    game.world.add(this);
};

R.Column.prototype = Object.create(Phaser.Sprite.prototype);
R.Column.prototype.constructor = R.Column;

R.Column.prototype.setPosition = function(x, y)
{
    this.position.set(x, y);
    if(this.bottomCard) this.bottomCard.setPosition(x, y);
};

R.Column.prototype.add = function(card, delay)
{
    if(card.column) card.column.remove(card);

    if(this.topCard) this.topCard.add(card);
    else
    {
        card.makeTween(this.x, this.y, 0);
        card.tween.onComplete.add(function() { this.visible = false; }, this);
        this.bottomCard = card;
    }
    card.tween.onComplete.add(R.deck.isAllSorted, R.deck);

    if(card.over)
    {
        var over = card.over;
        while(over)
        {
            this.topCard = over;
            over.column = this;
            over = over.over;
        }
    }
    else this.topCard = card;

    card.column = this;

    if(R.deck.state === 1 && card.isColumnNotMoved)
    {
        card.isColumnNotMoved = false;
        R.scoreChange(5);
        window.famobi_analytics.trackStats("card_moved",{card_value: card.value, card_type: card.suit});
    }

    if(card.prevOwner && card.prevOwner !== R.deck.srcOpen)
    {
        card.prevOwner = null;
        card.isHomeNotMoved = true;
        R.scoreChange(-15);
    }
};

R.Column.prototype.remove = function(card)
{
    this.topCard = card.under;

    if(this.topCard)
    {
        this.topCard.over = null;
        if(!this.topCard.isOpen) this.topCard.open(true, true);
    }
    else this.bottomCard = null;

    card.under = null;
    card.column = null;
};

R.Column.prototype.pick = function(x, y)
{
    var card = this.topCard;
    while(card && card.isOpen)
    {
        if(card.getBounds().contains(x, y))
        {
            if(card === this.bottomCard) this.visible = true;
            return card;
        }
        card = card.under;
    }
    return null;
};

R.Column.prototype.autoPlacePick = function()
{
    var card = this.topCard;
    if(card === this.bottomCard) this.visible = true;
    this.remove(card);
    return card;
};

R.Column.prototype.checkCard = function(cardData)
{
    if(this.topCard)
    {
        var suit = false;
        switch(this.topCard.cardData.suit)
        {
            case 's': suit = cardData.suit === 'h' || cardData.suit === 'd'; break;
            case 'c': suit = cardData.suit === 'h' || cardData.suit === 'd'; break;
            case 'h': suit = cardData.suit === 's' || cardData.suit === 'c'; break;
            case 'd': suit = cardData.suit === 's' || cardData.suit === 'c'; break;
        }
        return suit && (cardData.vi + 1) === this.topCard.cardData.vi;
    }
    return cardData.value === 'k';
};

R.Column.prototype.isSorted = function()
{
    var card = this.bottomCard;
    while(card)
    {
        if(!card.isOpen) return false;
        card = card.over;
    }
    return true;
};

//SuitDeck
R.SuitDeck = function()
{
    Phaser.Sprite.call(this, game, 0, 0, 'gui', 'card_place');

    this.pile = [];
    this.topCard = null;

    game.world.add(this);
};

R.SuitDeck.prototype = Object.create(Phaser.Sprite.prototype);
R.SuitDeck.prototype.constructor = R.SuitDeck;

R.SuitDeck.prototype.add = function(card)
{
    this.topCard = card;
    this.pile.push(card);

    card.makeTween(this.x, this.y, 0);

    card.tween.onComplete.add(function()
    {
        if(this.topCard.column) this.topCard.column.remove(this.topCard);
        game.world.remove(this.topCard);
        this.loadTexture(this.topCard.cardData.name);
        R.deck.isWin();
        R.deck.isAllSorted();
    }, this);

    if(card.isHomeNotMoved)
    {
        card.isColumnNotMoved = false;
        card.isHomeNotMoved = false;
        R.scoreChange(15);
        window.famobi_analytics.trackStats("card_moved",{card_value: card.value, card_type: card.suit});
    }

    card.prevOwner = this;

    if(R.sfx.card_to_base) R.sfx.card_to_base.play();
};

R.SuitDeck.prototype.autoPlaceAdd = function(card, delay)
{
    this.topCard = card;
    this.pile.push(card);

    card.makeTween(this.x, this.y, delay);

    card.tween.onStart.add(card.bringToTop, card);

    card.tween.onComplete.add(function(card)
    {
        game.world.remove(card);
        this.loadTexture(card.cardData.name);
        PlayState.displayScore += 14;
        R.score += 15;
    }, this, card);
};

R.SuitDeck.prototype.pick = function(x, y)
{
    if(this.topCard)
    {
        if(this.getBounds().contains(x, y))
        {
            var card = this.topCard;
            this.pile.pop();
            if(this.pile.length > 0)
            {
                this.topCard = this.pile[this.pile.length - 1];
                this.loadTexture(this.topCard.cardData.name);
            }
            else
            {
                this.loadTexture('gui', 'card_place');
                this.topCard = null;
            }
            card.position.set(this.x, this.y);
            game.world.add(card);
            return card;
        }
    }
    return null;
};

R.SuitDeck.prototype.startWin = function()
{
    var card = this.pile.pop();
    if(typeof(card) == "undefined") return;

    card.position.set(this.x, this.y);
    card.startWinAnim();

    if(this.pile.length > 0)
    {
        game.time.events.add(500, this.startWin, this);
        this.loadTexture(card.cardData.name);
    }
    else this.loadTexture('gui', 'card_place');
};

R.SuitDeck.prototype.checkCard = function(cardData)
{
    if(this.topCard) return this.topCard.cardData.si === cardData.si && (cardData.vi - 1) === this.topCard.cardData.vi;
    return cardData.vi === 0;
};

//MoveSaver
R.moveSaver = {

    card: null,
    under: null,
    column: null,
    prevOwner: null,
    isColumnNotMoved: false,
    isHomeNotMoved: false,
    underIsOpen: false,

    //
    reset: function()
    {
        this.card = null;
        this.under = null;
    },

    save: function(card)
    {
        this.card = card;
        this.column = card.column;
        this.prevOwner = card.prevOwner;
        this.isColumnNotMoved = card.isColumnNotMoved;
        this.isHomeNotMoved = card.isHomeNotMoved;
        this.under = card.under

        if(card.under) this.underIsOpen = card.under.isOpen;
    },

    undo: function()
    {
        if(fm_getOverride("disable_reverse")) { return; }
        
        if(game.tweens._tweens.length > 0 || !this.card)
        {
            if(R.sfx.error) R.sfx.error.play();
            return;
        }

        if(this.card.column) this.card.column.pick(this.card.x + 5, this.card.y + 5);
        else if(this.card.prevOwner && this.card.prevOwner !== R.deck.srcOpen) this.card.prevOwner.pick(this.card.x + 5, this.card.y + 5);

        if(this.column)
        {
            if(this.under) this.under.open(this.underIsOpen, false);
            this.column.add(this.card, 0);
            this.card.bringToTop();
            if(this.isColumnNotMoved && (!this.card.prevOwner || this.card.prevOwner === R.deck.srcOpen)) {

                R.scoreChange(-5);
            }
        }
        else if(this.prevOwner)
        {
            if(this.prevOwner === R.deck.srcOpen)
            {
                if(this.card.column)
                {
                    this.card.column.remove(this.card);
                    this.card.column = null;
                    R.scoreChange(-5);
                }
                else R.scoreChange(-15);

                R.deck.backToSrcOpen(this.card);
            }
            else this.prevOwner.add(this.card);
            this.card.prevOwner = this.prevOwner;
        }
        else {
            // R.trackStats("moves_reversed"); // discussable
            R.deck.popBackToSrcClose();
        }

        this.card.isColumnNotMoved = this.isColumnNotMoved;
        this.card.isHomeNotMoved = this.isHomeNotMoved;

        this.reset();
        PlayState.move();
        window.famobi_analytics.trackStats("revert_clicked");
    }
};

//ParticleSuit
R.ParticleSuit = function(card)
{
    var frame = '';
    switch(card.cardData.suit)
    {
        case 'c': frame = 'clubs'; break;
        case 'd': frame = 'diamonds'; break;
        case 'h': frame = 'hearts'; break;
        case 's': frame = 'spades'; break;
    }

    Phaser.Sprite.call(this, game, card.x, card.y, 'gui', frame);
    this.anchor.set(0.5);

    this.dx = game.rnd.between(0.5, 2);
    if(game.rnd.between(0, 1)) this.dx = -this.dx;
    this.dy = -game.rnd.between(4, 8);
    this.g = game.rnd.realInRange(0.05, 0.2);

    this.dr = game.rnd.realInRange(0.05, 0.1);
    if(game.rnd.between(0, 1)) this.dr = -this.dr;

    this.s = game.rnd.realInRange(0.3, 0.8);
    this.cs = this.s;

    this.ds = game.rnd.realInRange(0.01, 0.06);
    this.dsx = game.rnd.between(0, 1);

    this.scale.set(this.s);

    game.world.add(this);
};

R.ParticleSuit.prototype = Object.create(Phaser.Sprite.prototype);
R.ParticleSuit.prototype.constructor = R.ParticleSuit;

R.ParticleSuit.prototype.update = function()
{
    this.x += this.dx;
    this.y += this.dy;
    this.rotation += this.dr;
    this.dy += this.g;

    this.cs -= this.ds;
    if(this.cs < -this.s) this.cs = this.s;
    this.dsx ? this.scale.x = this.cs : this.scale.y = this.cs;

    if(this.y - this.height > game.height) game.world.remove(this, true);
};
