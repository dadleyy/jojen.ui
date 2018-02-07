import Component from '@ember/component';
import { timeout, task } from 'ember-concurrency';
import { defer } from 'rsvp';

const Audio = window.AudioContext || window.webkitAudioContext;

export default Component.extend({

  didInsertElement() {
    const result = this._super(...arguments);

    if (!Audio) {
      return result;
    }

    const context = new Audio();
    this.set('context', context);
    return result;
  },

  record: task(function * () {
    const context = this.get('context');
    const destination = context.createMediaStreamDestination();
    const recorder = new MediaRecorder(destination.stream);
    this.set('destination', destination);

    const { promise, resolve } = defer();
    const chunks = [];

    recorder.ondataavailable = function(evt) {
      chunks.push(evt.data);
    };

    recorder.onstop = function() {
      const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
      resolve(blob);
    };

    recorder.start();
    yield timeout(3e3);
    recorder.stop();

    const data = yield promise;
    const [playback] = this.$('[data-role=playback]');
    playback.src = URL.createObjectURL(data);
    playback.play();
  }),

  boop: task(function * () {
    const context = this.get('context');
    const destination = this.get('destination');

    const gain = context.createGain();
    gain.gain.value = 0.2;
    gain.connect(context.destination);

    const oscillator = context.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.value = 500;
    oscillator.connect(gain).connect(destination);
    oscillator.start(0);

    yield timeout(5e2);

    oscillator.stop();
    oscillator.disconnect();
    gain.disconnect();
  }),

});
