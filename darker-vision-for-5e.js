const DarkerVisionFor5e = {
  sightLayerUpdate: SightLayer.prototype.update,

  patch: {
    removeLitTokenRemnants: (tokenId) => {
      canvas.sight.sources.lights.delete(`Token.${tokenId}`);
      canvas.sight.update();
      canvas.lighting.update();
      DarkerVisionFor5e.betterDimVision();
    },
  },

  betterDimVision: () => {
    const controlledToken = canvas.tokens.controlled[0];
    const dimLights = canvas.sight.light.dim.children;

    if (controlledToken
      && controlledToken.data.dimSight
      && dimLights.length
      && !dimLights[dimLights.length - 1].isToken
    ) {
      dimLights[0].isToken = true;
      dimLights[0].light.blendMode = PIXI.BLEND_MODES.SUBTRACT;
      dimLights.push(dimLights.shift());
    }
  },
};

SightLayer.prototype.update = function update() {
  DarkerVisionFor5e.sightLayerUpdate.bind(this)();
  DarkerVisionFor5e.betterDimVision();
};

// remove after fixed in FVTT v0.7.0
Hooks.on('ready', () => {
  Hooks.on('deleteToken', (scene, token) => DarkerVisionFor5e.patch.removeLitTokenRemnants(token._id));
});
