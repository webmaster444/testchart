
function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

var chart = null;
var currentDate = null;
var currentTableNumber = null;

function draw_chart(date, tableNumber) {
	currentDate = date;
	currentTableNumber = tableNumber;

	if (typeof data[date] == 'undefined') {
		$("#bar-chart").hide();
		$(".message").show();
		return;
	}

	$("#bar-chart").show();
	$(".message").hide();

	var datasets = [];
	var chartData = data[date][tableNumber];
	var keys = Object.keys(chartData);

	for (let i in keys) {
		datasets.push({
			label: keys[i],
			backgroundColor: getRandomColor(),
			data: chartData[keys[i]]
		});
	}

	if (chart && typeof chart === "object") {
		chart.destroy();
	}

	chart = new Chart(document.getElementById("bar-chart"), {
		type: 'bar',
		data: {
			labels: [
				"01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", 
				"13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00"
			],
			datasets: datasets
		},
		options: {
			title: {
				display: false,
				text: 'Status'
			},
			scales: {
				yAxes: [{
					afterFit: function(scaleInstance) {
						scaleInstance.width = 100;
					}
				}]
			}
		}
	});
}

function draw_table(date) {
	if (typeof data[date] == 'undefined') {
		$(".table-wrapper").html("");
		return;
	}

	var td_width = ($("#bar-chart").width() - 120.4) / 24 - 1;

	var table = "";

	for (let i in data[date]) {
		table += "<table onClick=\"draw_chart('" + date + "', " + i + ")\"><tbody>";
		var keys = Object.keys(data[date][i]);

		for (let j in keys) {
			table += "<tr>";
			table += "<td style='width: 100px;'>" + keys[j] + "</td>";

			for (let k in data[date][i][keys[j]]) {
				table += "<td style='text-align: center; width: " + td_width + "px;'>" + data[date][i][keys[j]][k] + "</td>";
			}

			table += "</tr>";
		}

		table += "</tbody></table>";
	}

	$(".table-wrapper").html(table);
}

function getToday() {
	var d = new Date();
	var month = d.getMonth() + 1;
	var day = d.getDate();
	return d.getFullYear() + "-" + (month < 10 ? '0' : '') + month + "-" + (day < 10 ? '0' : '') + day;
}

$(document).ready(function() {

	currentDate = getToday();
	currentTableNumber = 0;

	$("#date-picker").datepicker({
		onSelect: function(selectedDate) {
			currentDate = selectedDate;
			currentTableNumber = 0;
			draw_chart(currentDate, currentTableNumber);
			draw_table(currentDate);
		},
		dateFormat: "yy-mm-dd"
	});

	$("#date-picker").datepicker().datepicker("setDate", "today");

	draw_chart(currentDate, currentTableNumber);
	draw_table(currentDate);

	$(window).resize(function() {
		draw_chart(currentDate, currentTableNumber);
		draw_table(currentDate);
	});

});