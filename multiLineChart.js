// set the dimensions and margins of the graph
var widthTime =  document.getElementById("timePlot").clientWidth,
    heightTime = document.getElementById("timePlot").clientHeight;

var xScaleYears, parseTime,yScaleGDP;

// append the svgBar object to the body of the page
var svgTime = d3.select("#timePlot")
          .attr("width", widthTime)
          .attr("height", heightTime);


function createMultilinePlot(countries){

  if(click_countries == 1 || click_zoom_country == 1){
    countries = selected_countries
  }

    svgTime.selectAll('g').remove();
    svgTime.selectAll(".lineGDP").remove();
    svgTime.selectAll(".circleGDP").remove();


    var groupDataTime = rows_socioDB.filter(function(d){
      if(countries.includes(d.code)){
          return d.code ;
      }
    });

    //format the year
    parseTime = d3.timeParse("%Y");

    //scale xAxis
    var xExtent = d3.extent(groupDataTime, d => parseTime(d.year));
    xScaleYears = d3.scaleTime()
                    .domain(xExtent)
                    .range([0, widthTime - widthTime/9]);

    //scale yAxis
    var yMax= d3.max(groupDataTime,d=>d.gdp)
    yScaleGDP = d3.scaleLinear()
                      .domain([0, d3.max(groupDataTime,d=>d.gdp)]).nice()
                      .range([heightTime - 48, 0])


    //draw xAxis and xAxis label
    xAxisYears = d3.axisBottom()
                  .scale(xScaleYears)
                  .tickFormat(d3.timeFormat("%Y"));

    svgTime.append("g")
          .attr("class", "axis")
          .attr("id", "axisGDP")
          .attr("transform", "translate(48," + (heightTime -25) + ")")
          .call(xAxisYears)

    //yAxis and yAxis label
    yAxisGDP = d3.axisLeft()
                  .scale(yScaleGDP)

    svgTime.append("g")
            .attr("class", "axis")
            .attr("id", "axisGDP")
            .attr("transform", "translate(48, 25)") //use variable in translate
            .call(yAxisGDP)
            .append("text")
            .attr("x", 2)
            .attr("y", -12)
            .attr("dy", "0.32em")
            .attr("fill", "white")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Current health expenditure (% of GDP)");

    //use .nest()function to group data so the line can be computed for each group
    var sumData = d3.nest()
                  .key(d => d.code)
                  .entries(groupDataTime);

    svgTime.selectAll(".line")
            .append("g")
            .data(sumData)
            .enter()
            .append("path")
            .attr("d", function (d) {
                return d3.line()
                .x(d => xScaleYears(parseTime(d.year)))
                .y(d => yScaleGDP(+d.gdp)).curve(d3.curveCardinal)
                  (d.values)
            })
            .attr("class", "lineGDP")
            .attr("id", function(d){return d.key+"_lineGDP";})
            .attr("name", function(d){return d.values[0].name;})
            .attr("fill", "none")
            .attr("stroke", "#bcbcbc")
            .attr("stroke-width", 1.5 )
            .attr("opacity", "0.8")
            .attr("transform", "translate(48, 25)")
            .on("mouseover", onLineGDP)
            .on("mouseout", outLineGDP);

      //Append circle
      var createCircle = function(){
          svgTime.selectAll(".circleGDP").remove();
          svgTime.selectAll("circle")
            .append("g")
            .data(groupDataTime)
            .enter()
            .append("circle")
            .attr("r", 0)
            .attr("cx", d => xScaleYears(parseTime(d.year)))
            .attr("cy", d => yScaleGDP(+d.gdp))
            .attr("class", "circleGDP")
            .attr("id", function(d){
              return d.code+"_circleGDP";})
            .attr("name", function(d){return d.name;})
            .style("fill", "#bcbcbc")
            .attr("transform", "translate(48, 25)")
            .on("mouseover", onCircleGDP)
            .on("mouseleave", outCircleGDP)
            //.transition()
            //.duration(4750)
            .attr("r", 2);}

      //Append line and transition
      d3.selectAll(".lineGDP")
          .each(function () {
            createCircle();
          });

}

//Init tooltip
const tooltip_time = d3.select("#multiLineBarPlot").append("div").attr("class", "tooltip").style("opacity", 0);

//Mouse over circle
function onCircleGDP(d){
  var code_gdp = d3.select(this).attr("id").split("_")[0]
  brush_gdp = d3.select(this).classed("pc_brushed")

  var string_info =  "<p>"+d.name+" :  "+ Math.round(d.gdp * 100) / 100 +"%&nbsp;</p>";

  //Reduce the opacity to all the circle
  if(brushing == '0'){
    //Reduce the opacity to all the circle
    d3.selectAll(".circleGDP")
      .style("opacity", "0.25")
      .each((item, i) => {
        if(item.code == d3.select(this).attr("id").split("_")[0]){
          d3.selectAll("#"+item.code+"_circleGDP")
          .style("fill", "#bcbcbc")
          .style("opacity", "1");
        }
      });

    //Reduce the opacity to all the line
    d3.selectAll(".lineGDP")
      .style("opacity", "0.25")
      .attr("stroke-width", 1.5 )
      .each((item, i) => {
        if(item.values[0].code == d3.select(this).attr("id").split("_")[0]){
          d3.select("#"+item.values[0].code+"_lineGDP")
            .attr("stroke", "#bcbcbc")
            .attr("stroke-width", 1.5 )
            .style("opacity", "1");
        }
      });
    //HIGHLIGTH the circle
    d3.select(this)
      .attr("r", 4)
      .style("opacity", 1);
  }else{
    d3.selectAll(".lineGDP").each(function(d){
      if(code_gdp == d.key && brush_gdp== true){
        d3.select(this)
          .style("stroke-width", 1.5)
          .style("stroke", "red");
      }
    })
    if(code_gdp == d.code && brush_gdp== true){
      d3.selectAll(".circleGDP").each(function(d){
        if(code_gdp == d.code && brush_gdp== true){
          d3.select(this)
            .style("stroke-width", 1)
            .style("stroke", "red");
          }
        })
        d3.select(this)
          .attr("r", 4);
      }else{

        //HIGHLIGTH the circle
        d3.select(this)
          .attr("r", 4)
          .style("opacity", 0.25);
      }

  }

  var pos_x =  xScaleYears(parseTime(d.year))
  var pos_y = yScaleGDP(+d.gdp)

  //Create tooltip
  tooltip_time.style("position", "absolute")
          .style("background-color", "lightgrey")
          .style("border-radius", "100px")
          .html(string_info)
          .attr( 'x', 10)
          .style("left", (d3.event.pageX + 7) + "px")
          .style("top", (d3.event.pageY - 70) + "px")
          .transition()
          .duration(400)
          .style("opacity", 0.9);


  //Create the vertical line
  svgTime.append("line")
          .attr("class", "vertical_line")
          .attr("x1", pos_x +48)
          .attr("y1",  25 )
          .attr("x2", pos_x+48)
          .attr("y2", heightTime - 25)
          .style("stroke-width", 1)
          .style("stroke", "#bcbcbc")
          .style("opacity", 0.25)
          .style("fill", "none");

  //HIGHLIGTH other Plots
  onPlots(d.code);
}

//Mouse out the circle
function outCircleGDP(d){
  //Reset al the opacities
  if(brushing == '0'){
    //Reset al the opacities
    d3.selectAll(".circleGDP")
      .attr("r", 2)
      .style("opacity", "1")
      .style("fill", "#bcbcbc")

    d3.selectAll(".lineGDP")
      .attr("stroke", "#bcbcbc")
      .style("opacity", "0.8")
      .attr("stroke-width", 1.5 );
  }else{
    d3.selectAll(".lineGDP")
      .style("stroke-width", 1.5)
      .style("stroke", "#bcbcbc");
    d3.selectAll(".circleGDP")
      .attr("r",2)
      .style("stroke-width", 1)
      .style("stroke", "#bcbcbc");
  }

  //Remove line
  d3.selectAll(".vertical_line").remove();
  //Remove tooltip
  tooltip_time.transition().duration(300)
		  .style("opacity", 0);
  outPlots(d.code);
}

//Mouse on the line
function onLineGDP(d){
  var code_gdp = d3.select(this).attr("id").split("_")[0]
  brush_gdp = d3.select(this).classed("pc_brushed")

  var string_info =  "<p>"+d.values[0].name+" &nbsp;</p>";
  if(brushing == '0'){
    //HIGHLIGTH the line and the circle and reduce the opacities of the others
    d3.selectAll(".circleGDP")
      .style("opacity", "0.25")
      .each((item, i) => {
        if(item.code == code_gdp){
          d3.selectAll("#"+item.code+"_circleGDP")
          .style("opacity", "1")
          .style("fill", "#bcbcbc");
        }
      });

    d3.selectAll(".lineGDP")
      .style("opacity", "0.25")
      .attr("stroke-width", 1.5 );

    d3.select(this)
    .attr("stroke", "#bcbcbc")
    .style("opacity", "1")
    .attr("stroke-width", 1.5) ;
  }else{
    d3.selectAll(".lineGDP").each(function(d){
      if(code_gdp == d.key && brush_gdp== true){
        d3.select(this)
          .style("stroke-width", 1.5)
          .style("stroke", "red");
      }
    })
    d3.selectAll(".circleGDP").each(function(d){
      if(code_gdp == d.code && brush_gdp== true){
        d3.select(this)
          .style("stroke-width", 0.8)
          .style("stroke", "red");
      }
    })
  }

  //Create tooltip, only for brush??
  tooltip_time.style("position", "absolute")
          .style("background-color", "lightgrey")
          .style("border-radius", "100px")
          .html(string_info)
          .attr( 'x', 10)
          .style("left", (d3.event.pageX + 7) + "px")
          .style("top", (d3.event.pageY - 70) + "px")
          .transition()
          .duration(400)
          .style("opacity", 0.9);

  //HIGHLIGTH other Plots
  onPlots(d.key,brush_gdp);
}

//Mouse out of the line
function outLineGDP(d){
  //Reset al the opacities
  if(brushing == '0'){
    d3.selectAll(".circleGDP")
      .attr("r", 2)
      .style("opacity", "1")
      .style("fill", "#bcbcbc");

    d3.selectAll(".lineGDP")
      .style("opacity", "0.8")
      .attr("stroke", "#bcbcbc")
      .attr("stroke-width", 1.5 );
  }else{
    d3.selectAll(".lineGDP")
      .style("stroke-width", 1.5)
      .style("stroke", "#bcbcbc");
    d3.selectAll(".circleGDP")
      .style("stroke-width", 1)
      .style("stroke", "#bcbcbc");
  }
  //Delete tooltip
  tooltip_time.transition().duration(300)
		  .style("opacity", 0);
  outPlots(d.key);
}

function onPlots(code_gdp, brush_gdp){
  //HIGHLIGTH Population bar
  if(brushing == '0'){
    if(d3.select("#populationBar_"+code_gdp).node() != null){
      d3.selectAll(".populationBar")
        .style("opacity", 0.4);
      d3.selectAll("#populationBar_"+code_gdp)
          .style("opacity", 1);
    }
    if(checkLabelBar == false){
      d3.selectAll("#populationBarText_"+code_gdp)
          .style("opacity", 1);
    }
  }else{
    d3.selectAll("#populationBarText_"+code_gdp).each(function(d){
      if(brush_gdp == true){
        d3.select(this).style("opacity", 1);
        changeColorAxes_y(code_gdp);
      }
    })

  }

  //HIGHLIGTH only one bar
  if(brushing == '0'){
    if(d3.select("#SexBar_"+code_gdp).node() != null){
      d3.selectAll(".SexBar")
        .style("opacity", 0.3);

      d3.selectAll("#SexBar_"+code_gdp)
          .style("opacity", 1);
    }
  }else{
    d3.selectAll(".SexBar").each(function(d){
      if(code_gdp == d.code && brush_gdp== true){
          changeColorAxes_x(code_gdp)
        }
    })
  }

  //HIGHLIGTH the country on the map
  d3.selectAll(".Country").each((item,i) =>{
      d3.select("#"+ item.properties.adm0_a3).style("opacity", .5);
      code_map = d3.select("#"+ item.properties.adm0_a3).attr("id");
        if(code_map == code_gdp){
          if(visualization==1 && !zoom_cluster && brushing== '0'){
            d3.select("#"+item.properties.adm0_a3)
              .style("stroke", "black")
              .style("stroke-width", 1.5)
              .style("opacity",1);
            }else if(zoom_cluster && brushing=='0'){
              d3.select("#"+item.properties.adm0_a3)
                .style("stroke", "black")
                .style("stroke-width", 2);
              d3.select("#"+item.properties.adm0_a3).style("opacity",1)
            }else{
              if(d3.select("#"+item.properties.adm0_a3).classed("pc_brushed")== true){
                d3.select("#"+item.properties.adm0_a3)
                      .style("opacity",1)
                      .style("stroke-width", 1.5)
                      .style("stroke", "black");
              }
            }
          }else if(d3.select("#"+ item.properties.adm0_a3).classed("pc_brushed")== true){
            d3.select("#"+item.properties.adm0_a3)
              .style("opacity", 1)
          }
        })

  //color grey all parallel except this one
  d3.select("#my_dataviz").selectAll('path').each(function(t){
    if (d3.select(this).attr("name") != null){
      if(code_gdp != d3.select(this).attr("name").trim()){
        d3.select(this).style("stroke", "grey")
      }
    }
  })

  //HIGHLIGTH MDS POINTS
  d3.select("#pca-kmeans").selectAll("circle").each(function(d){
    if(!zoom_cluster){
      if(code_gdp == d3.select(this).attr("id")){
        d3.select(this).raise().classed("active", true);
        d3.select(this).attr("r","4")
        d3.select(this).style("stroke","white")
        d3.select(this).style("stroke-width", "1")
      }
    }else{
      if(code_gdp == d3.select(this).attr("id")){
        d3.select(this).raise().classed("active", true);
        d3.select(this).attr("r",4 / transform.k)
        d3.select(this).style("stroke","white")
        d3.select(this).style("stroke-width", "1")
      }
    }
  })

  d3.select("#chart").selectAll("rect").each(function(d){
    if(code_gdp == d3.select(this).attr("id")){
      d3.select(this).style("fill", "#6F257F")
    }
  })
}

function outPlots(code_gdp){
  //DE-HIGHLIGTH Pop Bar
  if(brushing == '0'){
  d3.selectAll(".populationBar")
    .style("opacity", 1);
  }else{
    if(checkLabelBar == false){
      d3.selectAll("#populationBarText_"+code_gdp)
        .style("opacity", 0);
    }
  }

  //DE-HIGHLIGTH Sex Bar
  if(brushing == '0'){
    d3.selectAll(".SexBar")
      .style("opacity", 1);
  }else{
    d3.selectAll(".SexBar")
      .style("stroke-width", 0);
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

    //DE-HIGHLIGTH the country on the map
    if(click_countries == 0 && !zoom_cluster  && brushing=="0"){
      d3.selectAll(".Country")
          .style("stroke", "#273746")
          .style("stroke-width", .1)
          .style("opacity", 1);
    }else if(zoom_cluster && brushing=='0'){
      code_cluster.style("opacity",'1')
                  .style("stroke", "#273746")
                  .style("stroke-width", .1);

      code_Notcluster.style("opacity",'0.5')
    }else{
      d3.selectAll(".Country")
        .style("stroke", "#273746")
        .style("stroke-width", .1);
    }

    if(click_countries != 0){
      if(brushing == "0"){
        selected_countries.forEach((item, i) => {
          d3.select("#"+item)
          .style('opacity', 1);
        });
      }
    }

    if(click_zoom_country == 1){
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

  //Hide labels
  if(checkLabelBar == false){
      d3.selectAll("#populationBarText_"+code_gdp)
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


  d3.select("#chart").selectAll("rect").each(function(d){
    if(code_gdp == d3.select(this).attr("id")){
      d3.select(this).style("fill", "#bcbcbc")
    }
  })
}
