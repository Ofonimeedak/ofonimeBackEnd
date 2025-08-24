// ======================
// IMPORTS
// ======================
const express = require('express')
const mongoose = require('mongoose')
const speakeasy = require('speakeasy')
const uuid = require('uuid')
const QRCode = require('qrcode')

// ======================
// MIDDLEWARE
// ======================
const app = express()
app.use(express.json())

// ======================
// MONGOOSE SETUP
// ======================
mongoose.connect('mongodb://127.0.0.1:27017/TwoFA', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err))

// User Schema
const userSchema = new mongoose.Schema({
    id: String,
    temp_secret: Object,
    secret: Object,
    qrcode: String
})
const User = mongoose.model('User', userSchema)

// ======================
// ROUTES
// ======================

// Welcome Route
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to 2 factor auth project' })
})

// Register User
app.post('/api/register', async (req, res) => {
    const id = uuid.v4()
    const temp_secret = speakeasy.generateSecret()
    const qrcode = await QRCode.toDataURL(temp_secret.otpauth_url)

    const newUser = new User({
        id,
        temp_secret,
        qrcode
    })
    await newUser.save()

    res.send(`<h3>TEMP SECRET: ${temp_secret.base32}</h3>
              <h3>UserID: ${id}</h3>
              <img src=${qrcode}>`)
})

// Verify Token & Save Permanent Secret
app.post('/api/verify', async (req, res) => {
    const { token, userId } = req.body
    const user = await User.findOne({ id: userId })

    if (!user) return res.status(404).json({ message: 'User not found' })

    const verified = speakeasy.totp.verify({
        secret: user.temp_secret.base32,
        encoding: 'base32',
        token
    })

    if (verified) {
        user.secret = user.temp_secret
        user.temp_secret = undefined
        await user.save()
        return res.json({ verified: true })
    }

    res.json({ verified: false })
})

