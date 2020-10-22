function injectHijackScript() { // Inject the hijacker
    const injectedScript = document.createElement('script');
    injectedScript.src = chrome.extension.getURL('nubile.js');
    (document.head || document.documentElement).appendChild(injectedScript);
}

function setSubFlag(show) {
    var sc = document.getElementById('swearerscript');
    var swearererScript;
    if (sc == null) {
        swearererScript = document.createElement("script");
        swearererScript.setAttribute("id", "swearerscript");
    }
    if (show) {
        swearererScript.innerHTML = 'var swearerershowSubtitles = true;';
    } else {
        swearererScript.innerHTML = 'var swearerershowSubtitles = false;';
    }
    if (sc == null) {
        document.head.appendChild(swearererScript);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    stget('enableme', function(res) {
        if (res.enableme === enCap) {
            stget('showsubs', function(resub) {
                if (resub.showsubs === showCap) {
                    setSubFlag(true);
                } else {
                    setSubFlag(false);
                }
                injectHijackScript();
                filter(); // Run the filterer
            });
        }
    });
});

// Mute the sound for the tab
function muteTab(muted) {
    try {
        chrome.runtime.sendMessage("toggleMute");
    } catch(err) {
        console.log('muteTab', err);
    }
    var castav = document.querySelectorAll('video', 'audio');
    castav[0].muted = muted;
    return muted;
}

function filter() {
    var muted = false;
    lastSubslen = 0;
    setInterval(function() {
        subslen = 0;
        $('div.player-timedtext-text-container').each(function() {
            if (!$(this).text().endsWith('~')) { // User turned on subtitles
                subslen += $.trim($(this).text()).length;
                if ($.trim($(this).text()).length > 1) {
                    console.log($(this).text().length, $(this).text());
                }
            }
        });
        if (subslen > 0 && lastSubslen == 0) {
            muted = muteTab(true);
            lastSubslen = subslen;
        } else if (subslen == 0 && lastSubslen > 0) {
            setTimeout(function() { muted = muteTab(false); }, 1000);
            lastSubslen = 0;
        }
    }, 10);
}
