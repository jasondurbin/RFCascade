/**
 * @typedef {(
 * 	 SysColumnElementType
 * )} ColumnEleAttrHint
 *
 * @typedef {'title'} KeyEleAttrHint
*/
import { SysColumnABC } from "./columns-abc.js"

export class SysColumnElementAttr extends SysColumnABC{
	static type = 'attribute';
}

export class SysColumnElementType extends SysColumnElementAttr{
	static title = 'Type';
	static unit = null;
	static key = 'title';
}

export const ColumnEleAttr = [
	SysColumnElementType,
]
