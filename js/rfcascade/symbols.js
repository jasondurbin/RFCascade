/**
 * @import { BlockHint } from "./blocks.js"
 * */

/**
 * Draw an icon.
 *
 * @param {'antenna' | 'amplifier' | 'tline' | 'divider' | 'combiner'} symbol
 * @param {RenderingContext} ctx
 * @param {BlockHint} block
 * */
export function draw_symbol(symbol, ctx, block){
	const s = symbol.toLowerCase();

	ctx.strokeStyle = block.get_parameter('color');
	for (let i = 0; i < Symbols.length; i++){
		const [n, f] = Symbols[i];
		if (n.toLowerCase() == s) return f(ctx, block);
	}
	throw Error(`Unknown symbol '${symbol}'.`);
}
const ICON_MARGIN = 0.2;

/**
 * @param {RenderingContext} ctx
 * */
function _start_node(ctx, ext){
	if (ext === undefined) ext = 0.0;
	ctx.beginPath();
	ctx.moveTo(0.0, 0.5);
	ctx.lineTo(ICON_MARGIN + ext, 0.5);
	ctx.stroke();
}
/**
 * @param {RenderingContext} ctx
 * */
function _end_node(ctx, ext){
	if (ext === undefined) ext = 0.0;
	ctx.beginPath();
	ctx.moveTo(1.0 - ICON_MARGIN - ext, 0.5);
	ctx.lineTo(1.0, 0.5);
	ctx.stroke();
}

/**
 * @param {RenderingContext} ctx
 * */
function _variable_arrow(ctx, reduce){
	if (reduce === undefined) reduce = 0.0;
	const a = 0.3 - reduce;
	const aw = 0.12;
	ctx.beginPath();
	ctx.moveTo(0.5 - a, 1 - ICON_MARGIN - reduce);
	ctx.lineTo(0.5 + a, ICON_MARGIN + reduce);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0.5 + a - aw, ICON_MARGIN + reduce);
	ctx.lineTo(0.5 + a, ICON_MARGIN + reduce);
	ctx.lineTo(0.5 + a, ICON_MARGIN + aw + reduce);
	ctx.stroke();
}

/**
 * Draw icon.
 *
 * @param {RenderingContext} ctx
 * @param {BlockHint} block
 * */
function draw_symbol_antenna(ctx, block){
	const mg = ICON_MARGIN;
	const w = 0.3
	const h = 0.2

	if (block.parent.globals.is_tx()){
		ctx.beginPath();
		ctx.moveTo(0.0, 0.5);
		ctx.lineTo(mg, 0.5);
		ctx.lineTo(mg, 1 - h);
		ctx.lineTo(1 - w, 1 - h);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(1 - w, 1 - h);
		ctx.lineTo(1 - 2*w, mg);
		ctx.lineTo(1, mg);
		ctx.lineTo(1 - w, 1 - h);
		ctx.stroke();
	}
	else{
		ctx.beginPath();
		ctx.moveTo(1, 0.5);
		ctx.lineTo(1 - mg, 0.5);
		ctx.lineTo(1 - mg, 1 - h);
		ctx.lineTo(w, 1 - h);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(w, 1 - h);
		ctx.lineTo(2*w, mg);
		ctx.lineTo(0, mg);
		ctx.lineTo(w, 1 - h);
		ctx.stroke();
	}
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_amplifier(ctx, block){
	const mg = ICON_MARGIN;
	_start_node(ctx);

	ctx.beginPath();
	ctx.moveTo(mg, mg);
	ctx.lineTo(1.0-mg, 0.5);
	ctx.lineTo(mg, 1.0-mg);
	ctx.lineTo(mg, mg);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(1.0-mg, 0.5);
	ctx.lineTo(1.0, 0.5);
	ctx.stroke();
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_amplifier_variable(ctx, block){
	draw_symbol_amplifier(ctx, block);
	_variable_arrow(ctx);
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_tline(ctx, block){
	const mg = ICON_MARGIN;
	const h = 0.2
	_start_node(ctx);

	ctx.beginPath();
	ctx.moveTo(mg, 0.5+h/2);
	ctx.lineTo(mg, 0.5-h/2);
	ctx.lineTo(1.0-mg, 0.5-h/2);
	ctx.lineTo(1.0-mg, 0.5+h/2);
	ctx.lineTo(mg, 0.5+h/2);
	ctx.stroke();

	_end_node(ctx);
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_phase_shifter(ctx, block){
	const mg = ICON_MARGIN;
	_start_node(ctx, 0.06);
	_end_node(ctx, 0.06);

	ctx.beginPath();
	ctx.arc(0.5, 0.5, 0.5 - mg - 0.06, 0, 2*Math.PI);
	ctx.stroke();

	_variable_arrow(ctx);
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_combiner(ctx, block){
	const mg = ICON_MARGIN;
	const h = 0.1

	ctx.beginPath();
	ctx.moveTo(0.0, mg);
	ctx.lineTo(mg, mg);
	ctx.lineTo(1.0-mg, 0.5);
	ctx.lineTo(mg, 1-mg);
	ctx.lineTo(0.0, 1-mg);
	ctx.stroke();

	const count = 7;
	const step = (1 - 2*mg-2*h)/count;
	ctx.beginPath();
	ctx.moveTo(mg, mg);
	ctx.lineTo(mg, mg+h);
	for (let i = 1; i < count; i++){
		ctx.lineTo(mg-step*(-1)**i, mg+h+i*step);
	}
	ctx.lineTo(mg, 1-mg-h);
	ctx.lineTo(mg, 1-mg);
	ctx.stroke();

	_end_node(ctx);

	ctx.beginPath();
	ctx.font = "0.02em serif";
	ctx.strokeStyle = "none";
	ctx.fillStyle = block.get_parameter('color');
	ctx.textAlign = 'right';
	ctx.textBaseline = 'bottom';
	ctx.fillText(block.get_parameter('io_count') + "x", 1, 1-h)
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_divider(ctx, block){
	const mg = ICON_MARGIN;
	const h = 0.1
	_start_node(ctx);

	ctx.beginPath();
	ctx.moveTo(1.0, mg);
	ctx.lineTo(1.0-mg, mg);
	ctx.lineTo(mg, 0.5);
	ctx.lineTo(1.0-mg, 1-mg);
	ctx.lineTo(1.0, 1-mg);
	ctx.stroke();

	const count = 7;
	const step = (1 - 2*mg-2*h)/count;
	ctx.beginPath();
	ctx.moveTo(1.0-mg, mg);
	ctx.lineTo(1.0-mg, mg+h);
	for (let i = 1; i < count; i++){
		ctx.lineTo(1.0-mg-step*(-1)**i, mg+h+i*step);
	}
	ctx.lineTo(1.0-mg, 1-mg-h);
	ctx.lineTo(1.0-mg, 1-mg);
	ctx.stroke();

	ctx.beginPath();
	ctx.font = "0.02em serif";
	ctx.strokeStyle = "none";
	ctx.fillStyle = block.get_parameter('color');
	ctx.textAlign = 'left';
	ctx.textBaseline = 'bottom';
	ctx.fillText("/" + block.get_parameter('io_count'), 0, 1-h)
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_adc(ctx, block){
	const mg = ICON_MARGIN;
	const d = 0.3;
	_start_node(ctx);
	_end_node(ctx);

	ctx.beginPath();
	ctx.moveTo(mg, mg);
	ctx.lineTo(mg + d, mg);
	ctx.lineTo(1.0 - mg, 0.5);
	ctx.lineTo(mg + d, 1.0 - mg);
	ctx.lineTo(mg, 1.0 - mg);
	ctx.lineTo(mg, mg);
	ctx.stroke();
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_dac(ctx, block){
	const mg = ICON_MARGIN;
	const d = 0.3;
	_start_node(ctx);
	_end_node(ctx);

	ctx.beginPath();
	ctx.moveTo(mg, 0.5);
	ctx.lineTo(1 - mg - d, mg);
	ctx.lineTo(1 - mg, mg);
	ctx.lineTo(1 - mg, 1 - mg);
	ctx.lineTo(1 - mg - d, 1 - mg);
	ctx.lineTo(mg, 0.5);
	ctx.stroke();
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_attenuator(ctx, block){
	const mg = ICON_MARGIN;
	const h = 0.1
	const cx = 0.5;
	ctx.beginPath();
	ctx.moveTo(0, 0.5);
	ctx.lineTo(1, 0.5);
	ctx.stroke();

	const count = 7;
	const step = (1 - 2*mg-2*h)/count;
	ctx.beginPath();
	ctx.moveTo(cx, mg);
	ctx.lineTo(cx, mg+h);
	for (let i = 1; i < count; i++){
		ctx.lineTo(cx-step*(-1)**i, mg+h+i*step);
	}
	ctx.lineTo(cx, 1-mg-h);
	ctx.lineTo(cx, 1-mg);
	ctx.stroke();
}
/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_attenuator_variable(ctx, block){
	draw_symbol_attenuator(ctx, block);
	_variable_arrow(ctx);
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_capacitor(ctx, block){
	const mg = ICON_MARGIN;
	const w = 0.2;
	ctx.beginPath();
	ctx.moveTo(0, 0.5);
	ctx.lineTo(0.5 - w/2, 0.5);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(1, 0.5);
	ctx.lineTo(0.5 + w/2, 0.5);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0.5 + w/2, mg);
	ctx.lineTo(0.5 + w/2, 1-mg);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0.5 - w/2, mg);
	ctx.lineTo(0.5 - w/2, 1-mg);
	ctx.stroke();
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_nopass_filter(ctx, block, lmh){
	const mg = ICON_MARGIN;
	const p = 50;
	const rstep = 2*Math.PI/p;
	if (lmh === undefined) lmh = 0;
	_start_node(ctx);
	_end_node(ctx);

	ctx.beginPath();
	ctx.moveTo(mg, mg);
	ctx.lineTo(mg, 1 - mg);
	ctx.lineTo(1 - mg, 1 - mg);
	ctx.lineTo(1 - mg, mg);
	ctx.lineTo(mg, mg);
	ctx.stroke();

	const _sine = (cx, cy, w, h) => {
		ctx.beginPath();
		const ws = w/p;
		const ox = cx - w/2;
		for (let i = 0; i <= p; i++){
			const r = rstep*i;
			const ix = ox + ws*i;
			const iy = cy - h*Math.sin(r);
			if (i == 0) ctx.moveTo(ix, iy);
			else ctx.lineTo(ix, iy);
		}
		ctx.stroke();
	}
	const _line = (cx, cy) => {
		const a = 0.06;
		ctx.beginPath();
		ctx.moveTo(cx - a, cy + a);
		ctx.lineTo(cx + a, cy - a);
		ctx.stroke();
	}
	const h = 0.05;
	const w = 0.35;
	const s = 0.15;
	_sine(0.5, 0.5 - s, w, h);
	if (lmh & 1) _line(0.5, 0.5 - s);
	_sine(0.5, 0.50, w, h);
	if (lmh & 2) _line(0.5, 0.5);
	_sine(0.5, 0.50 + s, w, h);
	if (lmh & 4) _line(0.5, 0.5 + s);
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_lowpass_filter(ctx, block){
	draw_symbol_nopass_filter(ctx, block, 6);
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_highpass_filter(ctx, block){
	draw_symbol_nopass_filter(ctx, block, 3);
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_bandpass_filter(ctx, block){
	draw_symbol_nopass_filter(ctx, block, 5);
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_bandstop_filter(ctx, block){
	draw_symbol_nopass_filter(ctx, block, 2);
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_inductor(ctx, block){
	const mg = ICON_MARGIN;
	_start_node(ctx);
	_end_node(ctx);
	const cs = 4;
	const cw = (1 - 2*mg)/cs;
	const ch = cw/2 + 0.02;
	for (let i = 0; i < cs; i++){
		const cx = mg + cw/2  + cw*i;
		ctx.beginPath();
		ctx.arc(cx, 0.5, ch, 0, Math.PI, true);
		ctx.stroke();
	}
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_resistor(ctx, block){
	const mg = ICON_MARGIN;
	_start_node(ctx);
	_end_node(ctx);

	const count = 7;
	const step = (1 - 2*mg)/count;
	ctx.beginPath();
	ctx.moveTo(mg, 0.5);
	for (let i = 1; i < count; i++){
		ctx.lineTo(mg + step*i, 0.5+step*(-1)**i);
	}
	ctx.lineTo(1-mg, 0.5);
	ctx.stroke();
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_mixer(ctx, block){
	const mg = ICON_MARGIN;
	const x = 0.15;
	_start_node(ctx);
	_end_node(ctx);

	ctx.beginPath();
	ctx.arc(0.5, 0.5, 0.5 - mg, 0, 2*Math.PI);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0.5, 1);
	ctx.lineTo(0.5, 1-mg)
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0.5 - x, 0.5 + x);
	ctx.lineTo(0.5 + x, 0.5 - x)
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0.5 + x, 0.5 + x);
	ctx.lineTo(0.5 - x, 0.5 - x)
	ctx.stroke();
}

/** @inheritdoc @type {draw_symbol_antenna} */
function draw_symbol_switch(ctx, block){
	const mg = ICON_MARGIN;
	const r = 0.06;
	const s = 1 - 2*mg - 4*r;
	const a = 35*Math.PI/180;

	console.log(s);
	_start_node(ctx);
	_end_node(ctx);

	ctx.beginPath();
	ctx.arc(mg + r, 0.5, r, 0, 2*Math.PI);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(1 - mg - r, 0.5, r, 0, 2*Math.PI);
	ctx.stroke();


	ctx.beginPath();
	ctx.moveTo(mg + 2*r, 0.5);
	ctx.lineTo(mg + 2*r + Math.cos(a) * s, 0.5 - Math.sin(a) * s);
	ctx.stroke();

}

export const Symbols = [
	['Antenna', draw_symbol_antenna],
	['Amplifier', draw_symbol_amplifier],
	['TLine', draw_symbol_tline],
	['Combiner', draw_symbol_combiner],
	['Divider', draw_symbol_divider],
	['Attenuator', draw_symbol_attenuator],
	['Variable Attenuator', draw_symbol_attenuator_variable],
	['ADC', draw_symbol_adc],
	['DAC', draw_symbol_dac],
	['VGA', draw_symbol_amplifier_variable],
	['Phase Shifter', draw_symbol_phase_shifter],
	['Resistor', draw_symbol_resistor],
	['Capacitor', draw_symbol_capacitor],
	['Inductor', draw_symbol_inductor],
	['Low Pass Filter', draw_symbol_lowpass_filter],
	['High Pass Filter', draw_symbol_highpass_filter],
	['Band Pass Filter', draw_symbol_bandpass_filter],
	['Band Stop Filter', draw_symbol_bandstop_filter],
	['Mixer', draw_symbol_mixer],
	['Switch', draw_symbol_switch],
]
