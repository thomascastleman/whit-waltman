
var express         = require('express');
var mustacheExpress = require('mustache-express');
var bodyParser      = require('body-parser');
var markov			= require('string-markov-js');
var db				= require('./database.js');

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.engine('html', mustacheExpress());
app.use('/', express.static('views'));

var whitman = markov.newDataSet();
var ngram = 2;
var files = [
	// 'training/whitman_complete_poetry.txt',
	// 'training/whitman_complete_prose.txt',
	// 'training/whitman_drum_taps.txt',
	'training/whitman_leaves_grass.txt'
];
var fullSentences;
var passageSize = 100;	// number of words in a passage

// train the chain
function train(callback) {
	whitman.clearData();	// remove any previous training data

	// train on all whitman files
	whitman.trainOnFile(files, ngram, true, function() {
		// split into whitman lines
		fullSentences = whitman.fullCorpus.split("\n");
		callback();
	});
}

function excerptWhitman() {
	var excerpt = "";
	var index = Math.floor(Math.random() * fullSentences.length);

	// add new line while word amount not yet met
	while (excerpt.split(" ").length < passageSize) {
		excerpt += fullSentences[index++] + '\n';
	}

	return excerpt;
}

// generate whitman text
function generateWhitman() {
	return whitman.generate(passageSize, true);

}

app.get('/', function(req, res) {
	var renderObject = {};
	var status;

	if (Math.random() < 0.5) {
		renderObject.text = excerptWhitman();
		status = 1;
	} else {
		renderObject.text = generateWhitman();
		status = 0;
	}

	// enter passage into database, get a passage ID to reference it later
	db.addPassageToDB(status, function(passage_id) {
		renderObject.passage_id = passage_id;
		res.render('home.html', renderObject);
	});
});

app.post('/grade', function(req, res) {
	var renderObject = {text: req.body.full_passage};
	var guess = req.body.guess == "yesWhitman" ? true : false;	// convert to boolean

	// check db whether passage is whitman or not
	db.getPassageStatus(req.body.passage_id, function(status) {
		// handle result accordingly
		if (guess == status) {
			db.incrementCorrect();
			renderObject.result = "You are correct";
		} else {
			db.incrementIncorrect();
			renderObject.result = "You are NOT correct";
		}

		// remove passage from db
		db.deletePassage(req.body.passage_id);

		// check accuracy
		db.getAccuracyRate(function(data) {
			renderObject = Object.assign(data, renderObject);
			renderObject.accuracy = renderObject.accuracy.toFixed(3);
			res.render('result.html', renderObject);
		});
	});
});

// handle misc. get requests by redirecting to root
app.get('*', function(req, res) {
	res.redirect('/');
});

app.listen(8080, function() {
	console.log("Whit Waltman is listening on port 8080");

	db.clearPassages();

	// train markov chain on server start
	train(function() {
		console.log("Training complete.");
	});
});