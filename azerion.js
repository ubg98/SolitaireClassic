window["GD_OPTIONS"] = {
    "gameId": "edde194b22754091bab2dec2f1e463f0",
    "onEvent": function(event) {
        switch (event.name) {
            case "SDK_READY":
                onSDKReady();
                break;
            case "SDK_GAME_START":
                // advertisement done, resume game logic and unmute audio
                famobi_onResumeRequested();
                break;
            case "SDK_GAME_PAUSE":
                // pause game logic / mute audio
                famobi_onPauseRequested();
                break;
            case "SDK_GDPR_TRACKING":
                // this event is triggered when your user doesn't want to be tracked
                break;
            case "SDK_GDPR_TARGETING":
                // this event is triggered when your user doesn't want personalised targeting of ads and such
                break;
            case "AD_ERROR":
                showAd_onAdError();
                break;
            case "AD_IS_ALREADY_RUNNING":
                showAd_onAdError();
                break;
        }
    }
};
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = 'patch/js/gd-sdk.js?html5.api.gamedistribution.com/main.min.js';
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'gamedistribution-jssdk'));
