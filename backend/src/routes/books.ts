import { Router, Request, Response } from 'express';
import { bookModel } from '../models/book';

const router = Router();

// Get all books or filter by grade
router.get('/', async (req: Request, res: Response) => {
  try {
    const { grade } = req.query;
    const books = await bookModel.getAll(grade as string);
    res.json({ success: true, data: books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch books' });
  }
});

// Get book by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await bookModel.getById(id);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    res.json({ success: true, data: book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch book' });
  }
});

// Create new book
router.post('/', async (req: Request, res: Response) => {
  try {
    const bookData = req.body;
    const newBook = await bookModel.create(bookData);
    res.status(201).json({ success: true, data: newBook });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to create book' });
  }
});

// Update book
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bookData = req.body;
    const updatedBook = await bookModel.update(id, bookData);
    if (!updatedBook) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    res.json({ success: true, data: updatedBook });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to update book' });
  }
});

// Delete book
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await bookModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to delete book' });
  }
});

// Get books by grade
router.get('/grade/:grade', async (req: Request, res: Response) => {
  try {
    const { grade } = req.params;
    const books = await bookModel.getByGrade(grade);
    res.json({ success: true, data: books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch books' });
  }
});

// Get total book count
router.get('/stats/count', async (req: Request, res: Response) => {
  try {
    const count = await bookModel.count();
    res.json({ success: true, data: { total: count } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to get book count' });
  }
});

export default router;
