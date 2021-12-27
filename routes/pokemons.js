const express = require('express');
const router = express.Router();
const got = require('got');

const Joi = require('joi');
const cache = {};
const pokemonsCache = function (request, response, nextFunction) {
	console.log(`cache`);
	const name = `pokemons_${request.query.page}`;
	if (cache[name]) {
		console.log(`cache exist`);
		response.send(cache[name]);
	}
	else {
		console.log(`cache dont exist`);
		nextFunction();
	}
};
const pokemonsValidate = function (request, response, nextFunction) {
	console.log(`validating`);
	console.log(`${JSON.stringify(request.query)}`);
	const schema = Joi.object().keys({
		page: Joi.number().integer().min(0),
	});
	const {value, error} = schema.validate(request.query);
	if (error) {
		console.log(error);
		nextFunction(error);
	}
	else {
		console.log(value);
		request.query = value;
		nextFunction();
	}
};
const pokemonsHandler = async function (request, response, nextFunction) {
	const pokemons = [];
	let error;
	const init = 10 * request.query.page + 1;
	const end = init + 10;
	console.log(`init : ${init}, end : ${end}`);
	for (let i = init; i < end; i++) {
		const {body} = await got.get(`https://pokeapi.co/api/v2/pokemon/${i}/`,
			{
				responseType: 'json',
				timeout     : 30000,
			})
			.catch(reason => {
				error = reason;
			});
		pokemons.push({
			id       : i,
			name     : body.name,
			type     : body.types.map(value => value.type.name),
			weight   : body.weight,
			abilities: body.abilities.map(
				value => value.ability.name),
		});
	}
	if (error) {
		nextFunction(error);
	}
	else {
		cache[`pokemons_${request.query.page}`] = pokemons;
		response.json(pokemons);
	}
};

router.route('/pokemons')
	.get(pokemonsValidate)
	.get(pokemonsCache)
	.get(pokemonsHandler);

module.exports = router;
