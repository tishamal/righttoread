import pool from './database';

export const initializeDatabase = async () => {
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id UUID PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        grade VARCHAR(50) NOT NULL,
        subject VARCHAR(100) DEFAULT 'English',
        author VARCHAR(255),
        description TEXT,
        published_by_nie BOOLEAN DEFAULT false,
        year_published INTEGER,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id UUID PRIMARY KEY,
        book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        page_number INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS paragraphs (
        id UUID PRIMARY KEY,
        page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        ssml_text TEXT,
        audio_s3_key VARCHAR(500),
        paragraph_order INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS digital_versions (
        id UUID PRIMARY KEY,
        book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        approval_notes TEXT,
        approved_by UUID REFERENCES users(id),
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id UUID PRIMARY KEY,
        book_id UUID REFERENCES books(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        school_name VARCHAR(255),
        reading_time_minutes INTEGER DEFAULT 0,
        pages_read INTEGER DEFAULT 0,
        audio_played BOOLEAN DEFAULT false,
        interaction_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_books_grade ON books(grade);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_book_id ON analytics(book_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_digital_versions_book_id ON digital_versions(book_id);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};
