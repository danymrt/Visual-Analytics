//Legenda che quando clicchi seleziona solo quei paesi
//Seleziona e fai zoom solo su un continente
//zoom
// Passi sopra a un paese info

var selectedDisorder = ['eating']       //Selected disorders
var selectedYears = []                            //Selected years
var mentalDB = []                                 //Store the dataset
var max = 0
var minMax = 0

var svg = d3.select("#map"),
width = +svg.attr("width"),
height = +svg.attr("height");

//Get the dataBase in the variable mentalDB
d3.csv('Dataset/Mental_Disorder_with_continent.csv')
  .row(function(d) {
    return {code: d.Code,
      "entity": d.Entity,
      "year": +d.Year,
      "depressive": +d.Depressive,
      "anxiety": +d.Anxiety,
      "bipolar": +d.Bipolar,
      "eating": +d.Eating,
      "schizophrenia": +d.Schizophrenia,
      "attention": +d.Attention,
      "autism": +d.Autism,
      "conduct": +d.Conduct,
      "intellectualDisability": +d.intellectualDisability}; })
  .get(function(error, rows) {
    mentalDB = d3.nest().key(d => d.code).key(d => d.year).entries(rows);
  });

  //Read the json file for the Map
d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson', function(error,data){
  createMapWorld(data)
})

// add tooltip
const tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

//Init Legend
var legend = svg.append("g")
            .attr("id", "legend");

updateYears();
//check event change year
d3.selectAll("input[type=checkbox]").on("change",updateYears);


//Update the years array when the user select the checkboxes
function updateYears(){
  /* CHECK ALL
  var check = d3.selectAll('input').each(function(d){
    if(d3.select(this).attr("type") == "checkbox")
      d3.select(this).node().checked = true;
  });*/

  d3.selectAll('input[type=checkbox]').each(function(d){
      if(d3.select(this).node().checked == true){ //the box is checked add the year to the array
        if(!selectedYears.includes(d3.select(this).node().value)){
          selectedYears.push(d3.select(this).node().value);
        }
      }else{ //the box is unchecked remove the year from the array
        if(selectedYears.includes(d3.select(this).node().value)){
          selectedYears.pop(d3.select(this).node().value);
        }
      }
    });
   console.log(selectedYears);

  colorMap()
}

//Mouse over the Country
function onCountry(d){
  d3.selectAll(".Country")
    .transition()
    .duration(200)
    //.style("opacity", .5)
    .style("stroke", "transparent");
  d3.select(this)
    .transition()
    .duration(200)
    .style("opacity", 1)
    .style("stroke", d3.rgb(d3.select(this).style("fill")).darker());
  tooltip.style("left", (d3.event.pageX + 15) + "px")
    .style("top", (d3.event.pageY - 28) + "px")
    .transition().duration(400)
    .style("opacity", 1)
    .text(d.properties.name);
    //.style("stroke", "black")
}

//Mouse out the country
function outCountry(d){
  d3.selectAll(".Country")
			.transition()
			.duration(200)
			.style("opacity", 1)
			.style("stroke", "transparent")
      //.style("stroke-width", 0.5);
		tooltip.transition().duration(300)
			.style("opacity", 0);
}

//Function for create the Map of the world with TopoJson
function createMapWorld(topo){
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
    .attr('id', function(d){
      return d.id;
    })
    .attr("data-name", function(d) {
			return d.properties.name
		})
    .attr('fill', 'white')
    .style("stroke", "transparent")
    //.style("stroke-width", 0.5)
    .attr("class", function(d){ return "Country" } )
    .style("opacity", .8)
    .on("mouseover", onCountry )
    .on("mouseleave", outCountry)

    colorMap()
}

//Function for coloring the countries respect the queries
function colorMap(){

  var sum = 0 //Sum selected disorder for different years
  var data = [] //set for (key, value) : (Code_Country, Sum_disorder)
  var setSum = d3.map() //Array for all the sum of each country

  mentalDB.forEach((item, i) => {
    //Select the year
    item.values.forEach((item, i) => {
      if(selectedYears.includes(item.key)){
        var disorder = item.values[0];
        //select the disorder
        selectedDisorder.forEach((item, i) => {
          sum = sum + disorder[item]
        });
      }
    });
    setSum.set(item.key, sum)
    data.push(sum)
  });

  //Min and Max values
  var data_sorted = data.sort(d3.ascending)
  var q1 = d3.quantile(data_sorted, .25)
  var median = d3.quantile(data_sorted, .5)
  var q3 = d3.quantile(data_sorted, .75)
  var interQuantileRange = q3 - q1
  max = q1 + 1.5 * interQuantileRange
  minMax = d3.extent(data_sorted);

  var colorScale = d3.scaleQuantile()
                .domain([minMax[0], max])
                .range(['#feebe2','#fbb4b9','#f768a1','#c51b8a','#7a0177']);
  //console.log(colorScale.quantiles())

  setSum.each(function(value, key){
    //For each country we select the path in the map
    var country = d3.select("#map")
                    .selectAll('path')
                    .filter(function(d){
                        return d.id == key;
                      });

    country.attr('fill', function(d){
                return colorScale(value);});
    });

    updateLegend(colorScale)
}

//Function for adding and updating legend
function updateLegend(colorScale){

  //Remove all the part we did befor
  legend.selectAll("g").remove();

  //Append a rectangle to each element
  legend.append("rect")
        .attr("x", 10)
        .attr("y", height - 86)
        .attr("id", "rectLeg")
        .attr("width", 145)
        .attr("height", 80)
        .style("fill", 'white')
        .style('opacity', 0.2)
        .attr("rx", 4);

  var size = 10
  var legendBox = legend.selectAll("g")
                        .data(colorScale.range().map(function(d) {
                              d = colorScale.invertExtent(d);
                              if (d[0] == null) d[0] = minMax[0];
                              if (d[1] == null) d[1] = max;
                              return d;}))
                        .enter()
                        .append("g")
                        .attr("class", "legend");


  //Append a rectangle to each element
  legendBox.append("rect")
          .attr("x", 20)
          .attr("y", function(d, i) {
               return height - (i * size) - 25;
          })
          .attr("id", function(d,i){
            return 'rect_'+ String(colorScale(d[0]));
          })
          .attr("width", size)
          .attr("height", size)
          .style("fill", function(d){ return colorScale(d[0])})


  //Append a text element to each element
  legendBox.append("text")
            .attr("id", function(d,i){
              return 'text_'+ String(Math.round(d[0]));
            })
            .attr("x", 35)
            .attr("y", function(d, i) {
                return height - (i * size) - 16 ;
            })
            .text(function(d, i) {
                if (isNaN(d[1]) || isNaN(d[0])) return;
                if (i === 4) return ">" + Math.round(d[0]);
                //if (d[1] < d[0]) return Math.round(d[0]) + " +";
                return (Math.round(d[0])) + "-" + (Math.round(d[1])-1) ;
            });

  legendBox.append("text")
            .attr("x", 20)
            .attr("y", height - 72)
            .text("POP. WITH DISORDERS");

}
