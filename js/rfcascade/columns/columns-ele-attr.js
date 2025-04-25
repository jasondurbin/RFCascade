/**
 * @typedef {(
 * 	 SysColumnElementType
 * | SysColumnElementItem
 * )} ColumnEleAttrHint
 *
 * @typedef {'title' | 'index'} KeyEleAttrHint
*/
import {SysColumnABC} from "./columns-abc.js"

export class SysColumnElementAttr extends SysColumnABC{
	static type = 'attribute';
}

export class SysColumnElementType extends SysColumnElementAttr{
	static title = 'Type';
	static unit = null;
	static key = 'title';
}

export class SysColumnElementItem extends SysColumnElementAttr{
	static title = '#';
	static unit = null;
	static key = 'index';
}

export class SysColumnElementUp extends SysColumnElementAttr{
	static type = 'up';
	static title = '';
	static unit = null;
	static key = null;
}

export class SysColumnElementDown extends SysColumnElementAttr{
	static type = 'down';
	static title = '';
	static unit = null;
	static key = null;
}

export const ColumnEleAttr = [
	SysColumnElementUp,
	SysColumnElementDown,
	SysColumnElementItem,
	SysColumnElementType,
]
