
// Continent e metti solo i paese di quel continent dentro
var selectView = ['Europe']
var mentalDB = []                                 //Store the dataset
var infoDB = []
var max = 0
var minMaxDisorder;
var clickColor = [];                              //keep track of the click on the color of the legend
var checkLegend = 0;                              //keep track of the click on the legend
var show_population = false;                       //Show bubble map
var show_legend = true
var array_legendPop = [];
var click_countries = 0;
var max_pop, min_pop, pop_data,path, legend, projection,colorScale,max_legend_map;
var heightLegend = 40;
var widthLegend = 214;

var svgMap = d3.select("#map");
var g = svgMap.append("g");
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
        minMaxPop();
        d3.csv('Dataset/Mental_Disorder_sex.csv')
          .row(function(d){
            return {"year": d.Year,
              "code": d.Code,
              "name": d.Entity,
              "male": +d.Male,
              "female": +d.Female};})
          .get(function(error, rows) {
              sex_DB = rows;
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
                    rows_socioDB = rows;
                    draw_chart(YEAR)
                });
          });
    });

function minMaxPop(){
  pop_data = d3.map();
  //Take the info for the selected yaers
  infoDB.forEach((item1, i) => {
      item1.values.forEach((item2, i) => {
        if(item2.key == "Population, total" && item1.key.length != 2){ //We exclude the continent
          var sum = 0;
          var c = YEAR.length;
          YEAR.forEach((item3, i) => {
            sum = sum + item2.values[0][item3]
          });
          sum = sum / c;
          pop_data.set(item1.key, sum);
        }
    })
  });
  max_pop = d3.max(pop_data.values());
  min_pop = d3.min(pop_data.values());
  return pop_data;
}

//Init tooltip
const tooltip_countries = d3.select("#block_container").append("div").attr("class", "tooltip").style("opacity", 0);


var zoom = d3.zoom().scaleExtent([1, 8]).on('zoom', zoomed);

svgMap.call(zoom); // delete this line to disable free zooming

d3.select("#zoom_in").on("click", function() {
  zoom.scaleBy(svgMap.transition().duration(400), 1.2);
});
d3.select("#zoom_out").on("click", function() {
  zoom.scaleBy(svgMap.transition().duration(400), 0.8);
});

function zoomed(){
  svgMap.selectAll('path').attr('transform', d3.event.transform);
  svgMap.selectAll('.circle_population').attr('transform', d3.event.transform);
}


//Make zoom from Countries to World
function zoomContinentToWorld(){
  svgMap.transition()
      .duration(750)
      .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4
}


//Mouse over the Country
function onCountry(d){
  code = d3.select(this).attr("id")
  brush_country = d3.select(this).classed("pc_brushed")
  var continent = d3.select(this).attr("continent")
  var tooltip_string = "<p><strong>"+ d.properties.name + " ("+code +")</strong></p><hr>"
  tooltip_string = tooltip_string + "<p><i>Continent</i>: "+ continent +" &nbsp;</p>";

  if(click_countries == 0 && brushing== '0' && !zoom_cluster){
    d3.selectAll(".Country")
      .style("opacity", .7);
    d3.select(this)
      .style("opacity", 1)
      .style("stroke", "black")
      .style("stroke-width", 1.8)
  }else{
    if(d3.select(this).classed("pc_brushed")== true){
      d3.select(this)
        .style("stroke", "black")
        .style("stroke-width", 1.8)
    }
    d3.select(this)
      .style("stroke", "black")
      .style("stroke-width", 1.8)
  }

  infoDB.forEach((item1, i) => {
    if(item1.key == d.properties.adm0_a3){
      item1.values.forEach((item2, i) => {
        if(item2.key == "Population, total"){
          var sum = 0;
          var c = YEAR.length;
          YEAR.forEach((item3, i) => {
            sum = sum + item2.values[0][item3]
          });
          sum = sum / c;
          tooltip_string = tooltip_string + "<p><i>Population (million)</i>: "+ (sum /1000000) +" &nbsp;</p>";
        }
        if(item2.key == "Current health expenditure (% of GDP)"){
          var sum = 0;
          var c = YEAR.length;
          YEAR.forEach((item3, i) => {
            sum = sum + item2.values[0][item3]
          });
          sum = sum / c;
          tooltip_string = tooltip_string + "<p><i>Health expenditure(% GDP)</i>: "+ sum.toFixed(2) +"%&nbsp;</p>";
        }
      });
    }
  });
  tooltip_string = tooltip_string + "<p><i>Tot. number of disorders</i>: "+ Math.round(d3.select(this).attr("value-disorder")) +"&nbsp;</p>";
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

  //HIGHLIGTH Legend
  if(!ABSOLUTE){
    if(d3.select(this).attr("color-disorder").substring(1) == '670164'){
      d3.select("#rect_"+d3.select(this).attr("color-disorder").substring(1))
        .style('opacity', 1)
        .style('stroke-dasharray', ('0'))
        .style('stroke-width', 1);
    }else{
      d3.selectAll("#rect_"+d3.select(this).attr("color-disorder").substring(1))
        .style("stroke", "black")
        .style('stroke-width', 1);
    }
  }else{
    d3.selectAll("#rect_"+d3.select(this).attr("color-disorder").substring(1))
      .style("stroke", "black")
      .style('stroke-width', 1);
  }

  //color grey all parallel except this one
  d3.select("#my_dataviz").selectAll('path').each(function(t){
    if (d3.select(this).attr("name") != null){
      if(code != d3.select(this).attr("name").trim()){
        d3.select(this).style("stroke", "grey")
      }
    }
  })

  //HIGHLIGTH Pop Bar
  if(brushing == '0'){
    d3.selectAll(".populationBar")
      .style("opacity", 0.4);
    if(d3.select("#populationBar_"+code).node() != null){

      d3.selectAll("#populationBar_"+code)
          .style("opacity", 1);
    }

    if(checkLabelBar == false){
      d3.selectAll("#populationBarText_"+code)
          .style("opacity", 1);
    }
  }else{
    d3.selectAll("#populationBarText_"+code).each(function(d){
      if(brush_country == true){
        d3.select(this).style("opacity", 1);
        changeColorAxes_y(code)
      }
    })

  }

  //HIGHLIGTH Sex Bar
  if(brushing == '0'){
    d3.selectAll(".SexBar")
      .style("opacity", 0.3);
    if(d3.select("#SexBar_"+code).node() != null){

      d3.selectAll("#SexBar_"+code)
          .style("opacity", 1);
    }
  }else{
    d3.selectAll(".SexBar").each(function(d){
      if(code == d.code && brush_country== true){
        console.log(code);
        d3.select(this)
          //.style("stroke-width", 0.5)
          //.style("stroke", "red");
          changeColorAxes_x(code)
        }
    })
  }

  //HIGHLIGTH GDP line
  if(brushing == '0'){
    d3.selectAll(".lineGDP").each(function(d){
      if(code != d.key){
        d3.select(this).style("opacity", 0.2);
      }
    })
    d3.selectAll(".circleGDP").each(function(d){
      if(code != d.code){
        d3.select(this).style("opacity", 0.2);
      }
    })
  }else{
    d3.selectAll(".lineGDP").each(function(d){
      if(code == d.key && brush_country== true){
        d3.select(this)
          .style("stroke-width", 0.8)
          .style("stroke", "red");
      }
    })
    d3.selectAll(".circleGDP").each(function(d){
      if(code == d.code && brush_country== true){
        d3.select(this)
          .style("stroke-width", 0.8)
          .style("stroke", "red");
      }
    })
  }

  //HIGHLIGTH MDS POINTS
  d3.select("#pca-kmeans").selectAll("circle").each(function(d){
    if(!zoom_cluster){
      if(code == d3.select(this).attr("id")){
        d3.select(this).raise().classed("active", true);
        d3.select(this).attr("r","4")
        d3.select(this).style("stroke","white")
        d3.select(this).style("stroke-width", "1")
      }
    }else{
      if(code == d3.select(this).attr("id")){
        d3.select(this).raise().classed("active", true);
        d3.select(this).attr("r",4 / transform.k)
        d3.select(this).style("stroke","white")
        d3.select(this).style("stroke-width", "1")
      }
    }
  })

  d3.select("#chart").selectAll("rect").each(function(d){
    if(code == d3.select(this).attr("id")){
      d3.select(this).style("fill", "#6F257F")
    }
  })
}

//Mouse out the country
function outCountry(d){

  if(click_countries == 0 && brushing=='0' && !zoom_cluster){
    d3.selectAll(".Country")
  			.style("opacity", 1)
        .style("stroke", "#273746")
        .style("stroke-width", .1);

  }else if( click_zoom_country== 1){
    d3.selectAll(".Country")
      .style("stroke-width", .1);
    selected_countries.forEach((item, i) => {
      d3.select("#"+item)
      .style('stroke', "black")
      .style("stroke-width", 1.8);
    });
  }else{
    d3.selectAll(".Country")
      .style("stroke-width", .1);
  }

	tooltip_countries.transition().duration(300)
		  .style("opacity", 0);

  if(checkLabelBar == false){
        d3.selectAll("#populationBarText_"+d3.select(this).attr("id"))
            .style("opacity", 0);
      }

  //color all path on the parallel_coo according its cluster
  svg_PC.selectAll(".path_parallel").style("stroke", function(d1){
    var c;
    d3.select("#pca-kmeans").selectAll("circle").each(function(d2){
      if(d1.Code == d2.Code){
        c = d3.select(this).style("fill");
      }
    })
    return c
  })

  //DE-HIGHLIGTH Pop Bar
  if(brushing == '0' && !zoom_cluster){
  d3.selectAll(".populationBar")
    .style("opacity", 1);
  }else if(brushing =='0' && zoom_cluster){
    d3.selectAll(".populationBar")
      .style("opacity", 1);

      if(checkLabelBar == false){
            d3.selectAll("#populationBarText_"+code)
                .style("opacity", 0);
          }
  }

  //Color white name country
  d3.select("#y_stacked_axis")
    .selectAll("text")
    .style("fill", function(d){
      return "white";
    })

   d3.select("#x_stacked_axis")
     .selectAll("text")
     .style("fill", function(d){
        return "white";
    })

  //DE-HIGHLIGTH Sex Bar
  if(brushing=='0'){
  d3.selectAll(".SexBar")
    .style("opacity", 1);
  }
  //DE-HIGHLIGTH Legend
  if(!ABSOLUTE){
    if(d3.select(this).attr("color-disorder").substring(1) == '670164'){
      d3.select("#rect_"+d3.select(this).attr("color-disorder").substring(1))
        .style('opacity', 1)
        .style('stroke-dasharray', ('2,3'))
        .style('stroke-width', 1);
    }else{
      d3.selectAll("#rect_"+d3.select(this).attr("color-disorder").substring(1))
        .style("stroke", "black")
        .style('stroke-width', 0.1);
    }
  }else{
    d3.selectAll("#rect_"+d3.select(this).attr("color-disorder").substring(1))
      .style("stroke", "black")
      .style('stroke-width', 0.1);
  }

  //DE-HIGHLIGTH GDP line
  if(brushing == '0'){
    d3.selectAll(".lineGDP")
      .style("opacity", 1);
    d3.selectAll(".circleGDP")
      .style("opacity", 1);
  }else{
    d3.selectAll(".lineGDP")
      .style("stroke-width", 1.5)
      .style("stroke", "#bcbcbc");
    d3.selectAll(".circleGDP")
      .style("stroke-width", 1)
      .style("stroke", "#bcbcbc");
  }

  //DE-HIGHLIGTH MDS POINTS
  d3.select("#pca-kmeans").selectAll("circle").each(function(d){
      if(!zoom_cluster){
        if(d3.select(this).classed("pc_brushed") == false && brushing=='1'){
          d3.select(this).attr("r","4")
          d3.select(this).style("stroke-width", "0")
        }else{
          d3.select(this).attr("r","2")
          d3.select(this).style("stroke-width", "0")
        }
      }else{
        if(d3.select(this).classed("pc_brushed") == false && brushing=='1'){
          d3.select(this).attr("r",4 / transform.k)
          d3.select(this).style("stroke-width", "0")
        }else{
          d3.select(this).attr("r",2 / transform.k)
          d3.select(this).style("stroke-width", "0")
        }
      }
    })
    code = d3.select(this).attr("id")
    d3.select("#chart").selectAll("rect").each(function(d){
      if(code == d3.select(this).attr("id")){
        d3.select(this).style("fill", "#bcbcbc")
      }
    })
}


click_zoom_country = 0;
function click_with_zoom(d){
  delete_brush()
  if(list_clusters.includes(d.properties.adm0_a3)){
    if(selected_countries.includes(d.properties.adm0_a3)){
      index = selected_countries.indexOf(d.properties.adm0_a3);
        if (index > -1) {
          selected_countries.splice(index, 1); // 2nd parameter means remove one item only
        }
        d3.select("#"+d.properties.adm0_a3)
        .style("stroke", "black")
        .style("stroke-width", 0.1)
        if(selected_countries.length == 0){
          click_zoom_country = 0;
          COUNTRIES = list_clusters
          highlight_cluster(value_to_zoom)
          d3.selectAll(".populationBar").style("opacity",1)
          return;

      }
    }else{
      d3.select("#"+d.properties.adm0_a3)
      .style("stroke", "black")
      .style("stroke-width", 1.5)
      selected_countries.push(d.properties.adm0_a3)
    }
  }
  draw(YEAR, CMD_CONTINENT, selected_countries, DISORDERS, ABSOLUTE);
  createSexPlot(selected_countries);
  createBarAgePlot(selected_countries);
  createMultilinePlot(selected_countries);

}

var selected_countries;
//Click on the Country
function clickCountry(d){
  if(zoom_cluster){
    if(click_zoom_country == 0){
      selected_countries = []
      click_zoom_country = 1
    }
    click_with_zoom(d);
  }else{
    if(click_countries == 0){ //first click
      delete_brush()
      d3.selectAll("#pca_kmeans").select("circle").style('opacity', 1).attr("r", 2)
      selected_countries = [];
      selected_countries.push(d.properties.adm0_a3)

      d3.selectAll(".Country")
      .style("stroke-width", .1)
      .style('opacity', 0.5);

      d3.select(this)
        //.attr('fill', col)
        .style("stroke-width", .1)
        .style('opacity', 1);

      click_countries = 1;
    }else{
      //Check if the selected_countries is not clicked
      if(!selected_countries.includes(d.properties.adm0_a3)){
        //If we click on 30 couentries we remove the first and add the new
        console.log(d.properties.adm0_a3);
        if(selected_countries.length == 11){
          selected_countries.shift();
        }
        selected_countries.push(d.properties.adm0_a3);

        //Color Countries
        d3.selectAll(".Country")
        .filter(function(d){
          if(!selected_countries.includes(d.properties.adm0_a3)){
              return d;
          }
        })
        .style("stroke-width", .1)
        .style('opacity', 0.5);

        d3.select(this)
          .style("stroke-width", .1)
          .style('opacity', 1);
      }else{ //Second click for remove the country
        index = selected_countries.indexOf(d.properties.adm0_a3);
          if (index > -1) {
            selected_countries.splice(index, 1); // 2nd parameter means remove one item only
          }

          //Color Countries
          d3.selectAll(".Country")
          .filter(function(d){
            if(!selected_countries.includes(d.properties.adm0_a3)){
                return d;
            }
          })
          .style("stroke-width", .1)
          .style('opacity', 0.5);
      }
    }

    if(selected_countries.length == 0){
      click_countries = 0;
      draw_chart(YEAR)
      draw(YEAR, CMD_CONTINENT, COUNTRIES, DISORDERS, ABSOLUTE);
      return;

  }
    //Update other plot
    if(orderby == "disorders"){
      createBarAgePlot(selected_countries)
    }else{
      orderByYears(orderby)
    }

    draw(YEAR, CMD_CONTINENT, selected_countries, DISORDERS, ABSOLUTE);
    createSexPlot(selected_countries);
    createBarAgePlot(selected_countries);
    createMultilinePlot(selected_countries);
  }
}

//Function for create the Map of the world with TopoJson
function createMapWorld(topo){

  //A projection function takes a longitude and latitude co-ordinate
  //(in the form of an array [lon, lat]) and transforms it into an x and y co-ordinate
  var area = widthMap * heightMap
  var scale_map  = area * 0.000475
  projection = d3.geoNaturalEarth1()
    .scale(scale_map)    //scale specifies the scale factor of the projection
    .center([0,20])  //center of projection
    .translate([(widthMap / 2) - 15 , (heightMap / 2)-25]); //where the center of projection is located on the screen

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
      if( d.properties.region_wb == "Latin America & Caribbean"){
        return "South America";
      }
			return d.properties.continent;
		})
    .attr('fill', 'white')
    .style("stroke", "#273746")
    .style("stroke-width", .1)
    .attr("class", function(d){ return "Country" } )
    .attr('fill', '#9aa6ad')
    .style('opacity', 0.7);
  colorMap();
}

var out_countries = [];
//Function for coloring the countries respect the queries
function colorMap(){
  var sum = 0 //Sum selected disorder for different years
  var setSum = d3.map() //Array for all the sum of each country

  d3.csv('Dataset/Mental_Disorder_with_continent.csv')
    .row(function(d) {
      if(ABSOLUTE){
        return {code: d.Code,
          "entity": d.Entity,
          "year": +d.Year,
          "Depressive": (+d.Depressive/pop_data["$"+d.Code])*100000,
          "Anxiety": (+d.Anxiety/pop_data["$"+d.Code])*100000,
          "Bipolar": (+d.Bipolar/pop_data["$"+d.Code])*100000,
          "Eating": (+d.Eating/pop_data["$"+d.Code])*100000,
          "Schizophrenia": (+d.Schizophrenia/pop_data["$"+d.Code])*100000,
          "Attention": (+d.Attention/pop_data["$"+d.Code])*100000,
          "Autism": (+d.Autism/pop_data["$"+d.Code])*100000,
          "Conduct": (+d.Conduct/pop_data["$"+d.Code])*100000,
          "intellectualDisability": (+d.intellectualDisability/pop_data["$"+d.Code])*100000};
      }
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
        "intellectualDisability": +d.intellectualDisability}; })
    .get(function(error, rows) {

      if(click_countries == 0 && click_zoom_country == 0 && !zoom_cluster){
        d3.selectAll(".Country").style("opacity",1)
      }
      mentalDB = d3.nest().key(d => d.code).key(d => d.year).entries(rows);

      mentalDB.forEach((item1, i) => {
        if(item1.key.length == 3){
          sum = 0;
          //Select the year
          item1.values.forEach((item2, i) => {
            if(YEAR.includes(item2.key)){
              var disorder = item2.values[0];
              var c = DISORDERS.length
              var tot = 0
              //select the disorder
              DISORDERS.forEach((item3, i) => {
                //console.log(item3);
                tot = tot + Math.round(disorder[item3]);
              });
              sum = sum + (tot / c)
            }
          });
          setSum.set(item1.key, sum / (YEAR.length));
        }
      });

      //Min and Max values
      var values = setSum.values().sort(d3.ascending)
      result2 = reject_outliers(values, 20)
      outliers = values.filter(x => !result2.includes(x));
      minMaxDisorder = d3.extent(result2);
      colorScale = d3.scaleQuantile()
                    .domain([minMaxDisorder[0], minMaxDisorder[1]])
                    .range(['#fcc5c0','#fa9fb5','#f768a1','#dd3497','#ae017e','#8d018a']);

      setSum.each(function(value, key){
          //For each country we select the path in the map
          d3.selectAll('.Country')
            .filter(function(d){
                  return d.properties.adm0_a3 == key;
            })
            .attr('fill', function(d){
              if(value > result2[result2.length-1]){
                out_countries.push(d.properties.adm0_a3)
                return '#670164';
              }
                  return colorScale(value);
            })
            .attr('value-disorder',value)
            .attr('color-disorder', function(){
              if(value > result2[result2.length-1]) return '#670164';
              return colorScale(value)
            })
            .style("stroke", "#273746")
            .style("stroke-width", .1)
            .style('opacity', function(d){
              if(click_countries == 1 || click_zoom_country == 1){
                if(d3.select(this).attr("fill") == '#9aa6ad') return 0.5;
                if(selected_countries.includes(d.properties.adm0_a3)){
                    return 1;
                }else{
                  return 0.5;
                }
              }
              return 1;})
            .on("mouseover", onCountry)
            .on("mouseleave", outCountry)
            .on("click", clickCountry);
        });
        createLegend();
    });

}

function reject_outliers(x, m){
  var median = d3.median(x);
  var counter = 0
  var temp = [];
  for(var j =0 ; j<x.length; j++){
      temp[counter] = Math.abs(x[j]-median)
      counter = counter + 1;
  }
  mdev = d3.median(temp)
  var temp2 = []
  var counter2 = 0
  for(var j =0 ; j<temp.length; j++){
    if(mdev){
        temp2[counter2] = temp[counter2]/mdev
    }else{
      temp2[counter2] = 0
    }
    counter2 = counter2 + 1;
  }

  var data_sorted = []
  x.forEach((item, i) => {
    if(temp2[i]<m){
      //console.log(item);
      data_sorted.push(item)
    }
  });
  return data_sorted
}

function createLegend(){
  var heightLegend = 40
  var widthLegend = 0.263 * widthMap
  if(ABSOLUTE){
    widthLegend = widthLegend - ((widthLegend*10)/100)
  }

  if(show_population == true){
    heightLegend = heightLegend + heightLegend + 5;
  }

  //Remove all the part we did befor
  d3.selectAll('.legend_map').remove();
  d3.selectAll('.legendBubble').remove();
  d3.selectAll('.circle_legend').remove();
  d3.selectAll('.rectLegendDisorder').remove();

  //Init Legend
  legend = svgMap.append("g")
              .attr("class", "legend_map");

  //Append a rectangle
  legend.append("rect")
        .attr('class', 'legend_map')
        .attr("x", 10)
        .attr("y", function(){
          return heightMap - heightLegend  - 7;
        })
        .attr("id", "rectLeg")
        .attr("width", widthLegend)
        .attr("height", heightLegend)
        .style("fill", 'lightgrey')
        .style('opacity', 0)
        .attr("rx", 4);

  if(show_legend == true){
    updateLegendDisorder();
  }


}

var check_out = 0;
//Function for adding and updating legend
function updateLegendDisorder(){


    var legendBox = legend.selectAll("g")
                          .data(colorScale.range().map(function(d) {
                                d = colorScale.invertExtent(d);
                                if (d[0] == null) d[0] = minMaxDisorder[0];
                                if (d[1] == null) d[1] = minMaxDisorder[1];
                                return d;}))
                          .enter()
                          .append("g")
                          .attr('class', 'legend_map');


    //Append a rectangle to each element
    legendBox.append("rect")
            .attr("class","rectLegendDisorder")
            .attr("x", function(d, i) {
              var x = (i * widthLegend * 0.1308) + 17;
              if(ABSOLUTE) return x + ((x*4)/100)
              return x;
            })
            .attr("y", heightMap - 30)
            .attr("id", function(d,i){
              return 'rect_'+ String(colorScale(d[0])).substring(1);
            })
            .attr("width", function(){
              var x = widthLegend * 0.1308;
              if(ABSOLUTE) return x + ((x*4)/100)
              return x;
            })
            .attr("height", 8.5)
            .on('mouseover', onLegendDisorder)
            .on('mouseleave', outLegendDisorder)
            //.on('click', clickLegendDisorder)
            .style("fill", function(d){ return colorScale(d[0])})


    //Append a text element to each element
    legendBox.append("text")
              .attr("id", function(d,i){
                return 'text_'+ String(Math.round(d[0]));
              })
              .attr("x",  function(d, i) {
                var x = (i *((widthLegend * 0.1308)-1) ) + 17;
                if(ABSOLUTE) return x + ((x*3.5)/100)
                return x;
              })
              .attr("y", heightMap - 13)
              .text(function(d, i) {
                  if (isNaN(d[1]) || isNaN(d[0])) return;
                  if (i == 5){
                    val = nFormatter(Math.round(d[0]),1)//+' '.repeat(6)+ nFormatter(Math.round(d[1]),1)
                     return val;
                   }
                  var res = nFormatter(Math.round(d[0]),1)
                  if(String(nFormatter(Math.round(d[0]),1)).length > 4){
                    res = nFormatter(Math.round(d[0]),0)
                  }
                  return res;
            })
            .style("font-size", "7.5px");

    legendBox.append("text")
              .attr("x", function(){
                var x = (widthLegend * 0.3037);
                if(ABSOLUTE) return x - ((x*3.5)/100);
                return x})
              .attr("y", heightMap - 35)
              .text("NUMBER OF DISORDERS");

    if(!ABSOLUTE){

      //Append a rectangle to each element
      svgMap.append("rect")
              .attr("class","rectLegendDisorder")
              .attr("x", function(d, i) {
                return widthLegend- widthLegend/8;
              })
              .attr("y", heightMap - 30)
              .attr("id", function(d,i){
                return 'rect_'+ String(670164);
              })
              .attr("width", function(){
                var x = widthLegend * 0.1308;
                return x;
              })
              .attr("height", 8.5)
              .style('stroke-dasharray', ('2,3'))
              .style('stroke', '#ffd92f')
              //.on('click', clickLegendDisorder)
              .style("fill", function(d){ return "#670164"})
              .on('mouseover', onLegendDisorder)
              .on('mouseleave', outLegendDisorder)
              .on('click', function(d){
                if(check_out == 0){
                   check_out = 1;
                }
                else{
                  check_out = 0;
                }
                zoom_cluster = false
                zoomCluster("0",false, zoom_cluster)
                colorMap()
                draw_chart(YEAR)
              })


      //Append a text element to each element
      legendBox.append("text")
                .attr("id", function(d,i){
                  return 'text_'+ String(Math.round(minMaxDisorder[1]));
                })
                .attr("x", widthLegend - (widthLegend*3/100))
                .attr("y", heightMap - 13)
                .text(nFormatter(Math.round(max_pop),0))
              .style("font-size", "7.5px");

    }
    legendBox.append("text")
      .attr("x", widthLegend - (widthLegend*15/100))
      .attr("y",  heightMap - 13)
      .attr("fill", "black")
      .text(nFormatter(Math.round(minMaxDisorder[1]),1))
      .style("font-size","7.5px")

}


//Select only the countries with the selected color
function clickLegendDisorder(){

  //Color selected on the legend
  var colorLegend = d3.select(this).style('fill');

  if(checkLegend == 0){ //First time on the legend , enlighten only the selected color
    COUNTRIES = []
    checkLegend = 1;
    clickColor.push(colorLegend);
    d3.selectAll('.Country')
      .each((item, i) => {
        var color = d3.rgb(d3.select('#'+item.properties.adm0_a3).attr('color-disorder')).toString();
        var name = d3.select('#'+item.properties.adm0_a3).attr('name');    //// TODO: change with code, also in draw
        if(color != colorLegend){
          d3.select('#'+item.properties.adm0_a3)
            .attr('fill', '#9aa6ad')
            .style('opacity', 1);
        }else{
          COUNTRIES.push(name);
        }
      });
      draw(YEAR, CMD_CONTINENT, COUNTRIES, DISORDERS, ABSOLUTE);
      createBarAgePlot(COUNTRIES);
      createSexPlot(COUNTRIES);
  }else{ //I already clicked on the legend

    if(clickColor.includes(colorLegend.toString())){ //I have alredy clicked on this color and make that countries grey

      //remove specific element
      var index = clickColor.indexOf(colorLegend.toString());
      clickColor.splice(index,1)
      d3.selectAll('.Country')
        .each((item, i) => {
          var color = d3.rgb(d3.select('#'+item.properties.adm0_a3).attr('color-disorder')).toString();
          var name = d3.select('#'+item.properties.adm0_a3).attr('name');
          if(color == colorLegend){
            d3.select('#'+item.properties.adm0_a3)
              .attr('fill', '#9aa6ad')
              .style('opacity', 1);
              index = COUNTRIES.indexOf(name);
                if (index > -1) {
                  COUNTRIES.splice(index, 1); // 2nd parameter means remove one item only
                }
          }
        });
        draw(YEAR, CMD_CONTINENT, COUNTRIES, DISORDERS, ABSOLUTE)
        createBarAgePlot(COUNTRIES);
        createSexPlot(COUNTRIES);
    }else{ // I never clicked on that and we  enlighten that countries
      clickColor.push(colorLegend)
      d3.selectAll('.Country')
        .each((item, i) => {
          var color = d3.rgb(d3.select('#'+item.properties.adm0_a3).attr('color-disorder'));
          var name = d3.select('#'+item.properties.adm0_a3).attr('name');
          if(color.toString() == colorLegend){
            d3.select('#'+item.properties.adm0_a3)
              .attr('fill', color)
              .style('opacity', 1);
              COUNTRIES.push(name);
          }
        });
        draw(YEAR, CMD_CONTINENT, COUNTRIES, DISORDERS, ABSOLUTE)
        createBarAgePlot(COUNTRIES);
        createSexPlot(COUNTRIES);
    }
  }
  if(clickColor.length == 7){ //Select all the color on the legend and we restart from zero
    //SELECT ALL
    checkLegend = 0;
    clickColor = [];
    //Color the countries not in the dataset white
    d3.selectAll('.Country')
      .filter(function(d){ return d3.select('#'+d.properties.adm0_a3).attr('fill') == '#9aa6ad'})
      .attr('fill', '#9aa6ad')
      .style('opacity', 1);
  }
}


//Lightning the country with the selected color
function onLegendDisorder(){
  if(click_countries == 0 && brushing=='0' && !zoom_cluster){
    d3.selectAll('.Country')
      .style('opacity', .8)
  }else if(brushing=='0' && zoom_cluster){
    code_Notcluster.style('opacity', .5)
  }


  if(click_zoom_country == 1){
    d3.selectAll('.Country')
      .style('stroke', "black")
      .style("stroke-width", .1);
  }
//this is only for country - visualization=0, for continent?
  var list_country = []
  d3.selectAll('.Country')
    .each((item, i) => {
      color = d3.select('#'+item.properties.adm0_a3).style('fill');
      code = d3.select('#'+ item.properties.adm0_a3).attr('id');

      if(color == d3.select(this).style('fill')){
          list_country.push(code)
          if(click_countries == 0 && brushing=='0' && !zoom_cluster){
            d3.select('#'+item.properties.adm0_a3)
              .style('opacity', 1)
          }

          if( d3.select('#'+item.properties.adm0_a3).style('opacity') == 1){
            d3.select('#'+item.properties.adm0_a3)
              .style('stroke', "black")
              .style("stroke-width", 1.8);

          }

        }
    });

    d3.select("#my_dataviz").selectAll('path').each(function(t){
        if(d3.select(this).attr("name") != null){
          if(!list_country.includes(d3.select(this).attr("name"))){
            d3.select(this).style("stroke", "grey")
          }
        }
    })

  if(d3.select(this).attr("id") == "rect_670164"){
    d3.select(this)
      .style('opacity', 1)
      .style('stroke-dasharray', ('0'))
      .style('stroke-width', 1);
    }else{
      d3.select(this)
        .style('opacity', 1)
        .style('stroke-width', 1);
    }
}

//Deselect the country with the selected color
function outLegendDisorder(){

    if(d3.select(this).attr("id") == "rect_670164"){
      d3.select(this)
        .style('opacity', 1)
        .style('stroke-dasharray', ('2,3'))
        .style('stroke', '#ffd92f');
      }else{
        d3.select(this)
          .style('opacity', 1)
          .style('stroke-width', 0.1);
      }

      if(click_countries == 0 && brushing=='0' && !zoom_cluster){
        d3.selectAll(".Country")
          .style('opacity', 1)
      }else if (click_countries == 0 && click_zoom_country == 0 && brushing=='0' && zoom_cluster) {
        code_cluster.style("stroke", "black")
                    .style("stroke-width",  .1);
        code_Notcluster
            .style("opacity",'0.5')
            .style("stroke", "#273746")
            .style("stroke-width", .1);
      }

      if(click_zoom_country == 1 &&brushing=='1' ){
        d3.selectAll('.Country')
          .style('stroke-width', 0.1);
        }

      if(click_zoom_country == 1 && brushing=='0' ){
        code_cluster.style("stroke", "black")
                    .style("stroke-width",  .1);
        code_Notcluster
            .style("opacity",'0.5')
            .style("stroke", "#273746")
            .style("stroke-width", .1);
        selected_countries.forEach((item, i) => {
          d3.select("#"+item)
          .style('stroke', "black")
          .style("stroke-width", 1.8);
        });


      }

      if(!zoom_cluster){
      d3.selectAll(".Country")
        .style("stroke", "#273746")
        .style("stroke-width", .1);
      }
      //color blue parallel_coo
      svg_PC.selectAll(".path_parallel").style("stroke", function(d1){
        var c;
        d3.select("#pca-kmeans").selectAll("circle").each(function(d2){
          if(d1.Code == d2.Code){
            c = d3.select(this).style("fill");
          }
        })
        return c
      })
}

function nFormatter(num, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

var code_Notcluster = []
var code_cluster = []
var list_clusters = []
function highlight_cluster(value){
  //click_countries = 0
  d3.selectAll(".Country")
    .style("stroke-width",.1)
    if(brushing == '0'){
      d3.selectAll(".Country")
        .style("opacity",1)
    }else{
      d3.selectAll('.Country').each(function(d){
        if(d3.select(this).classed("pc_brushed")== true){
          console.log("igiuhiu");
          d3.select(this)
            .style('opacity', 1)
        }
      })
    }

    if(brushing=='0'){
      value = value -1
      list_clusters = []
      code_cluster = []
      code_Notcluster = []
      if(value != -1){
        console.log(value);
        d3.select("#pca-kmeans").selectAll("circle").each(function(d){
          //console.log((d3.select(this).attr("class").split(" "))[0]);
          if((d3.select(this).attr("class").split(" "))[0] == "cluster"+value){
            list_clusters.push(d3.select(this).attr("id"))
          }
        })
        console.log(list_clusters);
         code_cluster = d3.selectAll(".Country").filter(function(d){
          return list_clusters.includes(d3.select('#'+d.properties.adm0_a3).attr('id'));
        })

         code_Notcluster = d3.selectAll(".Country").filter(function(d){
          return !list_clusters.includes(d3.select('#'+d.properties.adm0_a3).attr('id'));
        })
        console.log(code_cluster);

        /*code_cluster.style("stroke", "black")
                    .style("stroke-width",  1.05);*/

        code_Notcluster.style("opacity",'0.5')
      }
  }

  COUNTRIES = []
        code_cluster.each(function(d){
          COUNTRIES.push(d.properties.adm0_a3)
        });
        draw_chart(YEAR);
}
