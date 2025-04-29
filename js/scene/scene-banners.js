/** @import { SceneParent } from "./scene-abc.js" */

export class SceneBanner{
	/**
	 * Create a new Scene Banner.
	 *
	 * @param {SceneParent} parent
	 * @param {String} classList
	 * */
	constructor(parent, classList){
		this.parent = parent;
		this.div = document.createElement('div');
		this.div.classList = classList;
		this.div.innerHTML = "TESST";
		document.body.appendChild(this.div);

		window.addEventListener('scroll', () => {
			this.div.style.top = window.scrollY + "px";
		})
	}
	hide(){ this.div.style.display = 'none'; }
	show(){ this.div.style.display = 'block'; }
	set_visible(vis){ if(vis) this.show(); else this.hide(); }
	get text(){ return this.div.innerHTML; }
	set text(s){ this.div.innerHTML = s; }
}
export class SceneBannerError extends SceneBanner{
	constructor(parent){ super(parent, 'scene-banner-error') };

}
