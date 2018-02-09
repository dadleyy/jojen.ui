import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  actions: {
    attack() {
      const context = this.get('context');
      context.attack();
    },
  },

});
