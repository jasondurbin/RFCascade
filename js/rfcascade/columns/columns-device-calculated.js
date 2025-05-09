/**
 * @import { BlockHint, SysCalculationNode } from "../blocks.js"
 * @typedef {(
 * 	 SysColumnDeviceSignalPowerGain
 * | SysColumnDeviceNoiseTemperature
 * | SysColumnDeviceNoiseFigureActual
 * | SysColumnDeviceTemperature
 * | SysColumnDeviceOP1dB
 * | SysColumnDeviceIP1dB
 * | SysColumnDeviceIIP3
 * | SysColumnDeviceOIP3
 * | SysColumnDeviceIIP2
 * | SysColumnDeviceOIP2
 * | SysColumnDeviceApertureGain
 * | SysColumnSinglePathGain
 * | SysColumnDeviceElectronicGain
 * )} ColumnDeviceCalculatedHint
 * @typedef {(
 * 	 typeof SysColumnDeviceSignalPowerGain
 * | typeof SysColumnDeviceNoiseTemperature
 * | typeof SysColumnDeviceNoiseFigureActual
 * | typeof SysColumnDeviceTemperature
 * | typeof SysColumnDeviceOP1dB
 * | typeof SysColumnDeviceIP1dB
 * | typeof SysColumnDeviceIIP3
 * | typeof SysColumnDeviceOIP3
 * | typeof SysColumnDeviceIIP2
 * | typeof SysColumnDeviceOIP2
 * | typeof SysColumnDeviceApertureGain
 * | typeof SysColumnSinglePathGain
 * | typeof SysColumnDeviceElectronicGain
 * )} ColumnDeviceCalculatedTypeHint
 *
 * @typedef {(
 *   'signal_power_gain'
 * | 'noise_factor'
 * | 'noise_temperature'
 * | 'noise_figure_physical'
 * | 'physical_temperature'
 * | 'op1db'
 * | 'ip1db'
 * | 'aperture_gain'
 * | 'single_path_gain'
 * | 'electronic_gain'
 * )} KeyDeviceCalculatedHint
 */
import {SysColumnABC} from "./columns-abc.js"
import {ColumnUnitTemperature, ColumnUnitPowerGain, ColumnUnitGain, ColumnUnitPower} from "../column-units.js"
import {ColumnSectionDeviceCalculated} from "./column-sections.js"

export class SysColumnDeviceCalculated extends SysColumnABC{
	static defaults = {
		...SysColumnABC.defaults,
		'visible': false,
	}
	static section = ColumnSectionDeviceCalculated;
	static type = 'device-output';
	/**
	 * Calculate element parameter.
	 *
	 * @param {SysCalculationNode} node
	 * @param {BlockHint} block
	 * */
	calculate_element(node, block){
		this.update(block, block.get_parameter(this.parameter_key));
	}
}

export class SysColumnDeviceSignalPowerGain extends SysColumnDeviceCalculated{
	static title = "Device Signal Gain";
	static unit = ColumnUnitPowerGain;
	static key = 'signal_power_gain';
	static uindex = 41;
	static description = "Device's contribution to signal gain. Signal gain takes into account nominal gain and combination gain (for combiners).";

	get title(){
		if (this.unit === undefined) return "Device Signal Gain";
		if (this.unit.selected_unit == 'V/V') return "Device Signal Voltage Gain";
		if (this.unit.selected_unit == 'W/W') return "Device Signal Power Gain";
		return "Device Signal Gain";
	}
}

export class SysColumnDeviceNoiseTemperature extends SysColumnDeviceCalculated{
	static title = 'Device Noise Temperature';
	static unit = ColumnUnitTemperature;
	static key = 'noise_temperature';
	static uindex = 42;
	static description = "Device's noise temperature. This is calculated from nominal noise figure and temperature.";
}

export class SysColumnDeviceNoiseFigureActual extends SysColumnDeviceCalculated{
	static title = "Device Noise Figure";
	static unit = ColumnUnitGain;
	static key = 'noise_figure_physical';
	static uindex = 43;
	static description = "Device's noise figure/factor. This is calculated from nominal noise figure and temperature.";

	get title(){
		if (this.unit === undefined) return "Device Noise Figure";
		if (this.unit.selected_unit == 'dB') return "Device Noise Figure";
		return "Device Noise Factor";
	}
}

export class SysColumnDeviceTemperature extends SysColumnDeviceCalculated{
	static title = 'Device Temperature';
	static unit = ColumnUnitTemperature;
	static key = 'physical_temperature';
	static uindex = 44;
	static description = "Device's physical temperature. This is system temperature increased by device's temperature offset.";
}

export class SysColumnDeviceOP1dB extends SysColumnDeviceCalculated{
	static title = 'Device OP1dB';
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'op1db';
	static uindex = 45;
	static description = "Device's output-referred 1-dB compression point (OP1dB).";
}

export class SysColumnDeviceIP1dB extends SysColumnDeviceCalculated{
	static title = 'Device IP1dB';
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'ip1db';
	static uindex = 46;
	static description = "Device's input-referred 1-dB compression point (IP1dB).";
}

export class SysColumnDeviceOIP3 extends SysColumnDeviceCalculated{
	static title = 'Device OIP3';
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'oip3';
	static uindex = 47;
	static description = "Device's output-referred third order intercept point (OIP3).";
}

export class SysColumnDeviceIIP3 extends SysColumnDeviceCalculated{
	static title = 'Device IIP3';
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'iip3';
	static uindex = 48;
	static description = "Device's input-referred third order intercept point (IIP3).";
}

export class SysColumnDeviceOIP2 extends SysColumnDeviceCalculated{
	static title = 'Device OIP2';
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'oip2';
	static uindex = 49;
	static description = "Device's output-referred second order intercept point (OIP2).";
}

export class SysColumnDeviceIIP2 extends SysColumnDeviceCalculated{
	static title = 'Device IIP2';
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'iip2';
	static uindex = 50;
	static description = "Device's input-referred second order intercept point (IIP2).";
}

export class SysColumnDeviceApertureGain extends SysColumnDeviceCalculated{
	static title = "Device Array Gain";
	static unit = ColumnUnitGain;
	static key = 'array_gain';
	static uindex = 51;
	static description = "Device's contribution to aperture gain.";
}

export class SysColumnSinglePathGain extends SysColumnDeviceCalculated{
	static title = "Device Single Path Gain";
	static unit = ColumnUnitGain;
	static key = 'single_path_gain';
	static uindex = 52;
	static description = "Device's contribution single path gain (RX mode only).";

	/** @inheritdoc @type {SysColumnSystemCascade['force_hidden']} */
	force_hidden(blocks){ return this.parent.globals.is_tx(); }
}

export class SysColumnDeviceElectronicGain extends SysColumnDeviceCalculated{
	static title = "Device Electronic Gain";
	static unit = ColumnUnitPowerGain;
	static key = 'electronic_gain';
	static uindex = 53;
	static description = "Device's contribution to electronic gain.";

	get title(){
		if (this.unit === undefined) return "Device Electronic Gain";
		if (this.unit.selected_unit == 'V/V') return "Device Electronic Voltage Gain";
		if (this.unit.selected_unit == 'W/W') return "Device Electronic Power Gain";
		return "Device Electronic Gain";
	}
	/** @inheritdoc @type {SysColumnSystemCascade['force_hidden']} */
	force_hidden(blocks){ return this.parent.globals.is_tx(); }
}

export const ColumnDeviceCalculated = [
	SysColumnDeviceSignalPowerGain,
	SysColumnDeviceElectronicGain,
	SysColumnDeviceApertureGain,
	SysColumnSinglePathGain,
	SysColumnDeviceTemperature,
	SysColumnDeviceNoiseTemperature,
	SysColumnDeviceNoiseFigureActual,
	SysColumnDeviceIP1dB,
	SysColumnDeviceOP1dB,
	SysColumnDeviceIIP3,
	SysColumnDeviceOIP3,
	SysColumnDeviceIIP2,
	SysColumnDeviceOIP2,
]
