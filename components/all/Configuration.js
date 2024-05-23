((()=> {
	
	let dom = component_registry[document.currentScript];
	dom = component_registry[dom].dom;
	
	let config = document.createElement('iframe');
	
	let fetches = {};
	
	//config.setAttribute('sandbox', 'allow-popups-to-escape-sandbox allow-popups allow-same-origin allow-scripts');
	config.setAttribute('title', 'Configuration');
	
	const clck = e => {
		e.currentTarget.removeEventListener(clck);
		ListenForPostMessage(config, AsAnsweringMachine(function (data, connection, recollection) {
			if (data.height) {
				config.style.height = data.height;
			} else return PerformAsFetchProxyAnsweringMachine(data, connection, recollection);
		}));
		config.setAttribute('src', '/config.html?embedded&scope=' + encodeURIComponent(location.pathname));
	};
	
	dom.addEventListener(clck);
	
	{
		let fallback = config.appendChild(document.createElement('a'));
		fallback.setAttribute('href', '/config.html?scope=' + encodeURIComponent(location.pathname));
		fallback.innerText = 'Go to configuration page (IFRAME not supported)';
	}
	{
		let box = document.createElement('div');
		box.className = 'fixwidth';
		box.appendChild(config);
		dom.appendChild(box);
	}	
})());