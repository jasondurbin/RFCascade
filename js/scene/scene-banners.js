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
