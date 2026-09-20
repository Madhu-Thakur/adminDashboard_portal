const db = require("../config/db");

// Create Notification
const createNotification = async (
  title,
  notify,
  role,
  status
) => {
  const [result] = await db.query(
    `INSERT INTO notification
      (title, notify, role, status)
     VALUES (?, ?, ?, ?)`,
    [
      title,
      notify,
      role,
      status,
    ]
  );

  return result;
};

// Get All Notifications
const getAllNotifications = async () => {
  const [rows] = await db.query(
    `SELECT
       id,
       title,
       notify,
       role,
       status,
       notification_date
     FROM notification
     ORDER BY id DESC`
  );

  return rows;
};

// Get Notification By ID
const getNotificationById = async (id) => {
  const [rows] = await db.query(
    `SELECT
       id,
       title,
       notify,
       role,
       status,
       notification_date
     FROM notification
     WHERE id = ?`,
    [id]
  );

  return rows[0];
};

// Update Notification
const updateNotification = async (
  id,
  title,
  notify,
  role,
  status
) => {
  const [result] = await db.query(
    `UPDATE notification
     SET
       title = ?,
       notify = ?,
       role = ?,
       status = ?
     WHERE id = ?`,
    [
      title,
      notify,
      role,
      status,
      id,
    ]
  );

  return result;
};

// Delete Notification
const deleteNotification = async (id) => {
  const [result] = await db.query(
    `DELETE FROM notification
     WHERE id = ?`,
    [id]
  );

  return result;
};

module.exports = {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
};