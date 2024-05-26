var cfgscope = urlSearchParams.get('scope');

if (cfgscope) {
	urlSearchParams.delete('scope');
	document.body.setAttribute('elemtitle', "You are viewing and changing settings for the page: " + cfgscope);
	var ga = document.createElement('a');
	a.setAttribute('href', '?' + urlSearchParams);
	a.innerText = 'Global Config';
	a.style.float = 'right';
	document.body.insertBefore(a, document.body.firstChild);
}
	