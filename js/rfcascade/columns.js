/**
 * @import {ColumnEleAttrHint, KeyEleAttrHint} from "./columns/columns-ele-attr.js"
 * @import {ColumnEleCalcHint, KeyEleCalcHint} from "./columns/columns-ele-calc.js"
 * @import {ColumnEleInputHint, KeyEleInputHint} from "./columns/columns-ele-input.js"
 * @import {ColumnSysAutoHint, KeySysAutoHint} from "./columns/columns-sys-auto.js"
 * @import {ColumnSysCalcHint, KeySysCalcHint} from "./columns/columns-sys-calc.js"
 *
 * @typedef {(ColumnEleAttrHint | ColumnEleCalcHint | ColumnEleInputHint | ColumnSysAutoHint | ColumnSysCalcHint)} SysColumnHint
 * @typedef {(KeyEleCalcHint | KeyEleInputHint | KeySysAutoHint | KeySysCalcHint | KeyEleAttrHint | KeySysConvHint)} KeyHintAny
 */

import {ColumnEleAttr} from "./columns/columns-ele-attr.js"
import {ColumnEleCalc} from "./columns/columns-ele-calc.js"
import {ColumnEleInput} from "./columns/columns-ele-input.js"
import {ColumnSysAuto} from "./columns/columns-sys-auto.js"
import {ColumnSysCalc} from "./columns/columns-sys-calc.js"


export const SysColumns = [];
const uids = {};

[
	ColumnEleAttr,
	ColumnEleInput,
	ColumnEleCalc,
	ColumnSysCalc,
	ColumnSysAuto,

].forEach(columns => {
	columns.forEach((c) => {
		SysColumns.push(c);

		let ui = c.uindex;
		if (uids[ui]) throw Error(`uindex=${ui} is not unique for ${c.name}. Taken by ${uids[ui]}`)
		uids[ui] = c.name;
	})
})
