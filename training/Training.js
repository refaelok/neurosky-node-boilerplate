import say from 'say';
import Cylon from'cylon';
import {NeuroskyEvents, port} from '../src/neurosky/neurosky.config';

export default class Training {
    constructor(trainings) {
        this.isAllTrainingDone = false;
        this.trainings = trainings;
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
        this.initialTrainingOnStart = this.initialTrainingOnStart.bind(this);
        this.isAllSamplesDone = this.isAllSamplesDone.bind(this);
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
            console.log('\x1b[34m', `========== Start Training number ${this.currentTraining} ==========`);
            say.speak(`Start Training number ${this.currentTraining}`, null, null, (err) => {
                console.log();
                this.getNextTrial();
            });
        } else {
            // Trainings Done
            console.log();
            console.log('\x1b[32m', '========== Trainings are Done ==========');
            say.speak('Training are Done');
            console.log();
            this.isAllTrainingDone = true;
        }
    }

    getNextTrial() {
        const {training} = this.getCurrentTrainingObject();
        this.isReadyForRecord = false;
        this.resetCurrentSample();
        this.currentTrial += 1;

        console.log('\x1b[33m', training.sayText);
        say.speak(training.sayText, null, null, (err) => {
            this.isReadyForRecord = true;
            console.log('\x1b[32m', `Training: ${this.currentTraining}; Trial: ${this.currentTrial}; has been done!`);
            console.log();
        });
    }

    isAllSamplesDone(sampleRate) {
        let isDone = true;
        for (const event in NeuroskyEvents) {
            if (this.currentSample[event] < sampleRate) {
                isDone = false;
            }
        }

        return isDone;
    }

    handleSample(data, event) {
        if (this.isReadyForRecord) {
            const {training, trainingName} = this.getCurrentTrainingObject();

            if (this.currentSample[event] < training.sampleRate) {
                this.currentSample[event] += 1;

                this.trainingResults[trainingName][event].push(data);
            } else if (this.isAllSamplesDone(training.sampleRate) && this.currentTrial < training.trialTimes) {
                this.getNextTrial();
            } else if (this.isAllSamplesDone(training.sampleRate)) {
                this.getNextTraining();
            }
        }
    }

    initialTrainingOnStart() {
        console.log("\u001b[2J\u001b[0;0H");
        this.getNextTraining();
    }

    start () {
        return new Promise((resolve) => {
            this.initialTrainingOnStart();
            let trainingsHandled = false;

            Cylon.robot({
                connections: {
                    neurosky: {adaptor: 'neurosky-master', port}
                },

                devices: {
                    headset: {driver: 'neurosky-master'}
                },

                work: (my) => {
                    for (const event in NeuroskyEvents) {
                        my.headset.on(event, (data) => {
                            if (this.isAllTrainingDone && !trainingsHandled) {
                                resolve(this.trainingResults);
                            }
                            this.handleSample(data, event);
                        });
                    }
                }
            }).start();
        });
    }


    startSimulator() {
        return new Promise((resolve) => {
            this.initialTrainingOnStart();
            let trainingsHandled = false;
            let i = 0;

            for (const event in NeuroskyEvents) {
                if (event === NeuroskyEvents.eeg) {
                    setInterval(() => {
                        if (this.isAllTrainingDone && !trainingsHandled) {
                            trainingsHandled = true;
                            resolve(this.trainingResults);
                        }

                        this.handleSample(i++, event);
                    }, 1.5);
                } else {
                    setInterval(() => {
                        if (this.isAllTrainingDone && !trainingsHandled) {
                            trainingsHandled = true;
                            resolve(this.trainingResults);
                        }

                        this.handleSample(i++, event);
                    }, 1.953125);
                }
            }
        });

    }

}
