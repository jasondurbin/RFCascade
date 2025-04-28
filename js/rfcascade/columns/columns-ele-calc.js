/**
 * @import { BlockHint, SysCalculationNode } from "../blocks.js"
 * @typedef {(
 * 	 SysColumnElementCalculated
 * | SysColumnElementLinearPowerGain
 * | SysColumnElementNoiseTemperature
 * | SysColumnElementNoiseFigureActual
 * | SysColumnElementDeviceTemperature
 * | SysColumnElementDeviceOP1dB
 * | SysColumnElementDeviceIP1dB
 * )} ColumnEleCalcHint
 *
 * @typedef {'power_gain' | 'noise_factor' | 'noise_temperature' | 'noise_figure_physical' | 'physical_temperature' | 'op1db' | 'ip1db'} KeyEleCalcHint
 */
import {SysColumnABC} from "./columns-abc.js"
import {ColumnUnitTemperature, ColumnUnitPowerGain, ColumnUnitGain, ColumnUnitPower} from "../column-units.js"

export class SysColumnElementCalculated extends SysColumnABC{
	static defaults = {
		...SysColumnABC.defaults,
		'visible': true,
	}
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

export class SysColumnElementLinearPowerGain extends SysColumnElementCalculated{
	static unit = ColumnUnitPowerGain;
	static key = 'power_gain';
	static uindex = 21;
	create_unit(container){
		super.create_unit(container);
		this.unit.addEventListener('change', () => {
			this.update_header();
		})
	}
	get title(){
		if (this.unit === undefined) return "Gain";
		if (this.unit.selected_unit == 'V/V') return "Voltage Gain";
		if (this.unit.selected_unit == 'W/W') return "Power Gain";
		return "Gain";
	}
}

export class SysColumnElementNoiseTemperature extends SysColumnElementCalculated{
	static title = 'Noise Temperature';
	static unit = ColumnUnitTemperature;
	static key = 'noise_temperature';
	static uindex = 22;
}

export class SysColumnElementNoiseFigureActual extends SysColumnElementCalculated{
	static unit = ColumnUnitGain;
	static key = 'noise_figure_physical';
	static uindex = 23;
	create_unit(container){
		super.create_unit(container);
		this.unit.addEventListener('change', () => {
			this.update_header();
		})
	}
	get title(){
		if (this.unit === undefined) return "Noise Figure Actual";
		if (this.unit.selected_unit == 'dB') return "Noise Figure Actual";
		return "Noise Factor Actual";
	}
}

export class SysColumnElementDeviceTemperature extends SysColumnElementCalculated{
	static title = 'Device Temperature';
	static unit = ColumnUnitTemperature;
	static key = 'physical_temperature';
	static uindex = 24;
}

export class SysColumnElementDeviceOP1dB extends SysColumnElementCalculated{
	static title = 'OP1dB';
	static unit = ColumnUnitPower;
	static key = 'op1db';
	static uindex = 25;
}

export class SysColumnElementDeviceIP1dB extends SysColumnElementCalculated{
	static title = 'IP1dB';
	static unit = ColumnUnitPower;
	static key = 'ip1db';
	static uindex = 26;
}


export const ColumnEleCalc = [
	SysColumnElementLinearPowerGain,
	SysColumnElementDeviceIP1dB,
	SysColumnElementDeviceOP1dB,
	SysColumnElementNoiseTemperature,
	SysColumnElementNoiseFigureActual,
	SysColumnElementDeviceTemperature,
]
