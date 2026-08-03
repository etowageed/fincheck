const cron = require('node-cron');
const Finances = require('../models/financesModel');
const User = require('../models/userModel');
const EmailService = require('./emails');
// const { getLocaleFromIP } = require('./geoUtils'); // REMOVED

const sendWeeklySummaries = async () => {
  // Use a cursor to stream users one by one instead of loading all into memory
  const cursor = User.find({}).cursor();

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() - 6); // Last Monday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

  const month = now.getMonth();
  const year = now.getFullYear();

  const BATCH_SIZE = 10; // Process emails in small batches to balance throughput vs SMTP limits
  const BATCH_DELAY_MS = 2000; // Delay between batches (not individual emails)
  let batch = [];
  let totalSent = 0;
  let totalFailed = 0;

  // Helper to process a single user's summary email
  const processUser = async (user) => {
    const finances = await Finances.findOne({ user: user._id, month, year });
    if (!finances) return; // Skip users without finance data

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

    const totalSavings = weeklyTransactions
      .filter((tx) => tx.type === 'savings')
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

    const appUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`;
    const emailInstance = new EmailService(user, appUrl);
    await emailInstance.sendWeeklySummary({
      startOfWeek,
      endOfWeek,
      totalIncome,
      totalExpenses,
      totalSavings,
      percentUsed,
      comparisonText,
    });
  };

  // Process users in batches
  for await (const user of cursor) {
    batch.push(processUser(user));

    if (batch.length >= BATCH_SIZE) {
      const results = await Promise.allSettled(batch);
      results.forEach((r) => {
        if (r.status === 'fulfilled') totalSent++;
        else {
          totalFailed++;
          console.error('❌ Weekly summary email failed:', r.reason?.message);
        }
      });
      batch = [];

      // ⏱️ Delay between batches to respect SMTP rate limits
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  // Process remaining users in the final partial batch
  if (batch.length > 0) {
    const results = await Promise.allSettled(batch);
    results.forEach((r) => {
      if (r.status === 'fulfilled') totalSent++;
      else {
        totalFailed++;
        console.error('❌ Weekly summary email failed:', r.reason?.message);
      }
    });
  }

  console.log(
    `📊 Weekly summary complete: ${totalSent} sent, ${totalFailed} failed`,
  );
};

// Run manually or via cron

// every monday at 12pm
cron.schedule('0 12 * * 1', () => {
  console.log('⏰ Sending weekly summaries...');
  sendWeeklySummaries().catch(console.error);
});

// every minute - for testing
// cron.schedule('* * * * *', () => {
//   console.log('⏰ Sending weekly summaries...');
//   sendWeeklySummaries().catch(console.error);
// });

module.exports = { sendWeeklySummaries };
