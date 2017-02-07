/**
 * Created by tomihei on 17/01/16.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.json({ message: 'Successfully Posted a test message.' });
});

module.exports = router;
