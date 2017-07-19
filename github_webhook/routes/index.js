var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '馬克在測試' });
});

router.post('/', function(req, res, next) {
  console.log(req.body);
  res.json({
    title: '馬克在測試'
  });
});

module.exports = router;
