const enCap = 'Enabled';
const disCap = 'Disabled';
const hideCap = 'Show Swearerer subtitles';
const showCap = 'Hide Swearerer subtitles';

function stset(exp, fn) {
    chrome.storage.local.set(exp, fn);
}

function stget(key, fn) {
    chrome.storage.local.get([key], fn);
}

function stdel(key, fn) {
    chrome.storage.local.remove(['key'], fn);
}
