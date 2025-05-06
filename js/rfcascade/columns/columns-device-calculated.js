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
 * )} ColumnDeviceCalculatedTypeHint
 *
 * @typedef {'signal_power_gain' | 'noise_factor' | 'noise_temperature' | 'noise_figure_physical' | 'physical_temperature' | 'op1db' | 'ip1db' | 'aperture_gain'} KeyDeviceCalculatedHint
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
	static title = "Device Gain";
	static unit = ColumnUnitPowerGain;
	static key = 'signal_power_gain';
	static uindex = 41;
	get title(){
		if (this.unit === undefined) return "Device Gain";
		if (this.unit.selected_unit == 'V/V') return "Device Voltage Gain";
		if (this.unit.selected_unit == 'W/W') return "Device Power Gain";
		return "Device Gain";
	}
}

export class SysColumnDeviceNoiseTemperature extends SysColumnDeviceCalculated{
	static title = 'Device Noise Temperature';
	static unit = ColumnUnitTemperature;
	static key = 'noise_temperature';
	static uindex = 42;
}

export class SysColumnDeviceNoiseFigureActual extends SysColumnDeviceCalculated{
	static title = "Device Noise Figure";
	static unit = ColumnUnitGain;
	static key = 'noise_figure_physical';
	static uindex = 43;

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
}

export class SysColumnDeviceOP1dB extends SysColumnDeviceCalculated{
	static title = 'Device OP1dB';
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'op1db';
	static uindex = 45;
}

export class SysColumnDeviceIP1dB extends SysColumnDeviceCalculated{
	static title = 'Device IP1dB';
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'ip1db';
	static uindex = 46;
}

export class SysColumnDeviceOIP3 extends SysColumnDeviceCalculated{
	static title = 'Device OIP3';
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'oip3';
	static uindex = 47;
}

export class SysColumnDeviceIIP3 extends SysColumnDeviceCalculated{
	static title = 'Device IIP3';
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'iip3';
	static uindex = 48;
}

export class SysColumnDeviceOIP2 extends SysColumnDeviceCalculated{
	static title = 'Device OIP2';
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'oip2';
	static uindex = 49;
}

export class SysColumnDeviceIIP2 extends SysColumnDeviceCalculated{
	static title = 'Device IIP2';
	static unit = ColumnUnitPower;
	static unit_default = 'dBm';
	static key = 'iip2';
	static uindex = 50;
}

export class SysColumnDeviceApertureGain extends SysColumnDeviceCalculated{
	static title = "Device Aperture Gain";
	static unit = ColumnUnitGain;
	static key = 'aperture_gain';
	static uindex = 51;
}

export const ColumnDeviceCalculated = [
	SysColumnDeviceSignalPowerGain,
	SysColumnDeviceApertureGain,
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
