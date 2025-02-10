const express = require('express');
const { generateBlog } = require('../controllers/generateBlogController');
const router = express.Router();


router.post('/blog', generateBlog);

module.exports = router;