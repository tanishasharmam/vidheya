const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();  // <--- Load environment variables

const app = express();
app.use(express.json());

// Allow requests from your frontend (Local + Production)
app.use(cors({
    origin: "*",
    credentials: true
}));

// Connect using the variable
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// Routes
app.get('/todos', async (req, res) => {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
});

app.post('/todos', async (req, res) => {
    const newTodo = new Todo({ text: req.body.text });
    await newTodo.save();
    res.json(newTodo);
});

app.put('/todos/:id', async (req, res) => {
    const todo = await Todo.findById(req.params.id);
    todo.completed = !todo.completed;
    await todo.save();
    res.json(todo);
});

app.delete('/todos/:id', async (req, res) => {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ result: 'Task deleted' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));