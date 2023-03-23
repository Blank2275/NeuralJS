const { Layer, Network } = require('./src/Network.js');
const { ActivationRelu, ActivationSigmoid } = require('./src/Activations.js');
const { MSELoss } = require('./src/LossFunctions.js');
const { DataSet } = require('./src/Dataset.js');
const { EvoTrainer } = require('./src/Trainer.js');
const { Saver } = require('./src/Saver.js');

layers = [
	new Layer(1, new ActivationRelu()),
	new Layer(16, new ActivationRelu()),
	new Layer(8, new ActivationRelu()),
	new Layer(1, new ActivationRelu()),
];

let network = new Network(layers);
// network.layers[1].weights = [[0, 2]]
// network.layers[1].biases = [1]
// network.layers[2].weights = [[3]]
// network.layers[2].biases = [0]

let val = network.evaluate([0, 1]); //9
// console.log(network.layers)

let X = [];
let y = [];

for (let i = 0; i < 100; i += 1) {
	let num = i;
	X.push([num]);
	y.push([Math.pow(num, 3) / 2]);
}

let dataset = new DataSet(X, y);

let trainer = new EvoTrainer(50, network, new MSELoss());

let best = trainer.train(200, dataset);

let num = Math.random() * Math.PI * 2;
console.log(num);
console.log(best.evaluate([0]));
console.log(Math.pow(num, 3) / 2);

// let saver = new Saver();
// let encoded = saver.encode(best)
// let decoded = saver.decode(encoded);

// console.log(decoded.evaluate([0]));
