const nodemailer = require('nodemailer');

class EmailService {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.name || user.email.split('@')[0];
    this.url = url;
    this.from = `Fincheck 👋 <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid when in production

      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
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
      `<h1>Hello, ${this.name}!</h1><p>Thanks for signing up. You can start managing your finances <a href="${this.url}">here</a>.</p>`
    );
  }

  async sendPasswordReset() {
    await this.send(
      'Your password reset link (valid for 10 min)',
      `<p>Hi ${this.name},</p><p>Click below to reset your password:</p><p><a href="${this.url}">${this.url}</a></p><p>If you didn't request this, please ignore.</p>`
    );
  }
}

module.exports = EmailService;
