const { Router } = require("express");
const router = Router();
const userRoutes = require("./user.routes")
const debateRoutes = require("./debate.routes")


router.use("/user", userRoutes);
router.use("/debate", debateRoutes);
module.exports = router;

