const express = require('express');
const helmet = require('helmet');

const app = express();
app.use(helmet());

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.get('/status', (req, res) => {
	res.sendStatus(200);
});

app.get('/pokemons', require('./routes/pokemons'));

app.get('/pokemon/:id', require('./routes/pokemon'));

app.use(function (error, request, response) {
	if (error) {
		response.sendStatus(500);
	}
});

module.exports = app;
