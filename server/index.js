const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Todo = require('./models/Todo');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = "super_secret_key_12345";

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// --- MIDDLEWARE (The Security Guard) ---
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ error: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Add user ID to the request
        next();
    } catch (e) {
        res.status(400).json({ error: "Token is not valid" });
    }
};

// --- AUTH ROUTES (Public) ---
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, JWT_SECRET);
        res.json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET);
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- TODO ROUTES (Protected) ---

// 1. Get ONLY the logged-in user's tasks
app.get('/todos', auth, async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: "Error fetching tasks" });
    }
});

// 2. Create task attached to the user
app.post('/todos', auth, async (req, res) => {
    const newTodo = new Todo({
        text: req.body.text,
        user: req.user.id // <--- Stamp with User ID
    });
    await newTodo.save();
    res.json(newTodo);
});

app.put('/todos/:id', auth, async (req, res) => {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
    if (!todo) return res.status(404).json({ error: "Task not found" });

    todo.completed = !todo.completed;
    await todo.save();
    res.json(todo);
});

app.delete('/todos/:id', auth, async (req, res) => {
    const result = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!result) return res.status(404).json({ error: "Task not found" });

    res.json({ result: 'Task deleted' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));