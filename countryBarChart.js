var country_DB = []
var different_array;

function orderByDisorder(data){
  var l = []
  var ex = d3.nest().key(function(d) { return d.Code; })
      .rollup(function(v) {
        var pro = 0;
        v.forEach((item1, i) => {
            if(item1.Code.length == 3){
              if(YEAR.includes(item1.Year.toString())){
                var tot = 0
                var c = DISORDERS.length
              //select the disorder
                DISORDERS.forEach((item3, i) => {
                  ////console.log(item1[item3]);
                  tot = tot + Math.round(item1[item3]);
                });
                pro = pro + tot/c
                }
              }
            });
            //if(ABSOLUTE)
            if(ABSOLUTE){
              pro = ((pro/YEAR.length)/pop_data["$"+v[0].Code])*100000
            }else{
              pro = ((pro/YEAR.length))
            }
            //else pro = tot/c
            l.push({"code":v[0].Code, "value":pro})
          })
      .entries(data);

  l.sort(function(x,y){
    return d3.ascending(x.value, y.value);
  })
  return l
}

function removeContinents(data){
  const data_filtered = []
  for(let i =0 ; i < data.length ; i++){
    if(data[i].Code.length != 2){
      data_filtered.push(data[i])
    }
  }
  return data_filtered
}

//Added only for the mouse wheel
var zoomer = d3.zoom()
    .on("zoom", null);


var margin_chart = {top: 5, right: 0, bottom: 5, left: 0},
    width_chart = document.getElementById("chart").clientWidth + margin_chart.left + margin_chart.right,
    height_chart = document.getElementById("chart").clientHeight - margin_chart.top - margin_chart.bottom;


var svg_chart = d3.select("#chart").append("svg")
        .attr("width", width_chart + margin_chart.left + margin_chart.right)
        .attr("height", height_chart + margin_chart.top + margin_chart.bottom)

function draw_chart(year){
  d3.select("#chart").selectAll("*").remove();
  var svg_chart = d3.select("#chart").append("svg")
          .attr("width", width_chart+ margin_chart.left + margin_chart.right)
          .attr("height", height_chart+ margin_chart.top + margin_chart.bottom)

  var y2 = d3.scaleBand().range([height_chart, 0]).padding(0.1);
  var x2 = d3.scaleLinear().range([width_chart, 0]);

  var g_chart = svg_chart.append("g")
      .attr("transform", "translate(" + margin_chart.left + "," + margin_chart.top + ")");

  d3.csv(dataset_path)
    .get(function(error, data) {
      var brushExtent = 20;
      if(zoom_cluster){
       brushExtent = (height_chart/(COUNTRIES.length)) * 10
        data = data.filter(function(d){
          if(COUNTRIES.includes(d.Code)){
            return d;
          }
        })
      }

      data = removeContinents(data)
      data = filterByYear(year,data)
      if(!ABSOLUTE && check_out == 0){
        data = data.filter(function(d){
          if(!out_countries.includes(d.Code)){
            return d
          }
        })
      }
      data = orderByDisorder(data)  //and ABSOLUTE
      y2.domain(data.map(function(d) {
          return d.code
      })).padding(0.1);
      x2.domain([0, d3.max(data, function(d) {
          return d.value
      })]);

      var translate = 0;

      g_chart.append('g').attr('transform', 'translate(' + margin_chart.left +","+ margin_chart.right + ')')
          .selectAll('.minibar')
          .data(data)
          .enter().append("rect")
          .attr("class", "minibar")
          .attr("id",function(d){return d.code})
          .attr("x", function(d) {
              ////console.log(d.value);
              return x2(d.value)
          })
          .attr("height", y2.bandwidth())
          .attr("y", function(d) {
              return y2(d.code)
          })
          .attr("width", function(d) {
              return x2(0) - x2(d.value);
          });


        this.brush = d3.brushY()
            .extent([
                [0, 0],
                [width_chart, height_chart]
            ])
            .on('brush end', brushed);


         var brush_group = g_chart.append("g")
                .attr('transform', 'translate(' + margin_chart.left +","+ margin_chart.right + ')')
                .attr("class", "brush")
                .call(brush)
                .call(brush.move, [0, brushExtent])

        brush_group.selectAll(".overlay")
            .on("mousedown", brushcenter)


      function brushed() {
          if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom
            var selected = d3.event.selection || y2.range();
            var newData = [];
            y2.domain().forEach(function(d) {
                var pos = y2(d) + y2.bandwidth() / 2;
                if (pos > selected[0] && pos < selected[1]) {
                    newData.push(d);
                }
            })

            if(selected[0] != 0 ){
              click_countries = 0;
              click_zoom_country = 0;
              selected_countries = []
              d3.selectAll(".Country")
              .style("stroke-width",.1)
              if(zoom_cluster){
                  code_Notcluster.style("opacity",.5)
                  code_cluster.style("opacity",1)
              }
            }
            let updateData = [];
            newData.forEach((d) => {
                data.map(function(obj) {
                    if (obj.code == d) {
                        updateData.unshift(obj);
                    }
                })
            });
            COUNTRIES = []
            updateData.forEach((item, i) => {
              COUNTRIES.push(item.code)
            });

            create_other();
      }

      function create_other(){
        d3.select("#my_dataviz").selectAll("path").remove();
        if(orderby == "disorders"){
          createBarAgePlot(COUNTRIES)
        }else{
          orderByYears(orderby)
        }
        createSexPlot(COUNTRIES);
        draw(YEAR, CMD_CONTINENT, COUNTRIES, DISORDERS, ABSOLUTE);
        createMultilinePlot(COUNTRIES);
        init_sex = 1

        if(brushing== '1'){
          brushing = '0';
          colorMap()
          delete_brush()
          if(zoom_cluster){
              code_Notcluster.style("opacity",.5)
              code_cluster.style("opacity",1)
          }
        }

        if(click_countries == 0 && !zoom_cluster){
          d3.selectAll(".Country")
          .style("opacity",1)
          .style("stroke-width",.1)
        }
      }


      function brushcenter(event) {
        delete_brush()
        if(zoom_cluster == false){
          colorMap()
        }

        var target = d3.event.target,
            size = brushExtent,
            range = y2.range(),
            y0 = d3.min(range) + size / 2,
            y1 = d3.max(range) + 0.1 - size / 2;

        var  center = Math.max( y0, Math.min( y1, d3.mouse(target)[1] ) );

        d3.event.stopPropagation();

        brush_group
            .call(brush.extent([
              [0,0],
              [width_chart, height_chart]
            ]))
            .call(brush)
            .call(brush.move, [center - size / 2, center + size / 2])

    }

  })
}
