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