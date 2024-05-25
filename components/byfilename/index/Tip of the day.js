((()=> {
	
	let dom = component_registry[document.currentScript];
	dom = component_registry[dom].dom;
	
	let tipOfTheDatabase = [
		{"tipOfTheDatabase[Math.floor(Date.now()/8.64e7) % tipOfTheDatabase.length]":
			'https://stackoverflow.com/questions/12739171/javascript-epoch-time-in-days'
		},
		{"Github provides free website hosting. You start the site by creating a public repository called <your-username>.github.io. It autopublishes the changes you push.":
			'https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site'
		},
		{"For application/x-www-form-urlencoded, spaces are to be replaced by +, so one may wish to follow a encodeURIComponent() replacement with an additional replacement of %20 with +.":
			'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent'
		}
	];
	let e = {};	e['Ill justified feelings are no less feelings. Feelings that "create problems" rather than "point to a practical solution" are often quite important. Important or not, they are ' +
		'part of you, and it will not serve you well to uncritically loathe, supress or remove them. Strong negative feelings sit in the middle of complex perceptions and needs. ' +
		'\tThinking you have no right to feel what you feel is not doing you any good. You can gainfully scrutinize your feelings, because feelings can outrun and overpower reasoning. ' +
		'Your past experiences are part of your present emotional responses. Problems you could not solve with one person may now be fears that keep you looking for and reacting to ' +
		'any indication that the thing is happening again.\n\n' +
		"When you have a strong negative feeling, the signal to start feeling it is usually some external stimulus, like someone treating your time as less valuable than theirs, or " +
		"some other impression that someone disrespects you.\n" +
		"\tAnd the impression may be right, and it may be wrong. There may be a subtle nuance.\n" +
		"\tAnd it is worth considering that the other person may have a different understanding, but also unknown motivators, things they are trying to communicate, but forgetting to say.\n" +
		"\tBut perhaps more important is your own web of unstated perceptions and expectations, because you are uniquely positioned to catch yourself and ask: \n" +
		"\t\tWhat am I fighting against here? What do I fear is being taken from me?\n" +
		"\t\tHas that happened before? With other people?\n" +
		"\t\tWhat would make me feel safe and happy again in spite of what just happened? Can I articulate it, and request it? Can it be independent of who is right or justified?"] =
			'I contemplate emotions much. I wish people the ability to help themselves and one another with understanding the needs indicated by the emotions.\n\n' +
			"ALSO: In case you're ever really very wrong about something important:\n" +
			'\tConsider how you would feel if you had a big fight with someone and it ended with them saying "Actually, I am wrong. I see it," and maybe apologising as well.\n' +
			'\tCould it soften your opinion and ease your distress? Why were you bothering to fight over anything unless this is a good outcome?\n' +
			'\t... and if that is how it is for you when they are wrong, could it be that discovering that you are wrong is a lot safer and more productive than it feels?\n' +
			'\t\tYou are the only one who can satisfactorily discover and conclude that you are wrong, so you need to keep an eye out for that possibility. The same goes for the other person.';
	tipOfTheDatabase.push(e);
	
	e = {}; e['In most widely adopted programming languages/environments you can assume, albeit with great frustration and much "It is not supposed to do that!" that ' +
		'the system is more reliable than your code, which is nice to know when your own code is what you can debug. In powershell... undefined behaviours dominate the bugs.'] =
			"or maybe they are defined, but the definitions keep changing... I don't enjoy having the actual types serialised away due to the context being script execution rather than interactive."
	tipOfTheDatabase.push(e);		

	tipOfTheDatabase = tipOfTheDatabase[Math.floor(Date.now()/8.64e7) % tipOfTheDatabase.length];

	for (let k in tipOfTheDatabase) {
		e = dom.appendChild( document.createElement('p') );
		e.style.whiteSpace = 'pre-wrap';
		e.innerText = k;
		k = tipOfTheDatabase[k];
		dom.appendChild(document.createElement('cite')).innerText = k;

		if (/^[hH][tT][tT][pP][sS]:\/\/./.exec(k)) {
			try { new URL(k); } 			catch { continue }
			e = document.createElement('a');
			e.innerText = ' [OPEN (in new tab/window)]';
			e.setAttribute('href', k);
			e.setAttribute('target', '_blank');
			//e.style.display = 'block';
			//e.style.position = 'absolute';
			dom.appendChild(e);
		}
	}
		
})());