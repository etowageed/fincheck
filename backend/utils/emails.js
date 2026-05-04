const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');
const { convert } = require('html-to-text');
const formatCurrency = require('./formatCurrency');

class EmailService {
  constructor(user, url, sender = 'hello') {
    this.to = user.email;
    [this.firstName] = user.name.split(' ');
    this.url = url;
    this.user = user;

    let fromEmail;
    let fromName;

    switch (sender) {
      case 'no-reply':
        fromEmail =
          process.env.EMAIL_FROM_NOREPLY || 'no-reply@pletefinance.com';
        fromName = 'Plete';
        break;
      case 'support':
        fromEmail =
          process.env.EMAIL_FROM_SUPPORT || 'support@pletefinance.com';
        fromName = 'Plete Support';
        break;
      case 'hello':
      default:
        fromEmail = process.env.EMAIL_FROM_HELLO || 'hello@pletefinance.com';
        fromName = 'Morena from Plete';
        break;
    }

    this.from = `${fromName} <${fromEmail}>`;
  }

  static _createTransporter() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: process.env.BREVO_EMAIL_HOST,
        port: process.env.BREVO_EMAIL_PORT,
        pool: true,
        maxConnections: 10,
        maxMessages: 100,
        auth: {
          user: process.env.BREVO_EMAIL_USERNAME,
          pass: process.env.BREVO_EMAIL_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      pool: true,
      maxConnections: 10,
      maxMessages: 100,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  static get transporter() {
    if (!EmailService.sharedTransporter) {
      EmailService.sharedTransporter = EmailService._createTransporter();
    }
    return EmailService.sharedTransporter;
  }

  async send(template, subject, templateData = {}) {
    try {
      // 1) Render HTML based on a pug template
      const html = pug.renderFile(
        path.join(__dirname, `../views/emails/${template}.pug`),
        {
          firstName: this.firstName,
          url: this.url,
          subject,
          ...templateData,
        },
      );

      // 2) Generate text version
      const text = convert(html, {
        wordwrap: 130,
      });

      // 3) Define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text,
      };

      // 4) Create a transport and send email
      await EmailService.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent: ${subject} to ${this.to}`);
    } catch (err) {
      console.error(`❌ Error sending email: ${err.message}`);
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Plete Finance Family! 🎉');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
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
        ? "🎉 Awesome! You're doing great and staying within your budget. Keep it up!"
        : "😬 You've spent more than your monthly budget. Review your categories.";

    await this.send('weeklySummary', 'Your Weekly Plete Finance Summary 🌟', {
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
    await this.send('premiumWelcome', 'Welcome to Plete Finance Premium! 🌟');
  }
}

module.exports = EmailService;
