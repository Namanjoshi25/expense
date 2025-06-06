import express from 'express';
import Expense from '../model/expense.model.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all expenses for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new expense
router.post('/', auth, async (req, res) => {
  try {
    const { amount, category, notes, date, paymentMode } = req.body;
    
    const expense = new Expense({
      user: req.userId,
      amount,
      category,
      notes,
      date,
      paymentMode
    });
    
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.userId });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;