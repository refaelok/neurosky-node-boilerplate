import '@babel/polyfill';
import reducers from './reducers';
import controllers from './controllers';
import neurosky from './neurosky';

reducers.create();
controllers.connect();
neurosky.start();