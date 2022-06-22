var expanded = false;
var counter_loader = 0;


var data = [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019]
var YEAR = ["2019"]
// Range
function create_slide_year(){
  // Range
  var sliderRange = d3
    .sliderBottom()
    .min(d3.min(data))
    .max(d3.max(data))
    .step(1)
    .width(300)
    .tickFormat(d3.format('.4'))
    .ticks(10)
    .tickPadding(-9)
    .displayValue(false)
    .default([2019,2019])
    .fill('#2196f3')
    .handle(
        d3
          .symbol()
          .type(d3.symbolCircle)
          .size(200)()
      )
    .on('onchange', val => {
      YEAR = []
      year = [parseInt(val[0]),parseInt(val[1])]
      i = year[0];
      while(i <= year[1]){
        YEAR.push(i.toString());
        i = i + 1;
      }
      minMaxPop();
      colorMap();
      createBarAgePlot(COUNTRIES);
      createSexPlot(COUNTRIES);
      $('#select_cluster').prop('selectedIndex', 0);
      zoom_cluster = false
      if( click_zoom_country == 1){
        click_countries = 1;
        click_zoom_country = 0;
      }
      delete_brush();
      d3.select("#pca-kmeans").selectAll("svg").remove();
      document.getElementById("loader").style.display = "block"
      counter_loader = counter_loader +1
      update_cluster(new_number_cluster,new_select_sex,new_select_pop, abs)
      draw_chart(YEAR)
    });


  var gRange = d3
    .select('div#slider-range')
    .append('svg')
    .attr("id", "slider_year")
    .attr('width', 356)
    .attr('height', 70)
    .append('g')
    .attr('transform', 'translate(30,30)');

  gRange.call(sliderRange);
}
create_slide_year()
function showCheckboxes() {
  var checkboxes = document.getElementById("checkboxes");
  if (!expanded) {
    checkboxes.style.display = "block";
    expanded = true;
  } else {
    checkboxes.style.display = "none";
    expanded = false;
  }
}

var expanded2 = false;
function showCheckboxes2() {
  var checkboxes2 = document.getElementById("checkboxes2");
  if (!expanded2) {
    checkboxes2.style.display = "block";
    expanded2 = true;
  } else {
    checkboxes2.style.display = "none";
    expanded2 = false;
  }
}


$(document).ready(function() {
  $("#continent_country").on('change', function(){
    if(this.value == "continent"){
      changeCmdContinent(true);
    }else{
      changeCmdContinent(false);
    }
  })
})

var ABSOLUTE = true;
var abs = 1
$(document).ready(function() {
  $("#absolute").on('change', function(){
    if(this.value == "ABSOLUTE"){
      ABSOLUTE = false;
      var element = document.getElementById("showLabel");
      element.style.display = "none";
      abs = 0
      changeCmdAbsolute(ABSOLUTE);
      delete_brush()
      $('#select_cluster').prop('selectedIndex', 0);
      zoom_cluster = false
      if( click_zoom_country == 1){
        click_countries = 1;
        click_zoom_country = 0;
      }
      COUNTRIES = []
      colorMap();
      draw_chart(YEAR)
      createBarAgePlot(COUNTRIES);
      d3.select("#pca-kmeans").selectAll("svg").remove();
      document.getElementById("loader").style.display = "block"
      update_cluster(new_number_cluster,new_select_sex,new_select_pop, abs)
    }else{
      ABSOLUTE = true;
      abs = 1
      check_out = 0
      var element = document.getElementById("showLabel");
      element.style.display = "block";
      changeCmdAbsolute(ABSOLUTE);
      delete_brush()
      $('#select_cluster').prop('selectedIndex', 0);
      zoom_cluster = false
      if( click_zoom_country == 1){
        click_countries = 1;
        click_zoom_country = 0;
      }
      COUNTRIES = []
      colorMap()
      draw_chart(YEAR)
      createBarAgePlot(COUNTRIES);
      d3.select("#pca-kmeans").selectAll("svg").remove();
      document.getElementById("loader").style.display = "block"
      update_cluster(new_number_cluster,new_select_sex,new_select_pop, abs)
    }
  })
})


$(document).ready(function(){
  $("#checkboxes :checkbox").change(function(e){
    if ($(this).is(":checked")){
      counter_loader = counter_loader +1
      filterbyDisorder(true, this.value, this.id);
      minMaxPop();
      colorMap();
      $('#select_cluster').prop('selectedIndex', 0);
      zoom_cluster = false
      COUNTRIES = []
      delete_brush();
      if( click_zoom_country == 1){
        click_countries = 1;
        click_zoom_country = 0;
      }

      d3.select("#pca-kmeans").selectAll("svg").remove();
      document.getElementById("loader").style.display = "block"
      update_cluster(new_number_cluster,new_select_sex,new_select_pop, abs);
      draw_chart(YEAR)
    }else{
      counter_loader = counter_loader +1
      filterbyDisorder(false, this.value, this.id);
      minMaxPop();
      colorMap();
      $('#select_cluster').prop('selectedIndex', 0);
      zoom_cluster = false
      if( click_zoom_country == 1){
        click_countries = 1;
        click_zoom_country = 0;
      }
      COUNTRIES = []
      delete_brush();
      d3.select("#pca-kmeans").selectAll("svg").remove();
      document.getElementById("loader").style.display = "block"
      update_cluster(new_number_cluster,new_select_sex,new_select_pop, abs);
      draw_chart(YEAR)
      }
    });
})


function check_all() {
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = true;
    }
    checkboxes = document.getElementById("checkboxes");
    checkboxes.style.display = "none";
    expanded = false;
}

function resetAll(){
  //reset variable
  zoom_cluster = false
  DISORDERS = ["Depressive", "Anxiety", "Bipolar", "Eating", "Schizophrenia", "Attention", "Conduct", "intellectualDisability", "Autism"]
  YEAR = ["2019"]
  ABSOLUTE = true;
  new_number_cluster = 4
  abs = 1
  check_out = 0
  click_countries = 0;
  click_zoom_country = 0;
  selected_countries = []
  cluster_value = 0;
  $('#absolute').prop('selectedIndex', 0);
  $("#number_clusters").prop('selectedIndex', 1);
  $("#cluster_sex").prop('selectedIndex', 0);
  $("#orderBy").prop('selectedIndex', 0);
  create_table(4)
  select_cluster()
  d3.select("#slider_year").remove()
  create_slide_year()
  //reset graph
  check_all()
  document.getElementById("label_pop").checked = false;
  checkLabelBar = false;
  showLabelBarPop(checkLabelBar)
  delete_brush();
  draw_cluster()
  draw(YEAR, CMD_CONTINENT, COUNTRIES, DISORDERS, ABSOLUTE);
  draw_chart(YEAR)
  createBarAgePlot(COUNTRIES);
  createSexPlot(COUNTRIES);
  createMultilinePlot(COUNTRIES);
  colorMap();
}

$(document).ready(function() {
  $("#reset").on('click', function(){
    resetAll();
  });
})

var checkLabelBar =  false;
$(document).ready(function(){
  $("#showLabel :checkbox").change(function(e){
    if ($(this).is(":checked")){
      checkLabelBar = true;
      showLabelBarPop(checkLabelBar);
    }else{
      checkLabelBar = false;
      showLabelBarPop(checkLabelBar);
      }
    });
})

var zoom_cluster = false
var value_to_zoom = 0
$(document).ready(function() {
  $("#select_cluster").on('change', function(){
      if(this.value=="0"){
        zoom_cluster= false

        if( click_zoom_country == 1){
          click_countries = 1;
          click_zoom_country = 0;
        }
        COUNTRIES = []
        colorMap()
        draw_chart(YEAR)
        zoomCluster(this.value,false, zoom_cluster)
        delete_brush();
        value_to_zoom = this.value
        zoomCluster(this.value,false, zoom_cluster)
        return
      }else{
        zoom_cluster= true
        click_countries = 0;
        click_zoom_country = 0;
        selected_countries = []
        delete_brush();
        value_to_zoom = this.value
        zoomCluster(this.value,false, zoom_cluster)
        highlight_cluster(this.value)
      }
  })
})


var new_number_cluster = 4;
$(document).ready(function() {
  create_table(4)
  $("#number_clusters").on('change', function(){
    new_number_cluster = this.value
  })
})

var new_select_sex = "Both";
$(document).ready(function() {
  create_table(4)
  $("#cluster_sex").on('change', function(){
    new_select_sex = this.value
  })
})

var orderby = "disorders";
$(document).ready(function() {
  create_table(4)
  $("#orderBy").on('change', function(){
    orderby = this.value
    if(orderby == "disorders"){
        createBarAgePlot(COUNTRIES);
    }else{
        orderByYears(orderby);
    }
  })
})

var new_select_pop = ["00-14","15-64","65-100"];
var expanded3 = false;
function showCheckboxes3() {
  var checkboxes3 = document.getElementById("checkboxes3");
  $("#checkboxes3 :checkbox").change(function(e){
    if(!(new_select_pop.includes(this.value))){
      new_select_pop.push(this.value)
    }else{
      var index = new_select_pop.indexOf(this.value);
      new_select_pop.splice(index,1);
    }
  })

  if (!expanded3) {
    checkboxes3.style.display = "block";
    expanded3 = true;
  } else {
    checkboxes3.style.display = "none";
    expanded3 = false;
  }
}


$(document).ready(function() {
  $("#run_kmeans").on('click', function(){
    create_table(new_number_cluster)
    select_cluster()
    zoom_cluster = false
    if( click_zoom_country == 1){
      click_countries = 1;
      click_zoom_country = 0;
    }
    COUNTRIES = []
    draw_chart(YEAR)
    delete_brush();
    draw(YEAR, CMD_CONTINENT, COUNTRIES, DISORDERS, ABSOLUTE)
    d3.select("#pca-kmeans").selectAll("svg").remove();
    document.getElementById("loader").style.display = "block"
    iteration_scatter_plot = 0
    counter_loader = 0
    update_cluster(new_number_cluster,new_select_sex,new_select_pop, abs)
    colorMap()
  })
})

//table for color - #cluster
function create_table(value){
  $('#table_clusters').empty()
  var span = document.getElementById("table_clusters");
  for(var i=0; i<value ; i++){
    var innerDiv = document.createElement('div');
    innerDiv.id = "table_clusters2"
    innerDiv.innerHTML += 'cluster '+ (parseInt(i)+1);
    var margin = parseInt("7") + 25*i
    innerDiv.style.position = "absolute"
    innerDiv.style.marginTop = margin + "%"
    var circle_cluster = document.createElement('div')
    circle_cluster.id = "circle"
    circle_cluster.style.backgroundColor = cluster_color[i]
    innerDiv.append(circle_cluster)
    span.append(innerDiv);
  }
}

function select_cluster(){
  var select_cluster = document.getElementById("select_cluster");
  var actual_lenght_option = $('#select_cluster option').length
  if(new_number_cluster > (actual_lenght_option-1)){
    var range = new_number_cluster-(actual_lenght_option-1)
    for(var j=0 ; j<range; j++){
      var new_text = "Cluster "+ (actual_lenght_option+j)
      var new_value = actual_lenght_option + j
      select_cluster.add(new Option(new_text, new_value))
    }
  }else{
    var range = (actual_lenght_option-1)-new_number_cluster
    for(var j=0; j<range ; j++){
      $("#select_cluster").find("option:last").remove();
    }
  }
  $('#select_cluster').prop('selectedIndex', 0);
}

function delete_brush(){
  brushing= '0'
  d3.selectAll('.Country').classed("pc_brushed",false)
  d3.select("#popPlot").selectAll('.populationBar').classed("pc_brushed",false)
  d3.select("#agePlot").selectAll('.AgeBar').classed("pc_brushed",false)
  d3.select("#timePlot").selectAll('.lineGDP').classed("pc_brushed",false)
  d3.select("#timePlot").selectAll('.circleGDP').classed("pc_brushed",false)
  d3.select("#pca-kmeans").selectAll("circle").classed("pc_brushed", true)
  d3.select("#pca-kmeans").selectAll("circle").style("opacity",1)
}

function orderByYears(val){
  var l = []
  if(click_countries == 1 || click_zoom_country == 1){
    createDataAge(selected_countries)
  }else{
    createDataAge(COUNTRIES)
  }
  pop_year.forEach((item1, i) => {
    if(val == "pop"){
      l.push({code:item1.value[0].code, value: item1.value[0].population})
    }else{
      item1.value.forEach((item2, i) => {
        if(item2.age == val){
          l.push({code:item2.code, value: item2.value})
        }
      });
    }
  });
  l.sort((a, b) => {return b.value - a.value;});
  var countries = []
  l.forEach((item, i) => {
    countries.push(item.code)
  });
  createBarAgePlot(countries);
}
