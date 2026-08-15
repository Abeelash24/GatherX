import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'gatherx.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database:', dbPath);
});

function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function printSection(title) {
  console.log('\n' + '='.repeat(60));
  console.log(`📊 ${title}`);
  console.log('='.repeat(60));
}

function printTable(headers, rows) {
  if (rows.length === 0) {
    console.log('No data available.');
    return;
  }
  const colWidths = headers.map((h, i) => {
    const maxContent = rows.reduce((max, row) => Math.max(max, String(row[Object.keys(row)[i]] || '').length), 0);
    return Math.max(h.length, maxContent);
  });
  const formatRow = (row) => headers.map((h, i) => {
    const val = String(row[Object.keys(row)[i]] ?? '');
    return val.padEnd(colWidths[i]);
  }).join(' | ');
  console.log(headers.map((h, i) => h.padEnd(colWidths[i])).join(' | '));
  console.log(colWidths.map(w => '-'.repeat(w)).join('-+-'));
  rows.forEach(row => console.log(formatRow(row)));
}

async function analyzePaymentMethods() {
  printSection('PAYMENT METHODS ANALYSIS');

  const query = `
    SELECT 
      paymentMethod,
      COUNT(*) AS count,
      SUM(paymentAmount) AS totalAmount,
      AVG(paymentAmount) AS avgAmount,
      MIN(paymentAmount) AS minAmount,
      MAX(paymentAmount) AS maxAmount
    FROM registrations
    WHERE paymentMethod IS NOT NULL AND paymentMethod != ''
    GROUP BY paymentMethod
    ORDER BY count DESC
  `;

  const rows = await runQuery(query);
  console.log('\n🏦 Payment Methods Distribution (Ordered by Usage Count):\n');
  printTable(
    ['Payment Method', 'Count', 'Total Amount', 'Avg Amount', 'Min', 'Max'],
    rows.map(r => ({
      paymentMethod: r.paymentMethod,
      count: r.count,
      totalAmount: `₹${Number(r.totalAmount || 0).toFixed(2)}`,
      avgAmount: `₹${Number(r.avgAmount || 0).toFixed(2)}`,
      minAmount: `₹${Number(r.minAmount || 0).toFixed(2)}`,
      maxAmount: `₹${Number(r.maxAmount || 0).toFixed(2)}`,
    }))
  );

  const total = rows.reduce((sum, r) => sum + r.count, 0);
  console.log(`\n📈 Total transactions: ${total}`);
  rows.forEach(r => {
    const pct = ((r.count / total) * 100).toFixed(1);
    console.log(`   ${r.paymentMethod}: ${r.count} (${pct}%)`);
  });
}

async function analyzeTopColleges() {
  printSection('TOP COLLEGES ANALYSIS');

  const query = `
    SELECT 
      college,
      COUNT(*) AS registrationCount,
      SUM(paymentAmount) AS totalAmount,
      AVG(paymentAmount) AS avgAmount,
      MAX(paymentAmount) AS maxAmount
    FROM registrations
    WHERE college IS NOT NULL AND college != ''
    GROUP BY college
    ORDER BY registrationCount DESC
    LIMIT 20
  `;

  const rows = await runQuery(query);
  console.log('\n🏆 Top Colleges by Registration Count:\n');
  printTable(
    ['Rank', 'College', 'Registrations', 'Total Amount', 'Avg Amount'],
    rows.map((r, i) => ({
      Rank: `#${i + 1}`,
      college: r.college,
      registrationCount: r.registrationCount,
      totalAmount: `₹${Number(r.totalAmount || 0).toFixed(2)}`,
      avgAmount: `₹${Number(r.avgAmount || 0).toFixed(2)}`,
    }))
  );

  const total = rows.reduce((sum, r) => sum + r.registrationCount, 0);
  console.log(`\n📈 Total registrations across top colleges: ${total}`);
}

async function analyzePaymentStatus() {
  printSection('PAYMENT STATUS BREAKDOWN');

  const query = `
    SELECT 
      paymentStatus,
      COUNT(*) AS count,
      SUM(paymentAmount) AS totalAmount,
      AVG(paymentAmount) AS avgAmount
    FROM registrations
    GROUP BY paymentStatus
    ORDER BY count DESC
  `;

  const rows = await runQuery(query);
  console.log('\n💳 Payment Status Distribution:\n');
  printTable(
    ['Status', 'Count', 'Total Amount', 'Avg Amount'],
    rows.map(r => ({
      paymentStatus: r.paymentStatus,
      count: r.count,
      totalAmount: `₹${Number(r.totalAmount || 0).toFixed(2)}`,
      avgAmount: `₹${Number(r.avgAmount || 0).toFixed(2)}`,
    }))
  );

  const total = rows.reduce((sum, r) => sum + r.count, 0);
  const completed = rows.find(r => r.paymentStatus === 'completed')?.count || 0;
  const pending = rows.find(r => r.paymentStatus === 'pending')?.count || 0;
  const failed = rows.find(r => r.paymentStatus === 'failed')?.count || 0;
  console.log(`\n📈 Completion Rate: ${total > 0 ? ((completed / total) * 100).toFixed(1) : 0}%`);
  console.log(`   Pending: ${pending} (${((pending / total) * 100).toFixed(1)}%)`);
  console.log(`   Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)`);
}

async function analyzeDepartments() {
  printSection('TOP DEPARTMENTS ANALYSIS');

  const query = `
    SELECT 
      departments,
      COUNT(*) AS count,
      SUM(paymentAmount) AS totalAmount
    FROM registrations
    WHERE departments IS NOT NULL AND departments != ''
    GROUP BY departments
    ORDER BY count DESC
    LIMIT 15
  `;

  const rows = await runQuery(query);
  console.log('\n🎓 Top Departments by Registration Count:\n');
  printTable(
    ['Rank', 'Department', 'Registrations', 'Total Amount'],
    rows.map((r, i) => ({
      Rank: `#${i + 1}`,
      departments: r.departments,
      count: r.count,
      totalAmount: `₹${Number(r.totalAmount || 0).toFixed(2)}`,
    }))
  );
}

async function analyzeParticipationTypes() {
  printSection('PARTICIPATION TYPE ANALYSIS');

  const query = `
    SELECT 
      participationType,
      COUNT(*) AS count,
      SUM(paymentAmount) AS totalAmount,
      AVG(paymentAmount) AS avgAmount
    FROM registrations
    GROUP BY participationType
    ORDER BY count DESC
  `;

  const rows = await runQuery(query);
  console.log('\n👥 Participation Type Distribution:\n');
  printTable(
    ['Type', 'Count', 'Total Amount', 'Avg Amount'],
    rows.map(r => ({
      participationType: r.participationType,
      count: r.count,
      totalAmount: `₹${Number(r.totalAmount || 0).toFixed(2)}`,
      avgAmount: `₹${Number(r.avgAmount || 0).toFixed(2)}`,
    }))
  );

  const total = rows.reduce((sum, r) => sum + r.count, 0);
  rows.forEach(r => {
    const pct = ((r.count / total) * 100).toFixed(1);
    console.log(`   ${r.participationType}: ${r.count} (${pct}%)`);
  });
}

async function analyzeEventsPerformance() {
  printSection('EVENTS PERFORMANCE ANALYSIS');

  const query = `
    SELECT 
      e.id,
      e.title,
      e.category,
      e.date,
      e.capacity,
      COUNT(r.id) AS totalRegistrations,
      SUM(CASE WHEN r.paymentStatus = 'completed' THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN r.paymentStatus = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN r.paymentStatus = 'failed' THEN 1 ELSE 0 END) AS failed,
      SUM(r.paymentAmount) AS totalRevenue
    FROM events e
    LEFT JOIN registrations r ON e.id = r.event_id
    GROUP BY e.id
    ORDER BY totalRegistrations DESC
  `;

  const rows = await runQuery(query);
  console.log('\n📅 Events Performance Overview:\n');
  printTable(
    ['ID', 'Title', 'Category', 'Date', 'Capacity', 'Regs', 'Completed', 'Pending', 'Failed', 'Revenue'],
    rows.map(r => ({
      id: r.id,
      title: r.title.length > 25 ? r.title.substring(0, 22) + '...' : r.title,
      category: r.category,
      date: r.date,
      capacity: r.capacity,
      totalRegistrations: r.totalRegistrations || 0,
      completed: r.completed || 0,
      pending: r.pending || 0,
      failed: r.failed || 0,
      totalRevenue: `₹${Number(r.totalRevenue || 0).toFixed(0)}`,
    }))
  );
}

async function generateExecutiveSummary() {
  printSection('EXECUTIVE SUMMARY');

  const totalRegs = await runQuery('SELECT COUNT(*) as count FROM registrations');
  const totalEvents = await runQuery('SELECT COUNT(*) as count FROM events');
  const totalRevenue = await runQuery(`
    SELECT SUM(paymentAmount) as total FROM registrations WHERE paymentStatus = 'completed'
  `);
  const avgAmount = await runQuery(`
    SELECT AVG(paymentAmount) as avg FROM registrations WHERE paymentStatus = 'completed'
  `);
  const topCollege = await runQuery(`
    SELECT college, COUNT(*) as count FROM registrations 
    WHERE college IS NOT NULL AND college != '' 
    GROUP BY college ORDER BY count DESC LIMIT 1
  `);
  const topPaymentMethod = await runQuery(`
    SELECT paymentMethod, COUNT(*) as count FROM registrations 
    WHERE paymentMethod IS NOT NULL AND paymentMethod != '' 
    GROUP BY paymentMethod ORDER BY count DESC LIMIT 1
  `);

  console.log('\n📋 Key Metrics:\n');
  console.log(`   Total Events: ${totalEvents[0]?.count || 0}`);
  console.log(`   Total Registrations: ${totalRegs[0]?.count || 0}`);
  console.log(`   Total Revenue: ₹${Number(totalRevenue[0]?.total || 0).toFixed(2)}`);
  console.log(`   Average Registration Amount: ₹${Number(avgAmount[0]?.avg || 0).toFixed(2)}`);
  console.log(`   Top College: ${topCollege[0]?.college || 'N/A'} (${topCollege[0]?.count || 0} registrations)`);
  console.log(`   Top Payment Method: ${topPaymentMethod[0]?.paymentMethod || 'N/A'} (${topPaymentMethod[0]?.count || 0} transactions)`);
}

async function runAllAnalyses() {
  console.log('\n🔍 GatherX Registration Data Analysis');
  console.log('='.repeat(60));

  try {
    await analyzePaymentMethods();
    await analyzeTopColleges();
    await analyzePaymentStatus();
    await analyzeDepartments();
    await analyzeParticipationTypes();
    await analyzeEventsPerformance();
    await generateExecutiveSummary();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Analysis completed successfully');
    console.log('='.repeat(60) + '\n');
  } catch (err) {
    console.error('❌ Analysis failed:', err.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

runAllAnalyses();
