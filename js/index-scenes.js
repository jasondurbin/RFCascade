import {SceneControl} from "./scene/scene-abc.js";
/** @import { SceneControlSystemCalc } from "./index.js" */

export const c_boltzmann =  1.380649*(10**-23);
/**
 * Create global scene for System simulator.
 *
 * @param {SceneControlSystemCalc} parent
 * */
export class SceneSystemGlobals extends SceneControl{
	static autoUpdateURL = false;
	constructor(parent){
		super(parent, []);
		this.system_temperature = 16.85 + 273.15;
		this.bandwidth = 1.0;
		this.kb = c_boltzmann*this.bandwidth;
		this.noise_power = 10**((-173.98-30)/10);
	}

	/**
	 * Auto-build global scene.
	 *
	 * @param {SceneControlSystemCalc} parent
	 * */
	static build(parent){
		const cont = parent.find_element('container');
		const div = document.createElement('div');

		cont.appendChild(div)

		const create_row = (id, inputType) => {
			if (inputType === undefined) inputType = 'input';
			const lbl = document.createElement('label');
			const inp = document.createElement(inputType);
			const dvv = document.createElement('div');
			const cid = parent.prepend + "-" + id;
			inp.id = cid;
			lbl.setAttribute('for', cid);
			dvv.appendChild(lbl);
			dvv.appendChild(inp);
			div.appendChild(dvv);
			return [lbl, inp];
		}
		const [flbl, fsel] = create_row('frequency_unit', 'select');
		flbl.innerHTML = 'Frequency Unit';

		let opt1 = document.createElement('option');
		opt1.innerHTML = 'GHz';
		fsel.appendChild(opt1);

		return new SceneSystemGlobals(parent);
	}
}
