import Component from '@ember/component';
import { inject as service } from '@ember/service';
import EmberObject, { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  audio: service(),
  loop: service(),

  duration: 2e3,
  countdownStep: 1e1,
  recording: false,
  timer: 5,

  support: reads('audio.supported'),
  context: reads('start.lastSuccessful.value.context'),

  start: task(function * () {
    while (this.get('timer') > 0) {
      const current = this.get('timer');
      yield timeout(this.get('countdownStep'));
      this.set('timer', current - 1);
    }

    const context = this.get('audio').context();
    const recorder = Recorder.create({ analyzer: context.get('analyzer') });
    const loop = this.get('loop').start(recorder, recorder.sample);

    return { loop, context, recorder };
  }),

  delay: task(function * ({ loop, context, recorder }) {
    const duration = this.get('duration');
    this.set('recording', true);
    yield timeout(duration);
    this.get('loop').end(loop);
    yield context.close();
    this.set('recording', false);
    console.log(get(recorder, 'samples'));
  }),

  stop: task(function * () {
    const last = this.get('start.lastSuccessful.value');

    if (last) {
      const { loop, context } = last;
      this.get('loop').end(loop);
      yield context.close();
    }

    try {
      const starting = this.get('start');
      starting.cancelAll();
      const delayed = this.get('delay');
      delayed.cancelAll();
    } catch (error) {
    }

    this.set('recording', false);
    this.set('timer', 5);
  }),

});

const Recorder = EmberObject.extend({
  init() {
    this._super(...arguments);
    this.set('samples', []);
  },

  sample() {
    const samples = this.get('samples');
    const analyzer = this.get('analyzer');
    const size = analyzer.frequencyBinCount;
    const buffer = new Uint8Array(size);
    analyzer.getByteTimeDomainData(buffer);

    samples.push(...buffer);
  },

});
