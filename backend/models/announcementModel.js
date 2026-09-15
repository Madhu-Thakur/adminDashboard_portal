const db = require("../config/db");

// Create Announcement
const createAnnouncement = async (
  announce,
  role,
  type,
  expiryDate,
  expiryTime,
  status
) => {
  const [result] = await db.query(
    `INSERT INTO announcement
      (announce, role, type, expiry_date, expiry_time, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      announce,
      role,
      type,
      expiryDate,
      expiryTime,
      status,
    ]
  );

  return result;
};

// Get All Announcements
const getAllAnnouncements = async () => {
  const [rows] = await db.query(
    `SELECT
       id,
       announce,
       role,
       type,
       expiry_date,
       expiry_time,
       status
     FROM announcement
     ORDER BY id DESC`
  );

  return rows;
};

// Get Announcement By ID
const getAnnouncementById = async (id) => {
  const [rows] = await db.query(
    `SELECT
       id,
       announce,
       role,
       type,
       expiry_date,
       expiry_time,
       status
     FROM announcement
     WHERE id = ?`,
    [id]
  );

  return rows[0];
};

// Update Announcement
const updateAnnouncement = async (
  id,
  announce,
  role,
  type,
  expiryDate,
  expiryTime,
  status
) => {
  const [result] = await db.query(
    `UPDATE announcement
     SET
       announce = ?,
       role = ?,
       type = ?,
       expiry_date = ?,
       expiry_time = ?,
       status = ?
     WHERE id = ?`,
    [
      announce,
      role,
      type,
      expiryDate,
      expiryTime,
      status,
      id,
    ]
  );

  return result;
};

// Delete Announcement
const deleteAnnouncement = async (id) => {
  const [result] = await db.query(
    `DELETE FROM announcement
     WHERE id = ?`,
    [id]
  );

  return result;
};

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
};