((()=> {
	
	let dom = component_registry[document.currentScript];
	dom = component_registry[dom].dom;
	dom.className = 'concealer';
	dom.innerText = 'NO COOKIES! But I accept that something is to be stored (on my computer).';
	
	dom.appendChild(document.createElement('input')).setAttribute('type','checkbox');
	
	dom.appendChild(document.createElement('div')).innerHTML =
	'<a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API" target="_blank">See the Storage APIs on the Mozilla developer site for more details!</a> (opens in new tab/window)';
		
})());