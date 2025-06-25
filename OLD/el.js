//
// el.js
// 	- the mimnmialist dom framework for developers who like vanella programatic development.
//
// 	ie..so you can new MyDomElement()
// 	?
//
// 2025.06.06
//
//
//	let d = new EL()
//	console.log(d.self) 	// this
//	console.log(d.dom)  	// the 'active' dom (d or shadow)
//	cosnole.log(d)	    	// the container (possiblly active dom (if no shadow))
//
//	use directly 
//
//	let d = new EL({innerHTML})
//
//	or..
//
//	function Widget(){
//		let r = new EL({innerHTML})
//
//		return r
//		}
//
//	or..
//
//	function Widget(){
//		let r = new HTML()
//
//
//		return r
//		}
//
//
//
//



const run = n=>n()

// ----------------------------------------------
// util
export function toFragment(el){
	const f = document.createDocumentFragment()

	if(el){
		while(el.firstChild)
			f.appendChild(el.firstChild)
		}

	return f
	}


// -----------------------------------------------
// property
export function shadowRoot(el){
	const dom = el.attachShadow({mode:'open'})
	el.dom = dom
	}//fn


// -----------------------------------------------
// property
export function properties(el,opts){
	// upg: make a factory based thing... (and/or preset recipies)
	for(let i of Object.entries(opts||{})){
		const [t,v] = i
		el.dom[t] = v
		}
	}//fn

// ------------------------------------------------
// property
export function shorts(el){
	//
	// upg: id too. (and/or it's own thing)
	// $firstclassname
	//

	const l = el.dom.querySelectorAll('*')

	/// upg: able to run functions with paramers etc if the property is a function.
	//

	for(let i of l){
		//if(typeof className == 'string') up...
		let {className} = i
		let x = []
		if(typeof(className?.split) == 'function'){ // or?
			x = className.split(/\s+/g)
			}
		let [n] = x
		// upg: id too?
		if(n){
			// upg: add secondaries etc if not overwrite first
			let nn = n.replace(/[^a-z0-9]/gi,'').toLowerCase()
			el[`$${nn}`]= i
			}//if

		//console.log(className,i,x)
		}//for
	}//fn




// --------------------------------------------
export function HTML_ELEMENT(...args){
	// since we return somethign else.. we use new HTML_ELEMENT() for this. and for future compatability?

	let obj = this

	let dom = document.createElement('div')
	obj.dom = dom

	//dom.this = this // or??
	dom.dom = dom // .. because shadow dom this might be different.
	dom.obj = obj // or? .this?

	return dom
	}//fn


// -------------------------------------------
// Fragment
export function Fragment(...args){
	//
	// make a fragment from a string.
	//

	// or? if object args not a string?
	const [opts] = args
	let r = new HTML_ELEMENT()



	let innerHTML = opts || '' // or?

	properties(r,{innerHTML})
	
	r = toFragment(r)
	
	return r
	}//fn

//console.log(new Fragment(`<h1>Hello</h1><div>hi</div>`))



// --------------------------------------------
//
// or composite your own
//
//Purpose: Get an object (a dom element) that can have extra properties for convenience. 
export default function EL(...args){
	const [opts] = args  //opts will be the FIRST element of args.  And that is first parameter passed into this function 
	let r = new HTML_ELEMENT()

	shadowRoot(r)
	properties(r,opts)
	shorts(r)
	
	return r
}//fn





// ----------------------------------------------
run(n=>{
	return
	const d = new EL({innerHTML:'hi'})
	document.body.appendChild(d)
	})

//
// upg: making your own elements test/example 
//

