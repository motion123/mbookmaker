/**
 * Created by tomihei on 17/03/22.
 */

var Url = require("./../config/url");

var params = {
	id: "",
	pattern: "",
};

module.exports = function(url,callback) {

	var match = Object.keys(Url).filter(function(element) {
		var reg = new RegExp(element);
		var isMatch = reg.test(url);
		if(isMatch) {
			return(element);
		}
	});
	if(match === undefined){
		return callback(true,null);
	} else {
		var reg = new RegExp(match, 'g');
		var id = reg.exec(url);
		params.id = id[1];
		params.pattern = Url[match];
		params.success = true;
		return callback(null,params);
	}
};