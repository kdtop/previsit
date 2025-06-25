//
// HomeComponent (HomeComp)
// 	> has space for expand.. to scroll (for addresseses)
// 	> but can have independantly scrolling windows
// 		(if display size big enough)
//

import EL from '../utility/el.js'

//const run = n=>n()

const xSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`

const blocksSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-blocks-icon lucide-blocks"><rect width="7" height="7" x="14" y="3" rx="1"/><path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"/></svg>`

// ---------------------------------------------------
//Purpose return a visualization element.
export default function(opts){
    const {ctrl} = opts  //type TCtrl

    //note: ` is a quote that allows ${<evaluate js code>} syntax  And it allows newlines (continue string on subsequent line)
	let innerHTML = `
		<style>
			svg {
				width: 32px;
				}
		</style>

		<div class='container'>
				<div>${blocksSVG}</div>
		</div>
	`  //<-- note end backtick

	// ----------------------------
	let self = new EL({innerHTML})  //create new dom element, passing in html+css code

	//self.className = 'home-app'

	// --------------------------
	self.about = function(){
	    //example of giving the dom element various methods if wanted.
	}

	return self
}//Fn
