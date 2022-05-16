var expanded = false;

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
    console.log('Changed option value ' + this.value);
    console.log('Changed option text ' + $(this).find('option').filter(':selected').text());
    if(this.value == "continent"){
      changeCmdContinent(true);
    }else{
      changeCmdContinent(false);
    }
  })
})


$(document).ready(function() {
  $("#absolute").on('change', function(){
    console.log('Changed option value ' + this.value);
    console.log('Changed option text ' + $(this).find('option').filter(':selected').text());
    if(this.value == "ABSOLUTE"){
      changeCmdAbsolute(false);
    }else{
      changeCmdAbsolute(true);
    }
  })
})


$(document).ready(function(){
  $("#checkboxes :checkbox").change(function(e){
    if ($(this).is(":checked")){
      filterbyDisorder(true, this.value, this.id);
      updateDisorders(true,this.value);
    }else{
      filterbyDisorder(false, this.value, this.id);
      updateDisorders(false,this.value);
      }
    });
})


var list_years = ["2019"]
$(document).ready(function(){
  $("#checkboxes2 :checkbox").change(function(e){
    var pos = 0
    text = $("#Years option:selected").text();
    years = (text.split(":"))[1]
    if ($(this).is(":checked")){
      //console.log(years.length);
      if(!(this.value in list_years)){
        for(var i=0; i<list_years.length; i++){
          if(parseInt(list_years[i]) < parseInt(this.value)){
            pos ++
          }
        }
        list_years.splice(pos, 0, this.value)
        console.log(list_years);
        //$("#Years").find("option[id='firstoptions']").text("Years:"+list_years);
        if(list_years.length > 3){
          var span = document.getElementById("Years");
          span.style.fontSize = "9.1px";
          $("#Years").find("option[id='firstoptions']").text("Years:"+list_years);
        }else{
          console.log("qui");
          var span = document.getElementById("Years");
          span.style.fontSize = "13.33333px";
          $("#Years").find("option[id='firstoptions']").text("Years:"+list_years);
        }
        changeYear(true, this.value)
        // TODO: function for map
      }
    }else{
      index = list_years.indexOf(this.value)
      if(index != -1){
        list_years.splice(index,1)
        console.log(list_years);
        if(list_years.length > 3 ){
          var span = document.getElementById("Years");
          span.style.fontSize = "9.1px";
          $("#Years").find("option[id='firstoptions']").text("Years:"+list_years);
        }else{
          console.log("qui2");
          var span = document.getElementById("Years");
          span.style.fontSize = "13.33333px";
          $("#Years").find("option[id='firstoptions']").text("Years:"+list_years);
        }
        changeYear(false, this.value)
          // TODO: function for map
      }
    }
    });
})


/*
var two_lines = false
$(document).ready(function(){
  $("#checkboxes2 :checkbox").change(function(e){
    var pos = 0
    text = $("#Years option:selected").text();
    years = (text.split(":"))[1]
    if ($(this).is(":checked")){
      //console.log(years.length);
      if(!(this.value in list_years)){
        for(var i=0; i<list_years.length; i++){
          if(parseInt(list_years[i]) < parseInt(this.value)){
            pos ++
          }
        }
        list_years.splice(pos, 0, this.value)
        console.log(list_years);
        //$("#Years").find("option[id='firstoptions']").text("Years:"+list_years);
        if(list_years.length > 3){
          var span = document.getElementById("Years");
          span.style.fontSize = "9.1px";
          if(two_lines == false){
            two_lines = true
            $("#Years").append($("<option id='newoption'> new option </option>"));
            console.log(document.getElementById("newoption"))
          }
          $("#Years").find("option[id='firstoptions']").text("Years:"+list_years.slice(0,9));
          $("#Years").find("option[id='newoption']").text("Years:"+list_years.slice(4,9));
        }else{
          two_lines = false
          var span = document.getElementById("Years");
          span.style.fontSize = "-0.2em";
          $("#Years").find("option[id='firstoptions']").text("Years:"+list_years);
        }
      }
    }else{
      index = list_years.indexOf(this.value)
      if(index != -1){
        list_years.splice(index,1)
        console.log(list_years);
        if(list_years.length > 3 ){


        }else{
          if(two_lines == true){
            document.getElementById("newoption").remove()
            two_lines = false
          }
          console.log("qui");
          var span = document.getElementById("Years");
          span.style.fontSize = "-0.2em";
          $("#Years").find("option[id='firstoptions']").text("Years:"+list_years);
        }
      }
    }
    });
})*/
