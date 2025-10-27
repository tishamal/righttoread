import { Router, Request, Response } from 'express';
import { analyticsModel } from '../models/analytics';

const router = Router();

// Create analytics entry
router.post('/', async (req: Request, res: Response) => {
  try {
    const analyticsData = req.body;
    const newAnalytics = await analyticsModel.create(analyticsData);
    res.status(201).json({ success: true, data: newAnalytics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to create analytics entry' });
  }
});

// Get analytics by book ID
router.get('/book/:bookId', async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const analytics = await analyticsModel.getByBookId(bookId);
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// Get analytics by school
router.get('/school/:schoolName', async (req: Request, res: Response) => {
  try {
    const { schoolName } = req.params;
    const analytics = await analyticsModel.getBySchool(schoolName);
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// Get book usage statistics
router.get('/stats/books', async (req: Request, res: Response) => {
  try {
    const stats = await analyticsModel.getBookUsageStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch book usage stats' });
  }
});

// Get school usage statistics
router.get('/stats/schools', async (req: Request, res: Response) => {
  try {
    const stats = await analyticsModel.getSchoolUsageStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch school usage stats' });
  }
});

// Get date range analytics
router.get('/range', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'startDate and endDate are required' });
    }
    const analytics = await analyticsModel.getDateRange(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

export default router;
