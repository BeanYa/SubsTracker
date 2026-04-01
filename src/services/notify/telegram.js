function escapeMarkdownV2(text = '') {
  if (!text) return '';
  // Escape special characters for Telegram MarkdownV2
  // Characters that need to be escaped: _ * [ ] ( ) ~ ` > # + - = | { } . ! \
  return String(text).replace(/([_\*\[\]\(\)~`>#+\-=|{}.!\\])/g, '\\$1');
}

async function sendTelegramNotification(message, config) {
  try {
    if (!config.TG_BOT_TOKEN || !config.TG_CHAT_ID) {
      console.error('[Telegram] 通知未配置，缺少Bot Token或Chat ID');
      return false;
    }

    console.log('[Telegram] 开始发送通知到 Chat ID: ' + config.TG_CHAT_ID);
    console.log('[Telegram] Bot Token: ' + config.TG_BOT_TOKEN.substring(0, 10) + '...');

    const url = 'https://api.telegram.org/bot' + config.TG_BOT_TOKEN + '/sendMessage';
    const escapedMessage = escapeMarkdownV2(message);

    console.log('[Telegram] 原始消息: ' + message.substring(0, 100));
    console.log('[Telegram] 转义后: ' + escapedMessage.substring(0, 100));

    // Try with MarkdownV2 first
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.TG_CHAT_ID,
        text: escapedMessage,
        parse_mode: 'MarkdownV2'
      })
    });

    const result = await response.json();
    console.log('[Telegram] MarkdownV2发送结果:', JSON.stringify(result));

    // If parse error, fallback to plain text (no parse_mode)
    if (!result.ok) {
      const errorDesc = result.description || '';
      const isParseError = errorDesc.toLowerCase().includes('parse');

      console.log('[Telegram] 错误类型: ' + (isParseError ? '解析错误' : '其他错误'));
      console.log('[Telegram] 错误详情: ' + errorDesc);

      if (isParseError) {
        console.log('[Telegram] 尝试纯文本发送...');
        const fallbackResponse = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: config.TG_CHAT_ID,
            text: String(message)
          })
        });
        const fallbackResult = await fallbackResponse.json();
        console.log('[Telegram] 纯文本发送结果:', JSON.stringify(fallbackResult));
        return fallbackResult.ok;
      }
    }

    return result.ok;
  } catch (error) {
    console.error('[Telegram] 发送通知异常:', error.message);
    console.error('[Telegram] 错误类型:', error.constructor.name);
    return false;
  }
}

export { sendTelegramNotification, escapeMarkdownV2 };
