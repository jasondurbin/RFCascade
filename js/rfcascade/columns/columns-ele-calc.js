/**
 * @import { BlockHint, SysCalculationNode } from "../blocks.js"
 * @typedef {(
 * 	 SysColumnElementCalculated
 * | SysColumnElementLinearPowerGain
 * | SysColumnElementNoiseFactor
 * | SysColumnElementNoiseTemperature
 * )} ColumnEleCalcHint
 *
 * @typedef {'power_gain' | 'noise_factor' | 'noise_temperature'} KeyEleCalcHint
 */
import {SysColumnABC} from "./columns-abc.js"
import {ColumnUnitTemperature, ColumnUnitPowerGain} from "../column-units.js"

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
	static title = 'Gain';
	static unit = ColumnUnitPowerGain;
	static key = 'power_gain';
}

export class SysColumnElementNoiseFactor extends SysColumnElementCalculated{
	static title = 'Noise Factor';
	static unit = '';
	static key = 'noise_factor';
}

export class SysColumnElementNoiseTemperature extends SysColumnElementCalculated{
	static title = 'Noise Temperature';
	static unit = ColumnUnitTemperature;
	static key = 'noise_temperature';
}


export const ColumnEleCalc = [
	SysColumnElementLinearPowerGain,
	SysColumnElementNoiseFactor,
	SysColumnElementNoiseTemperature,
]
