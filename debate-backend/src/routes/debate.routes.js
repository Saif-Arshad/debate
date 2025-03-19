const express = require('express');
const router = express.Router();
const debateController = require('../controllers/debate.controller');
const { verifyTeacherToken } = require('../middlewares/jwt-middleware');

router.post('/', verifyTeacherToken, debateController.createDebate);

router.get('/', verifyTeacherToken, debateController.getDebates);
router.post('/:id/join', debateController.joinDebate);
router.post('/:id/contributions', debateController.contributions);
router.post('/contributions/:contributionId/react', debateController.react);

router.get('/:id', debateController.getDebate);

router.put('/:id', debateController.updateDebate);

router.delete('/:id', debateController.deleteDebate);

module.exports = router;
