const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const fs = require("fs");

//env setup
require("dotenv").config();

const path = require("path");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const errorController = require("./controllers/error");

//* Connect to MongoDB
const db = require("./utils/database");
const User = require("./models/user");

const isAuthenticated = require("./middleware/is-authenticated");

const app = express();

const store = new MongoDBStore({
  uri: "mongodb+srv://somanigaurav:6owytrHAY2W2K1Zr@nodeshop.d9s3efh.mongodb.net/shop?retryWrites=true&w=majority",
  collection: "sessions",
});

const csrfProtection = csrf();

//* tell express to use ejs for templating
app.set("view engine", "ejs");
app.set("views", "views"); //tell express where to find the views

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.urlencoded({ extended: false }));

//* multer setup
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use(express.static(path.join(__dirname, "public")));

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(helmet());
app.use(compression());

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flags: "a",
  }
);

app.use(morgan("combined", { stream: accessLogStream }));

//* initialize session middleware
app.use(
  session({
    secret: "mysessionsecret",
    name: "sessionid", //default is 'connect.sid
    resave: false,
    saveUninitialized: false,

    store: store,
  })
);

app.use(csrfProtection);

//* This data (isAuthenticated & csrfToken) will be available in all views
//we dont need to seperately pass it to each view
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.loggedInUser = req.session.user;

  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (user) {
        req.user = user;
      }

      next();
    })
    .catch((err) => {
      console.log("err in User middleware:", err);
      throw new Error(err);
    });
});

app.use(flash());

app.use("/auth", authRoutes);
app.use("/admin", isAuthenticated, adminRoutes);
app.use(shopRoutes);

//error pages
app.use("/500", errorController.get500);
app.use("/", errorController.get404);

app.use((error, req, res, next) => {
  console.log("error:", error);

  // res.statusCode(error.statusCode).render("500");
  res.redirect("/500");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port 3000!");
});
