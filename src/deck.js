var R = R || {};

//Deck Manager
R.deck = {

    cards: [],
    cardsOpen: [],
    columns: [],

    srcPlace: null,
    srcOpen: null,
    state: 0, //0 - shuffle, 1 - ready
    mode: 1,
    currentOpenCards: 0,

    suitDecks: [],

    //
    shutdown: function()
    {
        this.cards.length = 0;
        this.columns.length = 0;
        this.suitDecks.length = 0;
        this.cardsOpen.length = 0;
        this.srcPlace = null;
        this.srcOpen = null;
        this.state = 0;
        this.currentOpenCards = 0;
    },

    init: function()
    {
        //suit decks
        for(var i = 0; i < 4; i++) this.suitDecks.push(new R.SuitDeck());

        //columns
        for(var i = 0; i < 7; i++) this.columns.push(new R.Column());

        //create and shuffle deck
        this.srcPlace = game.add.sprite(0, 0, 'gui', 'card_place');
        this.srcPlace.visible = false;

        this.srcOpen = game.add.sprite(0, 0, null);
        this.srcOpen.visible = false;

        var orderedDeck = [];

        for(var s in R.suits)
            for(var v in R.values) orderedDeck.push(new R.CardData(s, v));

        var n = orderedDeck.length;

        while(n--)
        {
            var i = game.rnd.between(0, orderedDeck.length - 1);
            var card = new R.Card(orderedDeck[i]);
            this.cards.push(card);
            game.world.add(card);
            orderedDeck.splice(i, 1);
        }
    },

    resize: function(width, height)
    {
        var x = 0, y = 0, xDst = 0, ySrc = 0;

        if(width > height)
        {
            x = ((width + 192) - (R.wCard * 7 + R.xColumnDistance * 6)) * 0.5;
            y = 200;
            ySrc = 70;
        }
        else
        {
            x = (width - (R.wCard * 7 + R.xColumnDistance * 6)) * 0.5;
            y = 332;
            ySrc = 202;
        }

        if(R.layoutRight)
        {
            for(var i in this.columns)
            {
                this.columns[i].setPosition(x, y);
                x += R.wCard + R.xColumnDistance;
            }

            xDst = this.columns[0].x;
        }
        else
        {
            var i = this.columns.length;
            while(i--)
            {
                this.columns[i].setPosition(x, y);
                x += R.wCard + R.xColumnDistance;
            }

            xDst = this.columns[3].x;
        }

        for(var i in this.suitDecks)
        {
            this.suitDecks[i].position.set(xDst, ySrc);
            xDst += R.wCard + R.xColumnDistance;
        }

        this.srcPlace.position.set(this.columns[this.state === 0 ? 4 : 6].x, ySrc);
        this.srcOpen.position.set(this.columns[5].x, ySrc);
        if(this.mode === 3) this.fixSrcOpen3Pos();

        for(var i in this.cards)
        {
            if(this.cards[i].tween) this.cards[i].tween.stop(true);
            this.cards[i].position.set(this.srcPlace.x, this.srcPlace.y);
        }
    },

    start: function()
    {
        var n = [1, 2, 3, 4, 5, 6, 7];
        var c = [0, 0, 0, 0, 0, 0, 0];

        var distributionN = 28;
        var delay = 0;

        for(var i = 0; i < distributionN;)
        {
            for(var j in this.columns)
            {
                if(c[j] === n[j]) continue;

                var card = this.cards.pop();

                if(c[j] === n[j] - 1) card.open(true);

                this.columns[j].add(card, delay);

                card.tween.stop(false);
                card.makeTween(this.columns[j].x, this.columns[j].y + R.hCardOffsetClose * c[j], delay);
                card.tween.onStart.add(card.bringToTop, card);

                delay += 100;
                ++c[j];
                ++i;
            }
        }

        //move source deck
        this.srcPlace.x = this.columns[6].x;

        for(var i in this.cards)
        {
            this.cards[i].makeTween(this.srcPlace.x, this.srcPlace.y, delay);
            delay += 10;
        }

        this.cards[this.cards.length - 1].tween.onComplete.add(this.beginPlay, this);
    },

    beginPlay: function()
    {
        var i = this.cards.length;
        while(i--) game.world.remove(this.cards[i]);

        this.srcPlace.loadTexture('card_skin1');
        this.srcPlace.visible = true;

        PlayState.beginPlay();
    },

    pick: function(x, y)
    {
        var card = null;
        //pick suit decks
        if(y < this.columns[0].y)
        {

            if(this.cardsOpen.length > 0 && this.srcOpen.getBounds().contains(x, y))
            {

                card = this.cardsOpen.pop();
                card.position.set(this.srcOpen.x, this.srcOpen.y);
                if(this.cardsOpen.length > 0)
                {
                    var topCard = this.cardsOpen[this.cardsOpen.length - 1];
                    this.srcOpen.loadTexture(topCard.cardData.name);
                    if(this.mode === 3)
                    {
                        if(this.currentOpenCards > 1) this.srcOpen.x = this.columns[R.layoutRight ? 4 : 5].x + (this.currentOpenCards - 2) * R.wCard * 0.5;//topCard.x;
                        else this.srcOpen.x = this.columns[R.layoutRight ? 4 : 5].x;
                        game.world.remove(topCard);
                    }
                }
                else this.srcOpen.visible = false;
                if(this.mode === 3) --this.currentOpenCards;
                game.world.add(card);
                card.prevOwner = this.srcOpen;
                return card;
            }

            if(this.srcPlace.getBounds().contains(x, y))
            {
                window.famobi_analytics.trackStats("deck_clicked");
                if(this.cards.length > 0 || this.cardsOpen.length > 0) PlayState.move();
                this.popCardClose();
                return null;
            }

            for(var i in this.suitDecks)
            {
                card = this.suitDecks[i].pick(x, y);
                if(card) return card;
            }
        }

        //pick columns
        for(var i in this.columns)
        {
            card = this.columns[i].pick(x, y);
            if(card) return card;
        }
        return null;
    },

    put: function(card, isSound)
    {
        var distance = Infinity;
        var d = 0;

        //check suit decks
        if(!card.over)
        {
            var suitDeck = null;

            for(var i in this.suitDecks)
            {
                d = Phaser.Point.distance(card, this.suitDecks[i]);
                if(d < R.wCard)
                {
                    if(d < distance)
                    {
                        distance = d;
                        suitDeck = this.suitDecks[i];
                    }
                }
            }

            if(suitDeck && suitDeck.checkCard(card.cardData))
            {
                R.moveSaver.save(card);
                suitDeck.add(card);
                PlayState.move();
                return;
            }
        }

        //check columns
        var column = null;
        var p = null;
        var c = null;
        distance = Infinity;

        for(var i in this.columns)
        {
            c = this.columns[i];
            if(c === card.column) continue;
            p = c.topCard ? c.topCard : c;
            d = Phaser.Point.distance(card, p);
            if(d < R.wCard)
            {
                if(d < distance)
                {
                    distance = d;
                    column = c;
                }
            }
        }

        if(column && column.checkCard(card.cardData))
        {
            R.moveSaver.save(card);
            column.add(card, 0);
            PlayState.move();
            return;
        }

        //back
        this.back(card);
        if(isSound && R.sfx.error) R.sfx.error.play();
    },

    back: function(card)
    {
        var dst = null;
        if(card.column)
        {
            if(card.under) dst = { x: card.under.x, y: card.under.y + (card.under.isOpen ? R.hCardOffsetOpen : R.hCardOffsetClose) };
            else dst = card.column;
            card.makeTween(dst.x, dst.y, 0);
        }
        else
        {
            if(card.prevOwner === this.srcOpen) this.backToSrcOpen(card);
            else card.prevOwner.add(card);
        }
    },

    autoPut: function(card)
    {
        if(fm_getOverride("disable_auto_play")) {
            this.back(card);
            return;
        }
        //check suit decks
        if(!card.over)
        {
            for(var i in this.suitDecks)
            {
                if(this.suitDecks[i].checkCard(card.cardData))
                {
                    R.moveSaver.save(card);
                    this.suitDecks[i].add(card);
                    PlayState.move();
                    return;
                }
            }
        }

        //check columns
        for(var i in this.columns)
        {
            if(this.columns[i].checkCard(card.cardData))
            {
                R.moveSaver.save(card);
                this.columns[i].add(card, 0);
                PlayState.move();
                return;
            }
        }

        //back
        this.back(card);
        if(R.sfx.error) R.sfx.error.play();
    },

    backToSrcOpen: function(card)
    {
        if(this.mode === 3)
        {
            if(this.currentOpenCards++ > 0)
            {
                game.world.add(this.cardsOpen[this.cardsOpen.length - 1]);
                card.bringToTop();
                this.srcOpen.bringToTop();
                this.srcOpen.visible = false;
                this.srcOpen.x += R.wCard * 0.5;
            }
        }
        this.addCardToSrcOpen(card);
    },

    popCardClose: function()
    {
        if(this.cards.length === 0)
        {
            if(this.cardsOpen.length === 0) return;
            var delay = 0;
            var card = null;
            for(var i in this.cardsOpen)
            {
                card = this.cardsOpen[i];
                card.open(false);
                card.position.set(this.srcOpen.x, this.srcOpen.y);
                game.world.add(card);
                card.makeTween(this.srcPlace.x, this.srcPlace.y, delay);
                delay += 10;
            }
            this.srcOpen.visible = false;
            this.cardsOpen[this.cardsOpen.length - 1].tween.onComplete.add(this.backToSrcClose, this);
            R.scoreChange(-15);
            return;
        }

        //pop
        if(this.mode === 3 && this.currentOpenCards > 0) {
            this.beforeSrcOpen3();
        }

        for(var i = 0; i < this.mode; ++i)
        {
            var card = this.cards.pop();

            game.world.add(card);
            card.open(true);

            this.mode === 1 ? this.addCardToSrcOpen(card) : this.addCardToSrcOpen3(card, i);

            R.moveSaver.save(card);

            if(this.cards.length === 0)
            {
                this.srcPlace.loadTexture('gui', 'card_place');
                return;
            }
        }
    },

    addCardToSrcOpen: function(card)
    {
        this.cardsOpen.push(card);
        card.makeTween(this.srcOpen.x, this.srcOpen.y, 0);

        card.tween.onComplete.add(function()
        {
            var card = this.cardsOpen[this.cardsOpen.length - 1];
            this.srcOpen.loadTexture(card.cardData.name);
            this.srcOpen.visible = true;
            card.prevOwner = null;
            game.world.remove(card);

        }, this);
    },

    addCardToSrcOpen3: function(card, i)
    {
        this.currentOpenCards = i + 1;
        this.cardsOpen.push(card);

        this.srcOpen.x = this.columns[R.layoutRight ? 4 : 5].x + i * R.wCard * 0.5;

        card.makeTween(this.srcOpen.x, this.srcOpen.y, 100 * i);

        if(i === 2 || this.cards.length === 0)
        {
            card.tween.onComplete.add(function()
            {
                var card = this.cardsOpen[this.cardsOpen.length - 1];
                game.world.remove(card);
                this.srcOpen.loadTexture(card.cardData.name);
                this.srcOpen.visible = true;
                this.srcOpen.bringToTop();

                var n = this.cardsOpen.length - this.currentOpenCards;
                while(n--) game.world.remove(this.cardsOpen[n]);

            }, this);
        }
    },

    beforeSrcOpen3: function()
    {
        var topCard = this.cardsOpen[this.cardsOpen.length - 1];
        topCard.position.set(this.srcOpen.x, this.srcOpen.y);
        game.world.add(topCard);

        this.srcOpen.visible = false;
        this.srcOpen.x = this.columns[R.layoutRight ? 4 : 5].x;

        for(var i = this.currentOpenCards; i > 0; --i) this.cardsOpen[this.cardsOpen.length - i].makeTween(this.srcOpen.x, this.srcOpen.y, 0);
    },

    backToSrcClose: function()
    {
        var i = this.cardsOpen.length;
        var card = null;
        while(i--)
        {
            card = this.cardsOpen.pop();
            this.cards.push(card);
            game.world.remove(card);
        }
        this.srcPlace.loadTexture('card_skin1');
        this.currentOpenCards = 0;
    },

    fixSrcOpen3Pos: function()
    {
        if(this.currentOpenCards > 0) this.srcOpen.x = this.columns[R.layoutRight ? 4 : 5].x + (this.currentOpenCards - 1) * R.wCard * 0.5;
        else this.srcOpen.x = this.columns[R.layoutRight ? 4 : 5].x;

        var card = null;

        for(var i in this.cardsOpen)
        {
            card = this.cardsOpen[i];
            if(card.tween) card.tween.stop(true);
        }

        for(var i = 1; i < this.currentOpenCards; ++i) this.cardsOpen[this.cardsOpen.length - i - 1].position.set(this.srcOpen.x - i * R.wCard * 0.5, this.srcOpen.y);
    },

    popBackToSrcClose: function()
    {
        var n = this.mode === 3 ? this.currentOpenCards : 1;

        for(var i = 0; i < n; ++i)
        {
            var card = this.cardsOpen.pop();
            this.cards.push(card);
            card.open(false);
            card.position.set(this.srcOpen.x, this.srcOpen.y);
            game.world.add(card);
            card.makeTween(this.srcPlace.x, this.srcPlace.y, 0);

            card.tween.onComplete.add(function(card)
            {
                game.world.remove(card);
                this.srcPlace.loadTexture('card_skin1');

            }, this, card);
        }

        this.currentOpenCards = 0;

        if(this.cardsOpen.length > 0)
        {
            this.srcOpen.loadTexture(this.cardsOpen[this.cardsOpen.length - 1].cardData.name);

            if(this.mode === 3)
            {
                var i = this.cardsOpen.length;
                while(i-- && this.currentOpenCards < 3) ++this.currentOpenCards;

                this.srcOpen.x = this.columns[R.layoutRight ? 4 : 5].x + (this.currentOpenCards - 1) * R.wCard * 0.5;

                if(this.currentOpenCards > 2)
                {
                    var card = this.cardsOpen[this.cardsOpen.length - 3];
                    game.world.add(card);
                    card.position.set(this.srcOpen.x - R.wCard, this.srcOpen.y, 100);
                }
                if(this.currentOpenCards > 1)
                {
                    var card = this.cardsOpen[this.cardsOpen.length - 2];
                    game.world.add(card);
                    card.position.set(this.srcOpen.x - R.wCard * 0.5, this.srcOpen.y, 200);
                }

                this.srcOpen.bringToTop();
            }
        }
        else this.srcOpen.visible = false;
    },

    isAllSorted: function()
    {
        if(this.cards.length > 0 || this.cardsOpen.length > 0) return;
        for(var i in this.columns) if(!this.columns[i].isSorted()) return;
        if(fm_getOverride("show_cards")) {
            if(this.isAllSortedOpen()) {
                this.autoPlace();
            }
        } else {
            this.autoPlace();
        }
    },

    isAllSortedOpen: function()
    {
        var sorted = true;
        R.deck.columns.forEach(column => {
            var curCard = column.bottomCard;
            if(curCard) {
                while(curCard.over) {
                    if(curCard.cardData.vi != curCard.over.cardData.vi + 1) {
                        sorted = false;
                        break;
                    }
                    curCard = curCard.over;
                }
            }
        });

        return sorted;
    },

    autoPlace: function()
    {
        var delay = 0;
        var column = null;
        var suitDeck = null;
        var lastCard = null;
        var n = 0;

        while(n < this.columns.length)
        {
            n = 0;
            for(var i in this.columns)
            {
                column = this.columns[i];
                if(column.topCard)
                {
                    suitDeck = this.checkCorrectSuitDeck(column.topCard.cardData);
                    if(suitDeck)
                    {
                        suitDeck.autoPlaceAdd(lastCard = column.autoPlacePick(), delay);
                        delay += 100;
                    }
                }
                else
                {
                    ++n;
                    continue;
                }
            }
        }

        lastCard.tween.onComplete.add(this.isWin, this);
    },

    checkCorrectSuitDeck: function(cardData)
    {
        for(var i in this.suitDecks) if(this.suitDecks[i].checkCard(cardData)) return this.suitDecks[i];
        return null;
    },

    isWin: function()
    {
        for(var i in this.suitDecks) if(!this.suitDecks[i].topCard || this.suitDecks[i].topCard.cardData.value != 'k') return;

        R.flyCards = 0;

        var delay = 100;
        for(var i in this.suitDecks)
        {
            game.time.events.add(delay, this.suitDecks[i].startWin, this.suitDecks[i]);
            delay += 300;
        }

        PlayState.win();
    }
};
