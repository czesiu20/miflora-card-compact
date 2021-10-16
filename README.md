[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)


# MiFlora Card Compact Version

A Home Assistant Lovelace card to report MiFlora sensors.
This card a fork from https://github.com/RodBr/miflora-card.

This card is dedicated to use in horizontal stack with two cards.

![miflora-card-compact](https://github.com/czesiu20/miflora-card-compact/raw/main/miflora-card-compact.png)

## Options

| Name             | Type    | Requirement  | Description                                   |
| ---------------- | ------- | ------------ | --------------------------------------------- |
| type             | string  | **Required** | `custom:miflora-card-compact`                 |
| title            | string  | **Required** | Name of the plant being monitored             |
| image            | string  | **Required** | Path to an image of the plant being monitored |
| min_moisture     | integer | Optional     | Minimum moisture content for this plant       |
| max_moisture     | integer | Optional     | Maximum moisture content for this plant       |
| min_conductivity | integer | Optional     | Minimum conductivity reading for this plant   |
| max_conductivity | integer | Optional     | Maximum conductivity reading for this plant   |
| min_temperature  | integer | Optional     | Minimum temperature for this plant            |
| max_temperature  | integer | Optional     | Maximum temperature for this plant            |
| min_brightness   | integer | Optional     | Minimum brightness for this plant             |
| max_brightness   | integer | Optional     | Maximum brightness for this plant             |
| entities         | list    | **Required** | A list sensors to be monitored                |

### Entities

| Name             | Type    | Requirement  | Description                                   |
| ---------------- | ------- | ------------ | --------------------------------------------- |
| entity           | string  | **Required** | Entity ID                                     |
| type             | string  | **Required** | Type of entity                                |
| name             | string  | Optional     | Custom name if you want to change it          |


## Installation

Use [HACS](https://hacs.xyz) or follow this [guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins)


```yaml
resources:
  - url: /hacsfiles/lovelace-miflora-card-compact/miflora-card-compact.js
    type: js
```

3. Add a custom card in your `ui-lovelace.yaml`

```yaml
- type: custom:miflora-card-compact
  title: 'Calathea Zebrina'
  image: images/calathea-zebrina.jpg
  min_moisture: 15
  max_moisture: 60
  min_conductivity: 350
  max_conductivity: 2000
  min_temperature: 12
  max_temperature: 35
  entities:
  - entity: sensor.miflora_1_moisture
    type: moisture
  - entity: sensor.miflora_1_light_brightness
    type: brightness
  - entity: sensor.miflora_1_temperature
    type: temperature
  - entity: sensor.miflora_1_conductivity
    type: conductivity
    name: Fertility
  - entity: sensor.miflora_1_battery
    type: battery
  - entity: sensor.miflora_1_rssi
    type: rssi
    name: BT Signal
```
