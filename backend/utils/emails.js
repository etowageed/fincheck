const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');
const formatCurrency = require('./formatCurrency');

class EmailService {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.user = user; // Added user to instance for formatCurrency
    this.from = `Fincheck 💸 <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // uses Brevo in production

    if (process.env.NODE_ENV === 'production') {
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
  async send(template, subject, templateData = {}) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(
      path.join(__dirname, `../views/emails/${template}.pug`),
      {
        firstName: this.firstName,
        url: this.url,
        subject,
        ...templateData,
      }
    );

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      // text: htmlToText.fromString(html) // Optional: convert HTML to text
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Fincheck Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
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
    const incomeFormatted = formatCurrency(totalIncome, {
      preferredLocale: this.user?.preferredLocale,
      preferredCurrency: this.user?.preferredCurrency,
    });

    const expensesFormatted = formatCurrency(totalExpenses, {
      preferredLocale: this.user?.preferredLocale,
      preferredCurrency: this.user?.preferredCurrency,
    });

    const friendlyComment =
      percentUsed <= 100
        ? `🎉 Awesome! You're doing great and staying within your budget. Keep it up!`
        : `😬 You've spent more than your monthly budget. Consider reviewing your spending categories.`;

    await this.send('weeklySummary', 'Your Weekly Fincheck Summary 🌟', {
      startOfWeek: startOfWeek.toDateString(),
      endOfWeek: endOfWeek.toDateString(),
      incomeFormatted,
      expensesFormatted,
      percentUsed: Math.round(percentUsed),
      comparisonText,
      friendlyComment,
    });
  }

  async sendPremiumWelcome() {
    await this.send('premiumWelcome', 'Welcome to Fincheck Premium! 🌟');
  }
}

module.exports = EmailService;
