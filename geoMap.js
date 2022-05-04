// Seleziona e fai zoom solo su un continente
// Passi sopra a un paese info
//confronta colori

var selectView = ['Europe']
var selectedDisorder = ['Eating']                 //Selected disorders
var selectedYears = ['2019']                            //Selected years
var mentalDB = []                                 //Store the dataset
var infoDB = []
var max = 0
var minMax = 0
var clickColor = [];                              //keep track of the click on the color of the legend
var checkLegend = 0;                              //keep track of the click on the legend
var show_population = false;                       //Show bubble map
var path;
var legend;
var projection;


var svg = d3.select("#map");
var g = svg.append("g");
widthMap = document.getElementById("map").clientWidth,
heightMap = document.getElementById("map").clientHeight;

//Load file geojson
d3.json('Dataset/Mediumcustom.geo.json', function(error,data){
  createMapWorld(data)
})

//Get the dataBase in the variable mentalDB
d3.csv('Dataset/cleaned_dataset4.csv')
  .row(function(d){ return {"code": d.Code,
      "series": d.Series,
      "name": d.Name,
      "2010": +d.year10,
      "2011": +d.year11,
      "2012": +d.year12,
      "2013": +d.year13,
      "2014": +d.year14,
      "2015": +d.year15,
      "2016": +d.year16,
      "2017": +d.year17,
      "2018": +d.year18,
      "2019": +d.year19};})
  .get(function(error, rows) {
        infoDB = d3.nest().key(d => d.code).key(d => d.series).entries(rows);
    });

//Init tooltip
const tooltip_countries = d3.select("#geoView").append("div").attr("class", "tooltip").style("opacity", 0);

//check event change year
//updateYears();
//d3.selectAll("input[type=checkbox]").on("change",updateYears);

//d3.selectAll("button").on("click",zoomWorldToContinent);
var zoom = d3.zoom().scaleExtent([1, 8]).on('zoom', zoomed);

svg.call(zoom); // delete this line to disable free zooming

d3.select("#zoom_in").on("click", function() {
  zoom.scaleBy(svg.transition().duration(400), 1.2);
});
d3.select("#zoom_out").on("click", function() {
  zoom.scaleBy(svg.transition().duration(400), 0.8);
});

function zoomed(){
  svg.selectAll('path').attr('transform', d3.event.transform);
  svg.selectAll('.circle_population').attr('transform', d3.event.transform);
}

//d3.select("#continent_zoom").on("click", zoomWorldToContinent);

//Make zoom from World to Continent
function zoomWorldToContinent1(){

  var continent =[]
   d3.selectAll('.Country')
   .each((item, i) => {
     if(item.properties.continent == "Africa"){
       continent.push(d3.select('#'+item.properties.adm0_a3).node());
     }
   });
   //console.log(continent);

  var data = []
  d3.select("#map")
    .attr("transform", function() {
      var bBox = this.getBBox();
      /*
      svg.append("rect")
            .attr("x", bBox.x)
            .attr("y", bBox.y)
            .attr("width", bBox.width)
            .attr("height", bBox.height)
            .style("stroke", 'red')
            .style('opacity', 1);*/
      var x = 350
      var y = 215
      var width_box = 90
      var height_box = 180
      var scale = Math.max(1, Math.min(8, 0.9 / Math.max(width_box / width, height_box / height)));
      var translate = [width / 2 - scale * x , height / 2 - scale * y];
      console.log(scale);
      console.log(translate);

      svg.transition()
          .duration(750)
          .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) ); // updated for d3 v4
      //return "translate(" + 0 + ','+ 0 + ") scale(0.4)";
    });

}

function zoomWorldToContinent(country){
  d3.csv('Dataset/countries.csv',  function(error,data){
    data.forEach((item, i) => {
      if(item.name == 'Fiji'){
        var p = projection([item.longitude,item.latitude]);

        svg.append("rect")
              .attr("x",p[0])
              .attr("y", p[1])
              .attr('width', 10)
              .attr("height", 10)
              .style("stroke", 'red')
              .style('opacity', 1);

        var centroid = [p[0], p[1]],
        zoomX = - centroid[0] + 50 ,
        zoomY = - centroid[1]  + heightMap / 2 - 100 ;

        console.log(zoomX);
        console.log(zoomY);
        //africa            [+ 100, 0 ]
        //america nord      [250, 100 ]

        svg.transition()
            .duration(750)
            .call( zoom.transform, d3.zoomIdentity.translate(zoomX,zoomY).scale(1.8) ); // updated for d3 v4

      }
    });
  });
}

//Make zoom from Continet to World
function zoomContinentToWorld(){
  svg.transition()
      .duration(750)
      // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
      .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4
}

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
          selectedYears.pop(d3.select(this).node().value); //NON FUNZIONA POP rimuove l'ultimo anno e non quello
        }
      }
    });
   console.log(selectedYears);

  colorMap()
}

//Mouse over the Country
function onCountry(d){

  var tooltip_string = "<p><strong>"+ d.properties.name +"</strong></p><hr>"

    d3.selectAll(".Country")
      .style("opacity", .8);
    d3.select(this)
      .style("opacity", 1)
      .style("stroke-width", 1.05)
      //.style("stroke", d3.rgb(d3.select(this).style("fill")).darker());
      .style("stroke", "black");

    infoDB.forEach((item, i) => {
      if(item.key == d.properties.adm0_a3){
        item.values.forEach((item, i) => {
          if(item.key == "Population, total"){
            tooltip_string = tooltip_string + "<p>Population(total): "+ item.values[0]["2019"] +"&nbsp;</p>";
          }
          if(item.key == "Current health expenditure (% of GDP)"){
            tooltip_string = tooltip_string + "<p>Health expenditure(% GDP): "+ item.values[0]["2019"] +"&nbsp;</p>";
          }
        });
      }
    });

    mentalDB.forEach((item1, i) => {
      if(item1.key == this.id){
        item1.values.forEach((item2, i) => {
          if(selectedYears.includes(item2.key)){
            selectedDisorder.forEach((item3, i) => {
              tooltip_string = tooltip_string + "<p>"+item3+" Disorder: "+ item2.values[0][item3] +"&nbsp;</p>";
            });
          }
        });
      }
    });


    // create a tooltip
    tooltip_countries.style("position", "absolute")
            .style("background-color", "lightgrey")
            .style("border-radius", "5px")
            .html(tooltip_string)
            .attr( 'x', 20000)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
            .transition()
            .duration(400)
            .style("opacity", 0.9);

}

//Mouse out the country
function outCountry(d){
    d3.selectAll(".Country")
  			.style("opacity", 1)
        .style("stroke", "#273746")
        .style("stroke-width", .1);
  	tooltip_countries.transition().duration(300)
  		  .style("opacity", 0);
}

//Function for create the Map of the world with TopoJson
function createMapWorld(topo){

  //A projection function takes a longitude and latitude co-ordinate
  //(in the form of an array [lon, lat]) and transforms it into an x and y co-ordinate
  projection = d3.geoNaturalEarth1()
    .scale((heightMap / 2)-40)    //scale specifies the scale factor of the projection
    .center([0,20])  //center of projection
    .translate([(widthMap / 2) - 50 , (heightMap / 2)-25]); //where the center of projection is located on the screen

  path = d3.geoPath().projection(projection);

  // Draw the map
  g.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("g")
    .append("path")
    .attr("d", path)
    .attr('id', function(d){
      return d.properties.adm0_a3;
    })
    .attr("name", function(d) {
			return d.properties.name
		})
    .attr("continent", function(d) {
			return d.properties.continent
		})
    .attr('fill', 'white')
    .style("stroke", "#273746")
    .style("stroke-width", .1)
    .attr("class", function(d){ return "Country" } )
    .attr('fill', '#797D7F')
    .style('opacity', 0.7);

  showPopulation(show_population);
  colorMap()
}

//Function for coloring the countries respect the queries
function colorMap(){
  var sum = 0 //Sum selected disorder for different years
  var dict_countries = [] //set for (key, value) : (Code_Country, Sum_disorder)
  var setSum = d3.map() //Array for all the sum of each country

  d3.csv('Dataset/Mental_Disorder_with_continent.csv')
    .row(function(d) {
      return {code: d.Code,
        "entity": d.Entity,
        "year": +d.Year,
        "Depressive": +d.Depressive,
        "Anxiety": +d.Anxiety,
        "Bipolar": +d.Bipolar,
        "Eating": +d.Eating,
        "Schizophrenia": +d.Schizophrenia,
        "Attention": +d.Attention,
        "Autism": +d.Autism,
        "Conduct": +d.Conduct,
        "IntellectualDisability": +d.intellectualDisability}; })
    .get(function(error, rows) {

      mentalDB = d3.nest().key(d => d.code).key(d => d.year).entries(rows);
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
        dict_countries.push(sum)
      });

      //Min and Max values
      var data_sorted = dict_countries.sort(d3.ascending)
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
          d3.selectAll('.Country')
            .filter(function(d){
                  return d.properties.adm0_a3 == key;
            })
            .attr('fill', function(d){
                  return colorScale(value);
            })
            .attr('color-disorder', colorScale(value))
            .style("stroke", "#273746")
            .style("stroke-width", .1)
            .style('opacity', 1)
            .on("mouseover", onCountry )
            .on("mouseleave", outCountry);
        });
      updateLegendDisorder(colorScale);
    });

}

//Function for adding and updating legend
function updateLegendDisorder(colorScale){

  //Init Legend
  legend = svg.append("g")
              .attr("id", "legend");


  var heightLegend = 80
  var widthLegend = 145

  //Remove all the part we did befor
  //legend.selectAll("g").remove();

  //Append a rectangle
  legend.append("rect")
        .attr("x", 10)
        .attr("y", heightMap - 86)
        .attr("id", "rectLeg")
        .attr("width", widthLegend)
        .attr("height", heightLegend)
        .style("fill", '#B2BABB')
        .style('opacity', 1)
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
               return heightMap - (i * size) - 25;
          })
          .attr("id", function(d,i){
            return 'rect_'+ String(colorScale(d[0]));
          })
          .attr("width", size)
          .attr("height", size)
          .on('mouseover', onLegendDisorder)
          .on('mouseleave', outLegendDisorder)
          .on('click', clickLegendDisorder)
          .style("fill", function(d){ return colorScale(d[0])})


  //Append a text element to each element
  legendBox.append("text")
            .attr("id", function(d,i){
              return 'text_'+ String(Math.round(d[0]));
            })
            .attr("x", 35)
            .attr("y", function(d, i) {
                return heightMap - (i * size) - 16 ;
            })
            .text(function(d, i) {
                if (isNaN(d[1]) || isNaN(d[0])) return;
                if (i === 4) return ">" + Math.round(d[0]);
                //if (d[1] < d[0]) return Math.round(d[0]) + " +";
                return (Math.round(d[0])) + "-" + (Math.round(d[1])-1) ;
          });

  legendBox.append("text")
            .attr("x", 20)
            .attr("y", heightMap - 72)
            .text("POP. WITH DISORDERS");

}

//TODO: Tasto select all
//Select only the countries with the selected color
function clickLegendDisorder(){
  //Color selected on the legend
  var colorLegend = d3.select(this).style('fill');

  if(checkLegend == 0){ //First time on the legend , enlighten only the selected color
    checkLegend = 1;
    clickColor.push(colorLegend);
    console.log(clickColor);
    d3.selectAll('.Country')
      .each((item, i) => {
        var color = d3.rgb(d3.select('#'+item.properties.adm0_a3).attr('color-disorder')).toString();
        if(color != colorLegend){
          d3.select('#'+item.properties.adm0_a3)
            .attr('fill', '#797D7F')
            .style('opacity', 1);
        }
      });
  }else{ //I already clicked on the legend

    if(clickColor.includes(colorLegend.toString())){ //I have alredy clicked on this color and make that countries grey

      //remove specific element
      var index = clickColor.indexOf(colorLegend.toString());
      clickColor.splice(index,1)
      console.log(clickColor);
      d3.selectAll('.Country')
        .each((item, i) => {
          var color = d3.rgb(d3.select('#'+item.properties.adm0_a3).attr('color-disorder')).toString();
          if(color == colorLegend){
            d3.select('#'+item.properties.adm0_a3)
              .attr('fill', '#797D7F')
              .style('opacity', 1);
          }
        });
    }else{ // I never clicked on that and we  enlighten that countries
      clickColor.push(colorLegend)
      console.log(clickColor);
      d3.selectAll('.Country')
        .each((item, i) => {
          var color = d3.rgb(d3.select('#'+item.properties.adm0_a3).attr('color-disorder'));
          if(color.toString() == colorLegend){
            d3.select('#'+item.properties.adm0_a3)
              .attr('fill', color)
              .style('opacity', 1);
          }
        });
    }
  }
  if(clickColor.length == 5){ //Select all the color on the legend and we restart from zero
    //SELECT ALL
    checkLegend = 0;
    clickColor = [];
    console.log(clickColor);
    //Color the countries not in the dataset white
    d3.selectAll('.Country')
      .filter(function(d){ return d3.select('#'+d.properties.adm0_a3).attr('fill') == '#797D7F'})
      .attr('fill', '#797D7F')
      .style('opacity', 1);
  }
}

//Lightning the country with the selected color
function onLegendDisorder(){

  d3.select(this)
    .style('stroke-width', 1);

  d3.selectAll('.Country')
    .each((item, i) => {
      color = d3.select('#'+item.properties.adm0_a3).style('fill');

      if(color == d3.select(this).style('fill')){
        d3.select('#'+item.properties.adm0_a3)
          .style('stroke', "black")
          .style('stroke-width', 1.05);
      }
    });
}

//Deselect the country with the selected color
function outLegendDisorder(){

    d3.select(this)
      .style('stroke-width', 0.1);

    d3.selectAll(".Country")
    .style("stroke", "#273746")
    .style("stroke-width", .1);

}

//Create bubble map over the map for showing the population
function showPopulation(show_population){
  var setPop = d3.map()

  //Take the info for the selected yaers
  infoDB.forEach((item1, i) => {
      item1.values.forEach((item2, i) => {
        if(item2.key == "Population, total" && item1.key.length!=2){ //We exclude the continent
          setPop.set(item1.key, item2.values[0]["2019"]);
        }
    })
  });

  var max_pop = d3.max(setPop.values());
  var min_pop = d3.min(setPop.values());

  let sqrtScale = d3.scaleSqrt()
                    .domain([min_pop, max_pop])
                    .range([2, 21]);

  //For each countries we use a dataset with the [lon,lat] of each countries for drawing the circle for the population
  d3.csv('Dataset/countries.csv',  function(error,data){
    data.forEach((item, i) => {
      var p = projection([item.longitude,item.latitude]);
      if(show_population == true){
          d3.selectAll('.Country')
            .each(function(d){
              if(item.name == d.properties.name){
                var pop_country = setPop.get(this.id)
                var r= sqrtScale(pop_country);

              g.append('g')
                .append('circle')
                .attr('cx',p[0])
                .attr('cy',p[1])
                .attr('class', 'circle_population')
                .attr('r', function(d){
                     if(isNaN(r)){
                       return 0;
                     }else{
                       return r;
                     }
                   })
                .style('opacity', 0.7)
                .attr('circle_countries', d.properties.name)
                .attr('number_pop', pop_country)
                .attr('fill', '#7fbc41')
                .style("stroke", 'trasparent')
                .on('mouseover', onCirclePopulation)
                .on('mouseleave', outCirclePopulation);
              }
            });
          legendBubble(min_pop, max_pop, sqrtScale);
        }
    });
  });

}

//Show and handle the legend of the population
function legendBubble(min_pop, max_pop, sqrtScale){

  //Init Legend
  var legend = svg.append("g")
              .attr("id", "legendBubble");

  var result = [],
      parts = 5,
      c = min_pop,
      delta = (max_pop - min_pop) / (parts - 1);
  while (c < max_pop) {
      result.push(c);
      c += delta;
  }
  result.push(max_pop);

  //Append a rectangle
  legend.append("rect")
        .attr("x", widthMap - 95)
        .attr("y", 5)
        .attr("id", "rectLegPop")
        .attr("width", 90)
        .attr("height", 200)
        .style("fill", '#B2BABB')
        .style('opacity', 0.8)
        .attr("rx", 4);

  var legendBox = legend.selectAll("g")
                        .data(result.sort(d3.descending))
                        .enter()
                        .append("g")
                        .attr("class", "legendBubble");


  //Append a rectangle to each element
  legendBox.append("circle")
          .attr("cx", widthMap - 65)
          .attr("cy", function(d, i) {
               return (i % 5) * 40 - (i*i) + 50;
          })
          .attr('value-circle', function(d){ return d;})
          .attr("r", function(d){ return sqrtScale(d);})
          .style("fill", '#7fbc41')
          .style("stroke", 'black')
          .style("stroke-width", .2)
          .on('mouseover', function(d){
            d3.select(this)
              .style("stroke-width", 1);


            d3.selectAll('.circle_population')
            .nodes()
            .forEach((item, i) => {
              var pop = d3.select(item).attr('number_pop');
              if(d3.select(this).attr('value-circle')==result[0]){
                if(pop >= result[1]){
                  d3.select(item)
                    .style("opacity", 1)
                    .style("stroke-width", 1.05)
                    .style("stroke", 'black');
                }
              }else if(d3.select(this).attr('value-circle')==result[1]){
                if(pop < result[1] && pop >= result[2]){
                  d3.select(item)
                    .style("opacity", 1)
                    .style("stroke-width", 1.05)
                    .style("stroke", 'black');
                }
              }else if(d3.select(this).attr('value-circle')==result[2]){
                if(pop < result[2] && pop >= result[3]){
                  d3.select(item)
                    .style("opacity", 1)
                    .style("stroke-width", 1.05)
                    .style("stroke", 'black');
                }
              }else if(d3.select(this).attr('value-circle')==result[3]){
                if(pop < result[3] && pop >= result[4]){
                  d3.select(item)
                    .style("opacity", 1)
                    .style("stroke-width", 1.05)
                    .style("stroke", 'black');
                }
              }else{
                if(pop == result[3] && pop >= result[4]){
                  d3.select(item)
                    .style("opacity", 1)
                    .style("stroke-width", 1.05)
                    .style("stroke", 'black');
                }
              }
            })
          })
          .on('mouseleave', function(){
            d3.select(this)
              .style("stroke-width", 0.2);
              d3.selectAll('.circle_population')
              .nodes()
              .forEach((item, i) => {
                  d3.select(item)
                    .style("opacity", 0.7)
                    .style("stroke-width", 0)
                    .style("stroke", 'trasparent');

              })
          });

  //Append a text element to each element
  legendBox.append("text")
            .attr("x", widthMap - 30)
            .attr("y", function(d, i) {
                return (i % 5) * 40 - (i*i) +50 ;
            })
            .text('1M');

  legendBox.append("text")
            .attr("x", widthMap - 90)
            .attr("y", 20)
            .text("POPULATION");
}

//Mouse over circle of bubble map
function onCirclePopulation(d){

  d3.select(this)
    .style("opacity", 1)
    .style("stroke-width", 1.05)
    .style("stroke", d3.rgb(d3.select(this).style("fill")).darker());
    //.style("stroke", "black");

    // create a tooltip
  tooltip_countries.style("position", "absolute")
        .style("background-color", "lightgrey")
        .style("border-radius", "5px")
        .text(d3.select(this).attr('circle_countries'))
        .attr( 'x', 20000)
        .style("left", (d3.event.pageX + 15) + "px")
        .style("top", (d3.event.pageY - 28) + "px")
        .transition()
        .duration(400)
        .style("opacity", 0.9);

}

//Muose leaves circle of bubble map
function outCirclePopulation(){

  d3.select(this)
    .style("opacity", 0.7)
    .style("stroke-width", 0)
    .style("stroke", 'trasparent');
    //.style("stroke", "black");
    tooltip_countries.transition().duration(300)
        .style("opacity", 0);

}
