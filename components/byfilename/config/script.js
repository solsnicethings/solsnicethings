((()=> {
	let scope = urlSearchParams.get('scope');
	if (scope) {
		body.classList.add('loadmsg');
		body.setAttribute('first', "Configuring scoped to page: scope");
	}
	
})());