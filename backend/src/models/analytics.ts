import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';

export interface Analytics {
  id: string;
  book_id: string;
  user_id?: string;
  school_name: string;
  reading_time_minutes: number;
  pages_read: number;
  audio_played: boolean;
  interaction_type?: string;
  created_at: Date;
}

export const analyticsModel = {
  async create(analyticsData: Partial<Analytics>): Promise<Analytics> {
    const id = uuidv4();
    const query = `
      INSERT INTO analytics (id, book_id, user_id, school_name, reading_time_minutes, pages_read, audio_played, interaction_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      id,
      analyticsData.book_id,
      analyticsData.user_id,
      analyticsData.school_name,
      analyticsData.reading_time_minutes || 0,
      analyticsData.pages_read || 0,
      analyticsData.audio_played || false,
      analyticsData.interaction_type,
    ]);
    return result.rows[0];
  },

  async getByBookId(bookId: string): Promise<Analytics[]> {
    const query = 'SELECT * FROM analytics WHERE book_id = $1 ORDER BY created_at DESC;';
    const result = await pool.query(query, [bookId]);
    return result.rows;
  },

  async getBySchool(schoolName: string): Promise<Analytics[]> {
    const query = 'SELECT * FROM analytics WHERE school_name = $1 ORDER BY created_at DESC;';
    const result = await pool.query(query, [schoolName]);
    return result.rows;
  },

  async getDateRange(startDate: Date, endDate: Date): Promise<Analytics[]> {
    const query = `
      SELECT * FROM analytics 
      WHERE created_at BETWEEN $1 AND $2 
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  },

  async getTotalReadingTime(bookId: string): Promise<number> {
    const query = 'SELECT SUM(reading_time_minutes) FROM analytics WHERE book_id = $1;';
    const result = await pool.query(query, [bookId]);
    return result.rows[0].sum || 0;
  },

  async getAverageReadingTime(bookId: string): Promise<number> {
    const query = 'SELECT AVG(reading_time_minutes) FROM analytics WHERE book_id = $1;';
    const result = await pool.query(query, [bookId]);
    return result.rows[0].avg || 0;
  },

  async getSchoolUsageStats(): Promise<any[]> {
    const query = `
      SELECT 
        school_name, 
        COUNT(*) as total_interactions,
        SUM(reading_time_minutes) as total_reading_time,
        COUNT(DISTINCT book_id) as books_used,
        SUM(CASE WHEN audio_played THEN 1 ELSE 0 END) as audio_plays
      FROM analytics
      GROUP BY school_name
      ORDER BY total_interactions DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async getBookUsageStats(): Promise<any[]> {
    const query = `
      SELECT 
        b.id,
        b.title,
        b.grade,
        COUNT(a.id) as total_interactions,
        SUM(a.reading_time_minutes) as total_reading_time,
        SUM(CASE WHEN a.audio_played THEN 1 ELSE 0 END) as audio_plays
      FROM books b
      LEFT JOIN analytics a ON b.id = a.book_id
      GROUP BY b.id, b.title, b.grade
      ORDER BY total_interactions DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  },
};
