import { Express } from "express";
require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const app: Express = express();
const port = 4000;
const transporter = nodemailer.createTransport({
  host: "athletes-profile.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

/* async function main() {
  let transporter = nodemailer.createTransport({
    host: "athletes-profile.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: process.env.MAIL_USERNAME,
    to: "marcoavb09@hotmail.com",
    subject: "Athlete Profile Email Test",
    html: "<h1>Athlete Profile Email Test</h1>" + "<p>This is a test.</p>",
  });

  console.log("Message sent");
}

main().catch((e) => console.log(e)); */

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ packages: ["level 1", "level 2", "level 3"] });
});

app.post("/send-email", (req, res) => {
  const { html, attachments } = req.body;

  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: process.env.MAIL_RECIPIENT,
    subject: "Athlete Profile Submission",
    html: html,
    attachments: attachments,
  };

  transporter.sendMail(mailOptions, (error: Error | null, info: any) => {
    if (error) {
      console.error(error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent ", info.response);
      res.status(200).send("Email sent successfully");
    }
  });
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
