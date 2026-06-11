class EmailService {
  async sendWelcome({ email, name }) {
    console.log(`[EmailService] Welcome письмо для ${name} на ${email}`);
  }

  async sendLoginAlert({ email, name }) {
    console.log(`[EmailService] Login alert для ${name} на ${email}`);
  }

  async sendCallbackReminder({ email, name, clientName, phone }) {
    console.log(
      `[EmailService] Reminder для ${name}: позвонить ${clientName} (${phone})`,
    );
  }
}

module.exports = new EmailService();
