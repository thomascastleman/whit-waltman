
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
var ngram = 3;
var files = [
	// 'training/whitman_complete_poetry.txt',
	// 'training/whitman_complete_prose.txt',
	// 'training/whitman_drum_taps.txt',
	'training/whitman_leaves_grass.txt'
];

// 50 words in a passageSize
var passageSize = 100;

// train the chain
function train(callback) {
	whitman.clearData();	// remove any previous training data

	// train on all whitman files
	whitman.trainOnFile(files, ngram, true, function() {
		callback();
	});
}

function excerptWhitman() {
	return "EXCERPT";
}

// generate whitman text
function generateWhitman() {
	return whitman.generate(passageSize, true);
}

app.get('/', function(req, res) {
	var renderObject = {};
	renderObject.text = Math.random() < 0.5 ? excerptWhitman() : generateWhitman();

	// enter passage into database, get a passage ID to reference it later
	db.addPassageToDB(renderObject.text, function(passage_id) {
		renderObject.passage_id = passage_id;
		res.render('home.html', renderObject);
	});
});

app.post('/grade', function(req, res) {
	var renderObject = {};
	// convert to boolean
	var guess = req.body.guess == "yesWhitman" ? true : false;
	console.log(guess);
	console.log(req.body.full_passage);
	res.render('result.html');
});

app.get('*', function(req, res) {
	res.redirect('/');
});

app.listen(8080, function() {
	console.log("Whit Waltman is listening on port 8080");
	train(function() {
		console.log("Training complete.");
	});
});