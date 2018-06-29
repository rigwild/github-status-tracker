const colors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(57, 191, 57)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(231,233,237)'
};

const timeFormat = 'YYYY-MM-DD';
const config = {
	type: 'line',
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
					tooltipFormat: 'll'
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

//Add to the chart an array of status
//format : [{"date":"2010-06-06","events":{"good":1,"minor":0,"major":0}}]
const addStatus = (chartEle, statusArray) => {
	statusArray.forEach(status => {
		//Check if day is not already present
		if (!chartEle.data.labels.find(aSavedDay => aSavedDay === status.date)) {
			//Add the date and its related data
			chartEle.data.labels.push(status.date);
			chartEle.data.datasets[0].data.push(status.events.good);
			chartEle.data.datasets[1].data.push(status.events.minor);
			chartEle.data.datasets[2].data.push(status.events.major);
		}
	});
	chartEle.update();
}

window.onload = () =>
	window.generatedChart = new Chart(
		document.getElementById('line-chart').getContext('2d'),
		config
	);