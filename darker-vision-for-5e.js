const DarkerVisionFor5e = {
  setup: () => {
    game.settings.register('darker-vision-for-5e', 'shadesOfGrey', {
      name: 'Experimental: Grey Scale Mode',
      hint: 'This setting will render areas of darkness in a token\'s dim vision radius as shades of gray. While this is true to the D&D 5e darkvision rules, it does impact performance and may render tokens, backgrounds, and tiles with less fidelity and greater pixelation while in effect. Additionally, zooming in too far may black out the screen. You can zoom back out to fix this.',
      scope: 'client',
      config: true,
      default: false,
      type: Boolean,
    });
  },

  sightLayerUpdate: SightLayer.prototype.update,

  vShader: 'precision mediump float;\nattribute vec2 aVertexPosition;\nuniform mat3 projectionMatrix;\nuniform vec4 inputSize;\nuniform vec4 outputFrame;\nvarying vec2 vTextureCoord;\nvarying vec2 vFilterCoord;\nvarying vec4 vInputSize;\nvarying vec4 vOutputFrame;\nvec4 filterVertexPosition( void )\n{\nvec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\nreturn vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\n}\nvec2 filterTextureCoord( void )\n{\nreturn aVertexPosition * (outputFrame.zw * inputSize.zw);\n}\nvec2 filterLocalCoord( void )\n{\nreturn filterTextureCoord() * inputSize.xy / outputFrame.zw;\n}\nvoid main(void)\n{\ngl_Position = filterVertexPosition();\nvTextureCoord = filterTextureCoord();\nvFilterCoord = filterLocalCoord();\nvInputSize = inputSize;\nvOutputFrame = outputFrame;\n}',

  fShader: 'varying vec2 vTextureCoord;\nvarying vec2 vFilterCoord;\nuniform sampler2D uSampler;\nuniform sampler2D uMask;\nvoid main(void)\n{\nvec4 baseRGB = texture2D(uSampler, vTextureCoord);\nvec4 maskRGB = texture2D(uMask, vFilterCoord);\nif (maskRGB.r > 0.0) {\nfloat intensity = (.3 * baseRGB.r) + (.59 * baseRGB.g) + (.11 * baseRGB.b);\ngl_FragColor = vec4(intensity, intensity, intensity, baseRGB.a);\n} else {\ngl_FragColor = baseRGB;\n}\n}',

  patch: {
    removeLitTokenRemnants: (tokenId) => {
      canvas.sight.sources.lights.delete(`Token.${tokenId}`);
      canvas.sight.update();
      canvas.lighting.update();
    },
  },

  betterDimVision: (lightSources) => {
    const controlledToken = canvas.tokens.controlled[0];
    const dimLights = canvas.sight.light.dim.children;
    const layers = [canvas.stage];

    if (canvas.darkvision) {
      layers.forEach((layer) => {
        if (layer.filters) {
          layer.filters.forEach((filter, i) => {
            if (filter.isDarkvision) {
              layer.filters.splice(i, 1);
            }
          });
        }
        if (layer.filters && !layer.filters.length) {
          layer.filters = null;
        }
      });
      canvas.darkvision = null;
    }

    if (controlledToken
      && controlledToken.data.dimSight
      && dimLights.length
      && dimLights[dimLights.length - 1].light.blendMode !== PIXI.BLEND_MODES.SUBTRACT
    ) {
      dimLights[0].light.blendMode = PIXI.BLEND_MODES.SUBTRACT;
      dimLights.push(dimLights.shift());

      if (game.settings.get('darker-vision-for-5e', 'shadesOfGrey')) {
        const darkvision = new PIXI.Graphics()
          .beginFill(0xFFFFFF)
          .drawRect(0, 0, canvas.sight.width, canvas.sight.height)
          .beginFill(0x000000);

        let darkvisionSourceSkipped = false;
        for (let sources of Object.values(lightSources)) {
          for (let source of sources.values()) {
            for (let [channel, radius] of Object.entries(source.channels)) {
              if (
                (channel === 'dim' || channel === 'bright')
                && (radius !== 0)
                && source.darknessThreshold <= canvas.lighting._darkness
              ) {
                if (!darkvisionSourceSkipped && channel === 'dim') {
                  darkvisionSourceSkipped = true;
                } else {
                  darkvision.drawPolygon(source.fov.points);
                }
              }
            }
          }
        }

        darkvision.endFill();
        canvas.darkvision = darkvision;
        const darkvisionMask = canvas.app.renderer.generateTexture(canvas.darkvision);
        const darkvisionFilter = new PIXI.Filter(
          DarkerVisionFor5e.vShader,
          DarkerVisionFor5e.fShader,
          { uMask: darkvisionMask },
        );
        darkvisionFilter.autoFit = false;
        darkvisionFilter.isDarkvision = true;
        layers.forEach((layer) => {
          layer.filters = layer.filters || [];
          layer.filters.push(darkvisionFilter);
        });
      }
    }
  },
};

SightLayer.prototype.update = function update() {
  DarkerVisionFor5e.sightLayerUpdate.bind(this)();
  DarkerVisionFor5e.betterDimVision(this.sources);
};

SightLayer.prototype._configureChannels = function _configureChannels() {
  const channels = {
    black: { alpha: 1.0 },
    explored: { alpha: 0.9 },
    dark: { alpha: 0.3 },
    dim: { alpha: 0.5 },
    bright: { alpha: 0.0 },
  };

  for (let channel of Object.values(channels)) {
    channel.hex = PIXI.utils.rgb2hex([channel.alpha, channel.alpha, channel.alpha]);
  }

  return channels;
};

Hooks.on('setup', DarkerVisionFor5e.setup);
Hooks.on('ready', () => {
  Hooks.on('deleteToken', (scene, token) => DarkerVisionFor5e.patch.removeLitTokenRemnants(token._id));
});
