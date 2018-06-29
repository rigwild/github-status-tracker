const colors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(57, 191, 57)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(231,233,237)'
};

let showGoodEvent = false;

let graphType = 'bar';
let timeFormat = 'YYYY-MM-DD';
let tooltipFormat = 'll';

let dataContainer;

let config = {
  type: graphType,
  data: {
    labels: [],
    datasets: [{
      label: 'Good',
      backgroundColor: Chart.helpers.color(colors.green).alpha(0.5).rgbString(),
      borderColor: colors.green,
      fill: false,
      data: []
    }, {
      label: 'Minor',
      backgroundColor: Chart.helpers.color(colors.orange).alpha(0.5).rgbString(),
      borderColor: colors.orange,
      fill: false,
      data: []
    }, {
      label: 'Major',
      backgroundColor: Chart.helpers.color(colors.red).alpha(0.5).rgbString(),
      borderColor: colors.red,
      fill: false,
      data: []
    }]
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: 'GitHub Status Tracker'
    },
    tooltips: {
      mode: 'index',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      xAxes: [{
        type: 'time',
        time: {
          displayFormats: {
            'millisecond': timeFormat,
            'second': timeFormat,
            'minute': timeFormat,
            'hour': timeFormat,
            'day': timeFormat,
            'week': timeFormat,
            'month': timeFormat,
            'quarter': timeFormat,
            'year': timeFormat
          },
          parser: timeFormat,
          tooltipFormat: tooltipFormat
        },
        scaleLabel: {
          display: true,
          labelString: 'Date'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Events'
        }
      }]
    }
  }
};

//Take an array and output an array with groups matching a string (sliced value)
const parseByGroup = (statusArray, sliceValue) => {
  let result = [];
  statusArray.forEach(status => {
    const group = status.date.slice(0, sliceValue);
    if (result.hasOwnProperty(group)) result[group].push(status);
    else result[group] = [status];
  });
  return result;
};
const groupByMonth = statusArray => parseByGroup(statusArray, 7);
const groupByYear = statusArray => parseByGroup(statusArray, 4);


//Add to the chart an array of status
//format : [{"date":"2010-06-06","events":{"good":1,"minor":0,"major":0}}]
//groupType : "year", "month", "day" to group the data as needed
const addStatus = async (chartEle, statusArray, groupType) => {
  if (!chartEle || !statusArray || !groupType) return;
  let data;
  switch (groupType) {
    case "year":
      data = groupByYear(statusArray);
      timeFormat = "YYYY";
      tooltipFormat = "YYYY";
      graphType = "bar";
      break;
    case "month":
      data = groupByMonth(statusArray);
      timeFormat = "YYYY-MM";
      tooltipFormat = "MMM YYYY";
      graphType = "bar";
      break;
    case "day":
    default:
      timeFormat = "YYYY-MM-DD";
      tooltipFormat = "ll";
      graphType = "bar";
      break;
  }

  //Get the checkbox state
  showGoodEvent = document.getElementById("goodCheckbox").checked;
  //Set the visuals to the appropriate format
  config.data.datasets[0].hidden = !showGoodEvent; //show/hide good events colum
  config.type = graphType;
  config.options.scales.xAxes[0].time.parser = timeFormat;
  config.options.scales.xAxes[0].time.tooltipFormat = tooltipFormat;

  //Empty the graph
  chartEle.data.labels = [];
  chartEle.data.datasets.forEach(dataset => dataset.data = []);

  if (groupType === "day")
    statusArray.forEach(status => {
      //Add the date and its related data
      chartEle.data.labels.push(status.date);
      chartEle.data.datasets[0].data.push(status.events.good);
      chartEle.data.datasets[1].data.push(status.events.minor);
      chartEle.data.datasets[2].data.push(status.events.major);
    });
  else {
    //Add the new data
    for (let group in data) {
      chartEle.data.labels.push(group);
      //Count the number of each event in the group
      let events = {
        good: 0,
        minor: 0,
        major: 0
      };
      data[group].forEach(status => {
        events.good += status.events.good;
        events.minor += status.events.minor;
        events.major += status.events.major;
      })
      chartEle.data.datasets[0].data.push(events.good);
      chartEle.data.datasets[1].data.push(events.minor);
      chartEle.data.datasets[2].data.push(events.major);
    }
  }
  //Update the graph to show the result
  chartEle.update(config);
}


//Load the data from the server, groupmethod = day/month/year
const loadData = (chartEle, groupMethod) => {
  if (!dataContainer) {
    fetch("/getData")
      .then(res => res.json())
      .then(data => {
        dataContainer = data;
        return addStatus(chartEle, data, groupMethod);
      })
      .catch(err => console.error(err));
  } else
    addStatus(chartEle, dataContainer, groupMethod);
}

//Set button events
const setButtonsEvent = chartEle =>
  ["day", "month", "year"].forEach(button =>
    document.getElementById(button).addEventListener('click', () => loadData(chartEle, button)))

//Create a chart with a config
const createChart = config =>
  new Chart(
    document.getElementById('line-chart').getContext('2d'),
    config
  );

//Start the script
window.onload = () => {
  chartEle = createChart(config);
  loadData(chartEle, "month");
  setButtonsEvent(chartEle);
};