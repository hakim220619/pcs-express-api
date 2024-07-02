const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const app = express();
const db = require("./connection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Uploads folder
  },
  filename: function (req, file, cb) {
    // Generate a unique name for the file
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Initialize multer middleware
const upload = multer({ storage: storage });
// POST endpoint to upload a photo
app.post("/api/upload", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No files were uploaded.");
  }
  // File path on the server
  const filePath = req.file.path;
  var sql =
    "INSERT INTO storage_file (id_film, id_user, image, location) VALUES ('" +
    req.body.movieId +
    "', '1', '" +
    req.file.filename +
    "', '" +
    req.body.location +
    "' )";
  db.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });

  // File is uploaded successfully, send a JSON response
  res.json({
    message: "File uploaded successfully",
    filename: req.file.filename,
    id_film: req.body.movieId,
    location: req.body.location,
  });
});

app.post("/api/login", (req, res) => {
  db.query(
    `SELECT * FROM users WHERE email = ${db.escape(req.body.email)};`,
    (err, result) => {
      // user does not exists
      if (err) {
        throw err;
        return res.status(400).send({
          msg: err,
        });
      }
      if (!result.length) {
        return res.status(401).send({
          msg: "Email or password is incorrect!",
        });
      }
      // check password
      bcrypt.compare(
        req.body.password,
        result[0]["password"],
        (bErr, bResult) => {
          // wrong password
          if (bErr) {
            throw bErr;
            return res.status(401).send({
              msg: "Email or password is incorrect!",
            });
          }
          if (bResult) {
            const token = jwt.sign(
              { id: result[0].id },
              "the-super-strong-secrect",
              { expiresIn: "1h" }
            );
            return res.status(200).send({
              msg: "Logged in!",
              token,
              user: result[0],
            });
          }
          return res.status(401).send({
            msg: "Username or password is incorrect!",
          });
        }
      );
    }
  );
});



// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
