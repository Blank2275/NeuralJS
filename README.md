# NeuralJS
A simple but flexible neural network evolution Javascript library I wrote based on a Java project I made. It is not complete yet but you can create custom neural networks with whatever layers you want, it 
currently has three activation functions: Relu, Sigmoid, and Softmax. For loss functions, it has mean squared error and categorical crossentropy however both of these 
can easily be expanded upon. For training, it currently only supports the evolutionary method, not backpropogation. You can also use this to merge two networks into a 
child network as needed. The models can also save/load.

## Basic Usage
Models are made with the Network constructor with the argument with an array of Layer objects. The first element in the layer array is the input layer and the last is the 
output layer. Layer takes two arguments: the number of neurons (n) and the activation function (activation) which is a constructor you instantiate.

```js
const { Layer, Network } = require("./Network.js");
const { ActivationRelu, ActivationSigmoid } = require("./Activations.js");
const { MSELoss } = require("./LossFunctions.js");
const { DataSet } = require("./Dataset.js");
const { EvoTrainer } = require("./Trainer.js");
const { Saver } = require("./Saver.js");

let layers = [
    new Layer(2, new ActivationRelu()),
    new Layer(8, new ActivationRelu()),
    new Layer(4, new ActivationRelu()),
    new Layer(1, new ActivationSigmoid())
];

let network = new Network(layers);

let X = [];
let y = [];
let nSamples = 1000;
for (let i = 0; i < nSamples; i++) {
    let xPos = Math.random() * 2;
    let yPos = Math.random() * 2;
    X.push([xPos, yPos]);
    y.push([xPos > yPos ? 0 : 1]); // 0 is below y=x, 1 is above
}

let dataset = new DataSet(X, y);

let trainer = new EvoTrainer(50, network, new MSELoss()); // batch size, network to train, loss function
let best = trainer.train(200, dataset); // epochs, dataset

//test model

let numTests = 10;
for (let i = 0; i < numTests; i++) {
    let xPos = Math.random() * 2;
    let yPos = Math.random() * 2;
    let res = best.evaluate([xPos, yPos]);
    let resultString = res > 0.5 ? "above y=x" : "below y=x";
    console.log(`${xPos}, ${yPos}: ${resultString}`);
}
```
