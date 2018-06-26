const http = require('http');

const startServer = () => {
	http.createServer(function(req, res) {
		res.writeHead(200, {
			'Content-Type': 'text/html'
		});
		res.write('Hello World!');
		res.end();
	}).listen(8080);
	console.log("Server is listening on 127.0.0.1:8080");
};



const fetchStatus = () => {

}

//https://status.github.com/messages/2010-02-01
const data = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>GitHub System Status</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <link rel="stylesheet" href="/assets/application.css" type="text/css"/>
    <link rel="alternate" href="/messages.rss" type="application/rss+xml"/>
    <link rel='icon' type='image/png' href='/images/status-icon-green.png'>
    <link rel="alternate" type="application/rss+xml" title="GitHub Service Status" href="/messages.rss" />
    <script src="/assets/application.js"></script>
  </head>
  <body class="">
    <div id="header" class="wrap">
      <h1 class="logo"><a href="/"><img src="/images/logo-good.png" alt="github:status" /></a></h1>


      <h2 id="last_updated">
        Updated <abbr class="timeago" title="2018-06-11T16:50:02Z">2018-06-11T16:50:02Z</abbr>
      </h2>
    </div>

    <div id="message-list" class="wrap" data-last-known-status="good">
  <div class="loader"><img src="/images/spinner.gif" /></div>
  <div class="about">
    <h3>What is this site?</h3>
    <p>We continuously monitor the status of <a href="https://github.com">github.com</a> and all its related services. If there are any interruptions in service, a note will be posted here.</p>
  </div>
  <div class="messages-header">
    <h1>Status Messages</h1>
  </div>
    <div class="message_group" id="2010-06-12">
      <h3>June 12, 2010</h3>
    
    
        <div class="message auto-message good">
          <time class="time" datetime="2010-06-12T00:00:00+00:00">00:00 UTC</time> <span class="title">All systems reporting at 100%</span>
        </div>
    </div>
    <div class="message_group" id="2010-06-11">
      <h3>June 11, 2010</h3>
    
        <div class="message good" data-status="good">
          <time class="time" datetime="2010-06-11T18:22:00+00:00">18:22 UTC</time> <span class="title">There were some issues with the zip/tarball downloads, things should be working again.</span> 
        </div>
        <div class="message minor" data-status="minor">
          <time class="time" datetime="2010-06-11T16:43:00+00:00">16:43 UTC</time> <span class="title">Intermittent memcached errors, we're working on it.</span> 
        </div>
        <div class="message good" data-status="good">
          <time class="time" datetime="2010-06-11T03:48:00+00:00">3:48 UTC</time> <span class="title">The file server is back online.</span> 
        </div>
        <div class="message major" data-status="major">
          <time class="time" datetime="2010-06-11T02:43:00+00:00">2:43 UTC</time> <span class="title">Extended disk checks need to run on the failed file server. ETA for the server to be back online and functional is 1 hour.</span> 
        </div>
        <div class="message minor" data-status="minor">
          <time class="time" datetime="2010-06-11T01:40:00+00:00">1:40 UTC</time> <span class="title">We have the server back up but not yet back in rotation. Need to run some verifications first.</span> 
        </div>
        <div class="message minor" data-status="minor">
          <time class="time" datetime="2010-06-11T01:22:00+00:00">1:22 UTC</time> <span class="title">There were complications with the failover of the file server. We're working on getting it back online.</span> 
        </div>
    
    </div>
    <div class="message_group" id="2010-06-10">
      <h3>June 10, 2010</h3>
    
        <div class="message minor" data-status="minor">
          <time class="time" datetime="2010-06-10T22:50:00+00:00">22:50 UTC</time> <span class="title">Emergency maintenance on one (out of five) of our file servers. Some repositories may be temporarily unavailable.</span> 
        </div>
    
    </div>
    <div class="message_group" id="2010-06-09">
      <h3>June 09, 2010</h3>
    
    
        <div class="message auto-message good">
          <time class="time" datetime="2010-06-09T00:00:00+00:00">00:00 UTC</time> <span class="title">All systems reporting at 100%</span>
        </div>
    </div>
    <div class="message_group" id="2010-06-08">
      <h3>June 08, 2010</h3>
    
    
        <div class="message auto-message good">
          <time class="time" datetime="2010-06-08T00:00:00+00:00">00:00 UTC</time> <span class="title">All systems reporting at 100%</span>
        </div>
    </div>
    <div class="message_group" id="2010-06-07">
      <h3>June 07, 2010</h3>
    
        <div class="message good" data-status="good">
          <time class="time" datetime="2010-06-07T11:43:00+00:00">11:43 UTC</time> <span class="title">The bug is now fixed.</span> 
        </div>
        <div class="message minor" data-status="minor">
          <time class="time" datetime="2010-06-07T11:30:00+00:00">11:30 UTC</time> <span class="title">Issues was unavailable for about 10 minutes due to a bug.</span> 
        </div>
    
    </div>
    <div class="message_group" id="2010-06-06">
      <h3>June 06, 2010</h3>
    
    
        <div class="message auto-message good">
          <time class="time" datetime="2010-06-06T00:00:00+00:00">00:00 UTC</time> <span class="title">All systems reporting at 100%</span>
        </div>
    </div>
  <div class="pagination">
      <a href="/messages/2010-06-19" class="next">Next Week &raquo;</a>
    <a href="/messages/2010-06-05" class="prev">&laquo; Previous Week</a>
  </div>
</div>


    <div id="footer" class="wrap">
      <div id="legal">
        <ul>
          <li><a href="http://github.com/blog">The GitHub Blog</a></li>
          <li><a href="mailto:support@github.com">Support</a></li>
          <li><a href="https://github.com/contact">Contact</a></li>
          <li><a href="http://developer.github.com">API</a></li>
        </ul>
        <p>© 2018 GitHub Inc. All rights reserved.</p>
      </div>
      <div class="github">
        <a href="http://github.com"><img src="/images/invertocat.png" alt="GitHub.com" /></a>
      </div>
    </div>
  </body>
</html>
<!-- always remember that github loves you dearly -->
`
const regexList = {
	getDayGroups: /message_group\" id=\"(.*?)\"\>[\s\S]*?(?=message_group|pagination)/g,
	getDayDate: /id=\"(.*?)\"/,
	getEventTypes: /message (?:auto-message)*(.*?)\"/g
};

const parseStatusPage = html => {
	let result = [];
	let temp, dayList = [];
	//Separate each days of the page
	while ((temp = regexList.getDayGroups.exec(html)))
		dayList.push(temp[0])

	if (dayList.length === 0)
		return;

	dayList.forEach(day => {
		let dayDate, eventsType = [];
		//Get the date of the current day
		try {
			dayDate = day.match(regexList.getDayDate)[1];
		} catch (e) {
			console.error(e);
			dayDate = null;
		}

		let dayResult = {
			date: dayDate,
			events: {
				good: 0,
				minor: 0,
				major: 0
			}
		};
		//get the events type
		while ((temp = regexList.getEventTypes.exec(day)))
			eventsType.push(temp[1].trim());

		//Increment the count of the corresponding event type
		eventsType.forEach(aEventType => {
			switch (aEventType) {
				case "good":
					dayResult.events.good++;
					break;
				case "minor":
					dayResult.events.minor++;
					break;
				case "major":
					dayResult.events.major++;
					break;
				default:
					break;
			}
		});
		result.push(dayResult);
	});
	return result;
}

console.log(parseStatusPage(data));