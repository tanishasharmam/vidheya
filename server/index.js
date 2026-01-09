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

// --- CORS FIX (THE GOLDEN CONFIG) ---
// We removed 'credentials: true' because it breaks when using origin: '*'
app.use(cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "x-auth-token"]
}));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = "super_secret_key_12345";

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// --- MIDDLEWARE ---
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ error: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ error: "Token is not valid" });
    }
};

// --- AUTH ROUTES ---
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ error: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET);
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
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

// --- TODO ROUTES (With Privacy Fix) ---

// 1. Get User's Tasks Only
app.get('/todos', auth, async (req, res) => {
    try {
        // FILTER BY USER ID IS CRITICAL HERE
        const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: "Error fetching tasks" });
    }
});

app.post('/todos', auth, async (req, res) => {
    try {
        const newTodo = new Todo({
            text: req.body.text,
            user: req.user.id // <--- Attach User ID
        });
        await newTodo.save();
        res.json(newTodo);
    } catch (error) { res.status(500).json({ error: "Error saving task" }); }
});

app.put('/todos/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
        if (!todo) return res.status(404).json({ error: "Task not found" });

        todo.completed = !todo.completed;
        await todo.save();
        res.json(todo);
    } catch (error) { res.status(500).json({ error: "Error updating task" }); }
});

app.delete('/todos/:id', auth, async (req, res) => {
    try {
        const result = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!result) return res.status(404).json({ error: "Task not found" });
        res.json({ result: 'Task deleted' });
    } catch (error) { res.status(500).json({ error: "Error deleting task" }); }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));