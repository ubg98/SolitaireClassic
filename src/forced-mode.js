var forcedMode = famobi.hasFeature("forced_mode");
var forcedModeProperties = {
	state: {},
	override: {}
};

/* :: Testing :: */
var testFeatureProperties = {
	state: {
		is_3_card: false //done
	},
	override: {
		hide_ui: ["score", "time", "turns"], //done
		disable_reverse: false, //done
		show_cards: true, //done
		disable_auto_play: false, //done
		disable_score_over_time: true, //done
		score_loss_amount: 1, //done
		score_loss_delay: 1, //done
		score_multiplier: 1.5 //done
	}
};

var forcedMode_defaultCheck = function() {
	return forcedMode && (forcedModeProperties != null) && (forcedModeProperties.state != null) && (forcedModeProperties.override != null);
};

var fm_getState = function(property) {
	if(!forcedMode_defaultCheck()) {
		return false;
	}

	return (forcedModeProperties.state[property] == "true")
};

var fm_getOverride = function(property, param) {
	if(!forcedMode_defaultCheck()) {
		return false;
	}

	switch(property) {
		case "hide_ui":
			if(forcedModeProperties.override[property]) {
				return forcedModeProperties.override[property].includes(param);
			}
			return false;
		case "score_loss_amount":
		case "score_loss_delay":
		case "score_multiplier":
			let value = forcedModeProperties.override[property];

			if(typeof(value) != "number") {
				return false;
			}

			value = Math.max(value, 0);

			return value;
		default:
			return (forcedModeProperties.override[property] == true)
	}
};

var initForcedMode = function(isTesting = false) {
	if(!forcedMode) {
		return;
	}

	console.warn("[ForcedMode]: ForcedMode: enabled");

	if(isTesting) {
		forcedModeProperties = testFeatureProperties;
	} else {
		forcedModeProperties = famobi.getFeatureProperties("forced_mode");
	}

	if(forcedMode_defaultCheck()) {
		if(fm_getState("is_3_card")) {
			R.deck.mode = 3;
		}
	}
};

var forcedMode_OnLevelLoaded = function() {
	if(fm_getOverride("show_cards")){
		R.deck.columns.forEach(column => {
        	PlayState.pretendInputOn(column.bottomCard);
    	});
	}
	
};

var forcedMode_OnLevelStart = function() {
	if(!forcedMode_defaultCheck()) {
		return;
	}

	console.log("[ForcedMode]: On Level Start");
	
    R.deck.columns.forEach(column => {
        let curCard = column.bottomCard;

        while(curCard != null) {
        	if(fm_getOverride("show_cards")) {
        		curCard.open(true, false);
        	}
            curCard = curCard.over;
        }
    });
};
