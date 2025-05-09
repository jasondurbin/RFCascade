/**
 * @import { BlockHint, SysCalculationNode } from "../blocks.js"
 * @typedef {(
 *   SysColumnSignalPowerInIdeal
 * | SysColumnNoisePowerIn
 * | SysColumnSNROut
 * | SysColumnSNRIn
 * | SysColumnSignalGain
 * )} ColumnSystemAutoHint
 *
 * @typedef {(
 *   typeof SysColumnSignalPowerInIdeal
 * | typeof SysColumnNoisePowerIn
 * | typeof SysColumnSNROut
 * | typeof SysColumnSNRIn
 * | typeof SysColumnSignalGain
 * )} ColumnSystemAutoTypeHint
 *
 * @typedef {'signal_power_in' | 'noise_power_in' | 'snr_out' | 'snr_in' | 'system_signal_gain_ideal'} KeySystemAutoHint
 */
import {SysColumnABC} from "./columns-abc.js"
import {ColumnUnitPower, ColumnUnitGain, ColumnUnitNoiseDensity} from "../column-units.js"
import {ColumnSectionSystemCascaded} from "./column-sections.js"

export class SysColumnSystemOutputAuto extends SysColumnABC{
	static type = 'system-auto';
	static defaults = {
		...SysColumnABC.defaults,
		'required': false,
		'visible': false
	}
	static section = ColumnSectionSystemCascaded;
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

export class SysColumnSignalPowerInIdeal extends SysColumnSystemOutputAuto{
	static title = 'Signal Power In';
	static unit = ColumnUnitPower;
	static unit_default = "dBm";
	static key = 'signal_power_in';
	static uindex = 201;
	static description = "Signal power at the input of a block.";
}

export class SysColumnSignalGain extends SysColumnSystemOutputAuto{
	static defaults = {
		...SysColumnSystemOutputAuto.defaults,
		'visible': true
	}
	static title = 'Signal Gain';
	static unit = ColumnUnitGain;
	static key = 'system_signal_gain_ideal';
	static uindex = 202;
	static cascade = true;
	static description = "Cascaded signal gain at the output of a block or system.";
}

export class SysColumnNoisePowerIn extends SysColumnSystemOutputAuto{
	static title = 'Noise Power In';
	static unit = ColumnUnitNoiseDensity;
	static unit_default = "dBm/Hz";
	static key = 'noise_power_in';
	static uindex = 203;
	static description = "Noise power at the input of a block.";
}

export class SysColumnSNROut extends SysColumnSystemOutputAuto{
	static title = 'SNR Out';
	static unit = ColumnUnitGain;
	static key = 'snr_out';
	static uindex = 204;
	static cascade = true;
	static description = "Signal-to-noise ratio at the output of a block or system.";
}

export class SysColumnSNRIn extends SysColumnSystemOutputAuto{
	static title = 'SNR In';
	static unit = ColumnUnitGain;
	static key = 'snr_in';
	static uindex = 205;
	static description = "Signal-to-noise ratio at the input of a block.";
}
