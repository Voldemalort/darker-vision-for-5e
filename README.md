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

## Known issues

* Selecting multiple tokens simultaneously will render lighting inconsistently.
