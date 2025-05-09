/**
 * @typedef {(
 * 	 SysColumnDeviceType
 * | SysColumnDeviceItem
 * | SysColumnDeviceMove
 * | SysColumnDeviceIcon
 * | SysColumnDeviceDelete
 * )} ColumnDeviceAttributeHint
 * @typedef {(
 * 	 typeof SysColumnDeviceType
 * | typeof SysColumnDeviceItem
 * | typeof SysColumnDeviceMove
 * | typeof SysColumnDeviceIcon
 * | typeof SysColumnDeviceDelete
 * )} ColumnDeviceAttributeTypeHint
 *
 * @typedef {'title' | 'index'} KeyDeviceAttributeHint
*/
import {SysColumnABC} from "./columns-abc.js"
import {ColumnSectionDeviceInput} from "./column-sections.js"

export class SysColumnDeviceAttr extends SysColumnABC{
	static type = 'attribute';
	static plottable = false;
	static uindex = 0;
	static position_fixed = true;
	static hideable = false;
	static section = ColumnSectionDeviceInput;
}

export class SysColumnDeviceType extends SysColumnDeviceAttr{
	static title = 'Type';
	static unit = null;
	static key = 'title';
	static uindex = 1;
	static hideable = true;
	static description = "Device's type. This cannot be changed after the block is created.";
}

export class SysColumnDeviceItem extends SysColumnDeviceAttr{
	static title = '#';
	static unit = null;
	static key = 'index';
	static uindex = 2;
}

export class SysColumnDeviceMove extends SysColumnDeviceAttr{
	static type = 'move';
	static title = '';
	static unit = null;
	static key = null;
	static uindex = 3;
}

export class SysColumnDeviceDelete extends SysColumnDeviceAttr{
	static type = 'remove';
	static title = '';
	static unit = null;
	static key = null;
	static uindex = 4;
}

export class SysColumnDeviceIcon extends SysColumnDeviceAttr{
	static type = 'icon';
	static title = '';
	static unit = null;
	static key = null;
	static uindex = 5;
	static hideable = true;
	static selector_title = "Symbol";
	static description = "Device's schematic symbol.";
}

export const ColumnDeviceAttribute = [
	SysColumnDeviceDelete,
	SysColumnDeviceMove,
	SysColumnDeviceItem,
	SysColumnDeviceIcon,
	SysColumnDeviceType,
]
