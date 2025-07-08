const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Finances = require('../models/financesModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.downloadData = catchAsync(async (req, res, next) => {
  const format = req.query.format; // 'pdf' or 'excel'
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const finances = await Finances.findOne({ user: req.user.id, month, year });

  if (!finances) {
    return next(new AppError('No data found for this month', 404));
  }

  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Transactions');

    sheet.columns = [
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Date', key: 'date', width: 20 },
    ];

    finances.transactions.forEach((tx) => {
      sheet.addRow({
        description: tx.description,
        amount: tx.amount,
        category: tx.category,
        type: tx.type,
        date: tx.date.toISOString().split('T')[0],
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=finances.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } else if (format === 'pdf') {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=finances.pdf');

    doc.pipe(res);
    doc.fontSize(18).text('Fincheck - Monthly Report', { align: 'center' });
    doc.moveDown();

    finances.transactions.forEach((tx, i) => {
      doc
        .fontSize(12)
        .text(
          `${i + 1}. ${tx.description} | ₦${tx.amount} | ${tx.category} | ${
            tx.type
          } | ${tx.date.toDateString()}`
        );
    });

    doc.end();
  } else {
    return next(
      new AppError('Invalid format. Use ?format=pdf or ?format=excel', 400)
    );
  }
});
