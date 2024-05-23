((()=> {
	let scope = urlSearchParams.get('scope');
	if (scope) {
		document.body.setAttribute('elemtitle', "Configuring scoped to page: scope");
	}
	
})());