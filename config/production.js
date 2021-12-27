const productionConfig = {
	port       : process.env.PORT ?? 3000,
	concurrency: 1,
};


module.exports = productionConfig;
