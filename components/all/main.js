((()=> {
	
	let dom = document.querySelector("#main ~ .menu"), main = document.getElementById('main');
	if (!dom) { dom = document.querySelector(".workspace .menu");
		if (!dom) {
			dom = component_registry[document.currentScript];
			if (!dom) return;
			dom = component_registry[dom];
			if (!dom) return;
			dom = dom.dom;	
			if (!dom) return;
			if (!main) main = dom.querySelector(".active");
			dom = dom.querySelector(".menu");
			if (!dom) return;
		}
	}

	if (!main) {
		main = document.querySelector('.workspace .active');
		if (!main) return;
	}
	
	dom.classList.add('clickentrylist');
	dom.addEventListener('click', e => {
		if (e.target.parentElement != dom) {
			if (!ShouldProceedWithBug()) return;
		}
		let x = main.firstElementChild;
		if (x) { x.dispatchEvent(new Event('deactivate');  main.insertBefore(e.target, x); dom.appendChild(x); }
		else main.appendChild(e.target);
		e.target.dispatchEvent(new Event('activate'));
	});
	
})());