const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Finances = require('../models/financesModel');
const Category = require('../models/categoryModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const formatCurrency = require('../utils/formatCurrency'); // Utility to format currency

// --- Private Helper Functions ---

/**
 * Fetches all relevant Finances documents for the specified time period.
 * @param {string} userId
 * @param {number} days
 * @returns {Array<Object>} Array of Finances documents.
 */
const _fetchFinancialData = async (userId, days) => {
  const toDate = new Date();
  const fromDate = new Date(toDate.getTime() - days * 24 * 60 * 60 * 1000);

  // Find all documents for the user that fall within the time range
  const documents = await Finances.find({
    user: userId,
    createdAt: { $gte: fromDate, $lte: toDate },
  }).sort({ year: 1, month: 1 });

  return documents;
};

/**
 * Flattens and filters transactions from multiple documents.
 */
const _processTransactions = (documents, filterType = 'all') => {
  const transactions = [];
  documents.forEach((doc) => {
    doc.transactions.forEach((tx) => {
      if (filterType === 'all' || tx.type === filterType) {
        transactions.push({
          ...tx.toObject(),
          // Use a simple date string for consistency in export
          date: tx.date.toISOString().split('T')[0],
          month: doc.month,
          year: doc.year,
        });
      }
    });
  });
  // Sort by date descending
  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

/**
 * Flattens and processes budget items from multiple documents.
 */
const _processBudget = (documents) => {
  const budgetItems = [];
  documents.forEach((doc) => {
    doc.monthlyBudget.forEach((item) => {
      budgetItems.push({
        ...item.toObject(),
        month: doc.month,
        year: doc.year,
      });
    });
  });
  return budgetItems;
};

/**
 * Finds category names for IDs.
 */
const _mapCategoryIds = async (data) => {
  if (data.length === 0) return data;

  const categoryIds = new Set();
  data.forEach((item) => categoryIds.add(item.category));

  const categories = await Category.find({
    _id: { $in: Array.from(categoryIds).map((id) => id.toString()) },
  });

  const categoryMap = categories.reduce((map, cat) => {
    map[cat._id.toString()] = cat.name;
    return map;
  }, {});

  return data.map((item) => ({
    ...item,
    categoryName: categoryMap[item.category] || 'Uncategorized',
  }));
};

/**
 * Generates an Excel (XLSX) file.
 */
const _generateExcel = async (data, format, res, user) => {
  const workbook = new ExcelJS.Workbook();
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  if (data.transactions.length > 0) {
    const sheet = workbook.addWorksheet('Transactions');
    sheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Category', key: 'categoryName', width: 25 },
      { header: 'Month', key: 'monthName', width: 15 },
      { header: 'Year', key: 'year', width: 10 },
    ];

    const mappedTransactions = await _mapCategoryIds(data.transactions);

    mappedTransactions.forEach((tx) => {
      sheet.addRow({
        ...tx,
        amount: parseFloat(tx.amount.toFixed(2)),
        monthName: monthNames[tx.month],
      });
    });

    // Formatting currency column
    sheet.getColumn('amount').numFmt = formatCurrency(1000, user, true)
      .replace('1,000', '0')
      .replace('1', '0');
  }

  if (data.budget.length > 0) {
    const sheet = workbook.addWorksheet('Budget Items');
    sheet.columns = [
      { header: 'Month', key: 'monthName', width: 15 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Category', key: 'categoryName', width: 25 },
      { header: 'Recurring', key: 'isRecurring', width: 15 },
      { header: 'Description', key: 'description', width: 40 },
    ];

    const mappedBudget = await _mapCategoryIds(data.budget);

    mappedBudget.forEach((item) => {
      sheet.addRow({
        ...item,
        amount: parseFloat(item.amount.toFixed(2)),
        monthName: monthNames[item.month],
        isRecurring: item.isRecurring ? 'Yes' : 'No',
      });
    });

    // Formatting currency column
    sheet.getColumn('amount').numFmt = formatCurrency(1000, user, true)
      .replace('1,000', '0')
      .replace('1', '0');
  }

  const filename = `${format.type}-${format.days}days-report.xlsx`;
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);
  res.end();
};

/**
 * Generates a PDF file (simplified).
 */
const _generatePDF = async (data, format, res, user) => {
  const doc = new PDFDocument();
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const filename = `${format.type}-${format.days}days-report.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);
  doc
    .fontSize(18)
    .text(`Fincheck Financial Report (${format.type})`, { align: 'center' });
  doc
    .fontSize(10)
    .text(`Period: Last ${format.days} days`, { align: 'center' });
  doc.moveDown();

  // --- Transactions Section ---
  if (data.transactions.length > 0) {
    const mappedTransactions = await _mapCategoryIds(data.transactions);

    doc.fontSize(14).text('Transactions', { underline: true });
    doc.moveDown();

    mappedTransactions.forEach((tx, i) => {
      const amountFormatted = formatCurrency(tx.amount, user, true);
      const categoryName = tx.categoryName;
      const docLabel = `${monthNames[tx.month]} ${tx.year}`;

      doc
        .fontSize(11)
        .text(
          `${tx.date} | ${tx.description} | ${amountFormatted} | ${categoryName} (${tx.type}) | Doc: ${docLabel}`
        );
    });
    doc.moveDown();
  }

  // --- Budget Section ---
  if (data.budget.length > 0) {
    const mappedBudget = await _mapCategoryIds(data.budget);

    doc.fontSize(14).text('Budget Items', { underline: true });
    doc.moveDown();

    mappedBudget.forEach((item, i) => {
      const amountFormatted = formatCurrency(item.amount, user, true);
      const categoryName = item.categoryName;
      const docLabel = `${monthNames[item.month]} ${item.year}`;

      doc
        .fontSize(11)
        .text(
          `${docLabel} | ${item.name} | ${amountFormatted} | ${categoryName} (${
            item.isRecurring ? 'Recurring' : 'One-time'
          })`
        );
    });
    doc.moveDown();
  }

  if (data.transactions.length === 0 && data.budget.length === 0) {
    doc
      .fontSize(12)
      .text('No data found for the selected criteria.', { align: 'center' });
  }

  doc.end();
};

// --- Main Controller Function ---

exports.generateReport = catchAsync(async (req, res, next) => {
  const format = req.query.format; // 'pdf' or 'excel'
  const type = req.query.type; // 'transactions', 'budget', or 'all'
  const days = parseInt(req.query.days, 10) || 30; // 30, 90, 180, 365

  if (!['pdf', 'excel'].includes(format)) {
    return next(
      new AppError('Invalid format. Use ?format=pdf or ?format=excel', 400)
    );
  }

  if (!['transactions', 'budget', 'all', 'income', 'expense'].includes(type)) {
    return next(
      new AppError(
        'Invalid content type. Use ?type=transactions, ?type=budget, ?type=income, ?type=expense or ?type=all',
        400
      )
    );
  }

  if (days < 1) {
    return next(new AppError('Days must be a positive number', 400));
  }

  // Fetch financial documents for the time range
  const documents = await _fetchFinancialData(req.user.id, days);

  if (documents.length === 0) {
    return next(
      new AppError(`No financial data found for the last ${days} days.`, 404)
    );
  }

  let data = {
    transactions: [],
    budget: [],
  };

  // 1. Collect Transactions/Income/Expense
  if (type === 'transactions' || type === 'all') {
    data.transactions = _processTransactions(documents, 'all');
  } else if (type === 'income') {
    data.transactions = _processTransactions(documents, 'income');
  } else if (type === 'expense') {
    data.transactions = _processTransactions(documents, 'expense');
  }

  // 2. Collect Budget Items (if requested)
  if (type === 'budget' || type === 'all') {
    data.budget = _processBudget(documents);
  }

  // Ensure there is content before attempting to generate the report
  if (data.transactions.length === 0 && data.budget.length === 0) {
    return next(
      new AppError(
        `No matching ${type} data found for the last ${days} days.`,
        404
      )
    );
  }

  const exportFormat = { type, format, days };

  // 3. Generate the report
  if (format === 'excel') {
    await _generateExcel(data, exportFormat, res, req.user);
  } else if (format === 'pdf') {
    await _generatePDF(data, exportFormat, res, req.user);
  }
});
