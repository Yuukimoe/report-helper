document.addEventListener('DOMContentLoaded', function() {
  const logsList = document.getElementById('logs');
  const ClearBtn = document.getElementById('ClearBtn');

  // 获取所有日志记录
  chrome.runtime.sendMessage({action: 'getLogs'}, function(response) {
    if (response.logs) {
      // 反转日志记录数组
      const reversedLogs = response.logs.reverse();
      // 将每个日志记录添加到 <ul> 元素中
      reversedLogs.forEach(function(log) {
        const { url, registeredAddress, queryUrl, businessScope, timestamp} = log;
        // 使用模板字符串创建日志记录的 HTML 元素
        const logElement = `
          <div class="log">
            <ul id="log-list">
              <li class="log-url">hostValue: <a href="${url}" target="_blank">${url}</a></li>
              <li class="log-url">queryUrl: <a href="${queryUrl}" target="_blank">${queryUrl}</a></li>
              <li class="log-address">registeredAddress: ${registeredAddress}</li>
              <li class="log-details">businessScope: ${businessScope}</li>
              <li class="log-details timestamp"><span>${new Date(timestamp).toLocaleString()}</span></li>
            </ul>
          </div><br>
        `;

        // 将日志记录添加到 <ul> 元素中
        logsList.innerHTML += logElement;
      });
    }
  });

  // 监听 Clear 按钮的点击事件
  ClearBtn.addEventListener('click', function() {
    // 发送消息通知后台脚本清除记录
    chrome.runtime.sendMessage({action: 'clearLogs'});
    // 清空 logsList 中的所有日志记录
    logsList.innerHTML = '';
  });
});
