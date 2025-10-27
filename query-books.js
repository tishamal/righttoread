#!/usr/bin/env node

/**
 * Simple script to query books from the database
 * Usage: node query-books.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.db
const envPath = path.join(__dirname, '.env.db');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && !process.env[key]) {
      process.env[key] = value ? value.trim() : '';
    }
  });
}

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'right_to_read',
};

console.log('📋 Database Configuration:');
console.log(`   Host: ${config.host}`);
console.log(`   Port: ${config.port}`);
console.log(`   User: ${config.user}`);
console.log(`   Database: ${config.database}\n`);

const pool = new Pool(config);

async function queryBooks() {
  try {
    console.log('🔍 Connecting to database...\n');
    
    // Test connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log(`📅 Server time: ${testResult.rows[0].now}\n`);

    // Query all books
    console.log('📚 Querying books from database...\n');
    const result = await pool.query(`
      SELECT 
        id,
        title,
        grade,
        subject,
        author,
        published_by_nie,
        status,
        created_at,
        updated_at
      FROM books
      ORDER BY grade ASC, created_at DESC
    `);

    if (result.rows.length === 0) {
      console.log('❌ No books found in database.');
      console.log('📝 The books table is empty.\n');
      console.log('To add books, use the backend API or insert sample data.\n');
    } else {
      console.log(`✅ Found ${result.rows.length} book(s) in database:\n`);
      console.log('=' .repeat(120));
      
      result.rows.forEach((book, index) => {
        console.log(`\n📖 Book ${index + 1}:`);
        console.log(`   ID:          ${book.id}`);
        console.log(`   Title:       ${book.title}`);
        console.log(`   Grade:       ${book.grade}`);
        console.log(`   Subject:     ${book.subject}`);
        console.log(`   Author:      ${book.author || '(Not specified)'}`);
        console.log(`   Status:      ${book.status}`);
        console.log(`   Published:   ${book.published_by_nie ? 'Yes (by NIE)' : 'No'}`);
        console.log(`   Created:     ${new Date(book.created_at).toLocaleString()}`);
        console.log(`   Updated:     ${new Date(book.updated_at).toLocaleString()}`);
      });
      
      console.log('\n' + '='.repeat(120));
      console.log(`\n✅ Total books: ${result.rows.length}`);
      
      // Summary by grade
      console.log('\n📊 Summary by Grade:');
      const byGrade = {};
      result.rows.forEach(book => {
        byGrade[book.grade] = (byGrade[book.grade] || 0) + 1;
      });
      Object.entries(byGrade).sort().forEach(([grade, count]) => {
        console.log(`   Grade ${grade}: ${count} book(s)`);
      });

      // Summary by status
      console.log('\n📊 Summary by Status:');
      const byStatus = {};
      result.rows.forEach(book => {
        byStatus[book.status] = (byStatus[book.status] || 0) + 1;
      });
      Object.entries(byStatus).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} book(s)`);
      });
    }

    console.log('\n');
    await pool.end();
  } catch (error) {
    console.error('❌ Error querying database:');
    console.error(`   ${error.message}\n`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Troubleshooting:');
      console.log('   1. Is PostgreSQL running?');
      console.log('   2. Is docker-compose up running?');
      console.log('   3. Check connection details in backend/.env');
      console.log('   4. Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD');
    }
    
    process.exit(1);
  }
}

// Run the query
queryBooks();
