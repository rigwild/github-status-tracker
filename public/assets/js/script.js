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
let timeFormat = 'YYYY-MM-DD';
let tooltipFormat = 'll';
let generatedChart;
let dataContainer;

const config = {
  type: 'bar',
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
      break;
    case "month":
      data = groupByMonth(statusArray);
      timeFormat = "YYYY-MM";
      tooltipFormat = "MMM YYYY";
      break;
    case "day":
    default:
      timeFormat = "YYYY-MM-DD";
      tooltipFormat = "ll";
      break;
  }

  //Set the visuals to the appropriate format
  chartEle.options.scales.xAxes.parser = timeFormat;
  chartEle.options.scales.xAxes.tooltipFormat = tooltipFormat;

  if (groupType === "day")
    statusArray.forEach(status => {
      //Check if day is not already present
      if (!chartEle.data.labels.find(aSavedDay => aSavedDay === status.date)) {
        //Add the date and its related data
        chartEle.data.labels.push(status.date);
        if (showGoodEvent) chartEle.data.datasets[0].data.push(status.events.good);
        chartEle.data.datasets[1].data.push(status.events.minor);
        chartEle.data.datasets[2].data.push(status.events.major);
      }
    });
  else
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
      if (showGoodEvent) chartEle.data.datasets[0].data.push(events.good);
      chartEle.data.datasets[1].data.push(events.minor);
      chartEle.data.datasets[2].data.push(events.major);
    }

  //Update the graph to show the result
  chartEle.update();
}


window.onload = async () => {
  generatedChart = new Chart(
    document.getElementById('line-chart').getContext('2d'),
    config
  );
  fetch("/getData")
    .then(res => res.json())
    .then(data => {
      dataContainer = data;
      return addStatus(generatedChart, data, "month");
    })
    .catch(err => console.error(err));
};