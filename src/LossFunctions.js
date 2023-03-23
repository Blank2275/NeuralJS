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