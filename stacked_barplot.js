//PROBLEMA ZOOM E SELECT LEGENDA

//The keys for create the plot
var keys_age=["pop00_14","pop15_64","pop65_100"]

// set the dimensions and margins of the graph
var widthBar =  document.getElementById("agePlot").clientWidth,
    heightBar = document.getElementById("agePlot").clientHeight;

// append the svgBar object to the body of the page
var svgBar = d3.select("#agePlot")
          .attr("width", widthBar)
          .attr("height", heightBar);

//Get the dataBase and call the function for create the Plot
/*
d3.csv('Dataset/cleaned_dataset4.csv')
  .row(function(d){ return {"code": d.Code,
      "series": d.Series,
      "name": d.Name,
      "y10": +d.year10,
      "y11": +d.year11,
      "y12": +d.year12,
      "y13": +d.year13,
      "y14": +d.year14,
      "y15": +d.year15,
      "y16": +d.year16,
      "y17": +d.year17,
      "y18": +d.year18,
      "y19": +d.year19};})
  .get(function(error, rows) {
        createBarPlot(rows);
    });*/

d3.csv('Dataset/socio_economicDB.csv')
  .row(function(d){
    return {"year": d.Year,
      "code": d.Code,
      "name": d.Name,
      "gdp": +d['Current health expenditure (% of GDP)'],
      "population": +d["Population, total"],
      "pop15_64": +d['Population ages 15-64, total'],
      "pop00_14": +d["Population ages 00-14, total"],
      "pop65_100": +d["Population ages 65 and above, total"],
      "rural": +d["Rural population"],
      "urban": +d["Urban population"]};})
  .get(function(error, rows) {
      console.log(rows);
      createBarPlot(rows);
  });

//Create the axis and the plot
function createBarPlot(rows){

  //Group the data: {code: codeCountry, name: nameCountry,
  //               Population ages 00-14, total: n, Population ages 15-64, total: n,
  //               Population ages 65 and above, total: n,  Population, total: n}
  /*
  var groupDataAge = d3.nest()
      .key(function(d) {return d.code; })
      .rollup(function(d, i){
          var d2 = {code: d[0].code, name: d[0].name}
          d.forEach(function(d){
            //console.log(d);
            if(d.series == "Population ages 00-14, total" ||
            d.series =="Population ages 15-64, total"||
            d.series =="Population ages 65 and above, total" || d.series =="Population, total"){
              //console.log(d2[d.series]);
              d2[d.series] = d.y19;
            }
          })
          return d2;
      })
      .entries(rows)
      .map(function(d){return d.value;})
      .filter(function(d){
        if(d.code.length == 2){
          return d;
        }
      });*/
  var groupDataAge = rows.filter(function(d){
    return d.code.length == 2;
  })

  var x_data = []; //Array for values on x axis
  var y_data = []; //Map for values on y axis

  //Take data for the axis
  groupDataAge.forEach((item, i) => {
    if(item.code.length == 2){
        if(!x_data.includes(item.name)) x_data.push(item.name);
        y_data.push(item.population);
    }
  });


  // X (horizontal axis) represents the countries/continent categories
  var x = d3.scaleBand()
      .rangeRound([0, widthBar - 60])
      .paddingInner(0.05)
      .align(0.1);

  // Y (vertical axis) represents the population in millions
  var y = d3.scaleLinear()
            .rangeRound([heightBar - 50, 0]);

  // Z represents the color scheme to be used for the various age groups
  var z = d3.scaleOrdinal()
            .range(['#1b9e77','#d95f02','#7570b3']);

  //Max value in the Y
  var max_pop = d3.max(y_data);

  //Domains
  x.domain(x_data);
  y.domain([0, max_pop]).nice();
  z.domain(keys_age);

  console.log(d3.stack().keys(keys_age)(groupDataAge));

  //Create the bar
  svgBar.append("g")
      .selectAll("g")
      .data(d3.stack().keys(keys_age)(groupDataAge))
      .enter().append("g")
      .attr("fill", function(d) { return z(d.key); })
      .selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("x", function(d) {return x(d.data.name); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth())
      .attr("transform", "translate(48,25)");

  // Create the X Axis
  svgBar.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(48," + (heightBar -25) + ")")
      .call(d3.axisBottom(x));

  // Create the Y Axis
  svgBar.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(48, 25)")
        .call(d3.axisLeft(y).tickFormat(d3.formatPrefix(".1", 1e6)))
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "white")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Population");

  // Create the legend
  var legend = svgBar.append("g")
                    .attr("font-size", 10)
                    .attr("text-anchor", "end")
                    .selectAll("g")
                    .data(keys_age.slice().reverse())
                    .enter().append("g")
                    .attr("transform", function(d, i) { return "translate(0," + i * 22 + ")"; });

  // Create circle for each element in legend
  legend.append("circle")
        .attr("cx", widthBar - 14)
        .attr("cy", 9)
        .attr("r", 7)
        .attr("fill", z);

  // Create text for each element in legend
  legend.append("text")
        .attr("x", widthBar - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .attr("fill", "white")
        .text(function(d) {
          if(d == 'pop65_100') d = 'Population ages 65 and above'
          if(d == 'pop15_64') d = 'Population ages 15-64'
          if(d == 'pop00_14') d = 'Population ages 00-15'
          return d;
         });

}
