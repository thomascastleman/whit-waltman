
var express         = require('express');
var mustacheExpress = require('mustache-express');
var bodyParser      = require('body-parser');
var markov			= require('string-markov-js');

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.engine('html', mustacheExpress());
app.use('/', express.static('views'));

var whitman = markov.newDataSet();
var ngram = 3;
var files = [
	'training/whitman_complete_poetry.txt',
	'training/whitman_complete_prose.txt',
	'training/whitman_drum_taps.txt',
	'training/whitman_leaves_grass.txt'
];

// 50 words in a passage
var passageSize = 50;

// train the chain
function train(callback) {
	whitman.clearData();

	whitman.trainOnFile(files, ngram, true, function() {
		callback();
	});
}

function excerptWhitman() {

}

function generateWhitman() {

}

app.listen(8080, function() {
	console.log("Whit Waltman is listening on port 8080");
	train(function() {
		console.log("Training complete.");
	});
});