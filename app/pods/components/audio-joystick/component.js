import Component from '@ember/component';
import { timeout, task } from 'ember-concurrency';
import { computed } from '@ember/object';

const Audio = window.AudioContext || window.webkitAudioContext;

export default Component.extend({
  supported: computed(() => !!Audio),

  record: task(function * () {
    const context = new Audio();
    const analyzer = context.createAnalyser();
    analyzer.fftSize = 2048;
    analyzer.connect(context.destination);

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0, 0);

    gain.connect(analyzer);

    this.set('audio', { gain, context });

    yield timeout(3e3);

    yield gain.disconnect();
    yield analyzer.disconnect();
    yield context.close();
  }),

  boop: task(function * () {
    const { gain, context } = this.get('audio');
    const oscillator = context.createOscillator();
    gain.gain.setValueAtTime(1.0, context.currentTime);
    oscillator.type = 'sine';
    oscillator.connect(gain);
    yield oscillator.start();
    yield timeout(2e2);
    oscillator.frequency.setValueAtTime(500, context.currentTime);
    yield timeout(2e2);
    gain.gain.setValueAtTime(0.0, context.currentTime);
    yield oscillator.stop();
    yield oscillator.disconnect();
  }),

});
