import { Express } from "express";
require("dotenv").config();
const fs = require("fs");
const express = require("express");
const mime = require("mime-types");
const formDataMap = new Map<string, any>();
const fileMap = new Map<string, any>();
const multer = require("multer");
const maxFileSize = 1 * 1000 * 1000;
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
      file.fieldname + "-" + Date.now() + "." + mime.extension(file.mimetype) ||
        "txt"
    );
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: maxFileSize },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedImageMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
      "image/svg+xml",
    ];

    if (allowedImageMimeTypes.includes(file.mimetype)) {
      // Allow the upload if the file type is in the allowedImageMimeTypes array
      cb(null, true);
    } else {
      // Reject the upload if the file type is not allowed
      cb(
        new Error(
          "Invalid file type. Allowed image types: jpeg, png, gif, bmp, webp, svg"
        )
      );
    }
  },
});
const nodemailer = require("nodemailer");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
  <p>Age: ${formData.age ?? ""}</p>
  <p>Height: ${formData.height ?? ""}</p>
  <p>Weight: ${formData.weight ?? ""}</p>
  <p>Gender: ${formData.gender ?? ""}</p>
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
  if (fileMap.has(sessionID)) {
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
    //fs.rmdir(sessionFolderPath, resultHandler);
    fs.rm(sessionFolderPath, { recursive: true }, resultHandler);
    //fs.rm(sessionFolderPath, resultHandler);
    // Deletes formdata and files from respective maps
    formDataMap.delete(sessionID);
    fileMap.delete(sessionID);
  }
}

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET,POST",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/products", (req, res) => {
  fs.readFile("./data/products.json", "utf8", (err: any, data: any) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading products file");
    } else {
      try {
        const products = JSON.parse(data);
        res.send(products);
      } catch (error) {
        console.error(error);
        res.status(500).send("Error parsing products data");
      }
    }
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

app.post("/submit-form", upload.array("photos", 15), (req, res) => {
  const formData = req.body;
  const sessionID = formData.sessionID;
  formDataMap.set(sessionID, formData);
  console.log(`FormData with session id ${sessionID} stored in map.`);
  /* if ((req as any).files.length > 0) {
    fileMap.set(sessionID, (req as any).files);
  } else {
    // Create directory if formData didn't already contain any files
    fs.mkdirSync(`uploads/${sessionID}`, { recursive: true });
  } */
  if ((req as any).files.length == 0) {
    fs.mkdirSync(`uploads/${sessionID}`, { recursive: true });
  }
  fileMap.set(sessionID, (req as any).files);
  // Create a CSV string from the form data
  const csvData = Object.keys(formData)
    .map((key) => `"${key}","${formData[key]}"`)
    .join("\n");

  // Save the CSV data to a file
  const csvFilePath = `uploads/${sessionID}/formData.csv`;
  fs.writeFile(csvFilePath, csvData, (err: Error) => {
    if (err) {
      console.error("Error writing CSV file:", err);
      return res.status(500).send("Error writing CSV file");
    }
    console.log("CSV file saved:", csvFilePath);
  });
  /*   fileMap.get(sessionID).push({
    filename: "formData.csv",
    path: csvFilePath,
  });
  console.log(fileMap.get(sessionID)); */
  clearData(sessionID);
  res.status(200).send("Form data saved successfully");
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
            description: product.description,
          },
          unit_amount: product.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.BACKEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BACKEND_URL}/cancel?session_id={CHECKOUT_SESSION_ID}`,
  });
  console.log(session.id);
  res.json({ checkoutURL: session.url, sessionID: session.id });
});

app.listen(port, () => {
  console.log(`Server started on ${process.env.BACKEND_URL}`);
});
