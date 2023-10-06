import { Express, Request } from "express";
import * as FormData from "form-data";
require("dotenv").config();
const fs = require("fs");
const express = require("express");
const mime = require("mime-types");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "uploads/");
  },
  filename: (req: any, file: any, cb: any) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + "." + mime.extension(file.mimetype)
    );
  },
});
const upload = multer({ storage: storage });
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

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ packages: ["level 1", "level 2", "level 3"] });
});

app.post("/send-email", upload.array("photos", 15), (req, res) => {
  const formData = req.body;
  console.log((req as any).files);
  const emailContent = `
    <p>Name: ${formData.athleteName}</p>
    <p>Email: ${formData.athleteEmail}</p>
    <p>Phone: ${formData.athletePhone}</p>
    <p>Address: ${formData.athleteAddress}</p>
    <p>Name: ${formData.parentName}</p>
    <p>Email: ${formData.parentEmail}</p>
    <p>Phone: ${formData.parentPhone}</p>
    <p>Address: ${formData.parentAddress}</p>
    <p>Sport: ${formData.sport}</p>
    <p>Package: ${formData.package}</p>
    <p>High School: ${formData.highSchool ?? ""}</p>
    <p>Class Of: ${formData.classOf ?? ""}</p>
    <p>Position: ${formData.position ?? ""}</p>
    <p>Events: ${formData.events ?? ""}</p>
    <p>Years Played: ${formData.yearsPlayed ?? ""}</p>
    <p>Academic Achievements: ${formData.academicAchievements ?? ""}</p>
    <p>GPA: ${formData.gpa ?? ""}</p>
    <p>Class Rank: ${formData.classRank ?? ""}</p>
  `;
  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: process.env.MAIL_RECIPIENT,
    subject: "Athlete Profile Submission",
    html: emailContent,
    attachments: (req as any).files,
  };

  transporter.sendMail(mailOptions, (error: Error | null, info: any) => {
    if (error) {
      console.error(error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent ", info.response);
      res.status(200).send("Email sent successfully");
    }
    // Result handler for unlink function
    let resultHandler = (err: Error) => {
      if (err) {
        console.log("unlink failed", err);
      } else {
        console.log("file deleted");
      }
    };
    // Delete files once they are sent by email
    (req as any).files.forEach((file: any) => {
      fs.unlink(file.path, resultHandler);
    });
  });
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
