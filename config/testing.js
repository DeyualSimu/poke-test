const productionConfig = {
	port: process.env.PORT,
	concurrency: parseInt(process.env.CONCURRENCY,10),
};

module.exports = productionConfig;
