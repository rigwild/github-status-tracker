require('dotenv').config();
const https = require('https');
const fs = require('fs');

//File where the data is backed up
const dataFile = process.env.DATA_FILE_PATH;

const regexList = {
  getDayGroups: /message_group\" id=\"(.*?)\"\>[\s\S]*?(?=message_group|pagination)/g,
  getDayDate: /id=\"(.*?)\"/,
  getEventTypes: /message (?:auto-message)*(.*?)\"/g
};

//Fetch the HTML content of a page, if no date specified, it takes the most recent status report
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


//Parse a status page returning an object with the date and the count of each type of events
//(Good, minor, major)
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


//Sort any array of objects by one of its keys
Array.prototype.sortByKey = function(key) {
  this.sort((a, b) => {
    let x = a[key],
      y = b[key];
    if (typeof x == "string")
      x = ("" + x).toLowerCase();
    if (typeof y == "string")
      y = ("" + y).toLowerCase();
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
};

//Pass an array of objects containing the date and the count of each type of events in parameters
//It searches if the date of the event in the save file exists, if not, it adds it to the save file
module.exports.saveData = async daysEventsArray => {
  if (!fs.existsSync(dataFile))
    fs.writeFileSync(dataFile, '[]');

  let savedData;
  try {
    savedData = await JSON.parse(fs.readFileSync(dataFile, 'utf8'))
  } catch (e) {
    console.log(e);
    return false;
  }
  await daysEventsArray.forEach(aDayEvents => {
    //Check if the date is already saved, if not, save it
    if (!savedData.find(aSavedDay => aSavedDay.date === aDayEvents.date))
      savedData.push(aDayEvents);
  });
  //Sort the array by date and save it
  savedData.sortByKey("date");
  await fs.writeFileSync(dataFile, JSON.stringify(savedData));
  return true;
};