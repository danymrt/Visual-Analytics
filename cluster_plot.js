// set the dimensions and margins of the graph
var scatter_margin = {top: 10, right: 10, bottom: 35, left: 30},
    scatter_width = document.getElementById("scatter_plot").clientWidth - scatter_margin.left - scatter_margin.right,
    scatter_height = document.getElementById("scatter_plot").clientHeight - scatter_margin.top - scatter_margin.bottom;


var tooltip_cluster = d3.select("#block_container").append("div").attr("class", "tooltip").style("opacity", 0);

// append the svg object to the body of the page
var svg_cluster = d3.select("#scatter_plot")
            .append("svg")
            .attr("width", scatter_width + scatter_margin.left + scatter_margin.right)
            .attr("height", scatter_height + scatter_margin.top + scatter_margin.bottom)
            .append("g")
            .attr("transform","translate(" + scatter_margin.left + "," + scatter_margin.top + ")");

var init_cluster = 0;
var clusterDB = []
var g_circle = svg_cluster.append('g')
var gx = svg_cluster.append("g")
var gy = svg_cluster.append("g")
var xScale = null
var xAxis = null
var yScale = null
var yAxis = null

cluster_color = ['#1f78b4','#e31a1c','#ff7f00','#a6cee3','#fb9a99','#fdbf6f'];
unselected_color = "#404040";
cluster_opacity = 0.8;
first_load = true
var post_call = 0
var outputData3 = 0
var k = 1
var transform = 0
scatter_width = scatter_width - 15
// Draw scatter
function scatter_from_json(svg_cluster,g_circle,data,pc_x,pc_y,first_load, cluster_value) {
  var pc_1 = "tsn"+(pc_x).toString();
  var pc_2 = "tsn"+(pc_y).toString();
  clusterDB = data

  if(counter_loader!=0 && iteration_scatter_plot == counter_loader){
    document.getElementById("loader").style.display = "none";
    iteration_scatter_plot = 0;
    counter_loader = 0;
  }else if(counter_loader!=0 && iteration_scatter_plot != counter_loader){
    return;
  }else if(counter_loader == 0){
    document.getElementById("loader").style.display = "none"
  }

/*----------------------------------------------------------------*/


    if(first_load){
      xScale = d3.scaleLinear()
                       .domain([ d3.min(clusterDB, function(d) {return d.tsn1})-1, d3.max(clusterDB, function(d) {return d.tsn1})])
                       .range([0, scatter_width]);


      xAxis = (g, x) => g
                        .attr("transform", `translate(5,${scatter_height})`)
                        .call(d3.axisBottom(xScale).ticks(16))


     yScale = d3.scaleLinear()
                 .domain([d3.min(clusterDB, function(d) {return d.tsn2})-1, d3.max(clusterDB, function(d) {return d.tsn2})+1])
                 .range([scatter_height, 0]);


      yAxis =  (g, y) => g
                      .attr("transform", `translate(5,0)`)
                      .call(d3.axisLeft(yScale).ticks(16));

        //compute transforms
        var outputData = data.map( Object.values );

        var forse=  d3.nest()
                      .key(function(d) { return d[3]; })
                      .entries(outputData);

        var outputData2 = forse.map( Object.values );

        outputData2.sort(function(a,b){return parseInt(a[0]) > parseInt(b[0])})

        outputData3 = [["Overview", d3.zoomIdentity]].concat(outputData2.map(([key, data]) => {
                    const [x0, x1] = d3.extent(data, d => d[1]).map(xScale);
                    const [y1, y0] = d3.extent(data, d => d[2]).map(yScale);
                    k = 0.9 * Math.min(scatter_width / (x1 - x0), scatter_height / (y1 - y0));
                    const tx = (scatter_width - k * (x0 + x1)) / 2;
                    const ty = (scatter_height - k * (y0 + y1)) / 2;
                    return [`Cluster ${key}`, d3.zoomIdentity.translate(tx, ty).scale(k)];
          }))
        var transform2 = outputData3[0][1];

        //append anme tsn1
        svg_cluster.append("text")
            .attr("transform","translate(" + (scatter_width/2) +" ," + (scatter_height + scatter_margin.top + 15) + ")")
            .style("text-anchor", "middle")
            .style("font-size", "9px")
            .style("fill", "white")
            .text("Tsne Component "+(pc_x).toString());
        //append name tns2
        svg_cluster.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -30 )
          .attr("x",0 - (scatter_height / 2))
          .attr("dy", "1em")
          .style("font-size", "9px")
          .style("text-anchor", "middle")
          .style("fill", "white")
          .text("Tsne Component "+(pc_y).toString());

     // Add dots
     g_circle.selectAll("dot")
        .append("g")
       .attr('transform', 'translate(' + scatter_margin.left + ',' + scatter_margin.top + ')')
       .attr("clip-path", "url(#clip)")
        .data(data)
        .enter()
        .append("circle")
            .attr("class", function (d) { return "cluster" + d.ClusterID} )
            .attr("cx", function (d) {
              return xScale(d[pc_1]);})
            .attr("cy", function (d) {
              return yScale(d[pc_2]);})
            .attr("r", 2)
            .attr("id", function(d){ return d.Code})
            .style("fill", function (d) {
              // Check if there are active filters
              //If some clusters are selected
              return cluster_color[parseInt(d.ClusterID)];
            })
            .attr("cluster_id",function(d){return d.ClusterID})
            .style("cursor", "pointer")
            .style("opacity", function(d) {
              return cluster_opacity;
            })
        .on("mouseover" ,function(d) {
          brush_cluster = d3.select(this).classed("pc_brushed")
          code = d3.select(this).attr("id")
          var tooltip_string = ""

          d3.selectAll(".Country")
          .each(function(d1){
            if(d1.properties.adm0_a3 == d.Code){
              tooltip_string = "<p>"+d1.properties.name + "</p>"
              console.log(tooltip_string);
            }
          })


          // create a tooltip
          tooltip_cluster.style("position", "absolute")
                  .style("background-color", "lightgrey")
                  .style("border-radius", "15px")
                  .html(tooltip_string)
                  .attr( 'x', 20000)
                  .style("left", (d3.event.pageX + 15) + "px")
                  .style("top", (d3.event.pageY - 28) + "px")
                  .transition()
                  .duration(400)
                  .style("opacity", 0.9);
          //highlight corresponding country
          d3.selectAll(".Country").each((item,i) =>{
              d3.select("#"+ item.properties.adm0_a3).style("opacity", .5);
              code_map = d3.select("#"+ item.properties.adm0_a3).attr("id");
                if(code_map == code){
                  if(visualization==1 && !zoom_cluster  && brushing== '0'){
                    if(click_countries == 1){
                      d3.select("#"+item.properties.adm0_a3)
                        .style("stroke", "black")
                        .style("stroke-width", 1.5);
                    }else{
                      d3.select("#"+item.properties.adm0_a3)
                        .style("stroke", "black")
                        .style("stroke-width", 1.5)
                        .style("opacity",1);
                    }

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
                if(code != d3.select(this).attr("name").trim()){
                  d3.select(this).style("stroke", "grey")
                }
              }
            })
          //HIGHLIGTH only one Pop bar
          if(brushing == '0'){
            if(d3.select("#populationBar_"+d.Code).node() != null){
              d3.selectAll(".populationBar")
                .style("opacity", 0.4);

              d3.selectAll("#populationBar_"+d.Code)
                  .style("opacity", 1);
            }else{
              d3.selectAll(".populationBar")
                .style("opacity", 0.4);
            }

            if(checkLabelBar == false){
              d3.selectAll("#populationBarText_"+d.Code)
                  .style("opacity", 1);
            }
          }else{
            d3.selectAll(".populationBar").each(function(d){
              //console.log(d.data.code);
              if(code == d.data.code && brush_cluster==false){
                if(checkLabelBar == false){
                  d3.selectAll("#populationBarText_"+code)
                    .style("opacity", 1);
                }
                changeColorAxes_y(code)
              }
            })
          }
          //HIGHLIGTH Sex Bar
          if(brushing == '0'){
            if(d3.select("#SexBar_"+d.Code).node() != null){
              d3.selectAll(".SexBar")
                .style("opacity", 0.3);

              d3.selectAll("#SexBar_"+d.Code)
                  .style("opacity", 1);
            }else{
              d3.selectAll(".SexBar")
                .style("opacity", 0.4);
            }
          }else{
            d3.selectAll(".SexBar").each(function(d){
              if(d.code==code && brush_cluster==false){
                d3.selectAll("#SexBar_"+code)
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
              if(code == d.key){
                d3.select(this)
                  .style("stroke-width", 0.8)
                  .style("stroke", "red");
              }
            })
            d3.selectAll(".circleGDP").each(function(d){
              if(code == d.code){
                d3.select(this)
                  .style("stroke-width", 0.8)
                  .style("stroke", "red");
              }
            })
          }

          d3.select("#chart").selectAll("rect").each(function(d){
            if(code == d3.select(this).attr("id")){
              d3.select(this).style("fill", "#6F257F")
            }
          })

        })
        .on("mouseout" ,function(d) {
          //remove tooltip
          tooltip_cluster.transition().duration(300)
        		  .style("opacity", 0);

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

          //color all path on the parallel_coo according its cluster
          svg_PC.selectAll(".path_parallel").style("stroke", function(d1){
            var c;
            d3.select("#scatter_plot").selectAll("circle").each(function(d2){
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
          }else{
            if(checkLabelBar == false){
              d3.selectAll("#populationBarText_"+d.code)
                  .style("opacity", 0);
            }
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

        gx.call(xAxis, outputData3[0][1].rescaleX(xScale));
        gy.call(yAxis, outputData3[0][1].rescaleY(yScale));
      }else if(!first_load && !zoom_cluster){

          var t = svg_cluster.transition().duration(1500);
          svg_cluster.select("#xAxis").transition(t).call(xAxis);
          svg_cluster.select("#yAxis").transition(t).call(yAxis);
          svg_cluster.selectAll("circle").transition(t)
              .attr('cx', function(d) {return xScale(d[pc_1])+20})
              .attr('cy', function(d) {return yScale(d[pc_2])-5});
          svg_cluster.selectAll("#text").transition(t)
             .attr("text-anchor", "middle")
             .attr('x', function(d) {return xScale(d[pc_1])})
             .attr('y', function(d) {return yScale(d[pc_2]) - 2 *pointRadius;});
      }

      draw(YEAR, CMD_CONTINENT, COUNTRIES, DISORDERS, ABSOLUTE);
}

$(document).ready(function(){
  if(init_cluster == 0){   //0
    d3.csv('Dataset/kmeans.csv')
      .row(function(d){ return {"Code": d.Code,
          "tsn1": +d.tsn1,
          "tsn2": +d.tsn2,
          "ClusterID": +d.ClusterID};})
      .get(function(error, data) {
        if(error) console.log(err);
        d3.select("#scatter_plot").selectAll("svg").remove();
        svg_cluster = d3.select("#scatter_plot")
                .append("svg")
                .attr("width", scatter_width + scatter_margin.left + scatter_margin.right)
                .attr("height", scatter_height + scatter_margin.top + scatter_margin.bottom)
                .append("g")
                .attr("transform","translate(" + scatter_margin.left + "," + scatter_margin.top + ")");
        var rect = svg_cluster.append("svg")
                .style("fill", "none")
                .attr("width", (scatter_width + scatter_margin.left + scatter_margin.right))   //506
                .attr("height", (scatter_height + scatter_margin.top + scatter_margin.bottom) *0.84) //245
                .attr('transform', 'translate(' +0 + ',' + (0) + ')');

        g_circle = rect.append('g')
        const tooltip_kmeans = g_circle.append("div").attr("class", "PCtooltip").style("opacity", 0);
        gx = svg_cluster.append("g")
                      .attr("class", "axis")
                      .attr("id", "xAxis")
                      .style("stroke", "white");
        gy = svg_cluster.append("g")
                        .attr("class", "axis")
                        .attr("id", "yAxis")
                        .style("stroke", "white")

        scatter_from_json(svg_cluster,g_circle,data, 1,2, first_load, 0);
        });

  }else{
    d3.json("http://serfelix.pythonanywhere.com/clusters", function(err,data) {
      d3.select("#scatter_plot").selectAll("svg").remove();
      // append the svg object to the body of the page
      svg_cluster = d3.select("#scatter_plot")
              .append("svg")
              .attr("width", scatter_width + scatter_margin.left + scatter_margin.right )
              .attr("height", scatter_height + scatter_margin.top + scatter_margin.bottom)
              .append("g")
              .attr("transform","translate(" + scatter_margin.left + "," + scatter_margin.top + ")");

      var rect = svg_cluster.append("svg")
              .style("fill", "none")
              .attr("width", (scatter_width + scatter_margin.left + scatter_margin.right))   //506
              .attr("height", (scatter_height + scatter_margin.top + scatter_margin.bottom) *0.84) //245
              .attr('transform', 'translate(' +0 + ',' + (0) + ')');

      g_circle = rect.append('g')
      const tooltip_kmeans = g_circle.append("div").attr("class", "PCtooltip").style("opacity", 0);
      gx = svg_cluster.append("g")
                    .attr("class", "axis")
                    .attr("id", "xAxis")
                    .style("stroke", "white");
      gy = svg_cluster.append("g")
                      .attr("class", "axis")
                      .attr("id", "yAxis")
                      .style("stroke", "white")

        scatter_from_json(svg_cluster,g_circle,data.data, 1,2, first_load, 0);
    });
  }

});

//to redraw after reset
function draw_cluster(){
  d3.csv('Dataset/kmeans.csv')
    .row(function(d){ return {"Code": d.Code,
        "tsn1": +d.tsn1,
        "tsn2": +d.tsn2,
        "ClusterID": +d.ClusterID};})
    .get(function(error, data) {
      if(error) console.log(err);
      d3.select("#scatter_plot").selectAll("svg").remove();
      // append the svg object to the body of the page
      svg_cluster = d3.select("#scatter_plot")
              .append("svg")
              .attr("width", scatter_width + scatter_margin.left + scatter_margin.right )
              .attr("height", scatter_height + scatter_margin.top + scatter_margin.bottom)
              .append("g")
              .attr("transform","translate(" + scatter_margin.left + "," + scatter_margin.top + ")");

      var rect = svg_cluster.append("svg")
              .style("fill", "none")
              .attr("width", (scatter_width + scatter_margin.left + scatter_margin.right))   //506
              .attr("height", (scatter_height + scatter_margin.top + scatter_margin.bottom) *0.84) //245
              .attr('transform', 'translate(' +0 + ',' + (0) + ')');

      g_circle = rect.append('g')
      const tooltip_kmeans = g_circle.append("div").attr("class", "PCtooltip").style("opacity", 0);
      gx = svg_cluster.append("g")
                    .attr("class", "axis")
                    .attr("id", "xAxis")
                    .style("stroke", "white");
      gy = svg_cluster.append("g")
                      .attr("class", "axis")
                      .attr("id", "yAxis")
                      .style("stroke", "white")

      scatter_from_json(svg_cluster,g_circle,data, 1,2, first_load, 0);
      });
}

var iteration_scatter_plot = 0;
function update_cluster(n,sex,pop,abs){

  var value_socio = []

  if(sex != "Both"){
    value_socio.push(sex)
  }else{
    value_socio.push("Male")
    value_socio.push("Female")
  }

  if(pop.length != 0){
    pop.forEach((item, i) => {
      value_socio.push(item)
    });
  }

  d3.selectAll('.Country')
    .style('opacity', 1)
    .style("stroke", "#273746")
    .style("stroke-width", .1);

  document.getElementById("loader").style.display = "block"
  d3.json("http://serfelix.pythonanywhere.com/clusters")
  .header("Content-Type", "application/json")
  .post(
    JSON.stringify({
      year: YEAR,
      socio: value_socio,
      n: parseInt(n),
      code: [],
      absolute: abs,
      disorders: DISORDERS
    }),
      function(err, data){
        if(counter_loader !=0){
          iteration_scatter_plot = iteration_scatter_plot + 1;
        }
        if(err) console.log(err);
        d3.select("#scatter_plot").selectAll("svg").remove();
        // append the svg object to the body of the page
        svg_cluster = d3.select("#scatter_plot")
                .append("svg")
                .attr("width", scatter_width + scatter_margin.left + scatter_margin.right )
                .attr("height", scatter_height + scatter_margin.top + scatter_margin.bottom)
                .append("g")
                .attr("transform","translate(" + scatter_margin.left + "," + scatter_margin.top + ")");

        var rect = svg_cluster.append("svg")
                        .style("fill", "none")
                        .attr("width", (scatter_width + scatter_margin.left + scatter_margin.right))   //506
                        .attr("height", (scatter_height + scatter_margin.top + scatter_margin.bottom) *0.84) //245
                        .attr('transform', 'translate(' +0 + ',' + (0) + ')');

        g_circle = rect.append('g')
        gx = svg_cluster.append("g")
                      .attr("class", "axis")
                      .attr("id", "xAxis")
                      .style("stroke", "white");
        gy = svg_cluster.append("g")
                        .attr("class", "axis")
                        .attr("id", "yAxis")
                        .style("stroke", "white")

        scatter_from_json(svg_cluster,g_circle,data.data, 1,2, first_load, 0);
      }
  )
}


function zoomCluster(cluster_value,first_load, zoom_cluster){
  console.log(clusterDB);
  clusterDB = clusterDB.map( Object.values );
  zoom2 = d3.zoom()
            .scaleExtent([1, 40])
            .translateExtent([[-100, -100], [scatter_width + 90, scatter_height + 100]])
            .on("zoom", zoomed2);
  pc_1 = "tsn1"
  pc_2 = "tsn2"
  var new_xScale = 0
  var new_yScale = 0
  var transforms = outputData3

  xScale = d3.scaleLinear()
             .domain(d3.extent(clusterDB, function(d) { return +parseFloat(d[1]); }))
             .range([0, scatter_width]);


  xAxis = (g, x) => g
                    .attr("transform", `translate(0,${scatter_height + 20})`)
                    .call(d3.axisBottom(xScale).ticks(16));


  yScale = d3.scaleLinear()
             .domain(d3.extent(clusterDB, function(d) { return +parseFloat(d[2]); }))
             .range([scatter_height, 0]);

  yAxis =  (g, y) => g
                  .call(d3.axisLeft(yScale).ticks(16));

  if (!first_load ) {
    transform = transforms[cluster_value][1];
    update(transform)
  }

  function zoomed2(event) {
    const {transform} = d3.event;

    g_circle.selectAll("circle").attr("transform", transform)
    g_circle.selectAll("circle").attr("r", 2 / transform.k).each(function(d){
      console.log(d3.select(this).classed("pc_brushed"));
      if(d3.select(this).classed("pc_brushed") == false && brushing=='1'){
        d3.select(this).attr("r",4 / transform.k)
        d3.select(this).style("stroke-width", "0")
      }else{
        d3.select(this).attr("r",2 / transform.k)
        d3.select(this).style("stroke-width", "0")
      }
    })

     new_xScale = transform.rescaleX(xScale);
     new_yScale = transform.rescaleY(yScale);

    xax = d3.axisBottom(xScale).ticks(16)
    yay = d3.axisLeft(yScale).ticks(16)
    gx.call(xax.scale(new_xScale));
    gy.call(yay.scale(new_yScale));


  }


  function update(transform) {
    svg_cluster.selectAll("#text_point_cluster").remove();
    svg_cluster.transition()
    .duration(1500)
    .call(zoom2.transform, transform)
  }

}
