/**
 * @import { BlockHint, SysCalculationNode } from "../blocks.js"
 * @typedef {(
 * SysColumnSystemOutputAuto
 * | SysColumnSystemLinearSignalPowerInIdeal
 * | SysColumnSystemSNROut
 * | SysColumnSystemSNRIn
 * )} ColumnSysAutoHint
 *
 * @typedef {'signal_power_in' | 'noise_power_in' | 'snr_out' | 'snr_in'} KeySysAutoHint
 */
import {SysColumnABC} from "./columns-abc.js"
import {ColumnUnitPower, ColumnUnitGain} from "../column-units.js"

export class SysColumnSystemOutputAuto extends SysColumnABC{
	static type = 'system-auto';
	static defaults = {
		...SysColumnABC.defaults,
		'required': false,
		'visible': true
	}
	/**
	 * Calculate column.
	 *
	 * @param {SysCalculationNode} node
	 * @param {BlockHint} block
	 * */
	// we don't need to do anything because this should have already been completed.
	calculate_element(node, block){
		this.update(block, block.get_parameter(this.parameter_key));
	}
}

export class SysColumnSystemLinearSignalPowerInIdeal extends SysColumnSystemOutputAuto{
	static title = 'Signal Power In';
	static unit = ColumnUnitPower;
	static key = 'signal_power_in';
	static uindex = 41;
}

export class SysColumnSystemLinearNoisePowerIn extends SysColumnSystemOutputAuto{
	static title = 'Noise Power In';
	static unit = 'W/Hz';
	static key = 'noise_power_in';
	static uindex = 42;
}

export class SysColumnSystemSNROut extends SysColumnSystemOutputAuto{
	static title = 'SNR Out';
	static unit = ColumnUnitGain;
	static key = 'snr_out';
	static uindex = 43;
}

export class SysColumnSystemSNRIn extends SysColumnSystemOutputAuto{
	static title = 'SNR In';
	static unit = ColumnUnitGain;
	static key = 'snr_in';
	static uindex = 44;
}

export const ColumnSysAuto = [
	SysColumnSystemLinearSignalPowerInIdeal,
	SysColumnSystemLinearNoisePowerIn,
	SysColumnSystemSNRIn,
	SysColumnSystemSNROut,
]
