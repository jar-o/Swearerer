chrome.runtime.onMessage.addListener(
  function(request, sender) {
    if (request == "toggleMute")
        if (sender.tab.mutedInfo.muted) {
            chrome.tabs.update(sender.tab.id, {muted: false});
        }
        else {
            chrome.tabs.update(sender.tab.id, {muted: true});
        }
  });
