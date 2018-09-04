// return Selection Text
browser.runtime.sendMessage({"data":document.getSelection().toString()});