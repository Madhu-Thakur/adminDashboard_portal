const db = require("../config/db");
 
const createService = async (serviceData) => {
  const {
    customer_id,
    service_type,
    domain,
    renewal_date,
    duration,
    expiry_date,
    renewal_amount,
    service_status,
  } = serviceData;

  const [result] = await db.execute(
    `
      INSERT INTO service_detail
      (
        customer_id,
        service_type,
        domain,
        renewal_date,
        duration,
        expiry_date,
        renewal_amount,
        service_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      customer_id,
      service_type,
      domain || null,
      renewal_date || null,
      duration || null,
      expiry_date || null,
      renewal_amount || null,
      service_status || "Active",
    ],
  );

  return result.insertId;
};
 
const getAllServices = async () => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_id,
        service_type,
        domain,
        renewal_date,
        duration,
        expiry_date,
        renewal_amount,
        service_status,
        created_at
      FROM service_detail
      ORDER BY id DESC
    `,
  );

  return rows;
};
 
const getServicesByCustomerId = async (customerId) => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_id,
        service_type,
        domain,
        renewal_date,
        duration,
        expiry_date,
        renewal_amount,
        service_status,
        created_at
      FROM service_detail
      WHERE customer_id = ?
      ORDER BY id DESC
    `,
    [customerId],
  );

  return rows;
};
 
const getServiceById = async (id) => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        customer_id,
        service_type,
        domain,
        renewal_date,
        duration,
        expiry_date,
        renewal_amount,
        service_status,
        created_at
      FROM service_detail
      WHERE id = ?
    `,
    [id],
  );

  return rows[0];
};
 
const updateService = async (id, serviceData) => {
  const {
    customer_id,
    service_type,
    domain,
    renewal_date,
    duration,
    expiry_date,
    renewal_amount,
    service_status,
  } = serviceData;

  const [result] = await db.execute(
    `
      UPDATE service_detail
      SET
        customer_id = ?,
        service_type = ?,
        domain = ?,
        renewal_date = ?,
        duration = ?,
        expiry_date = ?,
        renewal_amount = ?,
        service_status = ?
      WHERE id = ?
    `,
    [
      customer_id,
      service_type,
      domain || null,
      renewal_date || null,
      duration || null,
      expiry_date || null,
      renewal_amount || null,
      service_status || "Active",
      id,
    ],
  );

  return result;
};
 
const deleteService = async (id) => {
  const [result] = await db.execute(
    `
      DELETE FROM service_detail
      WHERE id = ?
    `,
    [id],
  );

  return result;
};
 
module.exports = {
  createService,
  getAllServices,
  getServicesByCustomerId,
  getServiceById,
  updateService,
  deleteService,
};
