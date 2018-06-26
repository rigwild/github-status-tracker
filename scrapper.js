const https = require('https');

const regexList = {
  getDayGroups: /message_group\" id=\"(.*?)\"\>[\s\S]*?(?=message_group|pagination)/g,
  getDayDate: /id=\"(.*?)\"/,
  getEventTypes: /message (?:auto-message)*(.*?)\"/g
};

module.exports.fetchStatusPage = date =>
  new Promise((resolve, reject) => {
    const url = date ? `https://status.github.com/messages/${date}` : "https://status.github.com/messages";
    https.get(url, res => {
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'];

      if (statusCode !== 200) {
        console.error(new Error(`Request Failed.\n Status Code: ${statusCode}`).message);
        res.resume();
        return;
      }
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => resolve(rawData));
    }).on('error', (e) => reject(e.message));
  });

module.exports.parseStatusPage = html => {
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
};