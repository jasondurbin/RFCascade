
import {SysColumnSignalPowerOutIdeal, SysColumnNoisePowerOut, SysColumnSystemOP1dB, SysColumnSystemOIP3, SysColumnSystemOIP2, SysColumnSystemApertureGain} from "./columns-system-calculated.js"
import {SysColumnSignalPowerInIdeal, SysColumnNoisePowerIn, SysColumnSNRIn, SysColumnSNROut, SysColumnSignalGain} from "./columns-system-auto.js"
import {SysColumnNoiseFigureCascaded, SysColumnSystemIP1dB, SysColumnSystemIIP3, SysColumnSystemIIP2, SysColumnSystemEIRP} from "./columns-system-cascade.js"

export const ColumnSystemSorted = [
	SysColumnSignalGain,
	SysColumnSystemApertureGain,
	SysColumnNoiseFigureCascaded,
	SysColumnSystemEIRP,
	SysColumnSignalPowerInIdeal,
	SysColumnSignalPowerOutIdeal,
	SysColumnNoisePowerIn,
	SysColumnNoisePowerOut,
	SysColumnSNRIn,
	SysColumnSNROut,
	SysColumnSystemIP1dB,
	SysColumnSystemOP1dB,
	SysColumnSystemIIP3,
	SysColumnSystemOIP3,
	SysColumnSystemIIP2,
	SysColumnSystemOIP2,
]
