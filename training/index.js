import '@babel/polyfill';
import fs from'fs';
import Training from'./Training';

(async () => {
    const trainings = {
        moveLeft:  {
            sayText: 'Please imagine you move left. In 3, 2, 1',
            trialDuration: 3,
            trialTimes: 3,
            sampleRate: 512
        },
        moveRight:     {
            sayText: 'Please imagine you move right. In 3, 2, 1',
            trialDuration: 3,
            trialTimes: 3,
            sampleRate: 512
        }
    };

    const trainingInstance = new Training(trainings) ;

    const results = await trainingInstance.startSimulator();
    fs.writeFileSync('test.json', JSON.stringify(results, null, 4));

})();
