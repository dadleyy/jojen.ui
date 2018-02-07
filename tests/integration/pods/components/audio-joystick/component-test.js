import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('audio-joystick', 'Integration | Component | audio joystick', {
  integration: true,
});

test('it renders', function(assert) {
  this.render(hbs`{{audio-joystick}}`);
  assert.ok(true);
});
