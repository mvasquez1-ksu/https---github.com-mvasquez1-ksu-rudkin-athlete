import { Express, Request } from "express";
require("dotenv").config();
const fs = require("fs");
const express = require("express");
const mime = require("mime-types");
const formDataMap = new Map<string, any>();
const fileMap = new Map<string, any>();
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const sessionID = req.body.sessionID;
    const folderPath = `uploads/${sessionID}`;
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
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
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
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

function sendEmail(sessionID: string): Promise<void> {
  const formData = formDataMap.get(sessionID);
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
    attachments: fileMap.get(sessionID),
  };
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error: Error | null, info: any) => {
      if (error) {
        console.error(error);
        reject(error);
        //res.status(500).send("Error sending email");
      } else {
        console.log("Email sent ", info.response);
        resolve();
        //res.status(200).send("Email sent successfully");
      }
    });
  });
}

function clearData(sessionID: string) {
  const sessionFolderPath = `uploads/${sessionID}/`;
  // Result handler for unlink function
  let resultHandler = (err: Error) => {
    if (err) {
      console.log("unlink failed", err);
    } else {
      console.log("file deleted");
    }
  };
  // Delete files and directory once email is sent
  fileMap.get(sessionID).forEach((file: any) => {
    fs.unlink(file.path, resultHandler);
  });
  fs.rmdir(sessionFolderPath, resultHandler);
  // Deletes formdata and files from respective maps
  formDataMap.delete(sessionID);
  fileMap.delete(sessionID);
}

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/products", (req, res) => {
  fs.readFile("./data/products.json", "utf8", (err: any, data: any) => {
    if (err) {
      throw err;
    }
    res.send(JSON.parse(data));
  });
});

app.get("/success", async (req, res) => {
  const { session_id } = req.query as { session_id: string };
  try {
    await sendEmail(session_id);
    clearData(session_id);
    res.send(`Success! Session ID: ${session_id}`);
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
});

app.get("/cancel", (req, res) => {
  const { session_id } = req.query as { session_id: string };
  clearData(session_id);
  res.send(`Canceled! Session ID: ${session_id}`);
  console.log(`Canceled! Session ID: ${session_id}`);
});

app.post("/webhook", (req, res) => {
  const payload = req.body;
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  console.log("Got payload: " + payload);
  res.status(200).end();
});

app.post("/submit-form", upload.array("photos", 15), (req, res) => {
  const formData = req.body;
  const sessionID = formData.sessionID;
  formDataMap.set(sessionID, formData);
  console.log(`FormData with session id ${sessionID} stored in map.`);
  fileMap.set(sessionID, (req as any).files);
  //sendEmail(sessionID);
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

app.post("/create-checkout-session", async (req, res) => {
  const product = req.body;
  console.log(product);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
          },
          unit_amount: product.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `http://localhost:${port}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:${port}/cancel?session_id={CHECKOUT_SESSION_ID}`,
  });
  //res.json({ id: session.id });
  console.log(session.id);
  res.json({ checkoutURL: session.url, sessionID: session.id });
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
