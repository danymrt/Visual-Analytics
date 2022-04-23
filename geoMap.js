var selectedDisorder = []
var selectedYears = []
var mentalDB = []

//Get the dataBase in the variable mentalDB
d3.csv('Dataset/Mental_Disorder_with_continent.csv')
  .row(function(d) {
    return {code: d.Code,
      entity: d.Entity,
      year: +d.Year,
      depressive: +d.Depressive,
      anxiety: +d.Anxiety,
      bipolar: +d.Bipolar,
      eating: +d.Eating,
      schizophrenia: +d.Schizophrenia,
      attention: +d.Attention,
      autism: +d.Autism,
      conduct: +d.Conduct,
      intellectualDisability: +d.intellectualDisability}; })
  .get(function(error, rows) {
    mentalDB = rows;
  });

  //Read the json file for the Map
  d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson', function(error,data){
    createMapWorld(data)
  })

  //check event change year
  d3.selectAll("input").on("change",updateYears);

//Update the years array when the user select the checkboxes
function updateYears(){
  var checkboxes = document.querySelectorAll('input[type=checkbox]:checked')

  for (var i = 0; i < checkboxes.length; i++) {
    selectedYears.push(checkboxes[i].value)
  }
  colorMap()
}

//Mouse over the Country
function onCountry(){
  d3.selectAll(".Country")
    .transition()
    .duration(200)
    .style("opacity", .5)
  d3.select(this)
    .transition()
    .duration(200)
    .style("opacity", 1)
    //.style("stroke", "black")
}

//Mouse out the country
function outCountry(){
  d3.selectAll(".Country")
    .transition()
    .duration(200)
    .style("opacity", 1)
  d3.select(this)
    .transition()
    .duration(200)
    .style("stroke", "transparent")
}

function createMapWorld(topo){
  var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

  // Map and projection
  var path = d3.geoPath();

  // Data and color scale
  var countries = d3.nest(); //group items together, creating a hashed array

  //A projection function takes a longitude and latitude co-ordinate
  //(in the form of an array [lon, lat]) and transforms it into an x and y co-ordinate
  var projection = d3.geoNaturalEarth1()
    .scale(150)    //scale specifies the scale factor of the projection
    .center([0,20])  //center of projection
    .translate([(width / 2) - 50 , (height / 2)-25]); //where the center of projection is located on the screen

    // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
    // draw each country
    .attr("d", d3.geoPath()
      .projection(projection)
    )
    .attr('id', function(d,i){
      return d.id;
    })
    //.attr("fill", colorMap)
    .style("stroke", "transparent")
    .attr("class", function(d){ return "Country" } )
    .style("opacity", .8)
    .on("mouseover", onCountry )
    .on("mouseleave", outCountry )
}

function colorMap(){
  var colorScale = d3.scaleThreshold() //maps continuous numeric input to discrete values defined by the range
    .domain([100,1000, 10000, 100000, 1000000, 10000000, 30000000, 100000000, 300000000])
    .range(d3.schemeBuGn[9]);

    console.log(mentalDB);
}
