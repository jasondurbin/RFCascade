/**
 * @typedef {(
 * 	 SysColumnDeviceGain
 * | SysColumnDeviceNoiseFigure
 * | SysColumnDevicePartNumber
 * | SysColumnDeviceP1dB
 * | SysColumnDeviceLinearity
 * | SysColumnDeviceColor
 * | SysColumnDeviceTemperatureOffset
 * | SysColumnDeviceIP3
 * | SysColumnDeviceIP2
 * )} ColumnDeviceInputHint
 *
 * @typedef {(
 * 	 typeof SysColumnDeviceGain
 * | typeof SysColumnDeviceNoiseFigure
 * | typeof SysColumnDevicePartNumber
 * | typeof SysColumnDeviceP1dB
 * | typeof SysColumnDeviceLinearity
 * | typeof SysColumnDeviceColor
 * | typeof SysColumnDeviceTemperatureOffset
 * | typeof SysColumnDeviceIP3
 * | typeof SysColumnDeviceIP2
 * )} ColumnDeviceInputTypeHint
 *
 * @typedef {'gain' | 'noise_figure' | 'part_number' | 'p1db' | 'linearity' | 'color' | 'ip3' | 'ip2' | 'temperature_offset' | 'io_count'} KeyDeviceInputHint
*/
import {SysColumnABC} from "./columns-abc.js"
import {ColumnSectionDeviceInput} from "./column-sections.js"

export class SysColumnDeviceInput extends SysColumnABC{
	static type = 'input';
	static input_type = 'number';
	static position_fixed = true;
	static section = ColumnSectionDeviceInput;
	get input_type(){ return this.constructor.input_type; }
}

export class SysColumnDevicePartNumber extends SysColumnDeviceInput{
	static title = 'Part Number';
	static unit = '';
	static key = 'part_number';
	static input_type = 'text';
	static save_key = 'p';
	static plottable = false;
	static uindex = 11;
}

export class SysColumnDeviceColor extends SysColumnDeviceInput{
	static title = 'Color';
	static unit = '';
	static key = 'color';
	static input_type = 'color';
	static save_key = 'c';
	static plottable = false;
	static uindex = 12;
}

export class SysColumnDeviceGain extends SysColumnDeviceInput{
	static title = 'Nominal Gain';
	static unit = 'dB';
	static key = 'gain';
	static save_key = 'g';
	static uindex = 20;
}

export class SysColumnDeviceNoiseFigure extends SysColumnDeviceInput{
	static title = 'Nominal Noise Figure';
	static unit = 'dB';
	static key = 'noise_figure';
	static save_key = 'n';
	static uindex = 21;
}

export class SysColumnDeviceLinearity extends SysColumnDeviceInput{
	static title = 'Linearity';
	static unit = '';
	static key = 'linearity';
	static input_type = ['Ignore', 'Output Referred', 'Input Referred'];
	static save_key = 'l';
	static uindex = 22;
}

export class SysColumnDeviceP1dB extends SysColumnDeviceInput{
	static title = 'Nominal P1dB';
	static unit = 'dBm';
	static key = 'p1db';
	static save_key = '1';
	static uindex = 23;
}

export class SysColumnDeviceIP3 extends SysColumnDeviceInput{
	static title = 'Nominal IP3';
	static unit = 'dBm';
	static key = 'ip3';
	static save_key = '3';
	static uindex = 24;
}

export class SysColumnDeviceIP2 extends SysColumnDeviceInput{
	static defaults = {
		...SysColumnDeviceInput.defaults,
		'visible': false,
	}
	static title = 'Nominal IP2';
	static unit = 'dBm';
	static key = 'ip2';
	static save_key = '2';
	static uindex = 25;
}

export class SysColumnDeviceTemperatureOffset extends SysColumnDeviceInput{
	static defaults = {
		...SysColumnDeviceInput.defaults,
		'visible': false,
	}
	static title = 'Temperature Offset';
	static unit = 'K';
	static key = 'temperature_offset';
	static save_key = 'o';
	static uindex = 26;
}

export class SysColumnDeviceLegs extends SysColumnDeviceInput{
	static title = 'Inputs or Outputs';
	static unit = '';
	static key = 'io_count';
	static save_key = 'j';
	static plottable = false;
	static uindex = 27;

	/** @inheritdoc @type {SysColumnDeviceInput['force_hidden']} */
	force_hidden(blocks){
		for (let i = 0; i < blocks.length; i++){
			if (!isNaN(blocks[i].constructor.default_pars['io_count'])) return false;
		}
		return true;
	}
}

export const ColumnDeviceInput = [
	SysColumnDeviceColor,
	SysColumnDevicePartNumber,
	SysColumnDeviceLegs,
	SysColumnDeviceGain,
	SysColumnDeviceNoiseFigure,
	SysColumnDeviceLinearity,
	SysColumnDeviceP1dB,
	SysColumnDeviceIP3,
	SysColumnDeviceIP2,
	SysColumnDeviceTemperatureOffset,
]
