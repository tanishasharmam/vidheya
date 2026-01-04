const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Todo = require('./models/Todo');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB (Replace with your actual connection string if not using localhost)
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern-todo')
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

app.listen(5000, () => console.log('Server running on port 5000'));