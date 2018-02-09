import Service from '@ember/service';
import { computed, get } from '@ember/object';
import { gte } from '@ember/object/computed';
import { A } from '@ember/array';
import { v4 } from 'ember-uuid';

const vendors = ['webkit', 'moz'];
const times = { last: 0, current: 0 };
const api = { request: window.requestAnimationFrame, cancel: window.cancelAnimationFrame };

for (let x = 0; x < vendors.length && !api.request; ++x) {
  const prefix = vendors[x];
  api.cancel = window[prefix + 'CancelAnimationFrame'] || window[prefix + 'CancelRequestAnimationFrame'];
  api.request = window[prefix + 'RequestAnimationFrame'];
}

if (!api.request) {
  api.request = function(callback) {
    const now = new Date().getTime();
    times.current = now;
    const delay = Math.max(0, 16 - (now - times.last));
    const id = window.setTimeout(function() { callback(now + delay); }, delay);
    times.last = now + delay;
    return id;
  };
}

if (!api.cancel) {
  api.cancel = function(id) { clearTimeout(id); };
}

function loop(service, listeners) {
  const active = get(listeners, 'length');

  for (const listener of listeners) {
    const { args, context, fn } = listener;
    fn.call(context, ...args);
  }

  if (active) {
    const next = loop.bind(null, service, listeners);
    return api.request.call(window, next);
  }
}

export default Service.extend({
  loops: computed(() => A([])),
  running: gte('loops.length', 1),

  end(handle) {
    const loops = this.get('loops');
    const id = get(handle, 'id') || handle;
    const runner = loops.find(l => get(l, 'id') === id);

    if (!runner) {
      return null;
    }

    loops.removeObject(runner);
    return id;
  },

  start(context, fn, ...args) {
    const id = v4();
    const loops = this.get('loops');
    const running = this.get('running');

    loops.push({ id, context, fn, args });

    if (!running) {
      loop(this, loops);
    }

    return { id };
  },

});
