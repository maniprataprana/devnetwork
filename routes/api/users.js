const express = require("express");

const router = express.Router();

// @route GET /api/users/test
// @desc Tests user route
// @access public route
router.get("/test", (req, res) => {
  res.json({ message: "User works!" });
});

module.exports = router;
