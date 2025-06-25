//
// main.js
//

//Every visual element will have separate import element
import HomeComp from './components/home.js'
import LoginComp from './components/login.js'
import config from './config.js'

const run = function(afunc) {
  return afunc()
}


// ================================================================
//
// TCtrl  .. common app data, events, and methods.
//
//
//This is somewhat like model-view-controller, and this part is the model (business logic of app)
//This will be passed to visual elements

class TCtrl extends EventTarget {
	constructor(opts){
		super()
	} // constructor
} // class


// ================================================================
//
// main  .. high level program process and user interface
//
//
//Master controller of program.  It coordinates visuals, and interacting with browser
//
let main = await run(async n=>{
	// ---------------------------
	// local variables
	// ---------------------------

	let dB = document.body;
	//This will give us events
	let result = new EventTarget()
	const ctrl = new TCtrl()

	//Instances of visual elements.
	//Add all components here.
	const homeComp = new HomeComp({ctrl})   //passing in the controller ctrl
	const loginComp= new LoginComp({ctrl})  //passing in the controller ctrl

	// --------------------------
	// local functions
	// --------------------------

	function handleCompContinue(e) {  //handler for 'continue' event
		//Currently only emitted by login.js
		const {detail:info} = e   //get e.detail and put into info object
		console.log(info);
		switchTo(homeComp);
	}

	//This is how to switch between visual elements in the app.
	function switchTo(n) {
	    //console.log(this)  // 'this' is unique to local scope.
		dB.innerHTML = ''
		dB.appendChild(n)
	}

	// --------------------------
	// Setup event handler(s)
	// --------------------------

	loginComp.addEventListener("continue", handleCompContinue);

	// --------------------------

	switchTo(loginComp);   //execute the change to the homeAp
	//NOTE: when loginComp is done, it will dispatch a 'continue' event, handled above

	return result  //will be stored in 'main' in global scope.
	//At this point, execution should return to the main message loop of the browser.
})



// ================================================================
//
// tests
await run(async n=>{
  console.log("here");
  //This is run as soon as main.js is run.  Could use for debugging.
  //Because main is an asynchronous function, that will finish before this function is called.
})//fn
