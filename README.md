# Darker Vision for 5e - Foundry VTT Module

This module attempts to replicate `dnd5e` darkvision rules more accurately, leveraging the existing `dim vision` setting on tokens' vision tabs.

The default Foundry VTT behavior when `dim vision` is set does the following:
* Renders `darkness` within the `dim vision` radius as `dim light`
* Renders `dim light` within the `dim vision` radius as `dim light`
* Renders `bright light` within the `dim vision` radius as `bright light`

Darkvision rules as written for `dnd5e` actually increase each level of light below bright light by one step within the `dim vision` radius. The desired behavior is:
* Renders `darkness` within the `dim vision` radius as `dim light`
* **Renders `dim light` within the `dim vision` radius as `bright light`**
* Renders `bright light` within the `dim vision` radius as `bright light`

This module accomplishes the desired `dnd5e` behavior by iterating through the light-sources of a scene when a token is controlled or updated, doing some math to determine if a light is within the `dim vision` radius, and if it is, temporarily setting the light-source's bright radius to the maximum of the dim and bright radius for the light.

## Configuration

Darker Vision can be configured to brighten lights when:
* any light emitted by the light-source enters the `dim vision` radius of a token
* any `bright light` emitted by the light-source enters the `dim vision` radius of a token
* the light-source origin enters the `dim vision` radius of a token

## Known issues

* Selecting multiple tokens simultaneously will render lighting inconsistently.
* This likely won't work with Dancing Lights or similar Foundry VTT modules that update light-sources often.
