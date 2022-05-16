YEAR = [2019]   //2010,2011,2012,2013,2014,2015,2016,2017,2018,
CMD_COUNTRIES = "only"
CMD_CONTINENT = false
COUNTRIES = ["Algeria","Burundi","Cuba","Italy", "Ireland","Zambia","Zimbabwe"]
DISORDERS = ["Depressive", "Anxiety", "Bipolar", "Eating", "Schizophrenia", "Attention", "Conduct", "intellectualDisability", "Autism"]
ABSOLUTE = false

MDS_PC_LOCK = false

//var dataset_path = "/Users/felicemassotti/Desktop/visual/project/General/datasets/Mental_Disorder_with_continent.csv"
var dataset_path = "./Dataset/Mental_Disorder_with_continent.csv";    //Pythonanywhere
var visualization = '1'; //variable that contain the visualization type of the moment: =0 =>vis. for countries; =1 => vis. for continent
var brushing = '0';   //indicates if exists any brush 0->no , 1-> yes

function get_continents(data) {
  const data_filtered = []
  for(let i =0 ; i < data.length ; i++){
    if(data[i].Code.length == 2){
    //if(data[i].Entity == "Europe"){
      data_filtered.push(data[i])
      console.log(data[i]);
      //console.log("ciaoooo");
    }
  }
  return data_filtered
}

function filterByCountry(command, countries, data){   //command da implementare
  const data_filtered = []
  for(let i = 0; i < data.length ; i++){
    countries.forEach(function(c){
      if(data[i].Entity == c){
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
        //console.log(data[i].Entity);
        //console.log(y)
        data_filtered.push(data[i])
      }
    })
  }
  return data_filtered
}

function findPopulation(entity, year){
  //var dataset_path2 = "/Users/felicemassotti/Desktop/visual/project/General/datasets/cleaned_dataset2.csv"
  var dataset_path2 = "./Dataset/cleaned_dataset4.csv"    //Pythonanywhere
  var population = []
  d3.text(dataset_path2 ,function(data){
    var dsv = d3.dsvFormat(',');
    var data =dsv.parse(data);
    for (var i = 0; i < data.length; i++) {
      if(data[i].Name == entity && data[i].Series == "Population, total"){
        //2011 [YR2011]
        year = "year"+year[2]+year[3]
        population_val = data[i][year]
        console.log(population_val + " " + data[i].Name + ":"+ year);
        //console.log(data[i].Entity);
        //console.log(data[i].Year);
        //return population;
        population.push(population_val)
      }
    }
  })
  //console.log(population);
  //return population
  return 100000
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
  console.log(flag);
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
/*
valore = $('#continent_country option:selected').val()
valore2 = $('#absolute option:selected').val()
console.log(valore);
console.log(valore2);*/

function draw(year,cmd_continent,countries, disorders, isAbsolute ){
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
    var dsv = d3.dsvFormat(',');
    var data = dsv.parse(raw);

  data = filterByYear(year,data)
  if(cmd_continent){
    console.log("prendo i continenti");
    data = get_continents(data)
  }else{
    data = filterByCountry(CMD_COUNTRIES, COUNTRIES, data)
  }

   // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
  //dimensions = d3.keys(data[0]).filter(function(d) { return d !="Index" && d!="Entity" && d!="Code" && d!='Year'})
  dimensions = DISORDERS
  console.log(dimensions);
  // For each dimension, I build a linear scale. I store all in a y object
  var y = {}
  for(i in dimensions){
    var name = dimensions[i]
    y[name] = d3.scaleLinear()
    //d3.extent  returns the minimum and maximum value in an array, in this case i take from the dataset the i-th feature domain
    .domain(d3.extent(data, function(d){
        if(!isAbsolute){ return +d[name];}
        else{
          var population = findPopulation(d["Entity"], d["Year"])
          //console.log(population);
          r = (d[name]/population) *10000
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
        //console.log(p + " "+ d[p]);
        return [x(p), y[p](d[p])];}
      else{
        population = findPopulation(d["Entity"], d["Year"])
        return [x(p), y[p]((d[p]/population) *10000)]
      }
    }));
  }
  // Add grey background lines for context
  background = svg_PC.append("g")
    .attr("class", "background")
    .selectAll("path")
    .data(data)
    .enter().append("path")
    .attr("d", path);
  // Add blue foreground lines for focus
  foreground = svg_PC.append("g")
    .attr("class", "foreground")
    .selectAll("path")
    .data(data)
    .enter().append("path")
    .attr("d", path);


  foreground.attr("name",function(d){return d.Code})
      .on("mouseover", function(d) {
        d3.select(this).raise().classed("active", true);
        d3.select("#my_dataviz").selectAll('path').each(function(t){
          if (d3.select(this).attr("name") != null){
            if(d.Code.trim() == d3.select(this).attr("name").trim()){
              d3.select(this).raise().classed("active", true);
              d3.select(this).style("stroke", "#d7191c")
            }
          }
        })
        //d3.select(this).style("stroke", "#d7191c")
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
        // metti in rilievo su mappe ,guarda visualization
        name = d.Entity
        if(visualization==1){
          d3.selectAll(".Country")
            .each((item,i) =>{
              code = d3.select("#"+ item.properties.adm0_a3).attr("id");
              if(code == d3.select(this).attr("name")){
                d3.select("#"+item.properties.adm0_a3)
                  .style("stroke", "black")
                  .style("stroke-width", 1.05);
                }
              })
        }
        //// TODO: visualization == 0    //continent
        /* mette in rilievo su mds
        brushed_p=[];
        d3.selectAll('.brushed').each(function(d){brushed_p.push(d)})
        if(brushed_p.length==0){
          if(visualization==0) id.style('stroke-width','1.5');
          else id.style('stroke-width','2');
        }
        else if(brushed_p.includes(id.attr('name') ) ){
          oldSt=id.style('stroke');
          id.style('stroke','blue');
        }
        else{
          id.style('stroke-width','1.5');
        }*/

      })
      .on("mouseout", function(d) {
        //removeTooltip
        d3.selectAll('.PCtooltip').style('display', 'none')
        name =d['Entity'].trim()
        if(visualization==1){
          d3.selectAll(".Country")
            .style("stroke", "#273746")
            .style("stroke-width", .2);
        } //// TODO: else visualization==0 for continent

        brushed_p=[];
        d3.selectAll('.brushed').each(function(d){
          brushed_p.push(d.trim())
        })
        //if(brushed_p.length==0) id.style('stroke-width','0.5');
        //if(brushed_p.includes(id.attr('name').trim() ) ){
        //  id.style('stroke',oldSt);
        //}
        //else{
        //  id.style('stroke-width','0.5');
        //}
        d3.select("#my_dataviz").selectAll('path').each(function(t){
          if( d3.select(this).attr("name") != null){
            if ( (MDS_PC_LOCK && !brushed_p.includes(overed) && d3.select(this).attr("name").trim() == overed)|| (!MDS_PC_LOCK )){
              d3.select(this).style("stroke", "#2c7bb6");
            }
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


/*
 // Draw the lines
 svg_PC
   .selectAll("myPath")
   .data(data)
   .enter().append("path")
   .attr("d",  path)
   .style("fill", "none")
   .style("stroke", "#69b3a2")
   .style("opacity", 0.5)
 // Draw the axis:
 svg_PC .selectAll("myAxis")
  // For each dimension of the dataset I add a 'g' element:
  .data(dimensions).enter()
  .append("g")
  // I translate this element to its right position on the x axis
  .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
  // And I build the axis with the call function
  .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
  // Add axis title
  .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function(d) { return d; })
    .style("fill", "black")*/


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
        //console.log("idNotBrush: "+ d3.select('#'+d.properties.adm0_a3).attr('id'));
        return !entity.includes( d3.select('#'+d.properties.adm0_a3).attr('id') );
       });
      var idBrush =d3.selectAll('.Country').filter(function(d){
        //console.log("idBrush: "+ d3.select('#'+d.properties.adm0_a3).attr('id'));
        return entity.includes( d3.select('#'+d.properties.adm0_a3).attr('id') );
      });
    }
    idNotBrush.style('opacity','0.5');
    idBrush.style('opacity','1');
    //for MDS
    d3.select("#countries").selectAll("circle").each(function(d){
      if(!entity.includes(d)){
        d3.select(this).classed("pc_brushed", true)
      }
      if(entity.includes(d)){
        d3.select(this).classed("pc_brushed", false);
      }
    })

    //if all brush have been removed and there are no actives restore all countries
    d3.select("#my_dataviz").selectAll("path").each(function(t){
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
    }

  }

  // Handles a brush event, toggling the display of foreground lines.
  function brush() {
    brushing = "1"
    var actives = [];
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
            //console.log(active);
            var result
            if(!isAbsolute){
                //console.log(active.extent[0]);
                result = active.extent[1] <= d[active.dimension] && d[active.dimension] <= active.extent[0];
            }
            else{
                result = active.extent[1] <= (d[active.dimension]/population)*10000 && (d[active.dimension]/population)*10000 <= active.extent[0];
            }
            return result;
        });
        // Only render rows that are active across all selectors
        if(isActive) selected.push(d);
        return (isActive) ? null : "none";
    });
    //console.log(selected);
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

draw(YEAR, CMD_CONTINENT, COUNTRIES, DISORDERS, ABSOLUTE)
