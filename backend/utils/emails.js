const nodemailer = require('nodemailer');
const formatCurrency = require('./formatCurrency');

class EmailService {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.name || user.email.split('@')[0];
    this.url = url;
    this.from = `Fincheck 💸 <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Brevo when in production

      return nodemailer.createTransport({
        service: 'Brevo',
        host: process.env.BREVO_EMAIL_HOST,
        port: process.env.BREVO_EMAIL_PORT,
        auth: {
          user: process.env.BREVO_EMAIL_USERNAME,
          pass: process.env.BREVO_EMAIL_PASSWORD,
        },
      });
    }

    // uses mailtrap when in development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  //   actualy sends the email
  async send(subject, htmlContent) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: htmlContent,
    };

    // creates a transport and sends the email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
      'Welcome to Fincheck 🎉',
      `<h1>Hello, ${this.name}! 👋</h1><p>Thanks for signing up. You can start managing your finances <a href="${this.url}">here</a>.</p>`
    );
  }

  async sendPasswordReset() {
    await this.send(
      'Your password reset link (valid for 10 min)',
      `<p>Hi ${this.name},</p><p>Click below to reset your password:</p><p><a href="${this.url}">${this.url}</a></p><p>If you didn't request this, please ignore.</p>`
    );
  }

  async sendWeeklySummary({
    startOfWeek,
    endOfWeek,
    totalIncome,
    totalExpenses,
    percentUsed,
    comparisonText,
  }) {
    // Format currency amounts using locale-aware utility
    const incomeFormatted = await formatCurrency(totalIncome, {
      lastKnownIP: this.user?.lastKnownIP,
      preferredLocale: this.user?.preferredLocale,
      preferredCurrency: this.user?.preferredCurrency,
    });

    const expensesFormatted = await formatCurrency(totalExpenses, {
      lastKnownIP: this.user?.lastKnownIP,
      preferredLocale: this.user?.preferredLocale,
      preferredCurrency: this.user?.preferredCurrency,
    });

    const friendlyComment =
      percentUsed <= 100
        ? `🎉 Awesome! You're doing great and staying within your budget. Keep it up!`
        : `😬 You've spent more than your monthly budget. Consider reviewing your spending categories.`;

    const summaryHtml = `
    <h1>Hello, ${this.name}! 👋</h1>
    <h2>📊 Your Fincheck Weekly Summary</h2>
    <p>Week of ${startOfWeek.toDateString()} – ${endOfWeek.toDateString()}</p>
    <p><strong>💰 Income:</strong> ${incomeFormatted}</p>
    <p><strong>💸 Expenses:</strong> ${expensesFormatted}</p>
    <p><strong>📊 Change:</strong> ${comparisonText}</p>
    <p><strong>📉 Budget Used:</strong> ${Math.round(percentUsed)}%</p>
    <p>${friendlyComment}</p>
    <br />
    <a href="${
      this.url
    }/api/v1/users/me" style="padding: 10px 20px; background: #00b894; color: white; text-decoration: none; border-radius: 5px;">📈 See full insights</a>
  `;

    await this.send('Your Weekly Fincheck Summary 🌟', summaryHtml);
  }
}

module.exports = EmailService;
