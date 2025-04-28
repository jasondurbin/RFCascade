import {linspace} from "../../util.js";
import {ScenePlotABC} from "../scene-plot-abc.js"

export class ScenePlot1D extends ScenePlotABC{
	constructor(parent, canvas, cmapKey){
		let cmap = parent.create_listed_colormap_selector(cmapKey);
		super(parent, canvas, cmap);
		this.reset();
		canvas.width = canvas.width*this.scale;
		canvas.height = canvas.height*this.scale;
		const pe = canvas.parentElement.parentElement;
		this.legend = pe.querySelector(".canvas-legend");
		if (this.legend !== null){
			this.legend.addEventListener('click', (e) => {
				e.target.classList.toggle('disabled');
				this.redrawWaiting = true;
			});
		}

		const _draw_frame = () => {
			const rd = this.redrawWaiting || cmap.changed;
			if (rd && this.xGrid !== undefined){
				this.draw();
				console.log("Updating 1D plot...");
			}
			requestAnimationFrame(_draw_frame)
		}
		_draw_frame();
	}
	legend_items(){
		return this.legend.querySelectorAll(".legend-item");
	}
	reset(){
		this.scale = 5;
		this.padding = 5;
		this.axesFontSize = 5;
		this.textPadding = 2;

		this.xLabel = undefined;
		this.yLabel = undefined;
		this.xGrid = undefined;

		this._data = []
		this.redrawWaiting = true;
		this.ypoints = 1;
		this.xpoints = 0;
	}
	get cPadding(){ return this.padding*this.scale; }
	get cAxesFontSize(){ return this.axesFontSize*this.scale; }
	get cTextPadding(){ return this.textPadding*this.scale; }
	get cGridLineWidth(){ return Math.max(1, parseInt(0.25*this.scale)); }
	get cDataLineWidth(){ return Math.max(1, parseInt(0.75*this.scale)); }
	set_ylabel(label){ this.yLabel = label; }
	set_xlabel(label){ this.xLabel = label; }
	set_xgrid(start, stop, count){ this.xGrid = linspace(start, stop, count); }
	set_ygrid(start, stop, count){ this.yGrid = linspace(start, stop, count); }
	set_xgrid_points(points){ this.xpoints = Number(points); }
	set_ygrid_points(points){ this.ypoints = Number(points); }
	add_data(x, y, item, config){
		this.redrawWaiting = true;
		if (config === undefined) config = {};
		if (item === null) item = undefined;
		this._data.push({
			'x': x,
			'y': y,
			'item': item,
			'markers': config['markers'] || false,
		});
		return this._data.length - 1;
	}
	draw(){
		const ctx = this.canvas.getContext('2d');
		ctx.reset();
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.compute_grid_bounds();
		this.draw_xgrid();
		this.draw_ygrid();
		this.draw_data();
		this.draw_outline();
		this.redrawWaiting = false;
	}
	compute_grid_bounds(){
		const textPadding = this.cTextPadding;
		let minY = this.canvas.height - this.cAxesFontSize - this.cPadding - textPadding;
		let minX = this.cPadding;

		this.config = {}
		if (this.yGrid !== undefined){
			const ctx = this.create_context();
			let mx = 0.0
			for (let i = 0; i < this.yGrid.length; i++){
				let mt = ctx.measureText(this.yGrid[i].toFixed(this.ypoints).toString());
				mx = Math.max(mt.width, mx);
			}
			this.config['y-grid-text-width'] = mx;
			minX += mx + textPadding;
		}
		else{ this.config['y-grid-text-width'] = 0.0; }
		if (this.xLabel !== undefined && this.xLabel != ''){
			minY -= this.cAxesFontSize + textPadding;
		}
		if (this.yLabel !== undefined && this.yLabel != ''){
			minX += this.cAxesFontSize + textPadding;
		}
		this._ycBounds = [minY, this.cPadding]
		this._xcBounds = [minX, this.canvas.width - this.cPadding]
	}
	data_color(i){
		return this.cmap.cmap()(i)
	}
	draw_data(){
		const ctx = this.create_context();
		const minX = this.xGrid[0];
		const maxX = this.xGrid[this.xGrid.length - 1];
		const minY = this.yGrid[0];
		const maxY = this.yGrid[this.yGrid.length - 1];
		const cm = this.cmap.cmap();
		const mw = this.cGridLineWidth*5;

		ctx.lineWidth = this.cDataLineWidth;

		ctx.save();
		ctx.rect(
			this._xcBounds[0],
			this._ycBounds[0],
			(this._xcBounds[1] - this._xcBounds[0]),
			(this._ycBounds[1] - this._ycBounds[0])
		);
		ctx.clip();

		const _x = (x) => {
			return this._xcBounds[0] + (x - minX)/(maxX - minX)*(this._xcBounds[1] - this._xcBounds[0])
		}
		const _y = (y) => {
			return this._ycBounds[0] + (y - minY)/(maxY - minY)*(this._ycBounds[1] - this._ycBounds[0])
		}
		this.cmap.changed = false;
		for (let i = 0; i < this._data.length; i++){
			const isValid = [false];
			const e = this._data[i];
			const item = e['item'];
			const c = cm(i);
			ctx.strokeStyle = c;
			ctx.fillStyle = c;
			if (item !== undefined){
				item.style.color = c;
				if (item.classList.contains('disabled')) continue
			}
			const x = e['x'];
			const y = e['y'];
			const sm = e['markers'];
			ctx.beginPath();

			let first = true;
			let ix = null;
			let iy = null;
			for (let j = 0; j < x.length; j++){
				const xx = x[j];
				const yy = y[j];
				const iv = isFinite(xx) && !isNaN(xx) && isFinite(yy) && !isNaN(yy);
				isValid.push(iv);
				if (iv){
					ix = _x(xx);
					iy = _y(yy);
					if (first){
						ctx.moveTo(ix, iy);
						first = false;
					}
					else ctx.lineTo(ix, iy);
				}
				else first = true;
			}
			ctx.stroke();
			isValid.push(false);
			for (let j = 0; j < x.length; j++){
				if (!sm){
					if (!isValid[j + 1]) continue;
					if (isValid[j] || isValid[j + 2]) continue;
				}
				ctx.beginPath();
				ctx.arc(_x(x[j]), _y(y[j]), mw, 0, 2*Math.PI);
				ctx.fill();
			}
		}
		ctx.restore();
	}
	create_context(){
		const style = window.getComputedStyle(document.body);
		const ctx = this.canvas.getContext('2d');
		ctx.strokeStyle = style.getPropertyValue('--grid-color');
		ctx.lineWidth = this.cGridLineWidth;
		ctx.fillStyle = style.getPropertyValue('--text-color');
		ctx.font = this.cAxesFontSize.toString() + 'px Arial';
		return ctx;
	}
	draw_outline(){
		const ctx = this.create_context();
		ctx.beginPath();
		ctx.moveTo(this._xcBounds[0], this._ycBounds[0]);
		ctx.lineTo(this._xcBounds[0], this._ycBounds[1]);
		ctx.lineTo(this._xcBounds[1], this._ycBounds[1]);
		ctx.lineTo(this._xcBounds[1], this._ycBounds[0]);
		ctx.lineTo(this._xcBounds[0], this._ycBounds[0]);
		ctx.stroke();
	}
	draw_ygrid(){
		const ctx = this.create_context();
		const count = this.yGrid.length;
		const sect = linspace(this._ycBounds[0], this._ycBounds[1], count);
		const maxX = this._xcBounds[1];
		const textPadding = this.cTextPadding;
		const minX = this._xcBounds[0];

		if (this.yLabel !== undefined && this.yLabel != ''){
			ctx.textBaseline = 'bottom';
			ctx.textAlign = 'center';
			ctx.save();
			ctx.beginPath();
			ctx.translate(minX-textPadding*2-this.config['y-grid-text-width'], (this._ycBounds[0] + this._ycBounds[1])/2.0);
			ctx.rotate(-Math.PI/2);
			ctx.fillText(this.yLabel, 0, 0);
			ctx.stroke();
			ctx.restore();
		}
		ctx.save();
		ctx.textAlign = 'right';
		ctx.textBaseline = 'middle';
		ctx.beginPath();
		for (let i = 0; i < count; i++){
			if (i > 0 && i < count - 1){
				ctx.moveTo(minX, parseInt(sect[i]));
				ctx.lineTo(maxX, parseInt(sect[i]));
			}
			ctx.fillText(this.yGrid[i].toFixed(this.ypoints).toString(), minX-textPadding, sect[i]);
		}
		ctx.stroke();
		ctx.restore();
	}
	draw_xgrid(){
		const ctx = this.create_context();
		const count = this.xGrid.length;
		const sect = linspace(this._xcBounds[0], this._xcBounds[1], count);
		const maxY = this._ycBounds[1];
		const textPadding = this.cTextPadding;
		const minY = this._ycBounds[0];
		const fontSize = this.cAxesFontSize;

		ctx.save();
		ctx.textBaseline = 'top';
		ctx.textAlign = 'center';

		if (this.xLabel !== undefined){
			ctx.beginPath();
			ctx.fillText(this.xLabel.toString(), (this._xcBounds[0] + this._xcBounds[1])/2, minY+textPadding*2+fontSize);
			ctx.stroke();
		}
		ctx.beginPath();
		for (let i = 0; i < count; i++){
			if (i > 0 && i < count - 1){
				ctx.moveTo(parseInt(sect[i]), minY);
				ctx.lineTo(parseInt(sect[i]), maxY);
			}
			ctx.fillText(this.xGrid[i].toFixed(this.xpoints).toString(), sect[i], minY+textPadding);
		}
		ctx.stroke();
		ctx.restore();
	}
}
