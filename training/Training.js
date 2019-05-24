import say from 'say';
import Cylon from'cylon';
import {NeuroskyEvents, port} from '../src/neurosky/neurosky.config';


export default class Training {
    constructor(trainings, onTrainingDone) {
        this.trainings = trainings;
        this.onTrainingDone = onTrainingDone;
        this.trainingResults = {};
        this.isReadyForRecord = false;
        this.currentSample = {};
        this.currentTraining = 0;
        this.currentTrial = 0;

        // initial results array
        for (const training in trainings) {
            this.trainingResults[training] = {};

            for (const event in NeuroskyEvents) {
                this.trainingResults[training][event] = [];
                this.currentSample[event] = 0;
            }
        }

        this.start = this.start.bind(this);
        this.startSimulator = this.startSimulator.bind(this);
        this.resetCurrentSample = this.resetCurrentSample.bind(this);
        this.handleSample = this.handleSample.bind(this);
        this.getNextTraining = this.getNextTraining.bind(this);
        this.getNextTrial = this.getNextTrial.bind(this);
        this.getCurrentTrainingObject = this.getCurrentTrainingObject.bind(this);
    }

    resetCurrentSample() {
        for (const event in NeuroskyEvents) {
            this.currentSample[event] = 0;
        }
    }

    getCurrentTrainingObject() {
        const trainingName = Object.keys(this.trainings)[this.currentTraining - 1];
        return {
            training: this.trainings[trainingName],
            trainingName
        }
    }

    getNextTraining() {
        this.resetCurrentSample();
        this.isReadyForRecord = false;
        this.currentTraining += 1;
        this.currentTrial = 0;

        if (this.currentTraining <= Object.keys(this.trainings).length) {
            this.getNextTrial();
        } else {
            // Trainings Done
            say.speak('Training are Done');
            this.onTrainingDone(this.trainingResults);
        }
    }

    getNextTrial() {
        const {training} = this.getCurrentTrainingObject();
        this.isReadyForRecord = false;
        this.resetCurrentSample();
        this.currentTrial += 1;

        console.log(training.sayText);
        say.speak(training.sayText, null, null, (err) => {
            this.isReadyForRecord = true;
            console.log(`Training: ${this.currentTraining}; Trial: ${this.currentTrial}; has been done!`);
        });
    }

    handleSample(data, event) {
        if (this.isReadyForRecord) {
            const {training, trainingName} = this.getCurrentTrainingObject();


            if (this.currentSample[event] < training.sampleRate) {
                this.currentSample[event] += 1;

                this.trainingResults[trainingName][event].push(data);
            } else if (this.currentTrial < training.trialTimes) {
                this.getNextTrial();
            } else {
                this.getNextTraining();
            }
        }
    }

    start () {
        this.getNextTraining();

        Cylon.robot({
            connections: {
                neurosky: { adaptor: 'neurosky-master', port }
            },

            devices: {
                headset: { driver: 'neurosky-master' }
            },

            work: (my) => {
                for (const event in NeuroskyEvents) {
                    my.headset.on(event, (data) => {
                        this.handleSample(data, event);
                    });
                }
            }
        }).start();
    }

    startSimulator() {
        let i = 0;
        this.getNextTraining();

        setInterval(() => {
            this.handleSample(i, NeuroskyEvents.eeg);
            this.handleSample(i, NeuroskyEvents.wave);
            this.handleSample(i, NeuroskyEvents.blink);
            i++;
        }, 1.953125);
    }

}
