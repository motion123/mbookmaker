/**
 * Created by tomihei on 17/03/22.
 */
var Youtube = require("./youtube");

module.exports = function(pattern,id,callback) {
	var thumbnail;
	switch (pattern) {
		case "YOUTUBE":
			thumbnail =Youtube(id);
			callback(null,thumbnail);
			break;
		default :
			callback(true,null);
			break;
	}
};