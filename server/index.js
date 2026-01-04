const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import the Todo model
// (Ensure you have the file: server/models/Todo.js)
const Todo = require('./models/Todo');

const app = express();

// Middleware
app.use(express.json());

// CORS Configuration (Allows your Vercel frontend to talk to this backend)
app.use(cors({
    origin: "*",
    credentials: true
}));

// Connect to MongoDB
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error("MongoDB Connection Error:", err));

// --- ROUTES ---

// 1. Get All Tasks
app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch tasks" });
    }
});

// 2. Add a New Task
app.post('/todos', async (req, res) => {
    try {
        const newTodo = new Todo({
            text: req.body.text
        });
        await newTodo.save();
        res.json(newTodo);
    } catch (error) {
        res.status(500).json({ error: "Could not create task" });
    }
});

// 3. Update Task (Complete/Incomplete)
app.put('/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: "Task not found" });
        }
        todo.completed = !todo.completed;
        await todo.save();
        res.json(todo);
    } catch (error) {
        res.status(500).json({ error: "Could not update task" });
    }
});

// 4. Delete Task
app.delete('/todos/:id', async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.json({ result: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ error: "Could not delete task" });
    }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));