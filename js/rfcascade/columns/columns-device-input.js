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
 * | SysColumnDeviceSymbol
 * | SysColumnDeviceLegs
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
 * | typeof SysColumnDeviceSymbol
 * | typeof SysColumnDeviceLegs
 * )} ColumnDeviceInputTypeHint
 *
 * @typedef {'gain' | 'noise_figure' | 'part_number' | 'p1db' | 'linearity' | 'color' | 'ip3' | 'ip2' | 'temperature_offset' | 'io_count' | 'symbol'} KeyDeviceInputHint
*/
import {SysColumnABC} from "./columns-abc.js"
import {ColumnSectionDeviceInput} from "./column-sections.js"
import {Symbols} from "../symbols.js";

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
	static save_key = 4;
	static plottable = false;
	static uindex = 11;
	static description = "Device part number or string to appear with symbol when plotting.";
}

export class SysColumnDeviceColor extends SysColumnDeviceInput{
	static title = 'Color';
	static unit = '';
	static key = 'color';
	static input_type = 'color';
	static save_key = 3;
	static plottable = false;
	static uindex = 12;
	static description = "Color of device's symbol.";

	/** @inheritdoc @type {SysColumnDeviceInput['from_saveable']} */
	static from_saveable(pars){
		let v = super.from_saveable(pars);
		if (v === null) return v;
		v = String(v);
		if (v.startsWith("#")) return v;
		if (v.length >= 6) return "#" + v;
		return "#".concat(v[0], v[0], v[1], v[1], v[2], v[2]);
	}
	/** @inheritdoc @type {SysColumnDeviceInput['to_saveable']} */
	static to_saveable(block){
		let v = super.to_saveable(block);
		if (v === null) return v;
		v = String(v);
		if (v.startsWith("#")) v = v.substring(1);
		if (v.length < 6) return v;
		if (v[0] == v[1] && v[2] == v[3] && v[4] == v[5]) return "".concat(v[0], v[2], v[4]);
		return v;
	}
}

export class SysColumnDeviceGain extends SysColumnDeviceInput{
	static title = 'Nominal Gain';
	static unit = 'dB';
	static key = 'gain';
	static save_key = 1;
	static uindex = 20;
	static description = "Nominal gain of device.";
}

export class SysColumnDeviceNoiseFigure extends SysColumnDeviceInput{
	static title = 'Nominal Noise Figure';
	static unit = 'dB';
	static key = 'noise_figure';
	static save_key = 2;
	static uindex = 21;
	static description = "Nominal noise figure of device.";
}

export class SysColumnDeviceLinearity extends SysColumnDeviceInput{
	static title = 'Linearity';
	static unit = '';
	static key = 'linearity';
	static input_type = ['Ignore', 'Output Referred', 'Input Referred'];
	static save_key = 5;
	static uindex = 22;
	static plottable = false;
	static description = "Linearity settings of device such as input/output referred or ignored.";
}

export class SysColumnDeviceP1dB extends SysColumnDeviceInput{
	static title = 'Nominal P1dB';
	static unit = 'dBm';
	static key = 'p1db';
	static save_key = 6;
	static uindex = 23;
	static description = "Nominal input- or output-referred 1-dB compression point (OP1dB or IP1dB depending on 'linearity' setting).";
}

export class SysColumnDeviceIP3 extends SysColumnDeviceInput{
	static title = 'Nominal IP3';
	static unit = 'dBm';
	static key = 'ip3';
	static save_key = 7;
	static uindex = 24;
	static description = "Nominal input- or output-referred third order intercept point (OIP3 or IIP3 depending on 'linearity' setting).";
}

export class SysColumnDeviceIP2 extends SysColumnDeviceInput{
	static defaults = {
		...SysColumnDeviceInput.defaults,
		'visible': false,
	}
	static title = 'Nominal IP2';
	static unit = 'dBm';
	static key = 'ip2';
	static save_key = 8;
	static uindex = 25;
	static description = "Nominal input- or output-referred second order intercept point (OIP2 or IIP2 depending on 'linearity' setting).";
}

export class SysColumnDeviceTemperatureOffset extends SysColumnDeviceInput{
	static defaults = {
		...SysColumnDeviceInput.defaults,
		'visible': false,
	}
	static title = 'Temperature Offset';
	static unit = 'K';
	static key = 'temperature_offset';
	static save_key = 9
	static uindex = 26;
	static description = "Device's temperature increase from system temperature.";
}

export class SysColumnDeviceLegs extends SysColumnDeviceInput{
	static title = 'Inputs or Outputs';
	static unit = '';
	static key = 'io_count';
	static save_key = 10;
	static plottable = false;
	static uindex = 27;
	static description = "Number of inputs or outputs of a combiner or divider.";

	/** @inheritdoc @type {SysColumnDeviceInput['force_hidden']} */
	force_hidden(blocks){
		for (let i = 0; i < blocks.length; i++){
			if (!isNaN(blocks[i].constructor.default_pars['io_count'])) return false;
		}
		return true;
	}
}

const sms = []
for (let i = 0; i < Symbols.length; i++) sms.push(Symbols[i][0]);
export class SysColumnDeviceSymbol extends SysColumnDeviceInput{
	static title = 'Symbol Type';
	static unit = '';
	static key = 'symbol';
	static input_type = sms;
	static save_key = 11;
	static uindex = 28;
	static plottable = false;
	static description = "Device's schematic symbol type.";
}

export const ColumnDeviceInput = [
	SysColumnDeviceColor,
	SysColumnDeviceSymbol,
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
