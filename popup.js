function el(id) {
    return document.getElementById(id);
}

function setbutton(name, val) {
    var btn = el(name);
    btn.value = val;
    btn.innerHTML = val;
    if (btn.innerHTML === enCap) {
        btn.style.backgroundColor = '#6BBA70';
    }
    if (btn.innerHTML === disCap) {
        btn.style.backgroundColor = '#D01F3C';
    }
    return btn;
}

function tabReload() {
    chrome.tabs.query({},function(tabs){
        tabs.forEach(function(tab){
            url = new URL(tab.url);
            if (url.host.indexOf('netflix.com') !== -1) {
                console.log(url.host);
                chrome.tabs.reload(tab.id);
            }
        });
     });
}

document.addEventListener("DOMContentLoaded", function(){
    var b1 = el('enableme');
    var b2 = el('showsubs');

    stget('enableme', function(result) {
        if (typeof result.enableme !== 'undefined') {
            b1 = setbutton('enableme', result.enableme);
        } else {
            b1 = setbutton('enableme', enCap);
            stset({enableme: b1.innerHTML}, function(){});
        }
    });

    stget('showsubs', function(result) {
        if (typeof result.showsubs !== 'undefined') {
            b2 = setbutton('showsubs', result.showsubs);
        } else {
            b2 = setbutton('showsubs', hideCap);
            stset({showsubs: b2.innerHTML}, function(){});
        }
    });

    b1.addEventListener("click", function() {
        if (b1.innerHTML === enCap) {
            setbutton('enableme', disCap);
        } else {
            setbutton('enableme', enCap);
        }
        stset({enableme: b1.innerHTML}, function(){
            tabReload();
        });
    });

    b2.addEventListener("click", function() {
        if (b2.innerHTML === showCap) {
            setbutton('showsubs', hideCap);
        } else {
            setbutton('showsubs', showCap);
        }
        stset({showsubs: b2.innerHTML}, function(){
            tabReload();
        });
    });
});
