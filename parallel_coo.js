YEAR = ["2019"]   //2010,2011,2012,2013,2014,2015,2016,2017,2018,
CMD_COUNTRIES = "only"
CMD_CONTINENT = false
DISORDERS = ["Depressive", "Anxiety", "Bipolar", "Eating", "Schizophrenia", "Attention", "Conduct", "intellectualDisability", "Autism"]
ABSOLUTE = true
COUNTRIES = [];

MDS_PC_LOCK = false

var populationDB = []

d3.csv("./Dataset/cleaned_dataset4.csv")
  .get(function(error, data) {
    populationDB = data;
    draw(YEAR, CMD_CONTINENT, COUNTRIES, DISORDERS, ABSOLUTE)
  })

var dataset_path = "./Dataset/Mental_Disorder_with_continent.csv";    //Pythonanywhere
var visualization = '1'; //variable that contain the visualization type of the moment: =0 =>vis. for countries; =1 => vis. for continent
var brushing = '0';   //indicates if exists any brush 0->no , 1-> yes

function get_continents(data) {
  const data_filtered = []
  for(let i =0 ; i < data.length ; i++){
    if(data[i].Code.length == 2){
      data_filtered.push(data[i])
    }
  }
  return data_filtered
}

function filterByCountry(command, countries, data){   //command da implementare
  const data_filtered = []
  for(let i = 0; i < data.length ; i++){
    countries.forEach(function(c){
      if(data[i].Code == c){
        data_filtered.push(data[i])
      }
    })
  }
  return data_filtered
}

function filterByYear(year,data){
  const data_filtered = []
  for (let i=0; i < data.length; i++){
    year.forEach(function(y){
      if(data[i].Year == y.toString()){
        data_filtered.push(data[i])
      }
    })
  }
  return data_filtered
}

function findPopulation(entity, year){
  populationDB.forEach((item, i) => {
    if(item.Code == entity && item.Series ==  "Population, total"){
      year = "year"+year[2]+year[3]
      population_val = item[year]
    }
  });
  return population_val
}

function filterbyDisorder(flag, disorder, position){
  svg_PC.selectAll("*").remove();
  if(flag){
    DISORDERS.splice(parseInt(position)-1, 0, disorder);
  }else{
    index= DISORDERS.indexOf(disorder)
    DISORDERS.splice(index,1);
  }
  draw(YEAR, CMD_CONTINENT,COUNTRIES, DISORDERS, ABSOLUTE)
}

function changeCmdContinent(flag){
  svg_PC.selectAll("*").remove();
  CMD_CONTINENT = flag
  draw(YEAR, CMD_CONTINENT,COUNTRIES, DISORDERS, ABSOLUTE)
}

function changeCmdAbsolute(flag){
  svg_PC.selectAll("*").remove();
  ABSOLUTE = flag
  ////console.log(flag);
  draw(YEAR, CMD_CONTINENT,COUNTRIES, DISORDERS, ABSOLUTE)
}

function changeYear(flag, year){
  svg_PC.selectAll("*").remove();
  if(flag){
    YEAR.push(year)
  }else{
    index = YEAR.indexOf(year)
    YEAR.splice(index,1)
  }
  draw(YEAR, CMD_CONTINENT,COUNTRIES, DISORDERS, ABSOLUTE)
}

// set the dimensions and margins of the graph
var margin = {top: 50, right: 15, bottom: 15, left: 0},
    width =  document.getElementById("my_dataviz").clientWidth + margin.left + margin.right,   //500 - margin.left - margin.right,
    height = document.getElementById("my_dataviz").clientHeight - margin.top - margin.bottom;    //400 - margin.top - margin.bottom;
// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
var svg_PC = svg.append("g")
            .attr("transform","translate(" + margin.left + "," + margin.top + ")");

function draw(year,cmd_continent,countries, disorders, isAbsolute ){
  if(click_countries == 1 || click_zoom_country == 1){
    countries = selected_countries
  }
  dragging = {}
  //clean and retrieve measuremenets
  d3.select("#my_dataviz").selectAll("*").remove();
  margin = {top: 50, right: 0, bottom: 15, left: 18},
  width = document.getElementById("my_dataviz").clientWidth+ margin.left + margin.right,
  height = document.getElementById("my_dataviz").clientHeight - margin.top - margin.bottom;
  svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width +margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
  svg_PC = svg.append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");
  const PCtooltip = d3.select('#PCtooltip');
  d3.text(dataset_path, function(raw){
    svg_PC.selectAll(".foreground").remove()
    svg_PC.selectAll(".background").remove()
    var dsv = d3.dsvFormat(',');
    var data = dsv.parse(raw);
  data = filterByYear(year,data)
  if(cmd_continent){
    data = get_continents(data)
  }else{
    data = filterByCountry(CMD_COUNTRIES, countries, data)
  }

   // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
  dimensions = DISORDERS
  // For each dimension, I build a linear scale. I store all in a y object

  var y = {}
  for(i in dimensions){
    var name = dimensions[i]
    y[name] = d3.scaleLinear()
    //d3.extent  returns the minimum and maximum value in an array, in this case i take from the dataset the i-th feature domain
    .domain(d3.extent(data, function(d){
        if(!isAbsolute){
           return +d[name];}
        else{
          var population = findPopulation(d["Code"], d["Year"])
          r = (d[name]/population) *100000
          return +r;
        }
      }))
    .range([height, 0])
  }


  //asse x -> it find the best position for each Y axis
  right_pad = 0
  last_disorder = Object.keys(y)[Object.keys(y).length-1]
  if(last_disorder != null && last_disorder.length > 5) right_pad = 2.5*last_disorder.length
  x = d3.scalePoint()
      .range([0, document.getElementById("my_dataviz").clientWidth-margin.right-right_pad])
      .padding(0.5)
      .domain(dimensions)
      // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d){
    return d3.line()(dimensions.map(function(p){
      if(!isAbsolute) {
        return [x(p), y[p](d[p])];}
      else{
        population = findPopulation(d["Code"], d["Year"])
        return [x(p), y[p]((d[p]/population) *100000)]
      }
    }));
  }
  // Add grey background lines for context
  background = svg_PC.append("g")
    .attr("class", "background")
    .selectAll("path")
    .data(data)
    .enter().append("path")
    .attr("d", path)

  dictionary_code_cluster = []
  d3.select("#pca-kmeans").selectAll("circle").each(function(d){
    var key = d3.select(this).attr("id")
    var value = d3.select(this).style("fill")
    dictionary_code_cluster[key] = value;
  })

  // Add blue foreground lines for focus
  foreground = svg_PC.append("g")
    .attr("class", "foreground")
    .selectAll("path")
    .data(data)
    .attr("id", function(d){ return d.Code})
    .enter().append("path")
    .attr("d", path)
    .style("fill", "none" )
    .attr("class", "path_parallel")

    svg_PC.selectAll(".path_parallel").style("stroke", function(d1){
      var c;
      d3.select("#pca-kmeans").selectAll("circle").each(function(d2){
        if(d1.Code == d2.Code){
          c = d3.select(this).style("fill");
        }
      })
      return c
    })

  foreground.attr("name",function(d){return d.Code})
      .on("mouseover", function(d) {
        d3.select(this).raise().classed("active", true);
        d3.select("#my_dataviz").selectAll('path').each(function(t){
          if (d3.select(this).attr("name") != null){
            if(d.Code.trim() != d3.select(this).attr("name").trim()){
              d3.select(this).raise().classed("active", true);
              d3.select(this).style("stroke", "grey")
            }
          }
        })
        //drawTooltip
        var text = d["Entity"]
        if(YEAR.length>1) text += " " + d["Year"] //Change the content of all tooltip elements:
        var mtooltip = d3.selectAll('#par-coord').append("div")
            .html(text)
            .attr("class", "PCtooltip")
            .style('display', 'block')
            .style("position","absolute")
            .style("left", (d3.mouse(this)[0]) + "px")
            .style("top", (d3.mouse(this)[1]+5) + "px");
        name = d.Code
        d3.selectAll(".Country").each((item,i) =>{
          d3.select("#"+ item.properties.adm0_a3).style("opacity", .5);
            code_map = d3.select("#"+ item.properties.adm0_a3).attr("id");
              if(code_map == name){
                if(visualization==1 && !zoom_cluster  && brushing== '0'){
                  d3.select("#"+item.properties.adm0_a3)
                    .style("opacity",1)
                    .style("stroke", "black")
                    .style("stroke-width", 1.5);
                  }else if(zoom_cluster && brushing=='0'){
                    d3.select("#"+item.properties.adm0_a3)
                      .style("stroke", "black")
                      .style("stroke-width", 2);
                    //code_cluster.style("opacity",.7)
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
                  //console.log("iihu");
                  d3.select("#"+item.properties.adm0_a3)
                    .style("opacity", 1)
                }
        })

        //HIGHLIGTH MDS POINTS
        d3.select("#pca-kmeans").selectAll("circle").each(function(d){
          if(!zoom_cluster){
            if(name == d3.select(this).attr("id")){
              d3.select(this).raise().classed("active", true);
              d3.select(this).attr("r","4")
              d3.select(this).style("stroke","white")
              d3.select(this).style("stroke-width", "1")
            }
          }else{
            if(name == d3.select(this).attr("id")){
              d3.select(this).raise().classed("active", true);
              d3.select(this).attr("r",4 / transform.k)
              d3.select(this).style("stroke","white")
              d3.select(this).style("stroke-width", "1")
            }
          }
        })
        //HIGHLIGTH Population Bar
        if(brushing == '0'){
          if(d3.select("#populationBar_"+d.Code).node() != null){
            d3.selectAll(".populationBar")
              .style("opacity", 0.4);

            d3.selectAll("#populationBar_"+d.Code)
                .style("opacity", 1);
          }

          if(checkLabelBar == false){
            d3.selectAll("#populationBarText_"+d.Code)
                .style("opacity", 1);
          }
        }else{
          if(checkLabelBar == false){
            d3.selectAll("#populationBarText_"+d.Code)
                .style("opacity", 1);
          }

          changeColorAxes_y(name)
        }
        //HIGHLIGTH Sex Bar
        if(brushing == '0'){
          if(d3.select("#SexBar_"+d.Code).node() != null){
            d3.selectAll(".SexBar")
              .style("opacity", 0.3);

            d3.selectAll("#SexBar_"+d.Code)
                .style("opacity", 1);
          }
        }else{
          d3.selectAll("#SexBar_"+d.Code)
                changeColorAxes_x(name)
        }
        //HIGHLIGTH GDP line
        if(brushing == '0'){
          d3.selectAll(".lineGDP").each(function(d){
            if(name != d.key){
              d3.select(this).style("opacity", 0.2);
            }
          })
          d3.selectAll(".circleGDP").each(function(d){
            if(name != d.code){
              d3.select(this).style("opacity", 0.2);
            }
          })
        }else{
          d3.selectAll(".lineGDP").each(function(d){
            if(name == d.key){
              d3.select(this)
                .style("stroke-width", 0.8)
                .style("stroke", "red");
            }
          })
          d3.selectAll(".circleGDP").each(function(d){
            if(name == d.code){
              d3.select(this)
                .style("stroke-width", 0.8)
                .style("stroke", "red");
            }
          })
        }

        d3.select("#chart").selectAll("rect").each(function(d){
          if(name == d3.select(this).attr("id")){
            d3.select(this).style("fill", "#6F257F")
          }
        })

      })
      .on("mouseout", function(d) {
        //removeTooltip
        d3.selectAll('.PCtooltip').style('display', 'none')
        name =d['Entity'].trim()
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

        brushed_p=[];
        d3.selectAll('.brushed').each(function(d){
          brushed_p.push(d.trim())
        })

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

        //DE-HIGHLIGTH Population Bar
        if(brushing == '0'){
        d3.selectAll(".populationBar")
          .style("opacity", 1);
        }
        if(checkLabelBar == false){
            d3.selectAll("#populationBarText_"+d.Code)
                .style("opacity", 0);
        }

        //DE-HIGHLIGTH Sex Bar
        if(brushing == '0'){
          d3.selectAll(".SexBar")
            .style("opacity", 1);
        }else{
          d3.selectAll(".SexBar")
          .style("stroke-width", 0);
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

          code = d.Code
          d3.select("#chart").selectAll("rect").each(function(d){
            if(code == d3.select(this).attr("id")){
              d3.select(this).style("fill", "#bcbcbc")
            }
          })
      })

  // Add a group element for each dimension.
  var g = svg_PC.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .call(d3.drag()
          .subject(function(d) { return {x: x(d)}; })
          .on("start", function(d) {
            dragging[d] = x(d);
            background.attr("visibility", "hidden");
          })
          .on("drag", function(d) {
            dragging[d] = Math.min(width, Math.max(0, d3.event.x));
            foreground.attr("d", path);
            dimensions.sort(function(a, b) { return position(a) - position(b); });
            x.domain(dimensions);
            g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
          })
          .on("end", function(d) {
            delete dragging[d];
            transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
            transition(foreground).attr("d", path);
            background
                .attr("d", path)
              .transition()
                .delay(500)
                .duration(0)
                .attr("visibility", null);
        }));


  // Add an axis and title.
  g.append("g")
    .attr("class", "axis")
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
  .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function(d) { return d; })
    .style("fill", "#ffffff");

// Add and store a brush for each axis.
  g.append("g")
    .attr("class", "brush")
    .each(function(d) {
      d3.select(this).call(y[d].brush = d3.brushY()
                      .extent([[-10,0], [10,height]]) //coordinates brush
                      .on("end", brush_end)
                      .on("brush", brush));
    })
  .selectAll("rect")
    .attr("x", -8)
    .attr("width", 16);

    function brush_end() {
      var all_brushed = true
      var brush_result = brush()
      var brushedEntity= brush_result[0];
      var entity = []
      brushedEntity.forEach( n => entity.push(n.Code.trim()) )
      if(visualization==0){
        var idNotBrush =d3.select('#mapCountry').selectAll('path').filter(function(d){
            return !entity.includes( d3.select('#'+this['id']).attr('name') );
        });
        var idBrush =d3.select('#mapCountry').selectAll('path').filter(function(d){
             return entity.includes( d3.select('#'+this['id']).attr('name') );
        });
      }
      else{
        var idNotBrush =d3.selectAll('.Country').filter(function(d){
          //////console.log("idNotBrush: "+ d3.select('#'+d.properties.adm0_a3).attr('id'));
          return !entity.includes( d3.select('#'+d.properties.adm0_a3).attr('id') );
         });
        var idBrush =d3.selectAll('.Country').filter(function(d){
          ////console.log("idBrush: "+ d3.select('#'+d.properties.adm0_a3).attr('id'));
          return entity.includes( d3.select('#'+d.properties.adm0_a3).attr('id') );
        });
      }
      idNotBrush.style('opacity','0.5')
                .classed("pc_brushed", false)
                .style("stroke", "#273746")
                .style("stroke-width", .1);

      idBrush.style('opacity','1')
             .style("stroke", "#273746")
             .style("stroke-width", .1)
             .classed("pc_brushed", true);
      //for Tsne
      d3.select("#pca-kmeans").selectAll("circle").each(function(d){
        if(!entity.includes(d3.select(this).attr('id'))){
          d3.select(this).classed("pc_brushed", true)
        }
        if(entity.includes( d3.select(this).attr('id'))){
          d3.select(this).classed("pc_brushed", false);
        }
      })
      var idNotBrush_tsne =d3.select("#pca-kmeans").selectAll('circle').filter(function(d){
        return !entity.includes( d3.select(this).attr('id') );
       });
      var idBrush_tsne =d3.select("#pca-kmeans").selectAll('circle').filter(function(d){
        return entity.includes( d3.select(this).attr('id') );
      })
      idNotBrush_tsne.style('opacity','0.3');
      idBrush_tsne.style('opacity','1')
      if(!zoom_cluster){
        idBrush_tsne.raise().classed("active", true)
                    .attr("r","4");
      }else{
        idBrush_tsne.raise().classed("active", true)
                    .attr("r",4 / transform.k);
      }
      //for Plot Population
      var idNotBrush_pop =d3.select("#popPlot").selectAll('.populationBar').filter(function(d){
        return !entity.includes(d.data.code );
       });
      var idBrush_pop =d3.select("#popPlot").selectAll('.populationBar').filter(function(d){
        return entity.includes( d.data.code );
       })
      idNotBrush_pop.style('opacity','0.4');
      idNotBrush_pop.classed("pc_brushed", false)
      idBrush_pop.style('opacity','1');
      idBrush_pop.classed("pc_brushed", true)

      //for Plot Ages
      var idNotBrush_sex =d3.select("#sexPlot").selectAll('.SexBar').filter(function(d){
        return !entity.includes(d.code );
       });
      var idBrush_sex =d3.select("#sexPlot").selectAll('.SexBar').filter(function(d){
        return entity.includes( d.code );
       })
      idNotBrush_sex.style('opacity','0.3');
      idBrush_sex.style('opacity','1');
      idBrush_sex.classed("pc_brushed", true)

      // for Plot GDP
      var idNotBrush_gdp =d3.select("#timePlot").selectAll('.lineGDP').filter(function(d){
        return !entity.includes(d.key );
       });
      var idBrush_gdp =d3.select("#timePlot").selectAll('.lineGDP').filter(function(d){
        return entity.includes( d.key);
       })
       var idNotBrush_gdp_circle =d3.select("#timePlot").selectAll('.circleGDP').filter(function(d){
         return !entity.includes(d.code);
        });
       var idBrush_gdp_circle =d3.select("#timePlot").selectAll('.circleGDP').filter(function(d){
         return entity.includes(d.code);
        })
      idNotBrush_gdp.style('opacity','0.2');
      idBrush_gdp.style('opacity','1');
      idNotBrush_gdp_circle.style('opacity','0.2');
      idBrush_gdp_circle.style('opacity','1');
      idBrush_gdp.classed("pc_brushed", true)
      idBrush_gdp_circle.classed("pc_brushed", true)

      //if all brush have been removed and there are no actives restore all countries
      d3.select("#my_dataviz").selectAll(".SexBar").each(function(t){
        if(d3.select(this).attr("name")!= null){
          if(!entity.includes(d3.select(this).attr("name"))){
            all_brushed = false
          }
        }
      })
      actives = brush_result[1]
      if(all_brushed && actives.length==0){
        brushing = "0"
        idNotBrush.style('opacity','1');
        idBrush.style('opacity','1');
        idNotBrush_tsne.style('opacity','1');
        delete_brush()
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
        if(click_countries == 1){
          d3.selectAll(".Country").style('opacity', 0.5);
          selected_countries.forEach((item, i) => {
            d3.select("#"+item)
            .style('opacity', 1);
          });
        }
        if(!zoom_cluster){
          idBrush_tsne.style('opacity','1')
                      .raise().classed("active", false)
                      .attr("r","2");
        }else{
          idBrush_tsne.style('opacity','1')
                      .raise().classed("active", false)
                      .attr("r",2 / transform.k);


          code_Notcluster.style("opacity",'0.5')
        }
      }

    }


  // Handles a brush event, toggling the display of foreground lines.
  function brush() {
    brushing = "1"
    var actives = [];
    d3.selectAll('.Country').classed("pc_brushed",false)
    d3.select("#popPlot").selectAll('.populationBar').classed("pc_brushed",false)
    d3.select("#sexPlot").selectAll('.SexBar').classed("pc_brushed",false)
    d3.select("#timePlot").selectAll('.lineGDP').classed("pc_brushed",false)
    d3.select("#timePlot").selectAll('.circleGDP').classed("pc_brushed",false)
    d3.select("#pca-kmeans").selectAll("circle").classed("pc_brushed", true)
    svg_PC.selectAll(".brush")
      .filter(function(d) {
            y[d].brushSelectionValue = d3.brushSelection(this);
            return d3.brushSelection(this);
      })
      .each(function(d) {
          // Get extents of brush along each active selection axis (the Y axes)
            actives.push({
                dimension: d,
                extent: d3.brushSelection(this).map(y[d].invert)
            });
      });
    svg_PC.selectAll(".selection").style("fill","yellow")
    svg_PC.selectAll(".selection").style("stroke","black")
    var selected = [];
    // Update foreground to only display selected values
    foreground.style("display", function(d) {
        let isActive = actives.every(function(active) {
            ////console.log(active);
            var result
            if(!isAbsolute){
                ////console.log(active.extent[0]);
                result = active.extent[1] <= d[active.dimension] && d[active.dimension] <= active.extent[0];
            }
            else{
                population = findPopulation(d["Code"], d["Year"])
                result = active.extent[1] <= (d[active.dimension]/population)*100000 && (d[active.dimension]/population)*100000 <= active.extent[0];
            }
            return result;
        });
        // Only render rows that are active across all selectors
        if(isActive) selected.push(d);
        return (isActive) ? null : "none";
    });
    ////console.log(selected);
    return [selected, actives]
  }


  })
}

function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}
