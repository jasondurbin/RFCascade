/**
 * @typedef {(
 * 	 SysColumnElementInput
 * | SysColumnElementGain
 * | SysColumnElementNoiseFigure
 * | SysColumnElementPartNumber
 * | SysColumnElementP1dB
 * | SysColumnElementLinearity
 * | SysColumnElementColor
 * )} ColumnEleInputHint
 *
 * @typedef {'gain' | 'noise_figure' | 'part_number' | 'p1db' | 'linearity' | 'color'} KeyEleInputHint
*/
import { SysColumnABC } from "./columns-abc.js"

export class SysColumnElementInput extends SysColumnABC{
	static type = 'input';
	static input_type = 'number';
	static position_fixed = true;
	get input_type(){ return this.constructor.input_type; }
}

export class SysColumnElementPartNumber extends SysColumnElementInput{
	static title = 'Part Number';
	static unit = '';
	static key = 'part_number';
	static input_type = 'text';
	static save_key = 'p';
	static plottable = false;
	static uindex = 11;
}
export class SysColumnElementColor extends SysColumnElementInput{
	static title = 'Color';
	static unit = '';
	static key = 'color';
	static input_type = 'color';
	static save_key = 'c';
	static plottable = false;
	static uindex = 12;
}

export class SysColumnElementGain extends SysColumnElementInput{
	static title = 'Nominal Gain';
	static unit = 'dB';
	static key = 'gain';
	static save_key = 'g';
	static uindex = 20;
}

export class SysColumnElementNoiseFigure extends SysColumnElementInput{
	static title = 'Nominal Noise Figure';
	static unit = 'dB';
	static key = 'noise_figure';
	static save_key = 'n';
	static uindex = 21;
}


export class SysColumnElementLinearity extends SysColumnElementInput{
	static title = 'Linearity';
	static unit = '';
	static key = 'linearity';
	static input_type = ['Ignore', 'Output Referred', 'Input Referred'];
	static save_key = 'l';
	static uindex = 22;
}

export class SysColumnElementP1dB extends SysColumnElementInput{
	static title = 'Nominal P1dB';
	static unit = 'dBm';
	static key = 'p1db';
	static save_key = '1';
	static uindex = 23;
}

export const ColumnEleInput = [
	SysColumnElementColor,
	SysColumnElementPartNumber,
	SysColumnElementGain,
	SysColumnElementNoiseFigure,
	SysColumnElementLinearity,
	SysColumnElementP1dB,
]
