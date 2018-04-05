
var mysql = require('mysql');

// init database connection
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'dbman',
    password: 'password',
    database: 'whit_waltman'
});

var con = connection;

module.exports = {

	connection: con,

	// insert a new status into the database and return its unique ID for later retrieval
	addPassageToDB: function(status, callback) {
		var data = { whitman_status: status };

		con.query('INSERT INTO passages SET ?;', data, function(err, res) {
			if (err) throw err;
			callback(res.insertId);
		});
	},

	// get info on whether or not a passage is whitman based on its ID
	getPassageStatus: function(passage_id, callback) {
		con.query('SELECT whitman_status FROM passages WHERE uid = ?;', [passage_id], function(err, res) {
			if (err) throw err;

			if (res.length > 0) {
				callback(res[0].whitman_status);
			} else {
				callback(undefined);
			}
		});
	},

	// increment the number of correct responses thus far
	incrementCorrect: function() {
		con.query('UPDATE responses SET count = count + 1 WHERE description = "correct";', function(err, res) {
			if (err) throw err;
		});
	},

	// increment the number of incorrect responses thus far
	incrementIncorrect: function() {
		con.query('UPDATE responses SET count = count + 1 WHERE description = "incorrect";', function(err, res) {
			if (err) throw err;
		});
	},

	// remove a passage from the database given its UID
	deletePassage: function(passage_id) {
		con.query('DELETE FROM passages WHERE uid = ?;', [passage_id], function(err, res) {
			if (err) throw err;
		});
	},

	// get info about the accuracy of responses thus far
	getAccuracyRate: function(callback) {
		con.query('SELECT count FROM responses ORDER BY description ASC;', function(err, res) {
			var cor = res[0].count;
			var inc = res[1].count;

			callback({
				correct: cor,
				incorrect: inc,
				accuracy: cor / (cor + inc) * 100
			});
		});
	},

	clearPassages: function() {
		con.query('DELETE FROM passages;', function(err, res) {
			if (err) throw err;
			con.query('ALTER TABLE passages AUTO_INCREMENT = 1;', function(err, res) {
				if (err) throw err;
			});
		});
	}
}