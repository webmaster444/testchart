var chart = null;
var currentDate = null;
var currentTableNumber = null;
var labels =  ["01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00"];
var legends;
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
	
	if(!$('#bar-chart-container').is(':empty')){	
		$("#bar-chart-container").empty();
	}	

	var newdata = dataManipulation(data[currentDate],labels);
	main(newdata);
}

function draw_table(date) {
	if (typeof data[date] == 'undefined') {
		$(".table-wrapper").html("");
		return;
	}

	var td_width = ($("#bar-chart-container").width() - 120.4) / 24 - 1;

	var table = "";

	for (let i in data[date]) {		
		table += "<table onClick=\"draw_chart('" + date + "', " + i + ")\"><tbody>";
		var keys = Object.keys(data[date][i]);

		for (let j in keys) {			
			table += "<tr>";
			table += "<td style='width: 100px;'>" + keys[j] + "</td>";
			var colorScale = d3.scaleSequential(d3.interpolateViridis).domain([d3.min(data[date][i][keys[j]]), d3.max(data[date][i][keys[j]])]);

			for (let k in data[date][i][keys[j]]) {				
				table += "<td style='background:"+colorScale(data[date][i][keys[j]][k])+";text-align: center; width: " + td_width + "px;'>" + data[date][i][keys[j]][k] + "</td>";
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

	var width,height
    var chartWidth, chartHeight
    var margin
    var svg,axisLayer ,chartLayer ;
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
        labels.forEach(function(label){
        	var tmp={};        	
        	tmp[label] = data[label];

        	new_chartdata.push(tmp);        
        })        
        drawChart(new_chartdata);  
    }
    
    function setSize(data) {
        width = 1780;
        height = 500;
    
        margin = {top:20, left:100, bottom:40, right:30 };
        
        
        chartWidth = width - (margin.left+margin.right)
        chartHeight = height - (margin.top+margin.bottom)

	    svg = d3.select("#bar-chart-container").append("svg")
	    axisLayer = svg.append("g").classed("axisLayer", true)
	    chartLayer = svg.append("g").classed("chartLayer", true);

        svg.attr("width", width).attr("height", height)
        
        axisLayer.attr("width", width).attr("height", height)
        
        chartLayer
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("transform", "translate("+[margin.left, margin.top]+")")
            
        xScale.domain(labels)
            .range([0, chartWidth]).paddingInner(0.1).paddingOuter(0.1)
            
        // var ageNames = Object.keys(data);        
        xInScale.domain(legends).range([0, xScale.bandwidth()])
                
        var a= [];
        var yMax = d3.max(a.concat(Object.values(chart_data)).map(function(d){        	
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
            .attr("transform", function(d) {return "translate(" + [xScale(Object.keys(d)), 0] + ")"; });

        
        var bar = newCountry.selectAll(".bar")
            .data(function(d){return Object.values(d)[0] })

        var newBar = bar.enter().append("rect").attr("class", "bar")

        bar.merge(newBar)
            .attr("width", xInScale.bandwidth())
            .attr("height", 0)
            .attr("fill", function(d) { return color(Object.keys(d)); })
            .attr("transform", function(d) {return "translate(" + [xInScale(Object.keys(d)), chartHeight] + ")" })
            .on("mousemove", function(d){                           
	            divTooltip.style("left", d3.event.pageX+10+"px");
	            divTooltip.style("top", d3.event.pageY-25+"px");
	            divTooltip.style("display", "inline-block");
	            var x = d3.event.pageX, y = d3.event.pageY
	            var elements = document.querySelectorAll(':hover');	            
	            l = elements.length
	            l = l-1
	            elementData = elements[l].__data__;

	            var activeBar = window.activeBar = elements[l];
	            divTooltip.html("<div style='width:15px;height:15px;display:inline-block;margin-right: 10px;vertical-align: text-bottom;background:"+color(Object.keys(d))+"'></div>"+(Object.keys(d)) +":" + Object.values(d));
	            d3.select(activeBar).style('opacity', 1);
	        }).on('mouseout',function(d){
	        	divTooltip.style("display", "none");
	        })
                
       bar.merge(newBar).transition(t)
            .attr("height", function(d) { return chartHeight - yScale(Object.values(d)); })
            .attr("transform", function(d) { return "translate(" + [xInScale(Object.keys(d)), yScale(Object.values(d))] + ")" })
        
    }
    
    function drawAxis(){
        var yAxis = d3.axisLeft(yScale)
            .tickSizeInner(-chartWidth)
        
        axisLayer.append("g")
            .attr("transform", "translate("+[margin.left, margin.top]+")")
            .attr("class", "axis y")
            .call(yAxis);
            
        var xAxis = d3.axisBottom(xScale)
    
        axisLayer.append("g")
            .attr("class", "axis x")
            .attr("transform", "translate("+[margin.left, chartHeight+margin.top]+")")
            .call(xAxis);
        
    }       
    function dataManipulation(data,labels){
    	chart_data = data[0];    	
    	legends = Object.keys(chart_data);
    	var newdata = {};
    	labels.forEach(function(label,i){
    		var tmp = [];
			legends.forEach(function(legend){				
				let newO = {};				
				newO[legend] = chart_data[legend][i];
				tmp.push(newO);
			})
			newdata[label] = tmp;	
    	})    	
    	return newdata;
    }