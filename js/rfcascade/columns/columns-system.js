
import {SysColumnSignalPowerOutIdeal, SysColumnNoisePowerOut, SysColumnSystemOP1dB, SysColumnSystemOIP3, SysColumnSystemOIP2, SysColumnSystemElementCount, SysColumnSystemSinglePathGain, SysColumnSystemArrayGain} from "./columns-system-calculated.js"
import {SysColumnSignalPowerInIdeal, SysColumnNoisePowerIn, SysColumnSNRIn, SysColumnSNROut, SysColumnSignalGain} from "./columns-system-auto.js"
import {SysColumnSystemNoiseFigure, SysColumnSystemIP1dB, SysColumnSystemIIP3, SysColumnSystemIIP2, SysColumnSystemEIRP, SysColumnSystemElectronicGain, SysColumnSystemNoiseTemperature, SysColumnSystemGoverT, SysColumnSystemSPGNoiseFigure} from "./columns-system-cascade.js"

export const ColumnSystemSorted = [
	SysColumnSignalGain,
	SysColumnSystemElementCount,
	SysColumnSystemElectronicGain,
	SysColumnSystemSinglePathGain,
	SysColumnSystemArrayGain,
	SysColumnSystemNoiseFigure,
	SysColumnSystemSPGNoiseFigure,
	SysColumnSystemNoiseTemperature,
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
	SysColumnSystemGoverT,
]
