import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';

export interface Book {
  id: string;
  title: string;
  grade: string;
  subject: string;
  author: string;
  description?: string;
  published_by_nie: boolean;
  year_published?: number;
  status: 'draft' | 'pending' | 'approved' | 'published';
  created_at: Date;
  updated_at: Date;
}

export const bookModel = {
  async create(bookData: Partial<Book>): Promise<Book> {
    const id = uuidv4();
    const query = `
      INSERT INTO books (id, title, grade, subject, author, description, published_by_nie, year_published, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      id,
      bookData.title,
      bookData.grade,
      bookData.subject || 'English',
      bookData.author,
      bookData.description,
      bookData.published_by_nie || false,
      bookData.year_published,
      bookData.status || 'draft',
    ]);
    return result.rows[0];
  },

  async getById(id: string): Promise<Book | null> {
    const query = 'SELECT * FROM books WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  },

  async getAll(grade?: string): Promise<Book[]> {
    let query = 'SELECT * FROM books';
    const params: any[] = [];

    if (grade && grade !== 'All Grades') {
      query += ' WHERE grade = $1';
      params.push(grade);
    }

    query += ' ORDER BY created_at DESC;';
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getByGrade(grade: string): Promise<Book[]> {
    const query = 'SELECT * FROM books WHERE grade = $1 ORDER BY created_at DESC;';
    const result = await pool.query(query, [grade]);
    return result.rows;
  },

  async update(id: string, bookData: Partial<Book>): Promise<Book | null> {
    const allowedFields = ['title', 'grade', 'subject', 'author', 'description', 'published_by_nie', 'year_published', 'status'];
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    Object.entries(bookData).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        params.push(value);
        paramCount++;
      }
    });

    if (updateFields.length === 0) return null;

    params.push(id);
    const query = `
      UPDATE books
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM books WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  },

  async count(): Promise<number> {
    const query = 'SELECT COUNT(*) FROM books;';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  },
};
