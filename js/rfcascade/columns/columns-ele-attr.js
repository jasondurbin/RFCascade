/**
 * @typedef {(
 * 	 SysColumnElementType
 * | SysColumnElementItem
 * | SysColumnElementUp
 * | SysColumnElementDown
 * | SysColumnElementIcon
 * )} ColumnEleAttrHint
 *
 * @typedef {'title' | 'index'} KeyEleAttrHint
*/
import {SysColumnABC} from "./columns-abc.js"

export class SysColumnElementAttr extends SysColumnABC{
	static type = 'attribute';
	static plottable = false;
	static uindex = 0;
	static position_fixed = true;
}

export class SysColumnElementType extends SysColumnElementAttr{
	static title = 'Type';
	static unit = null;
	static key = 'title';
	static uindex = 1;
}

export class SysColumnElementItem extends SysColumnElementAttr{
	static title = '#';
	static unit = null;
	static key = 'index';
	static uindex = 2;
}

export class SysColumnElementUp extends SysColumnElementAttr{
	static type = 'up';
	static title = '';
	static unit = null;
	static key = null;
	static uindex = 3;
}

export class SysColumnElementDown extends SysColumnElementAttr{
	static type = 'down';
	static title = '';
	static unit = null;
	static key = null;
	static uindex = 4;
}

export class SysColumnElementIcon extends SysColumnElementAttr{
	static type = 'icon';
	static title = '';
	static unit = null;
	static key = null;
	static uindex = 5;
}

export const ColumnEleAttr = [
	SysColumnElementUp,
	SysColumnElementDown,
	SysColumnElementItem,
	SysColumnElementIcon,
	SysColumnElementType,
]
