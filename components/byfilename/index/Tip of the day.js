((()=> {
	
	let dom = component_registry[document.currentScript];
	dom = component_registry[dom].dom;
	
	dom = dom.appendChild(document.createElement('b'));
	dom.style.whiteSpace = 'pre';

	let tips = [
		"Math.floor(new Date().getTime()/8.64e7) % tips.length"
	];

	let tip = Math.floor(new Date().getTime()/8.64e7) % tips.length;

	dom.innerText = tips[tip];

		
})());