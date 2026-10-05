 const db = require("../config/db");

// Create Address
const createAddress = async (addressData) => {
  const {
    customer_id,
    address_type,
    address,
    gst_number,
    state,
    pincode,
    country,
  } = addressData;

  const [result] = await db.execute(
    `
      INSERT INTO address
      (
        customer_id,
        address_type,
        address,
        gst_number,
        state,
        pincode,
        country
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      customer_id,
      address_type || "Billing",
      address,
      gst_number || null,
      state || null,
      pincode || null,
      country || "India",
    ],
  );

  return result.insertId;
};

// Get All Addresses
const getAllAddresses = async () => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_id,
        address_type,
        address,
        gst_number,
        state,
        pincode,
        country,
        created_at
      FROM address
      ORDER BY id DESC
    `,
  );

  return rows;
};

// Get Addresses By Customer ID
const getAddressesByCustomerId = async (customerId) => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_id,
        address_type,
        address,
        gst_number,
        state,
        pincode,
        country,
        created_at
      FROM address
      WHERE customer_id = ?
      ORDER BY id DESC
    `,
    [customerId],
  );

  return rows;
};

// Get Address By ID
const getAddressById = async (id) => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_id,
        address_type,
        address,
        gst_number,
        state,
        pincode,
        country,
        created_at
      FROM address
      WHERE id = ?
    `,
    [id],
  );

  return rows[0];
};

// Update Address
const updateAddress = async (id, addressData) => {
  const {
    customer_id,
    address_type,
    address,
    gst_number,
    state,
    pincode,
    country,
  } = addressData;

  const [result] = await db.execute(
    `
      UPDATE address
      SET
        customer_id = ?,
        address_type = ?,
        address = ?,
        gst_number = ?,
        state = ?,
        pincode = ?,
        country = ?
      WHERE id = ?
    `,
    [
      customer_id,
      address_type || "Billing",
      address,
      gst_number || null,
      state || null,
      pincode || null,
      country || "India",
      id,
    ],
  );

  return result;
};

// Delete Address
const deleteAddress = async (id) => {
  const [result] = await db.execute(
    `
      DELETE FROM address
      WHERE id = ?
    `,
    [id],
  );

  return result;
};

module.exports = {
  createAddress,
  getAllAddresses,
  getAddressesByCustomerId,
  getAddressById,
  updateAddress,
  deleteAddress,
};
