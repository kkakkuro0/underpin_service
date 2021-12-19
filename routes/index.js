var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const logined = req.session ? req.session.logined : false;
  res.render('index', { logined });
});

module.exports = router;