require('dotenv').config();
const https = require('https');
const fs = require('fs');

//File where the data is backed up
const dataFile = process.env.DATA_FILE_PATH;

const regexList = {
  getDayGroups: /message_group\" id=\"(.*?)\"\>[\s\S]*?(?=message_group|pagination)/g,
  getDayDate: /id=\"(.*?)\"/,
  getEventTypes: /message (?:auto-message)*(.*?)\"/g,
  isWeekTheMostRecent: /next disabled/,
  getNextWeekDate: /\"\/messages\/(.*?)\".*?Next Week/
};

const firstStatusDate = '{"date":"2010-02-01","events":{"good":1,"minor":0,"major":0}}';

//Load the data contained in the save file
const getSavedData = async () => {
  try {
    return await JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch (e) {
    console.log(e);
  }
  return false;
};

//Fetch the HTML content of a page, if no date specified, it takes the most recent status report
const fetchStatusPage = date =>
  new Promise((resolve, reject) => {
    const url = date ? `https://status.github.com/messages/${date}` : "https://status.github.com/messages";
    https.get(url, res => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(res);
      }
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => resolve(rawData));
    }).on('error', e => reject(e));
  });

//Parse a status page returning an object with the date and the count of each type of events
//(Good, minor, major)
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
};

//Pass nothing to get most recent status data, pass the date to get the week's status data
const getStatusOnline = async date => {
  try {
    const html = await fetchStatusPage(date);
    return await parseStatusPage(html);
  } catch (e) {
    console.error(e);
  }
  return false;
};

//Get or update the status data from github
const updateStatusData = async () => {
  if (!fs.existsSync(dataFile))
    fs.writeFileSync(dataFile, `[${firstStatusDate}]`);

  //We get the last status date saved in the file
  let savedData = await getSavedData();
  if (!savedData) return;
  savedData.sortByKey("date");
  let date = savedData[savedData.length - 1].date;

  console.log(`Updating the GitHub status events data ...\n`);
  //We loop from the last saved date to the most recent online, stop if last status or error
  let continueFetching = true;
  let count = 0;
  while (continueFetching) {
    try {
      console.log(`Fetching GitHub status for the week of this date : ${date}.`);
      const html = await fetchStatusPage(date);
      const weekStatus = await parseStatusPage(html);
      saveData(weekStatus);
      if (!regexList.isWeekTheMostRecent.test(html))
        date = html.match(regexList.getNextWeekDate)[1];
      else {
        console.log(`The date : ${date} is the most recent GitHub status's update week.`);
        continueFetching = false;
      }
    } catch (e) {
      //If the page redirects (http 302 code), we are at the last week of GitHub status
      if (e.hasOwnProperty('statusCode') && e.statusCode === 302) {
        //Save the last week status
        await saveData(await parseStatusPage(await fetchStatusPage()));
        console.log(`The date : ${date} is the most recent GitHub status's update week.`);
      } else {
        console.error(e);
        count--;
      };
      continueFetching = false;
    }
    count++;
  }
  console.log(`\nSuccessfully updated GitHub status events data. ${count} week(s) of events were fetched.`);
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
const saveData = async daysEventsArray => {
  if (!fs.existsSync(dataFile))
    fs.writeFileSync(dataFile, `[${firstStatusDate}]`);

  let savedData = await getSavedData();
  if (!savedData) return false;
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


//Exported objects to be used out of this script
module.exports = {
  dataFile: dataFile,
  getStatusOnline: getStatusOnline,
  updateStatusData: updateStatusData,
  getSavedData: getSavedData,
  saveData: saveData
};