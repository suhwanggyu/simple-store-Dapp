var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
 	res.render('index', { address: req.cookies.private_key });
});

router.post('/', function(req,res, next) {
	private_key = req.body.private_key;
	console.log(private_key);
	res.cookie('private_key', private_key);
	res.redirect('/');
});

module.exports = router;
