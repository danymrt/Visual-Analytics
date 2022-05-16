// set the dimensions and margins of the graph
var widthTime =  document.getElementById("timePlot").clientWidth,
    heightTime = document.getElementById("timePlot").clientHeight;

var xScaleYears;
var yScaleGDP;

// append the svgBar object to the body of the page
var svgTime = d3.select("#timePlot")
          .attr("width", widthBar)
          .attr("height", heightBar);

//Get the dataBase
/*
d3.csv('Dataset/cleaned_dataset4.csv')
  .row(function(d){
    return {"code": d.Code,
        "series": d.Series,
        "name": d.Name,
        "y_2010": +d.year10,
        "y_2011": +d.year11,
        "y_2012": +d.year12,
        "y_2013": +d.year13,
        "y_2014": +d.year14,
        "y_2015": +d.year15,
        "y_2016": +d.year16,
        "y_2017": +d.year17,
        "y_2018": +d.year18,
        "y_2019": +d.year19};})
  .get(function(error, rows) {
    createMultilinePlot(rows);
  });*/

  d3.csv('Dataset/socio_economicDB.csv')
  .row(function(d){
    return {"year": d.Year,
        "code": d.Code,
        "name": d.Name,
        "gdp": +d['Current health expenditure'],
        "population": +d["Population, total"],
        "pop15_64": +d['Population ages 15-64, total'],
        "pop00_14": +d["Population ages 00-14, total"],
        "pop65_100": +d["Population ages 65 and above, total"],
        "rural": +d["Rural population"],
        "urban": +d["Urban population"]};})
    .get(function(error, rows) {
      console.log(rows);
      createMultilinePlot(rows);
    });

function createMultilinePlot(dataDB){

    //var group = rows.filter(function(d){
    //  return d.series == "Current health expenditure (% of GDP)" && d.code.length == 2;
    //})
    /*
    var x_data = []
    var dataYears = []

    rows.forEach((item, i) => {

    });


    group.forEach((item1, i) => {
      d3.entries(item1).forEach((item2, i) => {
        if(item2.key.includes("_")){
          var s = item2.key.split("_")[1]
          dataYears.push({code: item1.code, name:item1.name, year: s, n: item2.value})
          x_data.push(item2.value)
        }
      })
    });

    console.log(x_data);*/

    dataDB =  dataDB.filter(function(d){
      return d.code.length == 2;
    })

    //format the year
    var parseTime = d3.timeParse("%Y");


    dataDB.forEach(function (d) {
        d.year = parseTime(d.year);
    });

    //scale xAxis
    var xExtent = d3.extent(dataDB, d => d.year);
    xScaleYears = d3.scaleTime()
                        .domain(xExtent)
                        .range([0, widthBar - 60]);

    //scale yAxis
    var yMax= d3.max(dataDB,d=>d.gdp)
    yScaleGDP = d3.scaleLinear()
                      .domain([d3.min(dataDB,d=>d.gdp), d3.max(dataDB,d=>d.gdp)]).nice()
                      .range([heightBar - 48, 0])

    //draw xAxis and xAxis label
    xAxisYears = d3.axisBottom()
                  .scale(xScaleYears)

    svgTime.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(48," + (heightBar -25) + ")")
          .call(xAxisYears)

    //yAxis and yAxis label
    yAxisGDP = d3.axisLeft()
                  .scale(yScaleGDP)

    svgTime.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(48, 25)") //use variable in translate
            .call(yAxisGDP)
            .append("text")
            .attr("x", 2)
            .attr("y", -12)
            .attr("dy", "0.32em")
            .attr("fill", "white")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("% of GDP");

    //use .nest()function to group data so the line can be computed for each group
    var sumData = d3.nest()
                  .key(d => d.code)
                  .entries(dataDB);

    //select path - three types: curveBasis,curveStep, curveCardinal
    svgTime.selectAll(".line")
            .append("g")
            .data(sumData)
            .enter()
            .append("path")
            .attr("d", function (d) {
                return d3.line()
                .x(d => xScaleYears(d.year))
                .y(d => yScaleGDP(+d.gdp)).curve(d3.curveCardinal)
                  (d.values)
            })
            .attr("class", "lineGDP")
            .attr("id", function(d){return d.values[0].name+"_line";})
            .attr("name", function(d){return d.values[0].name;})
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 1.5 )
            .attr("opacity", "0.8")
            .attr("transform", "translate(48, 25)")
            .on("mouseover", onLineGDP)
            .on("mouseout", outLineGDP);

      //append circle
      svgTime.selectAll("circle")
            .append("g")
            .data(dataDB)
            .enter()
            .append("circle")
            .attr("r", 2)
            .attr("cx", d => xScaleYears(d.year))
            .attr("cy", d => yScaleGDP(+d.gdp))
            .attr("class", "circleGDP")
            .attr("id", function(d){return d.name+"_circle";})
            .attr("name", function(d){return d.name;})
            .style("fill", "white")
            .attr("transform", "translate(48, 25)")
            .on("mouseover", onCircleGDP)
            .on("mouseleave", outCircleGDP)

}

function onCircleGDP(d){

  var string_info =  d.name+ ": " + Math.round(d.gdp * 100) / 100

  d3.selectAll(".circleGDP")
    .attr("opacity", "0.25")
    .each((item, i) => {
      if(item.name == d3.select(this).attr("name")){
        d3.selectAll("#"+d3.select(this).attr("name")+"_circle")
        .style("fill", "white")
        .attr("opacity", "1");
      }
    });

  d3.selectAll(".lineGDP")
    .attr("opacity", "0.25")
    .attr("stroke-width", 1.5 )
    .each((item, i) => {
      if(item.values[0].name == d3.select(this).attr("name")){
        d3.select("#"+d3.select(this).attr("name")+"_line")
          .attr("stroke", "white")
          .attr("stroke-width", 1.5 )
          .attr("opacity", "1");
      }
    });

  var pos_x =  xScaleYears(d.year)
  var pos_y = yScaleGDP(+d.gdp)

  svgTime.append("text")
        .attr("class", "textGDP")
        .attr("x", pos_x + 50)
        .attr("y", pos_y + 20)
        .attr("fill", "red")
        .attr("font-size", 9)
        .text(string_info);

  svgTime.append("line")
          .attr("class", "vertical_line")
          .attr("x1", pos_x +48)
          .attr("y1",  heightTime - 178)
          .attr("x2", pos_x+48)
          .attr("y2", heightTime - 25)
          .style("stroke-width", 1)
          .style("stroke", "white")
          .attr("opacity", 0.25)
          .style("fill", "none");

    d3.select(this)
      .attr("r", 4)
      .style("fill", "red");
}

function outCircleGDP(){

  d3.selectAll(".circleGDP")
    .attr("r", 2)
    .attr("opacity", "1")
    .style("fill", "white")

  d3.selectAll(".lineGDP")
    .attr("stroke", "white")
    .attr("opacity", "0.8")
    .attr("stroke-width", 1.5 );

    d3.selectAll(".textGDP").remove();
    d3.selectAll(".vertical_line").remove();

}

function onLineGDP(d){

  var string_info =  d.values[0].name;

  d3.selectAll(".circleGDP")
    .attr("opacity", "0.25")
    .each((item, i) => {
      if(item.name == d3.select(this).attr("name")){
        d3.selectAll("#"+d3.select(this).attr("name")+"_circle")
        .attr("opacity", "1")
        .style("fill", "white");
      }
    });

  d3.selectAll(".lineGDP")
    .attr("opacity", "0.25")
    .attr("stroke-width", 1.5 );

  d3.select(this)
  .attr("stroke", "white")
  .attr("opacity", "1")
  .attr("stroke-width", 2.5) ;

  svgTime.append("text")
        .attr("class", "textGDP")
        .attr("x", d3.event.pageX - widthTime - 120)
        .attr("y", d3.event.pageY -heightTime - 20)
        .attr("fill", "red")
        .attr("font-size", 9)
        .text(string_info);

}

function outLineGDP(){
  d3.selectAll(".circleGDP")
    .attr("r", 2)
    .attr("opacity", "1")
    .style("fill", "white");

  d3.selectAll(".lineGDP")
    .attr("opacity", "0.8")
    .attr("stroke", "white")
    .attr("stroke-width", 1.5 );

  d3.selectAll(".textGDP").remove();
}
