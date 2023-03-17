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