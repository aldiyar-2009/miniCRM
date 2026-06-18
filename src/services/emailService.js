class EmailService {
  async sendWelcome({ email, name }) {
    console.log(`[EmailService] Приветственное письмо для ${name} на ${email}`);
  }

  async sendLoginAlert({ email, name }) {
    console.log(`[EmailService] Оповещение о входе для ${name} на ${email}`);
  }

  async sendCallbackReminder({ email, name, clientName, phone }) {
    console.log(
      `[EmailService] Напоминание для ${name}: позвонить ${clientName} (${phone})`,
    );
  }
}

module.exports = new EmailService();
