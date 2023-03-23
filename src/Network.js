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