//put this in your userController

const UserModel = require("../Model/user");
const sendEmail = require("../email");
const mongoose = require("mongoose");
const speakeasy = require("speakeasy");
const uuid = require("uuid");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config();

exports.signup = async (req, res) => {
  //destructure the request body
  const { email, firstName } = req.body;

  //check exsiting user
  const existingUser = await UserModel.findOne({ email: email });

  if (existingUser) {
    //this is not a good approach. It makes the request infinite. Remind me to explain in the next class
    // return new Error("Email already exist");

    //this is a better approach
    return res.status(400).json({
      message: "Email already exists",
    });
  }

  //add this to your userController, inside signup handler
  //create user if user does not exist
  const newUser = await UserModel.create(req.body);
  res.status(201).json({
    message: "Signup successful.",
    user: newUser,
  });

  // After successful signup, send welcome email
  await sendEmail(email, "Welcome to My App!", "welcome.html", {
    firstName: firstName,
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  //1) Check if email and password exist
  if (!email || !password) {
    //bad request
    return res.status(400).json({
      message: "Please provide email & password",
    });
  }

  //2) check if user exist and password is correct
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  if (!user || !(await user.correctPassword(password, user.password))) {
    //unauthorized
    return res.status(401).json({
      message: "Incorrect email or password",
    });
  }

  // if everything is okay, grant access
  res.status(200).json({
    status: "User login successful.",
    data: {
      user: user,
    },
  });
};

exports.getSingleUser = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      message: "Invalid User ID format",
    });
  }

  try {
    const user = await UserModel.findById(userId);

    res.status(200).json({
      message: "User fetched successfully",
      user: user,
    });
  } catch (error) {
    console.error("cant fetch User", error.message);
  }
};

exports.getAllUser = async (req, res) => {
  const url = req.url;

  if (!url) {
    return res.status(404).json({
      message: "Invalid request, page not found",
    });
  }

  try {
    const users = await UserModel.find({});

    res.status(200).json({
      result: users.length,
      message: "Users fetched successfully",
      users: users,
    });
  } catch (error) {
    console.error("cant fetch Users", error.message);
  }
};

// generate  temporay secret and convert to qrcode
exports.register = async (req, res) => {
  const { email } = req.body;
  const id = uuid.v4();
  const temp_secret = speakeasy.generateSecret();
  const qrcode = await QRCode.toDataURL(temp_secret.otpauth_url);

  try {
    const user = await UserModel.findOneAndUpdate(
      { email: email },
      { id: id, temp_secret: temp_secret, qrcode: qrcode },
      { upsert: true, new: true } // Create if not exists, return updated document
    );

    // qrcode is the Base64 data URL from QRCode.toDataURL()
    const qrBase64 = `${qrcode}`;

    const base64Data = qrcode.replace(/^data:image\/png;base64,/, "");

    if (qrBase64) {
      // Remove the "data:image/png;base64," prefix

      // Define filename and folder
      const filename = `${user.firstName}.png`;
      const folderPath = path.join(__dirname, "templates");

      // Make sure folder exists
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Full path to file
      const filePath = path.join(folderPath, filename);

      // Save PNG file from Base64
      fs.writeFileSync(filePath, base64Data, "base64");

      console.log(`✅ Image saved as ${filePath}`);
    }

    console.log(`
            <h3>TEMP SECRET: ${temp_secret.base32}</h3>
            <h3>UserID: ${user.id}</h3>
            <img src=${qrcode}>`);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
    const mailOption = {
      from: `${process.env.GMAIL_USER}`,
      to: `${email}`,
      subject: "Your 2FA QR Code",
      html: `
        <h1>Hi ${user.firstName},</h1>
        <p>Scan this QR code with your authenticator app to set up 2FA:</p>
        <img src="cid:qrcode" alt="QR Code" />
      `,
      attachments: [
        {
          filename: "qrcode.png",
          content: base64Data,
          encoding: "base64",
          cid: "qrcode",
        },
      ],
    };
    await transporter.sendMail(mailOption);
    console.log("Email sent");

    res.json({
      message: "User registered and QR code sent via email",
      userId: id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user" });
  }
};

// Verify Token & Make Secret Permanent
exports.verify = async (req, res) => {
  const { token, email } = req.body;

  try {
    const user = await UserModel.findOne({ email: email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const { base32: secret } = user.temp_secret; // get only the base32 string

    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token, // from req.body
      window: 1, // 1 time step (±30s)
    });

    if (verified) {
      user.secret = user.temp_secret;
      user.temp_secret = undefined;
      await user.save();
      return res.json({ verified: true });
    }

    res.json({ verified: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying token" });
  }
};

// Validate Token from Permanent Secret
exports.validate = async (req, res) => {
  const { token, email } = req.body;
  const user = await UserModel.findOne({ email: email });

  if (!user || !user.secret) {
    return res
      .status(404)
      .json({ validated: false, message: "User or secret not found" });
  }

  const validated = speakeasy.totp.verify({
    secret: user.secret.base32,
    encoding: "base32",
    token,
    window: 2,
  });

  res.json({ validated, message: "validation successful" });
};
