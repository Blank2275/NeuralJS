(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class ActivationRelu {
    constructor() {
        this.encoded = "RELU";
    }
    activate(vals) {
        for (let i = 0; i < vals.length; i++) {
            vals[i] = Math.max(0, vals[i]);
        }
        return vals;
    }
    derivative(output) {
        if (output <= 0) return 0;
        return 1;
    }
}

class ActivationSigmoid {
    constructor() {
        this.encoded = "SIGMOID";
    }
    activate(vals) {
        for (let i = 0; i < vals.length; i++) {
            vals[i] = 1 / (1 + Math.pow(Math.E, -vals[i]));
        }
        return vals;
    }
    derivative(output) {
        return output * (1 - output);
    }
}

class ActivationSoftmax {
    constructor() {
        this.encoded = "SOFTMAX";
    }
    activate(arr) {
        let res = [];

        let sum = 0;
        for (let d of arr)
            sum += Math.exp(d);

        for (let i = 0; i < arr.length; i++) {
            res.push(Math.exp(arr[i]) / sum);
        }

        return res;
    }
}

exports.ActivationRelu = ActivationRelu;
exports.ActivationSigmoid = ActivationSigmoid;
},{}],2:[function(require,module,exports){
class DataSet{
    constructor(input, output){
        this.input = input;
        this.output = output;
    }
}

exports.DataSet = DataSet;
},{}],3:[function(require,module,exports){
class MSELoss {
    evaluateLoss(expected, actual) {
        let avg = 0;
        for (let i = 0; i < expected.length; i++) {
            for (let j = 0; j < expected[0].length; j++) {
                avg += Math.pow((expected[i][j] - actual[i][j]), 2) / expected[0].length;
            }
        }
        avg /= expected.length;
        return avg;
    }
}

class CategoricalCrossentropy{
    evaluateLoss(expected, actual){
        let res = 0;

        for(let i = 0; i < expected.length; i++){
            for(let j = 0; j < expected[0].length; j++){
                res -= expected[i][j] * Math.log(actual[i][j]);
            }
        }
        res /= actual.length;
        return res;
    }
}

exports.MSELoss = MSELoss;
},{}],4:[function(require,module,exports){
class Layer{
    constructor(n, activation){
        this.n = n;
        this.activation = activation;
        this.weights = [];
        this.biases = [];
        this.deltas = [];
        for(let i = 0; i < n; i++){
            this.deltas.push(0);
        }
    }
    
    setRandomWeights(past){
        this.weights = [];
        this.biases = [];
        for(let i = 0; i < this.n; i++){
            this.biases.push(this.genRand());
            this.weights.push([]);
            for(let j = 0; j < past; j++){
                this.weights[i].push(this.genRand());
            }
        }
    }

    evaluate(past){
        let finalVals = [];

        for(let c = 0; c < this.n; c++){
            let res = 0;

            for(let p = 0; p < past.length; p++){
                res += past[p] * this.weights[c][p];
            }

            finalVals.push(res);
        }

        finalVals = this.activation.activate(finalVals);
        for(let c = 0; c < this.n; c++){
            finalVals[c] += this.biases[c];
        }
        return finalVals;
    }
    
    genRand(){
        return Math.random() * 2 - 1;
    }
}

class Network{
    constructor(layers){
        this.layers = layers;
        this.genNetwork();
    }
    genNetwork(){
        for(let i = 1; i < layers.length; i++){
            this.layers[i].setRandomWeights(this.layers[i - 1].n);
        }
    }

    evaluate(input){
        for(let i = 1; i < this.layers.length; i++){
            input = this.layers[i].evaluate(input);
        }

        return input;
    }
}

exports.Layer = Layer;
exports.Network = Network;
},{}],5:[function(require,module,exports){
const {Network, Layer} = require("./Network.js");
const {ActivationSigmoid, ActivationRelu, ActivationSoftmax} = require("./Activations.js");

class Saver{
    encode(network){
        let res = "";

        res += network.layers.length + "\n";
        for(let layer of network.layers){
            res += layer.activation.encoded + " " + layer.n + "\n";
        }

         res += "===\n";

        for(let layer of network.layers){
            let weights = layer.weights;
            let biases = layer.biases;

            if(!biases.length)
                continue;

            res += this.arrToString(biases) + "\n";

            for(let node of weights){
                res += this.arrToString(node) + "\n";
            }
            
            res += "===\n";
        }
        return res;
    }

    decode(data){
        let dataArr = data.split("\n");
        let currentLine = dataArr[1];

        let numLayers = parseInt(dataArr[0]);

        let layers = [];
        let i = 1;

        while(currentLine != "==="){
            let parts = currentLine.split(" ");
            let activation;

            if(parts[0] === "RELU"){
                activation = new ActivationRelu();
            } else if(parts[0] === "SIGMOID"){
                activation = new ActivationSigmoid();
            } else if(parts[0] === "SOFTMAX"){
                activation = new ActivationSoftmax();
            }
            if(parts[0] === "===") break;

            let n = parseInt(parts[1]);
            layers[i - 1] = new Layer(n, activation);
            
            i++;
            currentLine = dataArr[i];
        }

        let n = new Network(layers);

        let chunks = [];
        let currentChunk = 0;
        chunks.push([]);

        for(let line of dataArr){
            if(currentChunk != 0 && !(line === "===")){
                chunks[currentChunk - 1].push(line);
            }
            if(line === "==="){
                currentChunk++;
                if(currentChunk != 1) chunks.push([]);
            }
        }

        for(let c = 0; c < chunks.length - 1; c++){//chunks.size() - 1 because the last one is empty from the way they are split up
            let biases = this.strArrToDbArr(chunks[c][0].split(" "));
            // let weights = new double[layers[c+1].getN()][layers[c].getN()];
            let weights = [];
            for(let l = 0; l < chunks[c].length - 1; l++){//l for line
                weights.push(this.strArrToDbArr(chunks[c][l + 1].split(" ")));
                // console.log(this.strArrToDbArr(chunks[c][l + 1].split(" ")));
            }
            // console.log(weights);
            layers[c + 1].biases = biases;
            layers[c + 1].weights = weights;
        }
        n.layers = layers;
        return n;
    }

    strArrToDbArr(arr){
        for(let i = 0; i < arr.length; i++){
            arr[i] = parseFloat(arr[i]);
        }
        return arr;
    }

    arrToString(arr){
        let res = "";
        let i = 0;
        for(let item of arr){
            res += item.toString();
            i++;
            if(i < arr.length)
                res += " "
        }
        return res;
    }
}

exports.Saver = Saver;
},{"./Activations.js":1,"./Network.js":4}],6:[function(require,module,exports){
const { Network, Layer } = require("./Network");
class EvoTrainer {
    constructor(batchSize, base, lossFunction) {
        this.batchSize = batchSize;
        this.base = base;
        this.lossFunction = lossFunction;
        this.topTenSize = Math.floor(this.batchSize / 10);
    }

    train(generations, data) {
        let batch = this.generateBatch(this.batchSize);

        for (let g = 0; g < generations; g++) {
            let scores = [];
            for (let n = 0; n < batch.length; n++) {
                scores.push(this.evaluate(batch[n], data));
            }
            // get top 10 percent
            let topIndices = [];
            for (let i = 0; i < this.topTenSize; i++) {
                let index = this.getLowestIndex(scores);
                scores[index] = Number.MAX_SAFE_INTEGER;
                topIndices.push(index);
            }
            for (let n = 0; n < batch.length; n++) {
                scores[n] = this.evaluate(batch[n], data);
            }

            // replace current batch with improved batch
            let newBatch = [];
            for (let i = 0; i < batch.length; i++) {
                let p1Index = Math.floor(Math.random() * this.topTenSize);
                let p2Index = Math.floor(Math.random() * this.topTenSize);
                let p1 = batch[topIndices[p1Index]];
                let p2 = batch[topIndices[p2Index]];
                newBatch.push(this.spawnChild(p1, p2));
            }
            // System.out.println(scores[topIndices[0]]);
            console.log(`generation ${g + 1}, loss:${scores[topIndices[0]]}`);
            batch = newBatch;

        }
        let scores = [];
        for (let n = 0; n < batch.length; n++) {
            scores.push(this.evaluate(batch[n], data));
        }
        let topIndex = this.getLowestIndex(scores);

        console.log("========= Final Loss =========");
        console.log(scores[topIndex]);


        return batch[topIndex];
    }

    getLowestIndex(arr) {
        let index = 0;
        let value = arr[0];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == Number.MAX_SAFE_INT)
                continue;
            if (arr[i] < value) {
                index = i;
                value = arr[i];
            }
        }
        return index;
    }

    generateBatch(size) {
        let res = [];
        let b = this.base;
        for (let i = 0; i < size; i++) {
            res[i] = new Network(Object.assign([], b.layers));
            res[i].genNetwork();
        }
        return res;
    }

    evaluate(network, data) {
        let expected = data.output;
        let input = data.input;

        let output = [];

        for (let i = 0; i < expected.length; i++) {
            output.push(network.evaluate(input[i]));
        }

        return this.calcError(expected, output);
    }

    calcError(expected, actual) {
        return this.lossFunction.evaluateLoss(expected, actual);
    }

    spawnChild(p1, p2) {
        let b = new Network(Object.assign([], this.base.layers));

        for (let l = 1; l < b.layers.length; l++) {
            let p1Layer = p1.layers[l];
            let p2Layer = p2.layers[l];
            let newLayer = this.mergeLayers(p1Layer, p2Layer);
            b.layers[l] = newLayer;
        }

        return b;
    }

    mergeLayers(l1, l2) {
        let merged = new Layer(l1.n, l1.activation);
        merged.setRandomWeights(l1.weights[0].length);
        // merge weights
        let mergedWeights = merged.weights;
        let mergedBiases = merged.biases;
        for (let c = 0; c < l1.weights.length; c++) {
            for (let p = 0; p < l1.weights[0].length; p++) {
                if (Math.random() > 0.5) {
                    mergedWeights[c][p] = l1.weights[c][p];
                } else {
                    mergedWeights[c][p] = l2.weights[c][p];
                }
                if (Math.random() > 0.99) {
                    mergedWeights[c][p] = Math.random() * 2 - 1;
                }
            }
        }

        for (let i = 0; i < l1.biases.length; i++) {
            if (Math.random() > 0.5) {
                mergedBiases[i] = l1.biases[i];
            } else {
                mergedBiases[i] = l2.biases[i];
            }
            if (Math.random() > 0.99) {
                mergedBiases[i] = Math.random() * 2 - 1;
            }
        }

        merged.weights = mergedWeights;
        merged.biases = mergedBiases;

        return merged;
    }
}

class BackpropTrainer {
    constructor(network, lossFunction) {
        this.network = network;
        this.lossFunction = lossFunction;
    }
    backwardPropogateError(expected, actual) {
        for (let i = this.network.layers.length - 1; i >= 0; i--) {
            let layers = this.network.layers;
            let layer = layers[i];
            let errors = [];

            if (i != layers.n - 1) {
                for (let j = 0; j < layer.n; j++) {
                    let error = 0;

                    for (let node = 0; node < layers[i].n; node++) {
                        error += layer.weights[node][j] * layer.nodes[node];
                    }
                    errors.push(error);
                }
            } else {
                for (let j = 0; j < layer.n; j++) {
                    errors.push(this.lossFunction(expected[j], actual[j]));
                }
            }
            for (let j = 0; j < layer.n; j++) {
                layer.deltas[j] = errors[j] * layer.activation.derivative(actual[j]);
            }
        }
    }
}

exports.EvoTrainer = EvoTrainer;
},{"./Network":4}]},{},[1,2,3,4,5,6]);
