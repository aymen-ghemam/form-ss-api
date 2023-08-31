require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const Participant = require("./models/Participant.js");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");

mongoose
  .connect(process.env.MONGO_URI)
  .catch((error) => {
    console.log("Connection to database failed:", error);
  })
  .then(() => {
    console.log("Successfully connected to database");
  });

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.post(
  "/register",
  [
    check("email", "Email is required !").not().isEmpty(),
    check("email", "Invalid email !").isEmail(),
    check("name", "Fullname is required !").not().isEmpty(),
    check("name", "Please enter your full name !").isLength({
      min: 5,
      max: 50,
    }),
    check("discord", "Discord ID is required !").not().isEmpty(),
    check("text", "Review text field is required !").not().isEmpty(),
    check("fields", "Please select at least 1 field !").not().isEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(200).json({ err: true, errors: errors.errors });

      const exists = await Participant.findOne({
        email: req.body.email,
      }).exec();
      if (exists)
        return res
          .status(200)
          .json({ err: true, errors: [{ msg: "Email already exist !" }] });

      const newParticipant = new Participant({
        email: req.body.email.toLowerCase(),
        name: req.body.name.toLowerCase(),
        fields: req.body.fields,
        discord: req.body.discord.toLowerCase(),
        text: req.body.text,
      });

      const result = await newParticipant.save();
      if (result)
        return res
          .status(200)
          .json({ err: false, msg: "Successfully registered !" });
      return res
        .status(200)
        .json({ err: true, errors: [{ msg: "Something went wrong !" }] });
    } catch (err) {
      console.log("something went wrong : " + err.message);
      return res
        .status(200)
        .json({ err: true, errors: [{ msg: "Something went wrong !" }] });
    }
  }
);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});