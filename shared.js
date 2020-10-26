const enCap = 'Enabled';
const disCap = 'Disabled';
const hideCap = 'Show scrubbed subtitles';
const showCap = 'Hide scrubbed subtitles';

function stset(exp, fn) {
    chrome.storage.local.set(exp, fn);
}

function stget(key, fn) {
    chrome.storage.local.get([key], fn);
}

function stdel(key, fn) {
    chrome.storage.local.remove(['key'], fn);
}

function isNetflix() {
    return !(window.location.host.indexOf('netflix.com') === -1);
}

function isPrime() {
    return !(window.location.host.indexOf('amazon.com') === -1);
}
