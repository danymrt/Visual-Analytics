//The keys for create the plot
var keys_sex=["male","female"]
var sex_DB;
var init_sex = 0;
//var checkLabelBar = false;


// set the dimensions and margins of the graph
var widthSex =  document.getElementById("sexPlot").clientWidth,
    heightSex = document.getElementById("sexPlot").clientHeight - 10;

// append the svgSex object to the body of the page
var svgSex = d3.select("#sexPlot")
          .attr("width", widthSex)
          .attr("height", heightSex);


//Create the axis and the plot
function createSexPlot(countries){

  if(click_countries == 1 || click_zoom_country == 1){
    countries = selected_countries
  }

  svgSex.selectAll('g').remove();

  var groupDataSex = sex_DB.filter(function(d){
    if(countries.includes(d.code) && YEAR.includes(d.year)){
        return d.code ;
    }
  });
  groupDataSex.sort(function(a, b){
    return countries.indexOf(a.code) - countries.indexOf(b.code);
  });

  var pop_sex_year = d3.nest().key(function(d) { return d.name; })
                          .rollup(function(v) {
                              var l = [];
                              l.push({"code":v[0].code,"sex": "male", "value": d3.mean(v, function(d) { return d.male; })});
                              l.push({"code":v[0].code,"sex": "female", "value": d3.mean(v, function(d) { return d.female; })});
                              return l;
                            })
                            .entries(groupDataSex);

  if(countries.length >= 12){
    var categoriesNames  = pop_sex_year.map(function(d) { return d.value[0].code; }); //Array for values on x axis
  }else{
    var categoriesNames  = pop_sex_year.map(function(d) { return d.key; }); //Array for values on x axis
  }

  if(countries.length < 6){
    var x0 = d3.scaleBand()
        .rangeRound([0, widthSex - 60])
        .padding(0.65)
        .align(0.1);
  }else {
    var x0 = d3.scaleBand()
        .rangeRound([0, widthSex - 60])
        .paddingInner(0.55)
        .align(0.1);
  }
  var x1 = d3.scaleBand();
  var y = d3.scaleLinear()
            .rangeRound([heightSex - 67, 0]);

  x0.domain(categoriesNames);
  x1.domain(keys_sex).rangeRound([0, x0.bandwidth()]);
  y.domain([0, d3.max(pop_sex_year, function(categorie) {return d3.max(categorie.value, function(d) { return d.value; }); })]);
  //var xAxis = d3.axisBottom(x0).tickFormat(0);

  var color = d3.scaleOrdinal()
      .range(['#31a354','#addd8e'])
  // Create the X Axis
  svgSex.append("g")
      .attr("class", "axis")
      .attr("id", "x_stacked_axis")
      .attr("transform", "translate(40," + (heightSex -31) + ")")
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .style("font-size", function(d) {
        if(d.length >= 8){
          var bbox = this.getBBox(),
              cbbox = svgBar.node().getBBox();
          return (Math.min(2 * bbox.height, (2 * bbox.height - 8) / this.getComputedTextLength() * 24)+0.5) + "px";
        }
        return 8.5;
        })
      .attr("dy", ".35em")
      .attr("transform", "rotate(45)")
      .style("text-anchor", "start");

  yAxis = d3.axisLeft(y);

  // Create the Y Axis
  svgSex.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(40, 36)")
        .call(yAxis)
        .append("text")
        .attr("x", 2)
        .attr("dy", "-0.5em")
        .attr("fill", "white")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("% of Population Sex")

 svgSex.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(40, 36)")
      .call(d3.axisLeft(y)
              .tickSize(-widthSex + 60)
              .tickFormat("")
      );

  //console.log(pop_Sex_year);
  var slice = svgSex.selectAll(".slice")
            .data(pop_sex_year)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform",function(d) {
              if(countries.length >= 12) return "translate(" + x0(d.value[0].code) + ",0)";
              return "translate(" + x0(d.key) + ",0)"; });

  slice.selectAll("rect")
        .data(function(d) { return d.value; })
        .enter().append("rect")
            .attr("width", function(){
              if(x1.bandwidth() > 13) return 13;
              return x1.bandwidth();})
            .attr("class", "SexBar")
            .attr("id", function(d){
                return "SexBar_" + d.code;
            })
            .attr("x", function(d) { return x1(d.sex) ; })
            .style("fill", function(d) { return color(d.sex) })
            .attr("y", function(d) {
              if(init_sex == 1) return y(d.value);
              return  y(0); })
            .attr("transform", "translate(40, 36)")
            .attr("height", function(d) {
              if(init_sex == 1) return heightSex - 67  - y(d.value);
               return heightSex - 67  - y(0); })
            .on("mouseover", function(d){
              var code_barSex = d.code;
              brush_sex = d3.select(this).classed("pc_brushed")
              //HIGHLIGTH only one bar
              if(brushing == '0'){
                if(d3.select("#SexBar_"+d.code).node() != null){
                  d3.selectAll(".SexBar")
                    .style("opacity", 0.3);

                  d3.selectAll("#SexBar_"+d.code)
                      .style("opacity", 1);
                }
              }else{
                d3.selectAll(".SexBar").each(function(d){
                  if(d.code==code_barSex && brush_sex==true){
                    d3.selectAll("#SexBar_"+code_barSex)
                        //.style("stroke-width", 0.5)
                        //.style("stroke", "red");
                        changeColorAxes_x(code_barSex)
                  }
                })
              }

              //HIGHLIGTH the country on the map
              d3.selectAll(".Country").each((item,i) =>{
                    d3.select("#"+ item.properties.adm0_a3).style("opacity", .5);
                    code_map = d3.select("#"+ item.properties.adm0_a3).attr("id");
                      if(code_map == code_barSex){
                        if(visualization==1 && !zoom_cluster  && brushing== '0'){
                          d3.select("#"+item.properties.adm0_a3)
                            .style("stroke", "black")
                            .style("stroke-width", 1.5)
                            .style("opacity",1);
                         }else if(zoom_cluster && brushing=='0'){
                            d3.select("#"+item.properties.adm0_a3)
                              .style("stroke", "black")
                              .style("stroke-width", 2);
                            //code_cluster.style("opacity",.8)
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
                  if(code_barSex != d3.select(this).attr("name").trim()){
                    d3.select(this).style("stroke","grey")
                  }
                }
              })

              //HIGHLIGTH only one Pop bar
              if(brushing == '0'){
                if(d3.select("#populationBar_"+code_barSex).node() != null){
                  d3.selectAll(".populationBar")
                    .style("opacity", 0.4);

                  d3.selectAll("#populationBar_"+code_barSex)
                      .style("opacity", 1);
                }

                if(checkLabelBar == false){
                  d3.selectAll("#populationBarText_"+code_barSex)
                      .style("opacity", 1);
                }
              }else{
                d3.selectAll("#populationBarText_"+code_barSex).each(function(d){
                  if(brush_sex == true){
                    d3.select(this).style("opacity", 1);
                    changeColorAxes_y(code_barSex);
                  }
                })
              }

              //HIGHLIGTH GDP line
              if(brushing == '0'){
                d3.selectAll(".lineGDP").each(function(d){
                  if(code_barSex != d.key){
                    d3.select(this).style("opacity", 0.2);
                  }
                })
                d3.selectAll(".circleGDP").each(function(d){
                  if(code_barSex != d.code){
                    d3.select(this).style("opacity", 0.2);
                  }
                })
              }else{
                d3.selectAll(".lineGDP").each(function(d){
                  if(code_barSex == d.key && brush_sex==true){
                    d3.select(this)
                      .style("stroke-width", 0.8)
                      .style("stroke", "red");
                  }
                })
                d3.selectAll(".circleGDP").each(function(d){
                  if(code_barSex == d.code && brush_sex==true){
                    d3.select(this)
                      .style("stroke-width", 0.8)
                      .style("stroke", "red");
                  }
                })
              }


              //HIGHLIGTH MDS POINTS
              d3.select("#pca-kmeans").selectAll("circle").each(function(d){
                if(!zoom_cluster){
                  if(code_barSex == d3.select(this).attr("id")){
                    d3.select(this).raise().classed("active", true);
                    d3.select(this).attr("r","4")
                    d3.select(this).style("stroke","white")
                    d3.select(this).style("stroke-width", "1")
                  }
                }else{
                  if(code_barSex == d3.select(this).attr("id")){
                    d3.select(this).raise().classed("active", true);
                    d3.select(this).attr("r",4 / transform.k)
                    d3.select(this).style("stroke","white")
                    d3.select(this).style("stroke-width", "1")
                  }
                }
              })

              d3.select("#chart").selectAll("rect").each(function(d){
                if(code_barSex == d3.select(this).attr("id")){
                  d3.select(this).style("fill", "#6F257F")
                }
              })

            })
            .on("mouseleave", function(d){
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
                              //   .style("stroke-width",  .1)
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
              //DE-HIGHLIGTH Population Bar
              if(brushing == '0'){
                d3.selectAll(".populationBar")
                  .style("opacity", 1);
                if(checkLabelBar == false){
                    d3.selectAll("#populationBarText_"+d.code)
                        .style("opacity", 0);
                }
              }else{
                if(checkLabelBar == false){
                    d3.selectAll("#populationBarText_"+d.code)
                        .style("opacity", 0);
                }
              }
              if(checkLabelBar == false){
                  d3.selectAll("#populationBarText_"+d.code)
                      .style("opacity", 0);
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

              code = d.code
              d3.select("#chart").selectAll("rect").each(function(d){
                  if(code == d3.select(this).attr("id")){
                    d3.select(this).style("fill", "#bcbcbc")
                  }
                })

            })
  if(init_sex == 0){
    slice.selectAll("rect")
          .transition()
          .delay(function (d) {return Math.random()*1000;})
          .duration(1000)
          .attr("y", function(d) {return y(d.value); })
          .attr("height", function(d) {
            return heightSex-67-y(d.value); })
  }

  // Create the legend
  var legend = svgSex.append("g")
                    .attr("font-size", 8)
                    .attr("text-anchor", "start")
                    .selectAll("g")
                    .data(keys_sex.slice())
                    .enter().append("g")
                    .attr("transform", function(d, i) { return "translate(" + i * 45 + ",0)"; });

  // Create circle for each element in legend
  legend.append("rect")
        .attr("x", widthSex/1.5)
        .attr("y", 7)
        .attr("width", 13)
        .attr("height", 6)
        .attr("fill", color);

  // Create text for each element in legend
  legend.append("text")
        .attr("x", widthSex/1.5 + 15)
        .attr("y",10)
        .attr("dy", "0.32em")
        .attr("fill", "white")
        .text(function(d) {
            if(d == 'male') d = 'male'
            if(d == 'female') d = 'female'
        return d;
      });

}

function changeColorAxes_x(code){
  d3.selectAll(".Country").each((item,i) =>{
      code_country = d3.select("#"+ item.properties.adm0_a3).attr("id");
      if(code == code_country){
        name_country = d3.select("#"+ item.properties.adm0_a3).attr("name")
        }
      })

  d3.select("#x_stacked_axis")
    .selectAll("text")
    .style("fill", function(d){
      if(d == name_country || d == code){
        return "red";
      }
      return "white";
    })
  }
