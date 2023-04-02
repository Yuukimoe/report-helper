var logMap = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'fetchData') {
    fetch(request.url)
      .then(response => response.text())
      .then(data => sendResponse(data))
      .catch(error => console.log(error));
    return true;
  } else if (request.action === 'addLog') {
    const log = {
      url: request.url,
      registeredAddress: request.registeredAddress,
      queryUrl: request.queryUrl,
      businessScope: request.businessScope,
      timestamp: new Date().toISOString(),
      currentUrl: request.currentUrl
    };
    logMap[log.url] = log;
  } else if (request.action === 'getLogs') {
    var logs = Object.keys(logMap).map(function(key) {
      return logMap[key];
    });
    sendResponse({logs: logs});
  } else if (request.action === 'clearLogs') {
    logMap = {};
  }
});
