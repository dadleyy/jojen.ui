import Service from '@ember/service';
import EmberObject, { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';

const Context = window.AudioContext || window.webkitAudioContext;

export default Service.extend({
  supported: computed({
    get() { return !!Context; },
  }),

  context() {
    const context = Context ? new Context() : null;
    return context ? AudioApi.create({ context }) : null;
  },
});

export const AudioApi = EmberObject.extend({
  time: reads('context.currentTime'),

  analyzer: computed('context', function() {
    const context = this.get('context');
    const analyzer = context.createAnalyser();
    analyzer.fftSize = 2048;
    analyzer.connect(context.destination);
    return analyzer;
  }),

  destination: computed('analyzer', function() {
    return this.get('analyzer');
  }),

  async close() {
    const context = this.get('context');
    await context.close();
    this.set('context', new Context());
    return true;
  },

  attack() {
    const context = this.get('context');

    if (!context) {
      return null;
    }

    const destination = this.get('destination');
    const node = context.createOscillator();
    const time = this.get('time');

    node.connect(destination);
    node.start();
    node.stop(time + 0.25);
    return true;
  },

});
