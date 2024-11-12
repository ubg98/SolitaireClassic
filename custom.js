console.log("v1.0.3");

let showAd_onAdError = function() {};

window.famobi_analytics = window.famobi_analytics || {};
window.famobi_tracking = window.famobi_tracking || {
	init: function() {},
	trackEvent: function() {},
	EVENTS: {
	    'LEVEL_START'	: 'event/level/start',
	    'LEVEL_END'		: 'event/level/end',
	    'LEVEL_UPDATE'	: 'event/level/update',
	    'PING'          : 'event/ping',
	    'AD'			: 'event/ad'
	}
};

window.famobi_analytics.trackEvent = function(event, params) {

	params = params || {};

	return new Promise(function(resolve, reject) {

		// console.log(event, params);

		// ANALYTICS
		switch(event) {

			case "EVENT_LEVELFAIL":
				if(params.reason !== "quit") {
					break;
				}
			case "EVENT_LEVELSTART":
			case "EVENT_LEVELRESTART":

				return gdsdk_showAd(function() {
					resolve(event, params);
				});

			default:
				// nothing to do
		}
		return resolve(event, params);
	});
}

const gdsdk_showAd = function(callback) {

	console.log("gdsdk_showAd()");

	const doCallback = function() {
		if(typeof callback === "function") {
			callback();
		}
	}

	if (typeof gdsdk !== "undefined" && gdsdk.showAd !== "undefined") {
		gdsdk.showAd().then(function() {
			doCallback();
		}, function() {
			doCallback();
		});
	} else {
		doCallback();
	}

	showAd_onAdError = function() {
		console.log("showAd_onAdError()");
		doCallback();
	};
}
