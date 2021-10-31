console.info("%c  MIFLORA-CARD-COMPACT  \n%c Version 0.1.4 ", "color: orange; font-weight: bold; background: black", "color: white; font-weight: bold; background: dimgray");
class MifloraCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({
            mode: 'open'
        });

        this.sensors = {
            moisture: 'hass:water',
            temperature: 'hass:thermometer',
            brightness: 'hass:white-balance-sunny',
            rssi: 'mdi:wifi',
            conductivity: 'mdi:emoticon-poop'
//            battery: 'hass:battery'
        };

    }
/*
    _computeIcon(sensor, state) {
        const icon = this.sensors[sensor];
        if (sensor === 'battery') {
            if (state <= 5) {
                return `${icon}-alert`;
            } else if (state < 95) {
                return `${icon}-${Math.round((state / 10) - 0.01) * 10}`;
            }
        }
        return icon;
    }
*/
    _click(entity) {
        this._fire('hass-more-info', {
            entityId: entity
        });
    }

    _fire(type, detail) {
        const event = new Event(type, {
            bubbles: true,
            cancelable: false,
            composed: true
        });
        event.detail = detail || {};
        this.shadowRoot.dispatchEvent(event);
        return event;
    }

    //Home Assistant will set the hass property when the state of Home Assistant changes (frequent).
    set hass(hass) {
        const config = this.config;

        var _maxMoisture = parseFloat(config.max_moisture);
        var _minMoisture = parseFloat(config.min_moisture);
        var _minConductivity = parseFloat(config.min_conductivity);
        var _maxConductivity = parseFloat(config.max_conductivity);        
        var _minTemperature = parseFloat(config.min_temperature);
        var _maxTemperature = parseFloat(config.max_temperature);
        var _minBrightness = parseFloat(config.min_brightness);
        var _maxBrightness = parseFloat(config.max_brightness);
        var _obsolete_after = parseFloat(config.obsolete_after); //hours
        
        var sensors_html = "";
        var obsolete_censors_counter = 0;
        for (var i = 0; i < config.entities.length; i++) {
            var _name = config.entities[i]['type'];
            var _sensor = config.entities[i]['entity'];
            // if (config.entities[i]['name']) {
            //     var _display_name = config.entities[i]['name'];
            // } else {
            //     var _display_name = _name[0].toUpperCase() + _name.slice(1);
            // }
            var _state = '';
            var _uom = '';
            if (hass.states[_sensor]) {
                _state = Math.round(parseFloat(hass.states[_sensor].state));
                _uom = hass.states[_sensor].attributes.unit_of_measurement || "";

                //detect outdated measurement
                //required to determine if the battery has died (since no battery entity is provided)
                if(isNaN(_obsolete_after) == false) {
                    var _since_last_update_h = Math.round((Date.now() - new Date(hass.states[_sensor].last_updated).getTime()) / 3600000);
                    if(_since_last_update_h > _obsolete_after) {
                        obsolete_censors_counter++;
                    }
                }
            } else {
                _state = 'Invalid Sensor';
            }

            //var _icon = this._computeIcon(_name, _state);
            var _alertStyle = '';
            var _alertIcon = '';
            switch(_name) {
                case 'moisture':
                    if (_state < _minMoisture) {
                        _alertStyle = 'style="color:#e15b64;"';
                        _alertIcon = '&#9660; '
                    } else if (_state > _maxMoisture) {
                        _alertStyle = 'style="color:#e15b64;"';
                        _alertIcon = '&#9650; ';
                    }
                    break;
                case 'conductivity':
                    if (_state < _minConductivity) {
                        _alertStyle = 'style="color:#e15b64;"';
                        _alertIcon = '&#9660; ';
                    } else if (_state > _maxConductivity) {
                        _alertStyle = 'style="color:#e15b64;"';
                        _alertIcon = '&#9650; ';
                    }
                    break;
                case 'temperature':
                    if (_state < _minTemperature) {
                        _alertStyle = 'style="color:#e15b64;"';
                        _alertIcon = '&#9660; ';
                    } else if (_state > _maxTemperature) {
                        _alertStyle = 'style="color:#e15b64;"';
                        _alertIcon = '&#9650; ';
                    }
                    break;
                case 'brightness':
                    if (_state < _minBrightness) {
                        //TODO: uzależnić od czasu, czyli tylko za dnia
                        //_alertStyle = 'style="color:#e15b64;"';
                        //_alertIcon = '&#9660; ';
                    } else if (_state > _maxBrightness) {
                        _alertStyle = 'style="color:#e15b64;"';
                        _alertIcon = '&#9650; ';
                    }
                    break;
            }

            sensors_html += `
                <div id="sensor${i}" class="sensor">
                    <div class="state" ${_alertStyle}>${_alertIcon}${_state} ${_uom}</div>
                </div>`;
        }

        //if all sensors are obsolete then we can assume that the device is dead
        if(obsolete_censors_counter == config.entities.length) {
            this.shadowRoot.getElementById('container').innerHTML = `
                <div class="content clearfix" style="color:#e15b64;">
                    <div id="sensors">` + sensors_html + `</div>
                </div>`;
        } else {
            this.shadowRoot.getElementById('container').innerHTML = `
                <div class="content clearfix">
                    <div id="sensors">` + sensors_html + `</div>
                </div>`;
        }



        for (var i = 0; i < config.entities.length; i++) {
            this.shadowRoot.getElementById('sensor' + [i]).onclick = this._click.bind(this, config.entities[i]['entity']);
        }
    }

    //  Home Assistant will call setConfig(config) when the configuration changes (rare).
    setConfig(config) {
        if (!config.entities) {
            throw new Error('Please define an entity');
        }

        if(config.obsolete_after && isNaN(parseFloat(config.obsolete_after))) {
            throw new Error('Invalid value of obsolete_after');
        }
        
        const root = this.shadowRoot;
        if (root.lastChild) root.removeChild(root.lastChild);

        this.config = config;

        const card = document.createElement('ha-card');
        const content = document.createElement('div');
        const plantimage = document.createElement('div');
        const style = document.createElement('style');

        style.textContent = `
            .card-header {
                padding: 0px !important;
                margin: 0px !important;
            }

            ha-card {
                position: relative;
                padding: 0;
                height: 145px;
            }
            ha-card .header {
                width: 100%;
            }
            .image {
                margin-left: 5px;
                margin-right: 5px;
                margin-bottom: 5px;
                margin-top: -8px;
                width: 100px;
                height: 100px;
                border-radius: 6px;
            }
            .location {
                float: right;
                margin-left: 5px;
                text-align: center;
            }            
            .sensor {
                display: flex;
                cursor: pointer;
                padding-bottom: 5px;
            }
            .state {
                white-space: nowrap;
                overflow: hidden;
                margin-top: 3px;
                margin-left: auto;
                margin-right: auto;
            }
            .uom {
                color: var(--secondary-text-color);
            }
            .clearfix::after {
                content: "";
                clear: both;
                display: table;
            }
            `;

        // Check if location is set and save location in Variable plantlocation
        if (config.location == null) {
            var _plantlocation = '';
        } else {
            var _plantlocation = config.location;
        }

        // Display Plant image (required) and location (optional)
        plantimage.innerHTML = `
            <p class="location"><img class="image" src=/local/${config.image}><br>${_plantlocation}</p>
            `;

        content.id = "container";
        card.header = config.title;
        card.appendChild(plantimage);
        card.appendChild(content);
        card.appendChild(style);
        root.appendChild(card);
    }

    // The height of your card. Home Assistant uses this to automatically
    // distribute all cards over the available columns.
    getCardSize() {
        return 2;
    }
}

customElements.define('miflora-card-compact', MifloraCard);
