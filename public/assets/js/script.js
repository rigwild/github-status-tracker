'use strict';

const colors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(57, 191, 57)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(231,233,237)'
};

let graphType = 'bar';
let timeFormat = 'YYYY-MM-DD';
let tooltipFormat = 'll';

let chartEle;
let dataTable;
let dataContainer;

//Show/hide the table
const tableVisible = visibleBool => {
  const button = document.getElementById("toggleTable");
  const eventsTableDiv = document.getElementById("eventsTableDiv");
  if (!visibleBool) { //toggle state 
    if (button.innerText === "Show table") {
      button.innerText = "Hide table";
      eventsTableDiv.style.display = "block";
    } else {
      button.innerText = "Show table";
      eventsTableDiv.style.display = "none";
    }
  } else {
    eventsTableDiv.style.display = visibleBool ? "block" : "none";
    button.innerText = visibleBool ? "Hide table" : "Show table";
  }
};

//Add lines to a dataTable (you still need to call dataTable.draw())
const addTableLines = (dataTable, dataArray) => dataTable.rows.add(dataArray);

//Remove all the lines from a table
const clearTable = dataTable => dataTable.clear();

//Called on click on a chart bar, add table lines with the events corresponding to the bar clicked
const updateTable = (event, array) => {
  if (array.length === 0) return;
  //Get which bar was clicked
  const clickedBar = array[0]._index;
  const clickedDataGroup = chartEle.data.labels[clickedBar];
  //Get the data corresponding with the bar
  const correspondingData = [];
  dataContainer.forEach(day => day.date.includes(clickedDataGroup) && correspondingData.push(day));
  clearTable(dataTable); //Empty the table
  //Add the lines to the table
  correspondingData.forEach(day => {
    const newLines = [];
    day.events.forEach(event => newLines.push([moment(event.timestamp).format('YYYY-MM-DD HH:mm'), event.type, event.msg]));
    addTableLines(dataTable, newLines);
  });
  dataTable.draw();
  tableVisible(true);
};

//Chart.js config
let chartConfig = {
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
    maintainAspectRatio: false,
    title: {
      display: false,
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
    onClick: updateTable,
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

const dataTableSettings = {
  columnDefs: [{
    className: "text-center",
    targets: [0, 1]
  }, {
    className: "text-left",
    targets: [2]
  }, {
    width: 200,
    targets: [0, 1]
  }],
  dom: "<'row'<'col-md-6 text-left'l><'col-md-6'f>>" +
    "<'row'<'col-md-12't>>" +
    "<'row'<'col-md-12 pb-2'i><'col-md-12 center-pagination'p>>",
  aLengthMenu: [
    [10, 25, 50, 75, -1],
    [10, 25, 50, 75, "All"]
  ],
  iDisplayLength: 25,
  responsive: true
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

  //Set the visuals to the appropriate format
  chartConfig.type = graphType;
  chartConfig.options.scales.xAxes[0].time.parser = timeFormat;
  chartConfig.options.scales.xAxes[0].time.tooltipFormat = tooltipFormat;

  //Empty the graph
  chartEle.data.labels = [];
  chartEle.data.datasets.forEach(dataset => dataset.data = []);

  if (groupType === "day")
    statusArray.forEach(status => {
      //Add the date and its related data
      chartEle.data.labels.push(status.date);
      chartEle.data.datasets[0].data.push(status.eventsCount.good);
      chartEle.data.datasets[1].data.push(status.eventsCount.minor);
      chartEle.data.datasets[2].data.push(status.eventsCount.major);
    });
  else {
    //Add the new data
    for (let group in data) {
      chartEle.data.labels.push(group);
      //Count the number of each event in the group
      let eventsCount = {
        good: 0,
        minor: 0,
        major: 0
      };
      data[group].forEach(status => {
        eventsCount.good += status.eventsCount.good;
        eventsCount.minor += status.eventsCount.minor;
        eventsCount.major += status.eventsCount.major;
      })
      chartEle.data.datasets[0].data.push(eventsCount.good);
      chartEle.data.datasets[1].data.push(eventsCount.minor);
      chartEle.data.datasets[2].data.push(eventsCount.major);
    }
  }
  //Update the graph to show the result
  chartEle.update(chartConfig);
};


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
};

const updateData = (chartEle, groupMethod) => {
  buttonAnimation(document.getElementById("updateData"), "Updating graph data ...", true)
  fetch("/updateData")
    .then(res => res.json())
    .then(data => {
      dataContainer = data;
      buttonAnimation(document.getElementById("updateData"), "Update graph data", false);
      return addStatus(chartEle, data, groupMethod);
    })
    .catch(err => console.error(err));
};

//Set button events
const setButtonsEvent = (chartEle, dataTable) => {
  ["day", "month", "year"].forEach(button =>
    document.getElementById(button).addEventListener('click', () => loadData(chartEle, button)));

  document.getElementById("updateData").addEventListener('click', () => updateData(chartEle, "month"));
  document.getElementById("toggleTable").addEventListener('click', () => tableVisible());

  ["filterGood", "filterMinor", "filterMajor"].forEach(button =>
    document.getElementById(button).addEventListener('click', () =>
      dataTable.column(1).search(button.replace('filter', ''), true, false).draw()));

  document.getElementById("filterReset").addEventListener('click', () =>
    dataTable.column(1).search('', true, false).draw());
};

//Remove html chars from string
const stripHtml = str => str.replace(/[\u00A0-\u9999<>\&]/gim, i => '&#' + i.charCodeAt(0) + ';');

//Set button animation, true to animate, false to reset
const buttonAnimation = (ele, text, animationBool) =>
  ele.innerHTML = `${stripHtml(text)}${animationBool ? " <i class='fas fa-spinner fa-spin'></i>" : ""}`;


//Start the script
window.onload = () => {
  chartEle = new Chart(document.getElementById('line-chart').getContext('2d'), chartConfig);
  loadData(chartEle, "month");
  dataTable = $("#eventsTable").DataTable(dataTableSettings);
  setButtonsEvent(chartEle, dataTable);
};