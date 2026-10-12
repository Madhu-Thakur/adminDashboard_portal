 const db = require("../config/db");

// Create Customer
const createCustomer = async (customerData) => {
  const {
    customer_name,
    company_name,
    phone,
    email,
    status,
  } = customerData;

  const [result] = await db.execute(
    `
      INSERT INTO customers
      (
        customer_name,
        company_name,
        phone,
        email,
        balance,
        due_date,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      customer_name,
      company_name || null,
      phone || null,
      email || null,
      0,
      null,
      Number(status ?? 1),
    ],
  );

  return result.insertId;
};


// Update Customer Status
const updateCustomerStatus = async (id, status) => {
  const [result] = await db.execute(
    `
      UPDATE customers
      SET status = ?
      WHERE id = ?
    `,
    [Number(status), id],
  );

  return result;
};



// Get All Customers
const getAllCustomers = async () => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_name,
        company_name,
        email,
        phone,
        balance,
        due_date,
        status,
        created_at
      FROM customers
      ORDER BY id DESC
    `,
  );

  return rows;
};

// Get Customer By ID
const getCustomerById = async (id) => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_name,
        company_name,
        email,
        phone,
        balance,
        due_date,
        status,
        created_at
      FROM customers
      WHERE id = ?
    `,
    [id],
  );

  return rows[0];
};

// Update Customer
const updateCustomer = async (id, customerData) => {
  const {
    customer_name,
    company_name,
    phone,
    email,
    status,
  } = customerData;

  const [result] = await db.execute(
    `
      UPDATE customers
      SET
        customer_name = ?,
        company_name = ?,
        phone = ?,
        email = ?,
        status = ?
      WHERE id = ?
    `,
    [
      customer_name,
      company_name || null,
      phone || null,
      email || null,
      Number(status ?? 1),
      id,
    ],
  );

  return result;
};

// Update Customer Payment
const updateCustomerPayment = async (id, payment, dueDate) => {
  const [result] = await db.execute(
    `
      UPDATE customers
      SET
        balance = ?,
        due_date = ?
      WHERE id = ?
    `,
    [
      Number(payment || 0),
      dueDate || null,
      id,
    ],
  );

  return result;
};

// Delete Customer
const deleteCustomer = async (id) => {
  const [result] = await db.execute(
    `
      DELETE FROM customers
      WHERE id = ?
    `,
    [id],
  );

  return result;
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  updateCustomerPayment,
  deleteCustomer,
  updateCustomerStatus,
};