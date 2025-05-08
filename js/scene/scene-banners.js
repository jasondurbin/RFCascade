/** @import { SceneParent } from "./scene-abc.js" */
import {SceneObjectEvent} from "./scene-event-obj.js"

export class SceneBanner extends SceneObjectEvent{
	/**
	 * Create a new Scene Banner.
	 *
	 * @param {SceneParent} parent
	 * @param {String} classList
	 * */
	constructor(parent, classList, timeout){
		super();
		this.add_event_types('hide', 'show', 'visibility-change')
		this.parent = parent;
		this.div = document.createElement('div');
		this.div.classList = "scene-banner " + classList;
		this.div.innerHTML = "";
		this.offset = 0;

		document.body.appendChild(this.div);
		window.addEventListener('scroll', () => { this.scroll(); })

		this.isTemporary = false;
		if (timeout !== undefined && timeout !== null){
			setTimeout(() => {this.hide();}, timeout)
			this.isTemporary = true;
		}
		this.scroll();
	}
	scroll(){
		this.div.style.top = (this.offset + window.scrollY) + "px";
	}
	hide(){
		this.div.style.display = 'none';
		this.trigger_event('hide');
		this.trigger_event('visibility-change', false);
	}
	show(){
		this.div.style.display = 'block';
		this.trigger_event('show');
		this.trigger_event('visibility-change', true);
	}
	set_visible(vis){ if(vis) this.show(); else this.hide(); }
	get text(){ return this.div.innerHTML; }
	set text(s){ this.div.innerHTML = s; }
	set top(v){
		this.offset = v;
		this.scroll();
	}
	get height(){ return this.div.clientHeight; }
	get visible(){ return this.div.clientHeight > 0; }
}
export class SceneBannerError extends SceneBanner{
	constructor(parent, timeout){ super(parent, 'scene-banner-error', timeout) };
}
export class SceneBannerWarning extends SceneBanner{
	constructor(parent, timeout){ super(parent, 'scene-banner-warning', timeout) };
}
export class SceneBannerNotice extends SceneBanner{
	constructor(parent, timeout){ super(parent, 'scene-banner-notice', timeout) };
}

export class SceneTooltip{
	/**
	 * Create a new tooltip.
	 *
	 * @param {SceneParent} parent
	 * */
	constructor(parent){
		this.parent = parent;
		const tt = document.createElement("div");
		tt.classList = "tooltip-box";
		document.body.appendChild(tt);
		const align = (ele) => {
			const erect = ele.getBoundingClientRect();
			const trect = tt.getBoundingClientRect();

			let top = window.scrollY + erect.top - trect.height - 5;
			let left = window.scrollX + erect.left + (erect.width / 2) - (trect.width / 2);

			if (top < window.scrollY) top = window.scrollY + erect.bottom + 5;
			if (left < window.scrollX) left = window.scrollX + 5;
			if (left + trect.width > window.scrollX + window.innerWidth){
				left = window.scrollX + window.innerWidth - trect.width - 5;
			}
			tt.style.top = `${top}px`;
			tt.style.left = `${left}px`;
		}
        document.addEventListener('mouseover', (e) => {
            let ele = e.target.closest('[data-tooltip]');
			let msg;
			if (!ele){
				ele = e.target.closest('[title]');
				if (ele) {
					msg = ele.getAttribute('title');
					ele.setAttribute('data-tooltip', msg);
					ele.setAttribute('title', '');
				}
			}
			else msg = ele.getAttribute('data-tooltip');
            if (ele && msg){
                tt.textContent = msg;
                tt.style.visibility = 'visible';
                tt.style.opacity = '1';
                align(ele);
            }
			else{
                tt.style.visibility = 'hidden';
                tt.style.opacity = '0';
            }
        });
	}
}
