const express = require("express");
const app = express();
const port = process.env.PORT || 8085;
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const details = require("./models/Details");
const auth = require("./models/User");
const secret = process.env.SECRET;
dotenv.config();

app.set("view engine", "ejs");

// middleware for Views
app.set("views", path.join(__dirname, "views"));

// Middleware for Static files
app.use(express.static(path.join(__dirname, "public")));

// parse form data
app.use(express.urlencoded({ extended: true }));

// database
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Database Connected Successfully"))
  .catch((err) => console.log("connection err", err));

//middleware to Authenticate
function authenticate(req, res, next) {
  const token = req.header("Authorisation");
  if (!token) {
    res.send("Access Denied");
  }
  try {
    const decode = jwt.verify(token, secret);
    req.user = decode;
    next();
  } catch (err) {
    res.send("Invalid token");
  }
}

// HomePage
app.get("/", authenticate, (req, res) => {
  res.render("index.ejs");
});

// Create
app.get("/create", (req, res) => {
  res.render("create.ejs");
});

app.post("/create", async (req, res) => {
  const { name, designation, achievements } = req.body;
  try {
    const detail = new details({ name, designation, achievements });
    await detail.save();
    res.status(201).send(`✅ Details saved`);
  } catch (err) {
    console.log("error occured", err);
    res.status(500).send("❌ Something went wrong");
  }
});

// read
app.get("/read", async (req, res) => {
  const allDetails = await details.find();
  res.render("read.ejs", { allDetails });
});

// update

app.get("/update/:id", async (req, res) => {
  const detail = await details.findById(req.params.id);
  res.render("update.ejs", { detail });
});

app.post("/update/:id", async (req, res) => {
  const { name, designation, achievements } = req.body;

  await details.findByIdAndUpdate(req.params.id, {
    name,
    designation,
    achievements,
  });
  res.redirect("/read");
});

// delete
app.get("/delete/:id", async (req, res) => {
  await details.findByIdAndDelete(req.params.id);
  res.send(`successfully Deleted `);
});

// signup
app.get("/signup", (req, res) => {
  res.send("signup.ejs");
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const hash_pass = bcrypt.hash(password, 10);
  const exist_user = auth.findOne({ username });
  if (!exist_user) {
    const user_data = new auth({ username, password: hash_pass });
    await user_data.save();
    res.send("User Registered!");
  }
});

// login
app.get("/login", (req, res) => {
  res.send("login.ejs");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const ver_pass = bcrypt.compare(password, auth.password);
  const exist_user = auth.findOne({ username });
  if (!exist_user) {
    console.log("Not Exists!");
  }

  const token = jwt.sign({ userId: auth._id }, secret, { expiresIn: "1hr" });
});

// listen
app.listen(port, () => {
  console.log(`Connection Successfully run on ${port}`);
});
