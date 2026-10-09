const normalizeEmailAddress = (value) =>
  typeof value === "string" ? value.trim() : "";

const isValidEmailAddress = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmailAddress(value));

module.exports = { normalizeEmailAddress, isValidEmailAddress };
