const cron = require('node-cron');
const Finances = require('../models/financesModel');
const User = require('../models/userModel');
const EmailService = require('./emails');
// const { getLocaleFromIP } = require('./geoUtils'); // REMOVED

const sendWeeklySummaries = async () => {
  const users = await User.find({});

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() - 6); // Last Monday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

  const month = now.getMonth();
  const year = now.getFullYear();

  for (const user of users) {
    const finances = await Finances.findOne({ user: user._id, month, year });
    if (!finances) continue;

    const weeklyTransactions = finances.transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate >= startOfWeek && txDate <= endOfWeek;
    });

    const totalIncome = weeklyTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpenses = weeklyTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const prevStartOfWeek = new Date(startOfWeek);
    prevStartOfWeek.setDate(prevStartOfWeek.getDate() - 7);
    const prevEndOfWeek = new Date(endOfWeek);
    prevEndOfWeek.setDate(prevEndOfWeek.getDate() - 7);

    const prevWeekTransactions = finances.transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate >= prevStartOfWeek && txDate <= prevEndOfWeek;
    });

    const prevWeekExpenses = prevWeekTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    let comparisonText = 'No previous data for comparison.';
    if (prevWeekExpenses > 0) {
      const ratio = (totalExpenses / prevWeekExpenses) * 100;
      const rounded = Math.round(ratio);
      const direction = ratio > 100 ? '↑' : ratio < 100 ? '↓' : '↔';
      comparisonText = `${rounded}% ${direction} vs previous week`;
    }

    const budget = finances.totalMonthlyBudget || 0;
    const spentSoFar = finances.expensesTotal;
    const percentUsed = budget ? (spentSoFar / budget) * 100 : 0;

    const appUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

    // 🌍 IP/Locale detection REMOVED

    const emailInstance = new EmailService(user, appUrl);
    await emailInstance.sendWeeklySummary({
      startOfWeek,
      endOfWeek,
      totalIncome,
      totalExpenses,
      percentUsed,
      comparisonText,
      // locale, // REMOVED
      // currency, // REMOVED
    });
  }
};

// Run manually or via cron
cron.schedule('0 12 * * 1', () => {
  console.log('⏰ Sending weekly summaries...');
  sendWeeklySummaries().catch(console.error);
});

// cron.schedule('* * * * *', () => {
//   console.log('⏰ Sending weekly summaries...');
//   sendWeeklySummaries().catch(console.error);
// });

module.exports = { sendWeeklySummaries };
