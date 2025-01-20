const express = require('express');
const { addAdminUser, updateAdminUser, loginAdminUser, getUserById , getAdminUsers } = require('../controllers/AdminController');

const router = express.Router();

router.post('/add', addAdminUser); 
router.post('/login', loginAdminUser); 
router.put('/edit/:id', updateAdminUser); 
router.get('/getallusers', getAdminUsers);
router.get('/getuser/:id', getUserById);

module.exports = router;
