import {SceneControl} from "../scene/scene-abc.js";
import {SceneSystemPlot} from "./scene-system-plot.js"
/**
 * @import { SceneControlSystemCalc } from "../index.js"
 * */

export class ScenePlotManager extends SceneControl{
	/**
	 * Create scene for managing plots.
	 *
	 * @param {SceneControlSystemCalc} parent
	 * */
	constructor(parent){
		super(parent, ['add-plot', "plots"]);
		/** @type {SceneControlSystemCalc} */
		this.parent;
		this.pcounter = 1;
		/** @type {Array<SceneSystemPlot>} */
		this.plots = []
		this.find_element('add-plot').addEventListener('click', () => {
			this.add_plot();
		})
	}
	static autoUpdateURL = false;
	add_plot(defaults){
		const con = this.find_element("plots");
		const div = document.createElement('div');
		div.classList = "system-plot";
		con.appendChild(div);
		const p = new SceneSystemPlot(this, div, this.pcounter, defaults);
		this.plots.push(p);
		this.pcounter++;
	}
	redraw(){
		const plts = Array.from(this.plots);

		this.find_element("plots").innerHTML = '';
		this.plots = [];
		plts.forEach((p) => {
			if (p.needsDelete) return;
			this.add_plot(p.save_parameters);
		})
	}
	process(force){
		let redraw = false;
		let save = force;
		this.plots.forEach((p) => {
			if (p.needsDelete){
				redraw = true;
				save = true;
			}
		});
		if (redraw) this.redraw();
		this.plots.forEach((p) => {
			if (p.needsSave || force) save = true;
			if (!p.needsUpdate && !force) return
			p.draw();
		})
		return save;
	}
	save_parameters(){
		const plots = [];
		for (let i = 0; i < this.plots.length; i++) plots.push(this.plots[i].save_parameters);
		return plots;
	}
	/**
	 * Load from config.
	 *
	 * @param {Array} configs
	 */
	load(configs){
		try{
			for (let i = 0; i < configs.length; i++) this.add_plot(configs[i]);
			console.log(`${configs.length} plot(s) reloaded...`)
		}
		catch(e){ this.parent.log_loading_error(e); }
	}
}
