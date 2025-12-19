const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// User schema me referral
const User = mongoose.model("User", {
  email: String,
  password: String,
  balance: { type: Number, default: 0 },
  package: { type: String, default: "Basic" },
  tasksDone: { type: Number, default: 0 },
  taskHistory: { type: Array, default: [] },
  referralCode: String,
  referredBy: String || null
});

// Gjenero referral code unik
const generateReferral = () => Math.random().toString(36).substring(2,8).toUpperCase();

// Register me referral
app.post("/register", async (req,res)=>{
  const { email, password, referral } = req.body;

  if(!referral) return res.status(400).json("Referral code required");

  const refUser = await User.findOne({ referralCode: referral });
  if(!refUser) return res.status(400).json("Invalid referral code");

  // bonus për personin që ftoi
  refUser.balance += 2;
  await refUser.save();

  const hash = await bcrypt.hash(password,10);
  const newUser = await User.create({
    email,
    password: hash,
    referralCode: generateReferral(),
    referredBy: referral
  });

  res.json({ message:"Registered!", referralCode: newUser.referralCode });
});

// Login
app.post("/login", async (req,res)=>{
  const user = await User.findOne({ email: req.body.email });
  if(!user) return res.status(400).json("No user");
  const ok = await bcrypt.compare(req.body.password, user.password);
  if(!ok) return res.status(400).json("Wrong password");

  res.json({
    email: user.email,
    balance: user.balance,
    package: user.package,
    tasksDone: user.tasksDone,
    taskHistory: user.taskHistory,
    referralCode: user.referralCode
  });
});

// Choose package
app.post("/choose-package", async (req,res)=>{
  const { email, packageName } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.status(400).json("User not found");
  user.package = packageName;
  await user.save();
  res.json({ message:"Package updated", package: packageName });
});

// Do task
app.post("/do-task", async (req,res)=>{
  const { email, taskName } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.status(400).json("User not found");

  // reward sipas package
  let reward = 1;
  if(user.package==="Pro") reward = 2;
  if(user.package==="VIP") reward = 5;

  user.balance += reward;
  user.tasksDone += 1;
  user.taskHistory.push({ task: taskName, reward });
  await user.save();

  res.json({
    email: user.email,
    balance: user.balance,
    package: user.package,
    tasksDone: user.tasksDone,
    taskHistory: user.taskHistory,
    reward
  });
});

app.listen(5000,()=>console.log("Server running with referral"));
