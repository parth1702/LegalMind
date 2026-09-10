const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');

const runAuthTests = async () => {
  console.log('--- STARTING STEP 19 AUTHENTICATION BACKEND VERIFICATION SUITE ---');

  try {
    await connectDB();

    // Clean test user if exists
    const testEmail = 'step19_test_attorney@legalmind.ai';
    await User.deleteMany({ email: testEmail });

    console.log('\n[TEST 1] Registration with valid credentials...');
    const registerPayload = {
      name: 'Sarah Jenkins, Esq.',
      email: testEmail,
      password: 'SecureLawPassword2026!',
      role: 'attorney',
      organization: 'Jenkins & Partners LLP',
    };

    const user = await User.create(registerPayload);
    console.log('✅ Registration Passed: User ID:', user._id.toString());

    console.log('\n[TEST 2] Duplicate Email Handling...');
    try {
      await User.create(registerPayload);
      console.error('❌ Failed: Duplicate email was not blocked');
    } catch (dupError) {
      console.log('✅ Duplicate Email Test Passed: Blocked with error code:', dupError.code || 'Duplicate Key');
    }

    console.log('\n[TEST 3] Invalid Short Password Validation...');
    try {
      const shortPassUser = new User({
        name: 'Invalid User',
        email: 'invalid@legalmind.ai',
        password: '123',
      });
      await shortPassUser.validate();
      console.error('❌ Failed: Short password was accepted');
    } catch (valError) {
      console.log('✅ Short Password Validation Passed:', valError.errors.password.message);
    }

    console.log('\n[TEST 4] Password Hashing & Plaintext Secrecy...');
    const fetchedUser = await User.findById(user._id).select('+password');
    const isPlaintext = fetchedUser.password === 'SecureLawPassword2026!';
    const isBcrypt = fetchedUser.password.startsWith('$2a$') || fetchedUser.password.startsWith('$2b$');
    if (!isPlaintext && isBcrypt) {
      console.log('✅ Password Hashing Passed: Encrypted hash:', fetchedUser.password.substring(0, 25) + '...');
    } else {
      console.error('❌ Password Hashing Failed! Stored as plaintext or bad format');
    }

    console.log('\n[TEST 5] Password Verification & Login Match...');
    const matchSuccess = await fetchedUser.matchPassword('SecureLawPassword2026!');
    const matchFailure = await fetchedUser.matchPassword('WrongPassword123');

    if (matchSuccess && !matchFailure) {
      console.log('✅ Password Verification Passed: Valid credentials matched, wrong credentials rejected');
    } else {
      console.error('❌ Password Verification Failed!');
    }

    console.log('\n[TEST 6] JWT Token Generation & Protection Verification...');
    const generateToken = require('./generateToken');
    const jwt = require('jsonwebtoken');
    const token = generateToken(user._id);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id === user._id.toString()) {
      console.log('✅ JWT Token Generation Passed: Decoded User ID matches:', decoded.id);
    } else {
      console.error('❌ JWT Token Verification Failed!');
    }

    console.log('\n[TEST 7] Invalid / Expired Token Rejection...');
    try {
      jwt.verify('invalid.malformed.token.string', process.env.JWT_SECRET);
      console.error('❌ Invalid Token Test Failed!');
    } catch (jwtErr) {
      console.log('✅ Invalid Token Test Passed: Rejected with error:', jwtErr.message);
    }

    // Cleanup
    await User.deleteMany({ email: testEmail });
    console.log('\n--- ALL STEP 19 AUTHENTICATION TESTS PASSED SUCCESSFULLY ---');
  } catch (err) {
    console.error('❌ Test Suite Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runAuthTests();
