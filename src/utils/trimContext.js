const CHARS_PER_TOKEN = 4;

function countChars(messages) {
  return messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0);
}

function trimMessages(messages, maxTokens = 2000) {
  if (messages.length === 0) return messages;

  const maxChars = maxTokens * CHARS_PER_TOKEN;
  const systemMsg = messages[0];
  const history = messages.slice(1);

  const result = [systemMsg];
  let used = systemMsg.content.length;
  for (let i = history.length - 1; i >= 0; i--) {
    const len = history[i].content.length;
    if (used + len > maxChars) break;
    result.splice(1, 0, history[i]);
    used += len;
  }

  return result;
}

module.exports = { trimMessages, countChars };
