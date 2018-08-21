var chart = null;
var currentDate = null;
var currentTableNumber = null;
var labels = ["01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00"];
var legends;
var td_width;
var removeKeys = ['Total', 'Still in'];

function draw_chart(date, tableNumber) {
    $('td').removeClass('highlight');
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

    if (!$('#bar-chart-container').is(':empty')) {
        $("#bar-chart-container").empty();
    }

    var newdata = dataManipulation(data[currentDate], tableNumber, labels);
    main(newdata);
}

function draw_table(date, tableNumber) {
    if (typeof data[date] == 'undefined') {
        $(".table-wrapper").html("");
        return;
    }

    if (tableNumber == 0) {
        var table = "";

        var table_breaches = "<table id='table_breaches'><tr>";
        table_breaches += '<tr><th>Hour</th>';
        for (let lindex in labels) {
            table_breaches += "<th>" + labels[lindex].substring(0, 2) + "</th>";
        }
        table_breaches += '</tr>';

        table += "<table id='table_" + tableNumber + "'><tbody>";
        var keys = Object.keys(data[date][tableNumber]);

        table += "</tr>";
        for (let j in keys) {
            if (keys[j] == "Breaches") {
                table_breaches += "<td style='width: 100px;'>" + keys[j] + "</td>";
            } else if (!removeKeys.includes(keys[j])) {
                table += "<tr>";
                table += "<td style='width: 100px;'>" + keys[j] + "</td>";
            }

            var colorScale = d3.scaleLinear().domain([d3.min(data[date][tableNumber][keys[j]]), d3.max(data[date][tableNumber][keys[j]])])
                .interpolate(d3.interpolateHcl)
                .range([d3.rgb("#45ad45"), d3.rgb('#d21717')]);

            for (let k in data[date][tableNumber][keys[j]]) {
                var backColor = "";
                if (keys[j] == "Breaches") {
                    backColor = "color:black;background:" + colorScale(data[date][tableNumber][keys[j]][k]);
                    table_breaches += "<td style='" + backColor + ";text-align: center; width: " + td_width + "px;'>" + data[date][tableNumber][keys[j]][k] + "</td>";
                } else if (!removeKeys.includes(keys[j])) {
                    backColor = "background: white";
                    table += "<td style='" + backColor + ";text-align: center; width: " + td_width + "px;'>" + data[date][tableNumber][keys[j]][k] + "</td>";
                }
            }
            table += "</tr>";
        }
        table += "</tbody></table>";

        $(".table-wrapper").append(table);
        $(".breach-table-wrapper").html(table_breaches);
    } else {
        var table = "";
        table += "<table id='table_" + tableNumber + "'><tbody>";
        var keys = Object.keys(data[date][tableNumber]);

        table += "</tr>";
        for (let j in keys) {
            if (!removeKeys.includes(keys[j])) {
                table += "<tr>";
                table += "<td style='width: 100px;'>" + keys[j] + "</td>";
            }

            for (let k in data[date][tableNumber][keys[j]]) {
                var backColor = "";
                if (!removeKeys.includes(keys[j])) {
                    backColor = "background: white";
                    table += "<td style='" + backColor + ";text-align: center; width: " + td_width + "px;'>" + data[date][tableNumber][keys[j]][k] + "</td>";
                }
            }
            table += "</tr>";
        }
        table += "</tbody></table>";

        $(".table-wrapper").append(table);
    }
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
            // draw_chart(currentDate, currentTableNumber);
            for (var i = 0; i < data[currentDate].length; i++) {
                appendNewWrapper(i, currentDate, currentTableNumber);
                draw_table(currentDate, i);
            }
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

    $(document).on('click', '#table_0 td', function() {
        $('td').removeClass('highlight');
        $(this).addClass('highlight');
        $('rect').removeClass('highlighted-bar');
        var nthKey = $(this).index();
        var nthGroup = $(this).parent().index();
        $(".contry:nth-child(" + nthKey + ") rect:nth-child(" + nthGroup + ")").addClass('highlighted-bar');
        var wLP = $(this).offset().left; // Highlight Window Left Position	    	   
        // highlight4hours(wLP,nthKey);
        $('.highlight-window').addClass('hide');
    });

    $(document).on('click', '#table_breaches td', function() {
        $('td').removeClass('highlight');
        $(this).addClass('highlight');
        $('rect').removeClass('highlighted-bar');
        var nthKey = $(this).index();
        var nthGroup = $(this).parent().index();
        $(".contry:nth-child(" + nthKey + ") rect:nth-child(3)").addClass('highlighted-bar');
        var wLP = $(this).offset().left; // Highlight Window Left Position	    	   
        highlight4hours(wLP, nthKey);
    });
});

var width, height
var chartWidth, chartHeight
var margin
var svg, axisLayer, chartLayer;
var chart_data;

var xScale = d3.scaleBand()
var xInScale = d3.scaleBand();

var yScale = d3.scaleLinear()
var divTooltip = d3.select("body").append("div").attr("class", "toolTip");
var color = d3.scaleOrdinal()
    .range(["#5DDEC9", "#EF64AD", "#7b6888", "#BA67E5", "#E0E23B", "#d0743c", "#ff8c00"]);

function main(data) {
    setSize(data);
    drawAxis()

    var new_chartdata = [];
    labels.forEach(function(label) {
        var tmp = {};
        tmp[label] = data[label];

        new_chartdata.push(tmp);
    })
    drawChart(new_chartdata);
}

function setSize(data, wrapperElement) {
    // width = 1800;
    width = $(wrapperElement).innerWidth();
    height = 300;

    margin = {
        top: 20,
        left: 100,
        bottom: 40,
        right: 0
    };


    chartWidth = width - (margin.left + margin.right)
    chartHeight = height - (margin.top + margin.bottom)

    svg = d3.select(wrapperElement).append("svg")
    axisLayer = svg.append("g").classed("axisLayer", true)
    chartLayer = svg.append("g").classed("chartLayer", true);

    svg.attr("width", width).attr("height", height)

    axisLayer.attr("width", width).attr("height", height)

    chartLayer
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("transform", "translate(" + [margin.left, margin.top] + ")")

    xScale.domain(labels)
        .range([0, chartWidth]).paddingInner(0.1).paddingOuter(0.1)

    td_width = xScale.step();

    xInScale.domain(legends).range([0, xScale.bandwidth()])

    var a = [];
    var yMax = d3.max(a.concat(Object.values(chart_data)).map(function(d) {
        return d3.max(d);
    }));
    yMax += 2;

    yScale.domain([0, yMax]).range([chartHeight, 0])
}

function drawChart(nested) {
    var t = d3.transition()
        .duration(1000)
        .ease(d3.easeLinear)

    var contry = chartLayer.selectAll(".contry")
        .data(nested)

    var newCountry = contry.enter().append("g").attr("class", "contry")

    contry.merge(newCountry)
        .attr("transform", function(d) {
            return "translate(" + [xScale(Object.keys(d)), 0] + ")";
        });


    var bar = newCountry.selectAll(".bar")
        .data(function(d) {
            return Object.values(d)[0]
        })

    var newBar = bar.enter().append("rect").attr("class", "bar")

    bar.merge(newBar)
        .attr("width", xInScale.bandwidth())
        .attr("height", 0)
        .attr("fill", function(d) {
            return color(Object.keys(d));
        })
        .attr("transform", function(d) {
            return "translate(" + [xInScale(Object.keys(d)), chartHeight] + ")"
        })
        .on("mousemove", function(d) {
            divTooltip.style("left", d3.event.pageX + 10 + "px");
            divTooltip.style("top", d3.event.pageY - 25 + "px");
            divTooltip.style("display", "inline-block");
            var x = d3.event.pageX,
                y = d3.event.pageY
            var elements = document.querySelectorAll(':hover');
            l = elements.length
            l = l - 1
            elementData = elements[l].__data__;
            var index = $(elements[l].parentNode).index();

            divTooltip.html("<span>" + labels[index] + "</span><br><div style='width:15px;height:15px;display:inline-block;margin-right: 10px;vertical-align: text-bottom;background:" + color(Object.keys(d)) + "'></div>" + (Object.keys(d)) + ":" + Object.values(d));
        }).on('mouseout', function(d) {
            divTooltip.style("display", "none");
        }).on('mousedown', function(d) {
            var elements = document.querySelectorAll(':hover');
            l = elements.length
            l = l - 1
            elementData = elements[l].__data__;
            var index = $(elements[l].parentNode).index();
            index += 2;

            var nthGroup = $(this).index();
            nthGroup += 2;
            $('rect.bar').removeClass('highlighted-bar');
            $('.highlight-window').addClass('hide');
            $("td").removeClass('highlight');
            $(this).addClass('highlighted-bar');
            if (nthGroup == 4) {
                $("#table_breaches tr td:nth-child(" + index + ")").addClass('highlight');
            } else {
                $("#table_0 tr:nth-child(" + nthGroup + ") td:nth-child(" + index + ")").addClass('highlight');
            }
        })

    bar.merge(newBar).transition(t)
        .attr("height", function(d) {
            return chartHeight - yScale(Object.values(d));
        })
        .attr("transform", function(d) {
            return "translate(" + [xInScale(Object.keys(d)), yScale(Object.values(d))] + ")"
        })

}

function drawAxis() {
    var yAxis = d3.axisLeft(yScale)
        .tickSizeInner(-chartWidth)

    axisLayer.append("g")
        .attr("transform", "translate(" + [margin.left, margin.top] + ")")
        .attr("class", "axis y")
        .call(yAxis);

    var xAxis = d3.axisBottom(xScale)

    axisLayer.append("g")
        .attr("class", "axis x")
        .attr("transform", "translate(" + [margin.left, chartHeight + margin.top] + ")")
        .call(xAxis);

}

function dataManipulation(data, tblNumber, labels) {
    chart_data = data[tblNumber];
    legends = Object.keys(chart_data).filter(function(d){
    	if(removeKeys.includes(d)) return false;
    	return true;
    });    
    var newdata = {};
    labels.forEach(function(label, i) {
        var tmp = [];
        legends.forEach(function(legend) {
        	if(!removeKeys.includes(legend)){
        		let newO = {};
	            newO[legend] = chart_data[legend][i];
	            tmp.push(newO);
        	}            
        })
        newdata[label] = tmp;
    })
    return newdata;
}

function highlight4hours(left, nthKey) {
    var windowHeight = $('.breach-table-wrapper').outerHeight(true) + $('.bar-chart-wrap').outerHeight(true) + $('.table-wrapper').outerHeight(true) + 40;
    $('.highlight-window').removeClass('hide');
    $('.highlight-window').css('top', $('#table_breaches').offset().top);
    var wW = 0;
    if (nthKey >= 4) {
        wW = td_width * 4 + 4;
    } else {
        wW = nthKey * td_width + nthKey;
    }
    $('.highlight-window').css('width', wW);
    if (nthKey >= 4) {
        left = left - td_width * 3 - 4;
    } else {
        left = left - td_width * (nthKey - 1) - nthKey;
    }

    $('.highlight-window').css('height', windowHeight);
    $('.highlight-window').css('left', left);
}

function appendNewWrapper(i, cuDate, tblNumber) {
    var tmp = '<div class="chart-wrapper"><div id="chart_' + i + '"></div></div>';
    $('.table-wrapper').append(tmp);
    var tmp_id = "#chart_" + i;
    drawAchart(cuDate, i, tmp_id);
}

function drawAchart(cuDate, tblNumber, wrapper) {
    currentDate = cuDate;
    currentTableNumber = tblNumber;

    if (typeof data[cuDate] == 'undefined') {
        $("#bar-chart").hide();
        $(".message").show();
        return;
    }

    $("#bar-chart").show();
    $(".message").hide();

    var datasets = [];
    var chartData = data[cuDate][tblNumber];
    var keys = Object.keys(chartData);

    if (!$(wrapper).is(':empty')) {
        $(wrapper).empty();
    }

    var newdata = dataManipulation(data[currentDate], tblNumber, labels);
    if (tblNumber == 0) {
        //first chart	
        setSize(newdata, wrapper);
        drawAxis();

        var new_chartdata = [];
        labels.forEach(function(label) {
            var tmp = {};
            tmp[label] = newdata[label];

            new_chartdata.push(tmp);
        })
        drawChart(new_chartdata);
    } else if (tblNumber == 1) {
        var new_chartdata = [];
        labels.forEach(function(label) {
            var tmp = {};
            tmp[label] = newdata[label];

            new_chartdata.push(tmp);
        })

        width = $(wrapper).innerWidth();
        height = 300;

        margin = {
            top: 20,
            left: 100,
            bottom: 40,
            right: 0
        };

        chartWidth = width - (margin.left + margin.right)
        chartHeight = height - (margin.top + margin.bottom)

        svg = d3.select(wrapper).append("svg")
        axisLayer = svg.append("g").classed("axisLayer", true)
        chartLayer = svg.append("g").classed("chartLayer", true);

        svg.attr("width", width).attr("height", height)

        axisLayer.attr("width", width).attr("height", height)

        chartLayer
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("transform", "translate(" + [margin.left, margin.top] + ")")

        xScale.domain(labels)
            .range([0, chartWidth]).paddingInner(0.1).paddingOuter(0.1)

        var a = [];
        var yMax = d3.max(chart_data['Arrivals']);
        var yMin = d3.max(chart_data['Departures']);

        yMax += 2;
        yMin += 2;

        yScale.domain([-yMin, yMax]).range([chartHeight, 0]);

        drawAxis();

        chartLayer.selectAll("rect.negative_bar")
            .data(new_chartdata).enter()
            .append("rect")
            .attr('class', function(d) {
                return 'negative_bar';
            })
            .attr("width", xScale.bandwidth())
            .attr('x', function(d) {
                return xScale(Object.keys(d));
            })
            .attr('y', function(d) {
                return yScale(0)
            })
            .transition()
            .duration(2000)
            .attr("y", function(d) {
                return yScale(0)
            })
            .attr("height", function(d) {            	
                return Math.abs(yScale(0) - yScale(Object.values(d)[0][2]['Departures']));
            })

        chartLayer.selectAll("rect.positive_bar")
            .data(new_chartdata).enter()
            .append("rect")
            .attr('class', function(d) {
                return 'positive_bar';
            })
            .attr("width", xScale.bandwidth())
            .attr('x', function(d) {
                return xScale(Object.keys(d));
            })
            .attr('y', function(d) {
                return yScale(0)
            })
            .transition()
            .duration(2000)
            .attr("y", function(d) {
                return yScale(Object.values(d)[0][1]['Arrivals'])
            })
            .attr("height", function(d) {
                return Math.abs(yScale(0) - yScale(Object.values(d)[0][1]['Arrivals']));
            })
    } else if (tblNumber == 2) {
        var new_chartdata = [];
        labels.forEach(function(label) {
            var tmp = {};
            tmp[label] = newdata[label];

            new_chartdata.push(tmp);
        })

        width = $(wrapper).innerWidth();
        height = 300;

        margin = {
            top: 20,
            left: 100,
            bottom: 40,
            right: 0
        };

        chartWidth = width - (margin.left + margin.right)
        chartHeight = height - (margin.top + margin.bottom)

        svg = d3.select(wrapper).append("svg")
        axisLayer = svg.append("g").classed("axisLayer", true)
        chartLayer = svg.append("g").classed("chartLayer", true);

        svg.attr("width", width).attr("height", height)

        axisLayer.attr("width", width).attr("height", height)

        chartLayer
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("transform", "translate(" + [margin.left, margin.top] + ")")

        xScale.domain(labels)
            .range([0, chartWidth]).paddingInner(0.1).paddingOuter(0.1)

        var yMax = d3.max(new_chartdata.map(function(d) {
            return Object.values(d)[0].map(function(g) {
                if ((Object.keys(g)[0] != "Ambulances") && (Object.keys(g)[0] != "Still in")) {
                    return Object.values(g)[0];
                }
                return 0;
            }).reduce((a, b) => a + b, 0);
        }));
        var yMin = d3.min(new_chartdata.map(function(d) {
            return Object.values(d)[0].map(function(g) {
                if ((Object.keys(g)[0] != "Ambulances") && (Object.keys(g)[0] != "Still in")) {
                    return Object.values(g)[0];
                }
                return 0;
            }).reduce((a, b) => a + b, 0);
        }));

        yMax += 2;
        yMin -= 2;       

        var stackedData = [];
        new_chartdata.forEach(function(d) {
            var tmp = {};
            tmp['key'] = Object.keys(d)[0];
            Object.values(d)[0].forEach(function(g) {
                var tmp_key = Object.keys(g)[0];
                if (tmp_key != "Still in")
                    tmp[tmp_key] = Object.values(g)[0];
            });
            stackedData.push(tmp);
        })

        var stackKeys = ["Majors", "Minors", "Resus"];

        var dataset = d3.stack()(["Majors", "Minors", "Resus"].map(function(fruit) {
            return stackedData.map(function(d) {
                return {
                    x: d.key,
                    y: +d[fruit]
                };
            });
        }));


        yScale.domain([0, yMax]).range([chartHeight, 0]);

        var z = d3.scaleOrdinal()
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        z.domain(stackKeys);
        drawAxis();

        var groups = chartLayer.selectAll("g.cost")
            .data(d3.stack().keys(stackKeys)(stackedData))
            .enter().append("g")
            .attr("class", "cost")
            .attr("fill", function(d, i) {                
                return z(d.key);
            });

        var rect = groups.selectAll("rect")
            .data(function(d) {
                return d;
            })
            .enter()
            .append("rect")
            .attr("x", function(d) {
                return xScale(d['data']['key']);
            })
            .attr("y", function(d) {                
                return yScale(d[1]);
            })
            .attr("height", function(d) {
                return yScale(d[0]) - yScale(d[1]);
            })
            .attr("width", xScale.bandwidth())

        var yMax1 = d3.max(stackedData.map(function(d) {
            return d['Ambulances']
        }));
        yMax1 += 2;
        var yScale1 = d3.scaleLinear();
        yScale1.domain([0, yMax1]).range([chartHeight, 0]);

        var line = d3.line()
            .x(function(d) {
                return xScale(d.key) + xScale.bandwidth() / 2;
            })
            .y(function(d) {
                return yScale1(d['Ambulances']);
            });
        chartLayer.append("path")
            .datum(stackedData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line);
    } else if (tblNumber == 3) {
        setSize(newdata, wrapper);
        drawAxis();

        var new_chartdata = [];
        labels.forEach(function(label) {
            var tmp = {};
            tmp[label] = newdata[label];

            new_chartdata.push(tmp);
        })        

        drawChart(new_chartdata);
    } else if (tblNumber == 4) {
        var new_chartdata = [];
        labels.forEach(function(label) {
            var tmp = {};
            tmp[label] = newdata[label];

            new_chartdata.push(tmp);
        })

        width = $(wrapper).innerWidth();
        height = 300;

        margin = {
            top: 20,
            left: 100,
            bottom: 40,
            right: 0
        };

        chartWidth = width - (margin.left + margin.right)
        chartHeight = height - (margin.top + margin.bottom)

        svg = d3.select(wrapper).append("svg")
        axisLayer = svg.append("g").classed("axisLayer", true)
        chartLayer = svg.append("g").classed("chartLayer", true);

        svg.attr("width", width).attr("height", height)

        axisLayer.attr("width", width).attr("height", height)

        chartLayer
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("transform", "translate(" + [margin.left, margin.top] + ")")

        xScale.domain(labels)
            .range([0, chartWidth]).paddingInner(0.1).paddingOuter(0.1)

        var yMax = d3.max(new_chartdata.map(function(d) {
            return Object.values(d)[0].map(function(g) {
                if ((Object.keys(g)[0] != "Total") && (Object.keys(g)[0] != "Still in")) {
                    return Object.values(g)[0];
                }
                return 0;
            }).reduce((a, b) => a + b, 0);
        }));

        yMax += 2;
        yMin -= 2;

        var stackedData = [];
        new_chartdata.forEach(function(d) {
            var tmp = {};
            tmp['key'] = Object.keys(d)[0];
            Object.values(d)[0].forEach(function(g) {
                var tmp_key = Object.keys(g)[0];
                if (tmp_key != "Still in")
                    tmp[tmp_key] = Object.values(g)[0];
            });
            stackedData.push(tmp);
        });

        var stackKeys = ["< 60", "60 - 120", "120 - 180", "180 - 240", "> 240"];

        yScale.domain([0, yMax]).range([chartHeight, 0]);

        var z = d3.scaleOrdinal()
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        z.domain(stackKeys);
        drawAxis();

        var groups = chartLayer.selectAll("g.cost")
            .data(d3.stack().keys(stackKeys)(stackedData))
            .enter().append("g")
            .attr("class", "cost")
            .attr("fill", function(d, i) {
                return z(d.key);
            });

        var rect = groups.selectAll("rect")
            .data(function(d) {
                return d;
            })
            .enter()
            .append("rect")
            .attr("x", function(d) {
                return xScale(d['data']['key']);
            })
            .attr("y", function(d) {
                return yScale(d[1]);
            })
            .attr("height", function(d) {
                return yScale(d[0]) - yScale(d[1]);
            })
            .attr("width", xScale.bandwidth())

    }
}