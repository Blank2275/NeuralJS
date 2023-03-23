const path = require('path');
module.exports = {
	entry: [
		'./src/Activations.js',
		'./src/Dataset.js',
		'./src/LossFunctions.js',
		'./src/Network.js',
		'./src/Saver.js',
		'./src/Trainer.js',
	],
	output: {
		filename: 'neural.js',
		path: path.resolve(__dirname, 'NeuralJS'),
	},
	optimization: { minimize: false },
};
