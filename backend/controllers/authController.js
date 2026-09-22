const db = require('../config/db');
const jwt = require('jsonwebtoken');
const md5 = require('md5'); 
const bcrypt = require('bcryptjs'); // 
const nodemailer = require("nodemailer");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if(!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and Password required' });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, emp_name, username, password, role, bname, status, file
       FROM user WHERE username = ? AND status IN ('Active', '1')`,
      [email]
    );

    if(rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid Email or Inactive Account' });
    }

    const user = rows[0];
    let isValid = false;

    // CASE 1: 
    if(user.password.length === 32) { //
      isValid = md5(password) === user.password;
    } 
    // CASE 2: 
    else if(user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isValid = await bcrypt.compare(password, user.password);
      // 
      if(isValid){
        const newHash = md5(password);
        await db.query(`UPDATE user SET password=? WHERE id=?`, [newHash, user.id]);
      }
    }
    else {
      // 
      isValid = password === user.password;
    }
    
    if(!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid Email or Password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.username, role: user.role, branch: user.bname },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    delete user.password;
    res.json({
      success: true,
      message: `Welcome ${user.emp_name}`,
      token,
      user
    });

  } catch (err) {
    console.log("DB Error: ", err);
    return res.status(500).json({ success: false, message: 'Database Error' });
  }
};



const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail'
});

// 
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); 
}

exports.forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, message: "Username required" });

    const [users] = await db.query("SELECT id, emp_name, username FROM user WHERE username =? LIMIT 1", [username.trim()]);
    if (users.length === 0) return res.status(404).json({ success: false, message: "User not found" });

    const token = generateCode(); // 

    await db.query("UPDATE user SET remember_token =?, updated_time = NOW() WHERE id =?", [token, users[0].id]);

    transporter.sendMail({
      from: `"Portal" <${process.env.COMPANY_MAIL}>`,
      to: users[0].username,
      subject: "Password Reset Code",
      html: `<p>Hi ${users[0].emp_name || 'User'},</p>
             <h2>${token}</h2>
             <p>Valid for 15 minutes.</p>`
    }, (err) => { if(err) console.log(err.message) });

    return res.json({
      success: true,
      message: "Reset code sent ✅",
      debug_token: token
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token ||!newPassword) {
      return res.status(400).json({ success: false, message: "Token and new password required" });
    }

    console.log("Received token:", token);

    const [users] = await db.query("SELECT id, remember_token FROM user WHERE remember_token =? LIMIT 1", [token.toString().trim()]);

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid code" });
    }

    await db.query("UPDATE user SET password =?, remember_token = NULL WHERE id =?", [newPassword, users[0].id]);

    return res.json({ success: true, message: "Password updated successfully ✅" });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};