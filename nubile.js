swearerFilterList = ['badword', 'naughty phrase', 'etc'].join('|'); // MUST be on first line!

function swearererIsNetflix() {
    return !(window.location.host.indexOf('netflix.com') === -1);
}

function swearererIsPrime() {
    return !(window.location.host.indexOf('amazon.com') === -1);
}

function swearerTTMLScrubText(text) {
    var replaced = false;
    var filteredtext = text.replace(swearererRe, function(token) {
        var mask = '';
        for (var k = 0; k < token.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_~()]/g, "").length; k++) {
            mask = mask + '*';
        }
        replaced = true;
        return mask;
    });
    if (replaced) {
        return filteredtext;
    } else { // Scrub the subtitle entirely, unless subtitles are toggled visible
        if (typeof swearerershowSubtitles !== 'undefined' && !swearerershowSubtitles) {
            return '';
        }
        if (typeof swearerershowSubtitles === 'undefined' || swearerershowSubtitles) {
            return text + ' ~';
        }
    }
}

// https://en.wikipedia.org/wiki/Timed_Text_Markup_Language#DFXP_Transformation
function swearererDFXPScrubber(xhrobj) {
    //console.log(xhrobj.response);
    var parser = new DOMParser();
    var xmdoc = parser.parseFromString(xhrobj.responseText, "text/xml");
    var caps = xmdoc.getElementsByTagName("tt:p");
    for (i = 0; i < caps.length; i++) {
        for (j = 0; j < caps[i].childNodes.length; j++) {
            if (caps[i].childNodes[j].nodeValue !== null) {
                var scrubbed = swearerTTMLScrubText(caps[i].childNodes[j].nodeValue);
                caps[i].childNodes[j].nodeValue = scrubbed;
                //if (scrubbed.trim().length > 0) {
                    //console.log(caps[i].childNodes[j].nodeValue);
                //}
            }
        }
    }
    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmdoc);
}

function swearererTTML2Scrubber(xhrobj) {
    //console.log(xhrobj.response);
    var parser = new DOMParser();
    var xmdoc = parser.parseFromString(xhrobj.responseText, "text/xml");
    var caps = xmdoc.getElementsByTagName("p");
    for (i = 0; i < caps.length; i++) {
        for (j = 0; j < caps[i].childNodes.length; j++) {
            caps[i].innerHTML = caps[i].innerHTML.replace(/<[^>]*>/g, ' ');
            if (caps[i].childNodes[j].nodeValue !== null) {
                var scrubbed = swearerTTMLScrubText(caps[i].childNodes[j].nodeValue);
                //console.log('caps[i].childNodes[j].nodeValue', caps[i].childNodes[j].nodeValue, 'scrubbed', scrubbed, caps[i], 'deletedelem', deletedElems, 'innerhtml', caps[i].childNodes[j].innerHTML);
                caps[i].childNodes[j].nodeValue = scrubbed;
                //if (scrubbed.trim().length > 0) {
                    //console.log(caps[i].childNodes[j].nodeValue);
                //}
            }
        }
    }
    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmdoc);
}

var swearererRe = new RegExp(swearerFilterList, 'gi');

if (swearererIsNetflix()) {
    console.log('netflix');
    (function () {
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
}

if (swearererIsPrime()) {
    console.log('prime');
    (function() {
        var open = window.XMLHttpRequest.prototype.open,
            send = window.XMLHttpRequest.prototype.send;

        function openReplacement(method, url, async, user, password) {
            this._url = url;
            return open.apply(this, arguments);
        }

        function sendReplacement(data) {
            if (this.onreadystatechange) {
                this._onreadystatechange = this.onreadystatechange;
            }
            this.onreadystatechange = onReadyStateChangeReplacement;
            return send.apply(this, arguments);
        }

        function onReadyStateChangeReplacement() {
            if (this.readyState == 4 && this.status == 200) {
                if (this._url.indexOf('.dfxp') > 0) {
                    /*
                        TODO Prime, get type/URL from this call
                        https://atv-ps.amazon.com/cdp/catalog/GetPlaybackResources?deviceID=...
                    */
                    var scrubbedResp = swearererDFXPScrubber(this);
                    //console.log('scrubbedResp', scrubbedResp);
                    Object.defineProperty(this, 'responseText', {
                        value: scrubbedResp
                    });
                    Object.defineProperty(this, 'response', {
                        value: scrubbedResp
                    });
                    //console.log('this.response (modified) = ', this.response);
                }
                if (this._url.indexOf('.ttml2') > 0) {
                    var scrubbedResp = swearererTTML2Scrubber(this);
                    //console.log('scrubbedResp', scrubbedResp);
                    Object.defineProperty(this, 'responseText', {
                        value: scrubbedResp
                    });
                    Object.defineProperty(this, 'response', {
                        value: scrubbedResp
                    });
                    //console.log('this.response (modified) = ', this.response);
                }
            }

            if (this._onreadystatechange) {
                return this._onreadystatechange.apply(this, arguments);
            }
        }

        window.XMLHttpRequest.prototype.open = openReplacement;
        window.XMLHttpRequest.prototype.send = sendReplacement;
    })();
}
