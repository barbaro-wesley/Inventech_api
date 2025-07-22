const axios = require('axios');

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const enviarNotificacaoTelegram = async (chatId, mensagem) => {
  if (!TELEGRAM_TOKEN) {
    return;
  }

  const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    const response = await axios.post(TELEGRAM_API, {
      chat_id: chatId,
      text: mensagem,
      parse_mode: 'HTML',
    });
  } catch (error) {
  }
};

module.exports = enviarNotificacaoTelegram;
