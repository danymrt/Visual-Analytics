//The keys for create the plot
var keys_pop=["pop00_14","pop15_64","pop65_100"]
var rows_socioDB, pop_year;
var tooltip_age = d3.select("#barPlot").append("div").attr("class", "tooltip").style("opacity", 0);
//var checkLabelBar = false;

// set the dimensions and margins of the graph
var widthBar =  document.getElementById("popPlot").clientWidth,
    heightBar = document.getElementById("popPlot").clientHeight -10;

// append the svgBar object to the body of the page
var svgBar = d3.select("#popPlot")
          .attr("width", widthBar)
          .attr("height", heightBar);


  function createDataAge(countries){
    var groupDataBar = rows_socioDB.filter(function(d){
      if(countries.includes(d.code) && YEAR.includes(d.year) ){
          return d.code ;
      }
    });

    groupDataBar.sort(function(a, b){
      return countries.indexOf(a.code) - countries.indexOf(b.code);
    });

    if(ABSOLUTE){
      pop_year = d3.nest().key(function(d) { return d.name; })
                              .rollup(function(v) {
                                  var l = [];
                                  l.push({"code":v[0].code,"age": "pop00_14", "value": ((d3.mean(v, function(d) { return d.pop00_14; })/d3.mean(v, function(d) { return d.population; }))*100000),"population":d3.mean(v, function(d) { return d.population; })});
                                  l.push({"code":v[0].code,"age": "pop15_64", "value": ((d3.mean(v, function(d) { return d.pop15_64; })/d3.mean(v, function(d) { return d.population; }))*100000),"population":d3.mean(v, function(d) { return d.population; })});
                                  l.push({"code":v[0].code,"age": "pop65_100", "value": ((d3.mean(v, function(d) { return d.pop65_100; })/d3.mean(v, function(d) { return d.population; }))*100000),"population":d3.mean(v, function(d) { return d.population; })});
                                  return l;
                                })
                                .entries(groupDataBar);

    }else{
      pop_year = d3.nest().key(function(d) { return d.name; })
                              .rollup(function(v) {
                                  var l = [];
                                  l.push({"code":v[0].code,"age": "pop00_14", "value": d3.mean(v, function(d) { return d.pop00_14; }),"population":d3.mean(v, function(d) { return d.population; })});
                                  l.push({"code":v[0].code,"age": "pop15_64", "value": d3.mean(v, function(d) { return d.pop15_64; }),"population":d3.mean(v, function(d) { return d.population; })});
                                  l.push({"code":v[0].code,"age": "pop65_100", "value": d3.mean(v, function(d) { return d.pop65_100; }),"population":d3.mean(v, function(d) { return d.population; })});
                                  return l;
                                })
                                .entries(groupDataBar);
    }
  }

  function createBarAgePlot(countries){
    if(click_countries == 1 || click_zoom_country == 1){
      if(countries.length != selected_countries.length)
        countries = selected_countries
    }
    svgBar.selectAll('g').remove();
    createDataAge(countries)
    //console.log(pop_year);

    var data = []
    pop_year.forEach((item1, i) => {
      var pop00 = 0
      var pop15 = 0
      var pop65 = 0
      var code;
      item1.value.forEach((item2, i) => {
        if(item2.age == "pop00_14"){
          pop00 = item2.value
        }
        if(item2.age == "pop15_64"){
          pop15 = item2.value
        }
        if(item2.age == "pop65_100"){
          pop65 = item2.value
        }
        code = item2.code;
      });
        data.push({"name": item1.key, "code": code, "pop00_14":pop00,"pop15_64":pop15,"pop65_100":pop65})
    });

    var categoriesNames  = pop_year.map(function(d) { return d.key; }); //Array for values on y axis

    var y = d3.scaleBand()
        .rangeRound([0, heightBar - 67])
        .paddingInner(0.25)
        .align(0.1)
        .domain(categoriesNames);

    var x = d3.scaleLinear()
              .rangeRound([widthBar - 65, 0]);

    var color = d3.scaleOrdinal()
                  .range(['#e5f5f9','#99d8c9','#2ca25f']);

    var max_bar = d3.max(pop_year, function(categorie) {return d3.max(categorie.value, function(d) { return d.population; }); })

    if(ABSOLUTE){
        x.domain([100000,0]).nice();
    }else{
        x.domain([max_bar,0]).nice();
    }

    // Create the Y Axis
     svgBar.append("g")
          .attr("class", "axis")
          .attr("id", "y_stacked_axis")
          .attr("transform", "translate(52,37)")
          .call(d3.axisLeft(y))
          .selectAll("text")
          .style("font-size", function(d) {
            if(d.length >= 8){
              var bbox = this.getBBox(),
                  cbbox = svgBar.node().getBBox();
              return (Math.min(2 * bbox.height, (2 * bbox.height - 8) / this.getComputedTextLength() * 24)+0.5) + "px";
            }
            return 8.5 + "px";
            })
          .attr("dy", ".35em");

      svgBar.append("text")
      .attr("x", 2)
      .attr("dy", "-0.5em")
      .attr("fill", "white")
      .attr("text-anchor", "start")
      .text("Population Ages")
      .style("font-size","9.5px")
      .attr("transform", "translate(52,37)");

    if(ABSOLUTE){
        xAxis = d3.axisBottom(x).tickFormat(d3.formatPrefix(".1s", 1e4));
    }else{
        xAxis = d3.axisBottom(x).tickFormat(d3.formatPrefix(".1s", 1e6));
    }

    // Create the X Axis
    svgBar.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(51.5," + (heightBar -29) + ")")
          .call(xAxis)
          .selectAll("text")
          .attr("y", 0)
          .attr("x", 9)
          .style("font-size","7.5px")
          .attr("dy", ".35em")
          .attr("transform", "rotate(90)")
          .style("text-anchor", "start");

    svgBar.append("g")
         .attr("class", "grid")
         .attr("transform", "translate(51.5, "+ (heightBar - 29)+")")
         .call(d3.axisBottom(x)
               .tickSize(-heightBar + 67)
               .tickFormat("")
               );


    var stack = d3.stack()
          			.keys(keys_pop)
                .order(d3.stackOrderNone)
                .offset(d3.stackOffsetNone);

    var layer = svgBar.selectAll(".layer")
              			.data(stack(data))
              			.enter().append("g")
              			.attr("class", "layer")
              			.style("fill", function(d, i) { return color(i); });

    layer.selectAll("rect")
    		  .data(function(d) { return d; })
    			.enter().append("rect")
    		  .attr("y", function(d) {
            if(countries.length <6) return y(d.data.name) -5 + y.bandwidth()/2 ;
            return y(d.data.name); })
          .attr("x", function(d) {
                return x(d[0]) + 0.7; })
          .attr("class", "populationBar")
          .attr('id', function(d){
            return "populationBar_" + d.data.code;
            })
    		  .attr("height", function(){
            if(countries.length <6) return +13;
            return y.bandwidth();
          })
    		  .attr("width", function(d) {

             return x(d[1]) - x(d[0]); })
          .attr("transform", "translate(52,37)")
          .on("mouseover", function(d){
            if(!ABSOLUTE){
              var tooltip_string = "<p>"+ d.data.name + "</p><hr>"
              tooltip_string = tooltip_string + "<p><i>Age 00-14: </i>: "+ d.data.pop00_14 +" &nbsp;</p>";
              tooltip_string = tooltip_string + "<p><i>Age 15-64: </i>: "+ d.data.pop15_64 +" &nbsp;</p>";
              tooltip_string = tooltip_string + "<p><i>Age > 65: </i>: "+ d.data.pop65_100 +" &nbsp;</p>";

              // create a tooltip
              tooltip_age.style("position", "absolute")
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

            code_barplot = d.data.code
            brush_pop = d3.select(this).classed("pc_brushed")
            //HIGHLIGTH Population bar
            if(brushing == '0'){
              if(d3.select("#populationBar_"+d.data.code).node() != null){
                d3.selectAll(".populationBar")
                  .style("opacity", 0.4);

                d3.selectAll("#populationBar_"+d.data.code)
                    .style("opacity", 1);
              }

              if(checkLabelBar == false){
                d3.selectAll("#populationBarText_"+d.data.code)
                    .style("opacity", 1);
              }
            }else{
              d3.selectAll("#populationBarText_"+d.data.code).each(function(d){
                if(brush_pop == true){
                  d3.select(this).style("opacity", 1);
                  changeColorAxes_y(code_barplot)
                }
              })

            }

            //HIGHLIGTH Agebar
            if(brushing == '0'){
              if(d3.select("#SexBar_"+code_barplot).node() != null){
                d3.selectAll(".SexBar")
                  .style("opacity", 0.3);

                d3.selectAll("#SexBar_"+code_barplot)
                    .style("opacity", 1);
              }
            }else{
              d3.selectAll(".SexBar").each(function(d){
                if(code_barplot == d.code && brush_pop== true){
                  d3.select(this)
                    //.style("stroke-width", 0.5)
                    //.style("stroke", "red");
                    changeColorAxes_x(code_barplot)
                  }
              })
            }
            //Show labels
          d3.selectAll(".Country").each((item,i) =>{
                d3.select("#"+ item.properties.adm0_a3).style("opacity", .5);
                code_map = d3.select("#"+ item.properties.adm0_a3).attr("id");
                  if(code_map == code_barplot){
                    if(visualization==1 && !zoom_cluster  && brushing== '0'){
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

          if(checkLabelBar == false){
              d3.selectAll("#populationBarText_"+d.data.code)
                .style("opacity", 1);
            }

            //color grey all parallel except this one
            d3.select("#my_dataviz").selectAll('path').each(function(t){
              if (d3.select(this).attr("name") != null){
                if(code_barplot != d3.select(this).attr("name").trim()){
                  d3.select(this).style("stroke", "grey")
                }
              }
            })

            //HIGHLIGTH GDP line
            if(brushing == '0'){
              d3.selectAll(".lineGDP").each(function(d){
                if(code_barplot != d.key){
                  d3.select(this).style("opacity", 0.2);
                }
              })
              d3.selectAll(".circleGDP").each(function(d){
                if(code_barplot != d.code){
                  d3.select(this).style("opacity", 0.2);
                }
              })
            }else{
              d3.selectAll(".lineGDP").each(function(d){
                if(code_barplot == d.key && brush_pop== true){
                  d3.select(this)
                    .style("stroke-width", 0.8)
                    .style("stroke", "red");
                }
              })
              d3.selectAll(".circleGDP").each(function(d){
                if(code_barplot == d.code && brush_pop== true){
                  d3.select(this)
                    .style("stroke-width", 0.8)
                    .style("stroke", "red");
                }
              })
            }

            //HIGHLIGTH MDS POINTS
            d3.select("#pca-kmeans").selectAll("circle").each(function(d){
              if(!zoom_cluster){
                if(code_barplot == d3.select(this).attr("id")){
                  d3.select(this).raise().classed("active", true);
                  d3.select(this).attr("r","4")
                  d3.select(this).style("stroke","white")
                  d3.select(this).style("stroke-width", "1")
                }
              }else{
                if(code_barplot == d3.select(this).attr("id")){
                  d3.select(this).raise().classed("active", true);
                  d3.select(this).attr("r",4 / transform.k)
                  d3.select(this).style("stroke","white")
                  d3.select(this).style("stroke-width", "1")
                }
              }
            })

            d3.select("#chart").selectAll("rect").each(function(d){
              if(code_barplot == d3.select(this).attr("id")){
                d3.select(this).style("fill", "#6F257F")
              }
            })

          })
          .on("mouseleave", function(d){
            if(!ABSOLUTE){
              tooltip_age.transition().duration(300)
                  .style("opacity", 0);
            }
            if(brushing == '0'){
            d3.selectAll(".populationBar")
              .style("opacity", 1);
            }else{
              if(checkLabelBar == false){
                  d3.selectAll("#populationBarText_"+d.data.code)
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
            if(brushing == '0'){
              d3.selectAll(".SexBar")
                .style("opacity", 1);
            }else{
              d3.selectAll(".SexBar")
                .style("stroke-width", 0);
              }

            //DE-HIGHLIGTH the country on the map
            if(click_countries == 0 && !zoom_cluster && brushing=="0"){
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
                d3.selectAll("#populationBarText_"+d.data.code)
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


            code = d.data.code
            d3.select("#chart").selectAll("rect").each(function(d){
                if(code == d3.select(this).attr("id")){
                  d3.select(this).style("fill", "#bcbcbc")
                }
              })


          });
    if(ABSOLUTE){
      svgBar.append("g")
              .selectAll("g")
              .data(stack(data))
              .enter().append("g")
              .attr("fill", function(d) { return color(d.key); })
              .selectAll("rect")
              .data(function(d) { return d; })
              .enter()
              .append("text")
              .attr("transform", "translate(52,37)")
              .attr("class", "populationBarText")
              .attr("id", function(d){
                return "populationBarText_" + d.data.code;
                })
              .text(function(d) { return d3.format(".3s")(d[1]-d[0]); })
              .attr("y", function(d) {
                if(countries.length<5){
                    return y(d.data.name) + y.bandwidth() / 1.8;
                }
                return y(d.data.name) + y.bandwidth() / 1.5;})
              .attr("x", function(d) {
                if(ABSOLUTE){
                  if(d[1] >= 99999){
                    if((d[1]-d[0]) < 12000){
                      return  x(d[0]) - 15 + (x(d[1])- x(d[0]))/1.5;
                    }
                  }
                }
                return  x(d[0]) - 5 + (x(d[1])- x(d[0]))/2})
              .style("fill", 'black')
              .style("font-size", "6.5px")
              .style("opacity", 0);
            }
    // Create the legend
      var legend = svgBar.append("g")
                        .attr("font-size", 8)
                        .attr("text-anchor", "start")
                        .selectAll("g")
                        .data(keys_pop.slice())
                        .enter().append("g")
                        .attr("transform", function(d, i) { return "translate(" + i * 45+ ",0)"; });

      // Create circle for each element in legend
      legend.append("rect")
            .attr("x", widthBar/1.8)
            .attr("y", 7)
            .attr("width", 13)
            .attr("height", 6)
            .attr("fill", color);

      // Create text for each element in legend
      legend.append("text")
            .attr("x", widthBar/1.8 + 15)
            .attr("y",10)
            .attr("dy", "0.32em")
            .attr("fill", "white")
            .text(function(d) {
              if(d == 'pop00_14') d = '00-14'
              if(d == 'pop15_64') d = '15-64'
              if(d == 'pop65_100') d = '> 65'
            return d;
          });

    showLabelBarPop(checkLabelBar);
  }

function getSize(d) {
  var bbox = this.getBBox(),
      cbbox = this.parentNode.getBBox(),
      scale = Math.min(cbbox.width/bbox.width, cbbox.height/bbox.height);
  d.scale = scale;
}

function showLabelBarPop(check){
  if(check){
    d3.selectAll(".populationBarText")
    .style('opacity',1);
  }else{
    d3.selectAll(".populationBarText")
    .style('opacity',0);
  }
}


function changeColorAxes_y(code){
  d3.selectAll(".Country").each((item,i) =>{
      code_country = d3.select("#"+ item.properties.adm0_a3).attr("id");
      if(code == code_country){
        name_country = d3.select("#"+ item.properties.adm0_a3).attr("name")
        }
      })

  d3.select("#y_stacked_axis")
    .selectAll("text")
    .style("fill", function(d){
      if(d == name_country){
        return "red";
      }
      return "white";
    })
}
