#!/usr/bin/node
global.config = require('../config');
const http = require('http');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const app = require('../app');

if (cluster.isMaster) {
	for (let i = 0; i < (config.concurrency ?? numCPUs); i++) {
		cluster.fork();
	}
	process.on('SIGTERM', () => {
		for (const worker in cluster.workers) {
			if (cluster.workers.hasOwnProperty(
				worker)) {
				cluster.workers[worker].disconnect();
			}
		}
	});

}
else {
	const server = http.createServer(app);
	server.listen(config.port);
}
