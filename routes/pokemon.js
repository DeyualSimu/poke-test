const express = require('express');
const router = express.Router();
const got = require('got');

const Joi = require('joi');
const cache = {};
const pokemonsCache = function (request, response, nextFunction) {
	console.log(`cache`);
	const name = `pokemon_${request.params.id}`;
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
	console.log(`${JSON.stringify(request.params)}`);
	const schema = Joi.object().keys({
		id: Joi.number().integer().positive(),
	});
	const {value, error} = schema.validate(request.params);
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

const getEvolutions = envolvesTo => {
	const evolutions = [];
	for (const evolution of envolvesTo) {
		evolutions.push({
			name      : evolution.species.name,
			evolutions: getEvolutions(evolution.evolves_to),
		});
	}
	return evolutions;
};
const filterEvolutions = (evolutions, name) => {
	console.log(evolutions);
	let filteredEvolutions;
	for (const evolution of evolutions) {
		if (name === evolution.name) {
			return evolution.evolutions;
		}
		else {
			filteredEvolutions = filterEvolutions(evolution.evolutions, name);
		}
		if (filteredEvolutions) {
			return filteredEvolutions;
		}
	}
	return filteredEvolutions;
};
const pokemonsHandler = async function (request, response, nextFunction) {
	let pokemon = {};
	let error;
	const {body} = await got.get(
		`https://pokeapi.co/api/v2/pokemon/${request.params.id}/`,
		{
			responseType: 'json',
			timeout     : 30000,
		})
		.catch(reason => {
			error = reason;
		});
	pokemon = {
		type     : body.types.map(value => value.type.name),
		weight   : body.weight,
		abilities: body.abilities.map(
			value => value.ability.name),
		name     : body.name,
	};
	const specie = await got.get(body.species.url, {
		responseType: 'json',
		timeout     : 30000,
	})
		.then(specieResponse => specieResponse.body)
		.catch(reason => {
			error = reason;
			console.error(reason);
		});
	await got.get(
		specie.evolution_chain.url, {
			responseType: 'json',
			timeout     : 30000,
		})
		.then(evolutionResponse => {
			const evolutions = getEvolutions(evolutionResponse.body.chain.evolves_to);
			pokemon.evolutions = filterEvolutions(evolutions, pokemon.name) ??
				evolutions;
		})
		.catch(reason => {
			error = reason;
		});
	pokemon.image = body.sprites.front_default;
	if (error) {
		nextFunction(error);
	}
	else {
		cache[`pokemon_${request.params.id}`] = pokemon;
		response.json(pokemon);
	}
};

router.route('/pokemon/:id')
	.get(pokemonsValidate)
	.get(pokemonsCache)
	.get(pokemonsHandler);

module.exports = router;
