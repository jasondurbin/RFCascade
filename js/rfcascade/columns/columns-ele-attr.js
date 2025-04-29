/**
 * @typedef {(
 * 	 SysColumnElementType
 * | SysColumnElementItem
 * | SysColumnElementMove
 * | SysColumnElementIcon
 * | SysColumnElementDelete
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

export class SysColumnElementMove extends SysColumnElementAttr{
	static type = 'move';
	static title = '';
	static unit = null;
	static key = null;
	static uindex = 3;
}
export class SysColumnElementDelete extends SysColumnElementAttr{
	static type = 'remove';
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
	SysColumnElementDelete,
	SysColumnElementMove,
	SysColumnElementItem,
	SysColumnElementIcon,
	SysColumnElementType,
]
