/**
 * @import {ColumnDeviceAttributeHint, ColumnDeviceAttributeTypeHint, KeyDeviceAttributeHint} from "./columns/columns-device-attributes.js"
 * @import {ColumnDeviceCalculatedHint, ColumnDeviceCalculatedTypeHint, KeyDeviceCalculatedHint} from "./columns/columns-device-calculated.js"
 * @import {ColumnDeviceCascadeHint, ColumnDeviceCascadeTypeHint, KeyDeviceCascadeHint} from "./columns/columns-device-cascade.js"
 * @import {ColumnDeviceInputHint, ColumnDeviceInputTypeHint, KeyDeviceInputHint} from "./columns/columns-device-input.js"
 * @import {ColumnSystemAutoHint, ColumnSystemAutoTypeHint, KeySystemAutoHint} from "./columns/columns-system-auto.js"
 * @import {ColumnSystemCalculationHint, ColumnSystemCalculationTypeHint, KeySystemCalculationHint} from "./columns/columns-system-calculated.js"
 * @import {ColumnSystemCascadeHint, ColumnSystemCascadeTypeHint, KeySystemCascadeHint} from "./columns/columns-system-cascade.js"
 *
 * @typedef {(
 *   ColumnDeviceAttributeHint
 * | ColumnDeviceCalculatedHint
 * | ColumnDeviceInputHint
 * | ColumnSystemAutoHint
 * | ColumnSystemCalculationHint
 * | ColumnDeviceCascadeHint
 * | ColumnSystemCascadeHint
 * )} SysColumnHint
 * @typedef {(
 * ColumnDeviceAttributeTypeHint
 * | ColumnDeviceCalculatedTypeHint
 * | ColumnDeviceInputTypeHint
 * | ColumnSystemAutoTypeHint
 * | ColumnSystemCalculationTypeHint
 * | ColumnDeviceCascadeTypeHint
 * | ColumnSystemCascadeTypeHint
 * )} SysColumnTypeHint
 * @typedef {(
 * KeyDeviceCalculatedHint
 * | KeyDeviceInputHint
 * | KeySystemAutoHint
 * | KeySystemCalculationHint
 * | KeyDeviceAttributeHint
 * | KeyDeviceCascadeHint
 * | KeySystemCascadeHint
 * )} KeyHintAny
 */

import {ColumnDeviceAttribute} from "./columns/columns-device-attributes.js"
import {ColumnDeviceCalculated} from "./columns/columns-device-calculated.js"
import {ColumnDeviceInput} from "./columns/columns-device-input.js"
import {ColumnDeviceCascade} from "./columns/columns-device-cascade.js"
import {ColumnSystemSorted} from "./columns/columns-system.js"

/** @type {Array<SysColumnTypeHint>} */
export const SysColumns = [];
const uids = {};

[
	ColumnDeviceAttribute,
	ColumnDeviceInput,
	ColumnDeviceCalculated,
	ColumnDeviceCascade,
	ColumnSystemSorted

].forEach(columns => {
	columns.forEach((c) => {
		SysColumns.push(c);

		let ui = c.uindex;
		if (uids[ui]) throw Error(`uindex=${ui} is not unique for ${c.name}. Taken by ${uids[ui]}`)
		uids[ui] = c.name;
	})
})
