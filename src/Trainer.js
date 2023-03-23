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