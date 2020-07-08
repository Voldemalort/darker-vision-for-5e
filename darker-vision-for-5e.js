const DarkerVisionFor5e = {
  register: () => {
    game.settings.register('darker-vision-for-5e', 'brighten-boundary', {
      name: 'What part of a light source must be within the dim vision radius to be brightened?',
      scope: 'world',
      config: true,
      default: 'any',
      type: String,
      choices: {
        any: 'Any light (bright or dim)',
        bright: 'Any bright light (or the light source origin if it emits only dim light)',
        origin: 'The light source origin',
      },
    });
  },

  initialize: () => {
    DarkerVisionFor5e.modifyLights();
  },

  patch: {
    removeLitTokenRemnants: (tokenId) => {
      canvas.sight.sources.lights.delete(`Token.${tokenId}`);
      canvas.sight.update();
      canvas.lighting.update();
    },
  },

  modifyLights: (ambientLight) => {
    const controlledToken = canvas.tokens.controlled[0];
    const brightenBoundary = game.settings.get('darker-vision-for-5e', 'brighten-boundary');

    if (ambientLight) {
      const updatedLight = canvas.sight.sources.lights.get(`Light.${ambientLight._id}`);
      updatedLight.originalBright = ambientLight.bright * 0.2 * canvas.scene.data.grid;
    }

    canvas.sight.sources.lights.forEach((light) => {
      let shouldBrighten = false;

      if (controlledToken && controlledToken.data.dimSight) {
        const vision = canvas.sight.sources.vision.get(`Token.${controlledToken.id}`);
        const xOffset = Math.abs(light.x - vision.x);
        const yOffset = Math.abs(light.y - vision.y);
        const distance = Math.sqrt((xOffset * xOffset) + (yOffset * yOffset));
        const dimVision = vision.channels.dim;
        const dimLight = light.channels.dim;
        const brightLight = light.channels.bright;

        switch (brightenBoundary) {
          case 'bright':
            shouldBrighten = distance <= (dimVision + brightLight);
            break;
          case 'origin':
            shouldBrighten = distance <= dimVision;
            break;
          default:
            shouldBrighten = distance <= (dimVision + Math.max(brightLight, dimLight));
        }
      }

      light.originalBright = light.originalBright || light.channels.bright;

      if (shouldBrighten) {
        light.channels.bright = Math.max(light.channels.bright, light.channels.dim);
      } else {
        light.channels.bright = light.originalBright;
      }
    });

    canvas.sight.update();
  },
};

Hooks.once('init', () => DarkerVisionFor5e.register());

Hooks.on('ready', () => {
  DarkerVisionFor5e.initialize();

  Hooks.on('controlToken', () => DarkerVisionFor5e.modifyLights());
  Hooks.on('updateToken', () => DarkerVisionFor5e.modifyLights());
  Hooks.on('createToken', () => DarkerVisionFor5e.modifyLights());

  Hooks.on('updateAmbientLight', (scene, light) => DarkerVisionFor5e.modifyLights(light));
  Hooks.on('creatAmbientLight', (scene, light) => DarkerVisionFor5e.modifyLights(light));

  // remove after fixed in FVTT v0.7.0
  Hooks.on('deleteToken', (scene, token) => DarkerVisionFor5e.patch.removeLitTokenRemnants(token._id));
});
