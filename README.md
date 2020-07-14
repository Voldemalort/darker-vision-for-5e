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

## Experimental Grey-Scale Mode

An experimental grey-scale mode can now be accessed on a per-user basis in module settings. Enabling this setting will desaturate anything that a `dim vision` token would see in areas of darkness. This comes at a cost, however:

* performance: this grey-scale effect is a filter that is running any time a token with `dim vision` is selected and may cause performance issues
* image fidelity: this filter can reduce token, background, and tile image quality when it is in effect for some (maybe all) browsers
* personal space: something about the filter reacts poorly when you zoom in too much, causing the screen to go black. `dim vision` tokens like their personal space. Just zoom back out to see your token and the scene again.

## Known issues

* Selecting multiple tokens simultaneously will render lighting inconsistently.
