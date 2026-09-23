const db = require("../config/db");

// Get All Designations
const getAllDesignations = async () => {
  const [rows] = await db.query(
    `SELECT
       id,
       des,
       last_update
     FROM des
     ORDER BY id ASC`,
  );

  return rows;
};

// Get Designation By ID
const getDesignationById = async (id) => {
  const [rows] = await db.query(
    `SELECT
       id,
       des,
       last_update
     FROM des
     WHERE id = ?`,
    [id],
  );

  return rows[0];
};
 
const createDesignation = async (designationData) => {
  const { des } = designationData;

  const [result] = await db.query(
    `INSERT INTO des
      (des)
     VALUES (?)`,
    [des],
  );

  return result.insertId;
};
 
const updateDesignation = async (id, designationData) => {
  const { des } = designationData;

  const [result] = await db.query(
    `UPDATE des
     SET
       des = ?
     WHERE id = ?`,
    [des, id],
  );

  return result;
};

// Delete Designation
const deleteDesignation = async (id) => {
  const [result] = await db.query(
    `DELETE FROM des
     WHERE id = ?`,
    [id],
  );

  return result;
};

module.exports = {
  getAllDesignations,
  getDesignationById,
  createDesignation,
  updateDesignation,
  deleteDesignation,
};