filterList = ['badword', 'naughty phrase', 'etc'].join('|');
// Injected vars should be namespaced (i.e. prefixed)
var swearererRe = new RegExp(filterList, 'gi');
var swearererSubs = (function () {
    var subs = [];
    var push = Array.prototype.push;
    Array.prototype.push = function () {
        if (arguments[0] && arguments[0].blocks) {
            subs[subs.length] = arguments[0];
            var contextStack = [];
            var replaced = false;
            for (i=0; i < arguments[0].blocks.length; i++) {
                for (j=0; j < arguments[0].blocks[i].textNodes.length; j++) {
                    var filteredtext = arguments[0].blocks[i].textNodes[j].text.replace(swearererRe, function(token){
                        var mask = '';
                        for (var k = 0; k < token.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_~()]/g,"").length; k++) {
                            mask = mask + '*';
                        }
                        replaced = true;
                        return mask;
                    });
                    if (replaced) {
                        arguments[0].blocks[i].textNodes[j].text = filteredtext;
                    } else { // Scrub the subtitle entirely, unless subtitles are toggled visible
                        if (typeof swearerershowSubtitles !== 'undefined' && !swearerershowSubtitles) {
                            arguments[0].blocks[i].textNodes[j].text = '';
                        } 
                        if (typeof swearerershowSubtitles === 'undefined' || swearerershowSubtitles) {
                            arguments[0].blocks[i].textNodes[j].text += ' ~';
                        }
                    }
                }
            }
        }
        return push.apply(this, arguments);
    };
    return subs;
}());
