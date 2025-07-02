// backend/utils/__mocks__/emails.js
module.exports = class {
  constructor() {}
  async sendWelcome() {
    return true;
  }
  async sendPasswordReset() {
    return true;
  }
};
