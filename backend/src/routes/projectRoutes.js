const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, projectController.getAllProjects);
router.post('/', auth, roleCheck('admin', 'project_manager'), projectController.createProject);
router.patch('/:id/status', auth, roleCheck('admin', 'project_manager'), projectController.updateProjectStatus);

module.exports = router;