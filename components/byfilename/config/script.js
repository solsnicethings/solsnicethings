((()=> {
	let scope = urlSearchParams.get('scope');
	if (scope) {
		document.body.classList.add('loadmsg');
		document.body.setAttribute('first', "Configuring scoped to page: scope");
	}
	
})());