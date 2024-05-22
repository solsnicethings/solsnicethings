((()=> {
	
	let dom = component_registry[document.currentScript];
	dom = component_registry[dom].dom;
	
	let config = document.createElement('iframe');
	
	component_registry[config.contentWindow] = height => {
		config.style.height = height;
		config.parentNode.style.height = height;
	};
	
	//config.setAttribute('sandbox', 'allow-popups-to-escape-sandbox allow-popups allow-same-origin allow-scripts');
	config.setAttribute('title', 'Configuration');
	config.setAttribute('src', '/config.html?embedded&scope=' + encodeURIComponent(location.pathname));
	
	{
		let fallback = config.appendChild(document.createElement('a'));
		a.setAttribute('href', '/config.html?scope=' + encodeURIComponent(location.pathname));
		a.innerText = 'Go to configuration page (IFRAME not supported)';
	}
	{
		let box = document.createElement('div');
		box.className = 'fixwidth';
		box.appendChild(config);
		dom.appendChild(box);
	}	
})());