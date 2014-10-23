// load in modules
var mongo = require('mongojs');
// global variables
var ObjectId = mongo.ObjectId;
var scriptures_db = mongo('scriptures');
var works = ['ot', 'nt', 'bofm', 'dc', 'pgp'];
var works_name = ['Old Testament', 'New Testament', 'Book of Mormon', 'Doctrine & Covenants', 'Pearl of Great Price'];
var data = [];
var index = [];

/*
 * function load_data
 * This function loads the data from mongodb and caches it locally
 */
function load_data() {
	for (var work_id = 0; work_id < works.length; work_id++) {
		index[work_id] = {};
		index[work_id]._id = work_id;
		index[work_id].name = works_name[work_id];
		load_work(work_id, works[work_id]);
	}
}
load_data();

/*
 * function load_work
 * This function loads the specified work and caches it locally
 * It also indexes the work
 */
function load_work(work_id, work_abbr) {
	var collection = scriptures_db.collection(work_abbr);
	collection.find({}, function (err, result) {
		if (err) {
			console.log(err);
		} else {
			result.sort(function (a,b) {
  				if (a._id < b._id)
     				return -1;
  				if (a._id > b._id)
    				return 1;
  				return 0;
			});
			data[work_id] = result;
			index[work_id].books = [];
			for (var i = 0; i < data[work_id].length; i++) {
				var book = {};
				book._id = parseInt(data[work_id][i]._id);
				book.name = data[work_id][i].name;
				book.abbr = data[work_id][i].abbr;
				book.chapters = data[work_id][i].chapters.length;
				index[work_id].books[book._id] = book;
			}
		}
	});
}

/*
 * function get_work
 * This function returns the contents of the specified work
 */
exports.get_work = function (work) {
	return data[work];
};

/*
 * function get_book
 * This function returns the given book in the specified work
 */
exports.get_book = function (work, book) {
	return data[work][book];
};

/*
 * function get_chapter
 * This function returns the given chapter in the specified book and work
 */
exports.get_chapter = function (work, book, chapter) {
	return data[work][book].chapters[chapter];
};

/*
 * function get_index
 * This function returns the global index variable
 */
exports.get_index = function () {
	return index;
};