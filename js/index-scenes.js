import {SceneControl} from "./scene/scene-abc.js";
import {ScenePlot1D} from "./scene/plot-1d/scene-plot-1d.js";
import {linspace} from "./util.js";
/**
 * @import { SceneControlSystemCalc } from "./index.js"
 * @import { SysColumnHint } from "./rfcascade/columns.js"
 * */

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


const ICO_SIZE = 50;
export class SceneSystemPlot extends ScenePlot1D{
	/**
	 * Create global scene for System simulator.
	 *
	 * @param {SceneControlSystemCalc} parent
	 * @param {HTMLDivElement} element
	 * @param {Number} counter
	 * */
	constructor(parent, element, counter){
		const pre = "plot-" + String(counter);
		const cmk = pre + "-colormap";
		const chc = document.createElement('select');
		const div1 = document.createElement('div');
		const div2 = document.createElement('div')
		const div3 = document.createElement('div');

		parent.columns.forEach((c) => {
			if (!c.plottable) return;
			const opt = document.createElement('option');
			opt.innerHTML = c.title;
			chc.appendChild(opt);
			opt.setAttribute('data-cls', c.constructor.name);
		})

		chc.addEventListener('change', () => { this.draw(); });

		chc.id = parent.prepend + "-" + pre + "-choice";
		div1.class = "canvas-header";

		element.appendChild(div1);
		element.appendChild(div2);
		element.appendChild(div3);

		div2.classList = "canvas-wrapper";
		const canvas = document.createElement("canvas");
		canvas.id = parent.prepend + "-" + pre;
		div2.appendChild(canvas);

		div3.classList = "canvas-footer";

		const div4 = document.createElement('div');
		const lbl = document.createElement('label');
		const sel = document.createElement('select');

		lbl.setAttribute('for', parent.prepend + "-" + cmk);
		sel.id = parent.prepend + "-" + cmk;
		sel.setAttribute('name', parent.prepend + "-" + cmk);

		div4.appendChild(chc);
		div4.appendChild(lbl);
		div4.appendChild(sel);

		div3.appendChild(div4);
		super(parent, canvas, cmk);

		this.selector = chc;
	}
	/**
	 * Find and return selected column
	 *
	 * @returns {SysColumnHint}
	 * */
	find_active_column(){
		const cols = this.parent.columns;
		let sel = this.selector[0].getAttribute('data-cls');
		for (let i = 0; i < this.selector.length; i++){
			const opt = this.selector[i];
			if (!opt.selected) continue;
			sel = opt.getAttribute('data-cls');
		}
		for (let i = 0; i < cols.length; i++){
			const kls = cols[i];
			if (kls.constructor.name != sel) continue;
			return kls;
		}
		return cols[0];

	}
	draw(){
		const col = this.find_active_column();
		const x = [];
		const y = [];

		let xc = 0;

		let minY = Infinity;
		let maxY = -Infinity;
		this.parent.blocks.forEach((b) => {
			const yi = col.value(b);
			x.push(xc);
			y.push(yi);
			xc++;

			if (isFinite(yi) && !isNaN(yi)){
				minY = Math.min(minY, yi);
				maxY = Math.max(maxY, yi);
			}
		})

		if (maxY == minY){
			maxY -= 1;
			minY += 1;
		}

		this.reset();
		this.set_xgrid(x[0], xc-1, xc);
		this.set_ygrid(minY, maxY, 11);
		this.add_data(x, y, null, {'markers': true});
		this.set_ylabel(col.label);

		super.draw();
	}
	draw_xgrid(){
		const ctx = this.create_context();
		const count = this.xGrid.length;
		const sect = linspace(this._xcBounds[0], this._xcBounds[1], count);
		const maxY = this._ycBounds[1];
		const textPadding = this.cTextPadding;
		const minY = this._ycBounds[0];
		const blocks = this.parent.blocks;

		ctx.save();
		ctx.textBaseline = 'top';
		ctx.textAlign = 'center';

		ctx.beginPath();
		for (let i = 0; i < count; i++){
			if (i > 0 && i < count - 1){
				ctx.moveTo(parseInt(sect[i]), minY);
				ctx.lineTo(parseInt(sect[i]), maxY);
			}
		}
		ctx.stroke();
		ctx.restore();

		for (let i = 0; i < count; i++){
			ctx.save();
			ctx.textBaseline = 'middle';
			ctx.textAlign = 'left';
			ctx.translate(sect[i], minY+textPadding+ICO_SIZE)
			ctx.rotate(45*Math.PI/180);
			//ctx.fillStyle = blocks[i].get_parameter('color');
			ctx.fillText(blocks[i].get_parameter('part_number'), 0, 0);
			ctx.restore();

			ctx.save();
			ctx.translate(sect[i], minY+textPadding)
			ctx.scale(ICO_SIZE, ICO_SIZE);
			ctx.translate(-0.5, 0);
			ctx.lineWidth = 1/25;
			blocks[i].draw_icon(ctx);
			ctx.restore();
		}
	}
	compute_grid_bounds(){
		super.compute_grid_bounds();
		const blocks = this.parent.blocks;
		const textPadding = this.cTextPadding;
		const ctx = this.create_context();
		let mx = 0.0
		blocks.forEach((b) => {
			const txt = b.get_parameter('part_number');
			let mt = ctx.measureText(txt);
			mx = Math.max(mt.width, mx);
		});

		const txt = blocks[blocks.length - 1].get_parameter('part_number');
		let mt = ctx.measureText(txt);
		this._ycBounds[0] = this.canvas.height - this.cPadding - textPadding - mx*Math.sin(Math.PI*45/180)-ICO_SIZE;
		this._xcBounds[1] -= Math.max(ICO_SIZE/2, mt.width*Math.cos(Math.PI*45/180))
	}
}
