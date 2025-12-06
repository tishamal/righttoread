# Python Flask Backend Example for Analytics API
# This is a starter template - adapt to your existing backend structure

from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import time
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'right_to_read_db',
    'user': 'postgres',
    'password': 'your_password',
    'port': 5432
}

def get_db_connection():
    """Create database connection"""
    conn = psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
    return conn

def get_time_range_ms(range_str):
    """Convert range string to milliseconds"""
    ranges = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
        '365d': 365 * 24 * 60 * 60 * 1000,
    }
    end_time = int(time.time() * 1000)
    start_time = end_time - ranges.get(range_str, ranges['30d'])
    return start_time, end_time

def calculate_percentage_change(current, previous):
    """Calculate percentage change between two values"""
    if previous == 0:
        return 100 if current > 0 else 0
    return round(((current - previous) / previous) * 100)

# ============================================================================
# 1. OVERVIEW STATS
# ============================================================================
@app.route('/api/analytics/overview', methods=['GET'])
def get_overview_stats():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get current period stats
        cur.execute("""
            SELECT 
                COUNT(*) FILTER (WHERE is_active = true) as total_active_schools,
                (SELECT COUNT(DISTINCT book_id) FROM books) as total_books,
                COALESCE(SUM(total_reading_time_ms), 0) as total_reading_time_ms,
                COALESCE(SUM(total_records), 0) as total_records,
                COUNT(*) FILTER (
                    WHERE last_sync_time >= EXTRACT(EPOCH FROM NOW() - INTERVAL '7 days') * 1000
                ) as active_schools_last_7_days,
                COUNT(*) FILTER (
                    WHERE last_sync_time >= EXTRACT(EPOCH FROM NOW() - INTERVAL '30 days') * 1000
                ) as active_schools_last_30_days
            FROM schools;
        """)
        current = cur.fetchone()
        
        # Get previous period stats (for percentage change)
        cur.execute("""
            SELECT 
                COUNT(*) FILTER (
                    WHERE last_sync_time BETWEEN 
                        EXTRACT(EPOCH FROM NOW() - INTERVAL '60 days') * 1000 
                        AND EXTRACT(EPOCH FROM NOW() - INTERVAL '30 days') * 1000
                ) as prev_schools,
                COALESCE(SUM(total_reading_time_ms), 0) as prev_reading_time,
                COALESCE(SUM(total_records), 0) as prev_records
            FROM schools
            WHERE last_sync_time < EXTRACT(EPOCH FROM NOW() - INTERVAL '30 days') * 1000;
        """)
        previous = cur.fetchone()
        
        data = {
            'totalActiveSchools': current['total_active_schools'],
            'totalBooks': current['total_books'],
            'totalReadingTimeMs': current['total_reading_time_ms'],
            'totalReadingTimeHours': round(current['total_reading_time_ms'] / (1000 * 60 * 60), 2),
            'totalRecords': current['total_records'],
            'activeSchoolsLast7Days': current['active_schools_last_7_days'],
            'activeSchoolsLast30Days': current['active_schools_last_30_days'],
            'percentageChange': {
                'schools': calculate_percentage_change(
                    current['active_schools_last_30_days'],
                    previous['prev_schools'] if previous['prev_schools'] else 0
                ),
                'readingTime': calculate_percentage_change(
                    current['total_reading_time_ms'],
                    previous['prev_reading_time'] if previous['prev_reading_time'] else 0
                ),
                'records': calculate_percentage_change(
                    current['total_records'],
                    previous['prev_records'] if previous['prev_records'] else 0
                )
            }
        }
        
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'data': data})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# 2. SCHOOLS STATISTICS
# ============================================================================
@app.route('/api/analytics/schools/stats', methods=['GET'])
def get_schools_stats():
    try:
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        sort_by = request.args.get('sortBy', 'totalReadingTime')
        
        # Map frontend sort field to database column
        sort_mapping = {
            'totalReadingTime': 'total_reading_time_ms',
            'schoolName': 'school_name',
            'totalRecords': 'total_records'
        }
        sort_column = sort_mapping.get(sort_by, 'total_reading_time_ms')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(f"""
            SELECT 
                id,
                school_name AS "schoolName",
                serial_number AS "serialNumber",
                total_reading_time_ms AS "totalReadingTimeMs",
                ROUND((total_reading_time_ms / (1000.0 * 60 * 60))::numeric, 2) AS "totalReadingTimeHours",
                total_books_accessed AS "totalBooksAccessed",
                total_records AS "totalRecords",
                last_sync_time AS "lastSyncTime",
                is_active AS "isActive"
            FROM schools
            ORDER BY {sort_column} DESC
            LIMIT %s OFFSET %s;
        """, (limit, offset))
        
        schools = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'data': schools})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# 3. POPULAR BOOKS
# ============================================================================
@app.route('/api/analytics/books/popular', methods=['GET'])
def get_popular_books():
    try:
        limit = request.args.get('limit', 10, type=int)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            WITH book_stats AS (
                SELECT 
                    b.book_id AS "bookId",
                    b.book_title AS "bookTitle",
                    b.book_id AS grade,
                    SUM(b.total_active_time_ms) AS "totalActiveTimeMs",
                    SUM(ARRAY_LENGTH(b.pages_accessed, 1)) AS "totalAccessCount",
                    COUNT(DISTINCT b.school_id) AS "uniqueSchools",
                    AVG(ps.active_time_ms) AS "avgSessionTimeMs"
                FROM books b
                LEFT JOIN page_sessions ps ON ps.book_record_id = b.id
                GROUP BY b.book_id, b.book_title
            )
            SELECT 
                "bookId",
                "bookTitle",
                grade,
                COALESCE("totalActiveTimeMs", 0) AS "totalActiveTimeMs",
                COALESCE("totalAccessCount", 0) AS "totalAccessCount",
                "uniqueSchools",
                COALESCE(ROUND("avgSessionTimeMs"), 0) AS "avgSessionTimeMs",
                ARRAY[]::integer[] AS "pagesAccessed"
            FROM book_stats
            ORDER BY "totalActiveTimeMs" DESC
            LIMIT %s;
        """, (limit,))
        
        books = cur.fetchall()
        
        # Get pages accessed for each book
        for book in books:
            cur.execute("""
                SELECT ARRAY_AGG(DISTINCT page_num ORDER BY page_num) as pages
                FROM books b, unnest(b.pages_accessed) as page_num
                WHERE b.book_id = %s
                GROUP BY b.book_id;
            """, (book['bookId'],))
            result = cur.fetchone()
            book['pagesAccessed'] = result['pages'] if result and result['pages'] else []
        
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'data': books})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# 4. TIMELINE DATA
# ============================================================================
@app.route('/api/analytics/timeline', methods=['GET'])
def get_timeline_data():
    try:
        range_str = request.args.get('range', '30d')
        start_time, end_time = get_time_range_ms(range_str)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                (EXTRACT(EPOCH FROM DATE_TRUNC('day', TO_TIMESTAMP(ps.session_start_time / 1000.0))) * 1000)::bigint AS timestamp,
                TO_CHAR(TO_TIMESTAMP(ps.session_start_time / 1000.0), 'YYYY-MM-DD') AS date,
                COUNT(*) AS "totalSessions",
                SUM(ps.active_time_ms) AS "totalActiveTimeMs",
                COUNT(DISTINCT ps.book_id) AS "uniqueBooks",
                COUNT(DISTINCT b.school_id) AS "uniqueSchools"
            FROM page_sessions ps
            JOIN books b ON ps.book_record_id = b.id
            WHERE ps.session_start_time >= %s
                AND ps.session_start_time <= %s
            GROUP BY timestamp, date
            ORDER BY timestamp;
        """, (start_time, end_time))
        
        timeline = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'data': timeline})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# 5. BOOKS BY GRADE
# ============================================================================
@app.route('/api/analytics/books/by-grade', methods=['GET'])
def get_books_by_grade():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            WITH grade_stats AS (
                SELECT 
                    book_id AS grade,
                    COUNT(*) AS count,
                    SUM(total_active_time_ms) AS total_reading_time_ms
                FROM books
                WHERE book_id BETWEEN 3 AND 10
                GROUP BY book_id
            ),
            total_count AS (
                SELECT SUM(count) AS total FROM grade_stats
            )
            SELECT 
                gs.grade,
                gs.count,
                gs.total_reading_time_ms AS "totalReadingTimeMs",
                ROUND((gs.count::numeric / NULLIF(tc.total, 0) * 100), 1) AS percentage
            FROM grade_stats gs
            CROSS JOIN total_count tc
            ORDER BY gs.grade;
        """)
        
        grades = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'data': grades})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# 6. SYNC LOGS
# ============================================================================
@app.route('/api/analytics/sync/logs', methods=['GET'])
def get_sync_logs():
    try:
        limit = request.args.get('limit', 50, type=int)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                sl.id,
                sl.school_id AS "schoolId",
                s.school_name AS "schoolName",
                sl.sync_timestamp AS "syncTimestamp",
                sl.records_processed AS "recordsProcessed",
                sl.success,
                sl.error_message AS "errorMessage",
                sl.created_at AS "createdAt"
            FROM sync_logs sl
            LEFT JOIN schools s ON sl.school_id = s.id
            ORDER BY sl.created_at DESC
            LIMIT %s;
        """, (limit,))
        
        logs = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'data': logs})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# 7. DEVICE STATS
# ============================================================================
@app.route('/api/analytics/device/stats', methods=['GET'])
def get_device_stats():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            WITH platform_counts AS (
                SELECT 
                    platform,
                    COUNT(*) AS count,
                    MAX(app_version) AS app_version,
                    MAX(last_seen_at) AS last_seen_at
                FROM device_info
                GROUP BY platform
            ),
            total_devices AS (
                SELECT SUM(count) AS total FROM platform_counts
            )
            SELECT 
                pc.platform,
                pc.count,
                ROUND((pc.count::numeric / NULLIF(td.total, 0) * 100), 1) AS percentage,
                pc.app_version AS "appVersion",
                pc.last_seen_at AS "lastSeenAt"
            FROM platform_counts pc
            CROSS JOIN total_devices td
            ORDER BY pc.count DESC;
        """)
        
        devices = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'data': devices})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# 8. SYNC STATUS
# ============================================================================
@app.route('/api/analytics/sync/status', methods=['GET'])
def get_sync_status():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Overall sync stats
        cur.execute("""
            SELECT 
                COUNT(*) AS "totalSyncs",
                SUM(CASE WHEN success THEN 1 ELSE 0 END) AS "successfulSyncs",
                SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) AS "failedSyncs",
                ROUND((SUM(CASE WHEN success THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) * 100), 2) AS "successRate",
                MAX(sync_timestamp) AS "lastSyncTime"
            FROM sync_logs;
        """)
        stats = cur.fetchone()
        
        # Schools pending sync
        cur.execute("""
            SELECT COUNT(*) AS "schoolsPendingSync"
            FROM schools
            WHERE last_sync_time < EXTRACT(EPOCH FROM NOW() - INTERVAL '24 hours') * 1000
                OR last_sync_time IS NULL;
        """)
        pending = cur.fetchone()
        
        # Recent errors
        cur.execute("""
            SELECT 
                sl.school_id AS "schoolId",
                s.school_name AS "schoolName",
                sl.error_message AS "errorMessage",
                sl.sync_timestamp AS timestamp
            FROM sync_logs sl
            JOIN schools s ON sl.school_id = s.id
            WHERE sl.success = false
            ORDER BY sl.sync_timestamp DESC
            LIMIT 5;
        """)
        errors = cur.fetchall()
        
        data = {
            **stats,
            'schoolsPendingSync': pending['schoolsPendingSync'],
            'averageSyncTime': 2500,  # Placeholder - calculate from actual data
            'recentErrors': errors
        }
        
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'data': data})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# 9. PAGE ENGAGEMENT
# ============================================================================
@app.route('/api/analytics/pages/engagement', methods=['GET'])
def get_page_engagement():
    try:
        book_id = request.args.get('bookId', type=int)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        if book_id:
            cur.execute("""
                SELECT 
                    ps.book_id AS "bookId",
                    b.book_title AS "bookTitle",
                    ps.page_number AS "pageNumber",
                    COUNT(*) AS "totalSessions",
                    ROUND(AVG(ps.active_time_ms)) AS "avgActiveTimeMs",
                    SUM(ps.active_time_ms) AS "totalActiveTimeMs"
                FROM page_sessions ps
                JOIN books b ON ps.book_record_id = b.id
                WHERE ps.book_id = %s
                GROUP BY ps.book_id, b.book_title, ps.page_number
                ORDER BY ps.page_number;
            """, (book_id,))
        else:
            cur.execute("""
                SELECT 
                    ps.book_id AS "bookId",
                    b.book_title AS "bookTitle",
                    ps.page_number AS "pageNumber",
                    COUNT(*) AS "totalSessions",
                    ROUND(AVG(ps.active_time_ms)) AS "avgActiveTimeMs",
                    SUM(ps.active_time_ms) AS "totalActiveTimeMs"
                FROM page_sessions ps
                JOIN books b ON ps.book_record_id = b.id
                GROUP BY ps.book_id, b.book_title, ps.page_number
                ORDER BY "totalActiveTimeMs" DESC
                LIMIT 50;
            """)
        
        engagement = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'data': engagement})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# Additional helper endpoints
# ============================================================================

@app.route('/api/analytics/schools/<int:school_id>/timeline', methods=['GET'])
def get_school_timeline(school_id):
    try:
        range_str = request.args.get('range', '30d')
        start_time, end_time = get_time_range_ms(range_str)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                TO_CHAR(TO_TIMESTAMP(ps.session_start_time / 1000.0), 'YYYY-MM-DD') AS date,
                (EXTRACT(EPOCH FROM DATE_TRUNC('day', TO_TIMESTAMP(ps.session_start_time / 1000.0))) * 1000)::bigint AS timestamp,
                COUNT(*) AS "totalSessions",
                SUM(ps.active_time_ms) AS "totalActiveTimeMs",
                COUNT(DISTINCT ps.book_id) AS "uniqueBooks"
            FROM page_sessions ps
            JOIN books b ON ps.book_record_id = b.id
            WHERE b.school_id = %s
                AND ps.session_start_time >= %s
                AND ps.session_start_time <= %s
            GROUP BY date, timestamp
            ORDER BY timestamp;
        """, (school_id, start_time, end_time))
        
        timeline = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'data': timeline})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics/books/<int:book_id>/details', methods=['GET'])
def get_book_details(book_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                b.book_id AS "bookId",
                b.book_title AS "bookTitle",
                b.book_id AS grade,
                SUM(b.total_active_time_ms) AS "totalActiveTimeMs",
                COUNT(ps.id) AS "totalAccessCount",
                COUNT(DISTINCT b.school_id) AS "uniqueSchools",
                ROUND(AVG(ps.active_time_ms)) AS "avgSessionTimeMs",
                MIN(b.first_access_time) AS "firstAccessTime",
                MAX(b.last_access_time) AS "lastAccessTime",
                MAX(b.total_pages) AS "totalPages"
            FROM books b
            LEFT JOIN page_sessions ps ON ps.book_record_id = b.id
            WHERE b.book_id = %s
            GROUP BY b.book_id, b.book_title;
        """, (book_id,))
        
        book = cur.fetchone()
        
        if not book:
            return jsonify({'success': False, 'error': 'Book not found'}), 404
        
        # Get pages accessed
        cur.execute("""
            SELECT ARRAY_AGG(DISTINCT page_num ORDER BY page_num) as pages
            FROM books b, unnest(b.pages_accessed) as page_num
            WHERE b.book_id = %s;
        """, (book_id,))
        pages_result = cur.fetchone()
        book['pagesAccessed'] = pages_result['pages'] if pages_result and pages_result['pages'] else []
        
        # Get schools using this book
        cur.execute("""
            SELECT 
                s.id AS "schoolId",
                s.school_name AS "schoolName",
                b.total_active_time_ms AS "totalTime",
                ARRAY_LENGTH(b.pages_accessed, 1) AS "accessCount"
            FROM books b
            JOIN schools s ON b.school_id = s.id
            WHERE b.book_id = %s
            ORDER BY b.total_active_time_ms DESC
            LIMIT 10;
        """, (book_id,))
        book['schoolsUsing'] = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'data': book})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics/reading-patterns', methods=['GET'])
def get_reading_patterns():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                EXTRACT(HOUR FROM TO_TIMESTAMP(session_start_time / 1000.0))::integer AS hour,
                EXTRACT(DOW FROM TO_TIMESTAMP(session_start_time / 1000.0))::integer AS "dayOfWeek",
                COUNT(*) AS "totalSessions",
                ROUND(AVG(active_time_ms)) AS "avgSessionTimeMs"
            FROM page_sessions
            WHERE session_start_time >= EXTRACT(EPOCH FROM NOW() - INTERVAL '30 days') * 1000
            GROUP BY hour, "dayOfWeek"
            ORDER BY "dayOfWeek", hour;
        """)
        
        patterns = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'data': patterns})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
