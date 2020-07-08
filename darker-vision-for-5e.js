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

  removeTokenLight: (tokenId) => {
    canvas.sight.sources.lights.delete(`Token.${tokenId}`);
    canvas.sight.update();
    canvas.lighting.update();
  },

  brightenLights: () => {
    const token = canvas.tokens.controlled.length === 1 ? canvas.tokens.controlled[0] : undefined;
    const newLights = { Light: {}, Token: {} };
    const lights = game.user.getFlag('darker-vision-for-5e', 'lights') || newLights;

    canvas.sight.sources.lights.forEach((light, lightKey) => {
      const [ type, lightId ] = lightKey.split('.');

      if (lights[type][lightId]) {
        light.channels.dim = lights[type][lightId].originalDim;
        light.channels.bright = lights[type][lightId].originalBright;
      }
    });

    if (token && token.data.dimSight) {
      const brightenBoundary = game.settings.get('darker-vision-for-5e', 'brighten-boundary');
      const vision = canvas.sight.sources.vision.get(`Token.${token.id}`);

      canvas.sight.sources.lights.forEach((light, lightKey) => {
        const [ type, lightId ] = lightKey.split('.');
        const a = Math.abs(light.x - vision.x);
        const b = Math.abs(light.y - vision.y);
        const c = Math.sqrt((a * a) + (b * b));
        let shouldBrighten = false;

        switch (brightenBoundary) {
          case 'bright':
            shouldBrighten = c <= (vision.channels.dim + light.channels.bright);
            break;
          case 'origin':
            shouldBrighten = c <= vision.channels.dim;
            break;
          default:
            shouldBrighten = c <= (vision.channels.dim + Math.max(light.channels.bright, light.channels.dim));
        }

        if (shouldBrighten) {
          newLights[type][lightId] = {
            originalDim: light.channels.dim,
            originalBright: light.channels.bright,
          };
          light.channels.bright = Math.max(light.channels.bright, light.channels.dim);
        }
      });
    }

    game.user.unsetFlag('darker-vision-for-5e', 'lights').then(() => {
      game.user.setFlag('darker-vision-for-5e', 'lights', newLights);
      canvas.sight.update();
    });
  }
};

Hooks.once('init', () => DarkerVisionFor5e.registerModule());

Hooks.on('ready', () => {
  game.user.unsetFlag('darker-vision-for-5e', 'lights');
  DarkerVisionFor5e.brightenLights();
  Hooks.on('controlToken', () => DarkerVisionFor5e.brightenLights());
  Hooks.on('updateToken', () => DarkerVisionFor5e.brightenLights());
  Hooks.on('createToken', () => DarkerVisionFor5e.brightenLights());
  Hooks.on('deleteToken', (scene, token) => DarkerVisionFor5e.removeTokenLight(token._id));
  Hooks.on('updateAmbientLight', () => DarkerVisionFor5e.brightenLights());
  Hooks.on('creatAmbientLight', () => DarkerVisionFor5e.brightenLights());
});
