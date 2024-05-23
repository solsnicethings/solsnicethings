((()=> {
	let scope = urlSearchParams.get('scope');
	if (scope) {
		document.body.setAttribute('elemtitle', "You are viewing and changing settings for the page: " + scope);
	}
	
})());