((()=> {
	
	let dom = component_registry[document.currentScript];
	dom = component_registry[dom].dom;
	
	let config = document.createElement('iframe');
	
	ListenForPostMessage(config, AsAnsweringMachine(async function (data, connection) {
		if (data.height) {
			config.style.height = data.height;
		} else switch (data.please) {
			case 'fetch':
				connection(await fetch(data.path, data.options));
				return;
		}
	}));
	
	//config.setAttribute('sandbox', 'allow-popups-to-escape-sandbox allow-popups allow-same-origin allow-scripts');
	config.setAttribute('title', 'Configuration');
	config.setAttribute('src', '/config.html?embedded&scope=' + encodeURIComponent(location.pathname));
	
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