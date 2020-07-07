const DarkerVisionFor5e = {
  registerModule: () => {
    game.settings.register('darker-vision-for-5e', 'brighten-boundary', {
      name: 'What part of a light source must be within the dim vision radius to be brightened?',
      scope: 'world',
      config: true,
      default: 'any',
      type: String,
      choices: {
        'any': 'Any light (bright or dim)',
        'bright': 'Any bright light (or the light source origin if it emits only dim light)',
        'origin': 'The light source origin'
      }
    });
  },

  brightenLights: (tokenData) => {
    const brightenBoundary = game.settings.get('darker-vision-for-5e', 'brighten-boundary');
    const lights = game.user.getFlag('darker-vision-for-5e', 'lights') || { Light: {}, Token: {} };
    const newLights = { Light: {}, Token: {} };
    const vision = canvas.sight.sources.vision.get(`Token.${tokenData._id}`);

    canvas.sight.sources.lights.forEach((light, lightKey) => {
      const [ type, key ] = lightKey.split('.');
      const a = Math.abs(light.x - vision.x);
      const b = Math.abs(light.y - vision.y);
      const c = Math.sqrt((a * a) + (b * b));
      let shouldBrighten = false;

      switch (brightenBoundary) {
        case 'bright':
          shouldBrighten = c <= (vision.channels.dim + (lights[type][key] ? lights[type][key].originalBright : light.channels.bright));
          break;
        case 'origin':
          shouldBrighten = c <= vision.channels.dim;
          break;
        default:
          shouldBrighten = c <= (vision.channels.dim + Math.max(light.channels.bright, light.channels.dim));
      }

      if (tokenData.dimSight && shouldBrighten) {
        newLights[type][key] = lights[type][key] || {
          originalDim: light.channels.dim,
          originalBright: light.channels.bright,
        };
        light.channels.bright = Math.max(light.channels.bright, light.channels.dim);
      } else if (lights[type][key]) {
        light.channels.dim = lights[type][key].originalDim;
        light.channels.bright = lights[type][key].originalBright;
      }
    });

    game.user.setFlag('darker-vision-for-5e', 'lights', newLights);

    canvas.sight.update();
  }
};

Hooks.once('init', () => DarkerVisionFor5e.registerModule());

Hooks.on('ready', () => {
  Hooks.on('controlToken', (token) => DarkerVisionFor5e.brightenLights(token.data));
  Hooks.on('updateToken', (sceneData, tokenData) => DarkerVisionFor5e.brightenLights(tokenData));
});
