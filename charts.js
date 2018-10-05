// Adjust this object to adjust the grade categories to plot and manipulate
var syllabus = {
	Book_problems: 10,
	Problem_sets: 15,
	Lab: 20,
  Midterms:45,
  Final:10
};

// List grade categories
var categories = Object.keys(syllabus);

var theData = [];
var groups = [];

// Given a group title and scaling factor, adds a new group to the dataset
function addGroup(title, factor){
  var newGroup = Object.assign({}, syllabus);
  newGroup.x = title;

  for (var i in categories) {
	  newGroup[categories[i]] *= factor;
  }

  theData.push(newGroup);
  groups.push(title);
}

function removeGroup(){
  theData.pop();
  groups.pop();
}

addGroup("Total possible",1);


//Plotting parameters
var chart = c3.generate({
  bindto: '#chartContainer',
  data: {
    json: theData,
    keys:{
      value:categories
    },
    type: 'bar',
    groups: [
      categories
    ],
    order: function (t1, t2) {
      return t1.id < t2.id;
    }
  },
  grid: {
    lines:{front:false},
    y: {
      front:true,
      lines: [
        {value:  0},
        {value: 60, class:"dotted-line", text:"D"},
        {value: 70, class:"dotted-line", text:"C"},
        {value: 80, class:"dotted-line", text:"B"},
        {value: 90, class:"dotted-line", text:"A"},
        {value:100}
      ]
    }
  },
  axis: {
    x: {
      type: 'category',
      categories: groups
    },
    y:{
      max: 100,
      min: 0,
      padding:{top:15,bottom:0}
    }
  },
  tooltip:{
    order:function (t1, t2) {
      return t1.id > t2.id;
    }
  }
});

// Button to add hypothetical grade breakdowns
hypoCount = 0
d3.select("#adder").on("click",function(){
  addGroup("Hypothetical "+ ++hypoCount,0.75);
  chart.load({ json:theData, keys:{value:categories} });
  addSliders(hypoCount);
  categories.forEach(function(cat){
    updateComponent(hypoCount, cat,theData[hypoCount][cat]);
  });
});

d3.select("#remover").on("click",function(){
  if (theData.length >1){
  removeGroup();
  chart.load({ json:theData, keys:{value:categories} });
  removeSliders(hypoCount--);
  }
});

// Update attributes
function updateComponent(groupNumber, compName, compVal) {

  // adjust the text on the range slider
  d3.select(".hyp"+groupNumber+" #" + compName + "-value")
    .text(makeValueText(compName,compVal));

  d3.select(".hyp"+groupNumber+" #" + compName).property("value", compVal);

  theData[groupNumber][compName] = compVal;

  chart.load({ json:theData, keys:{value:categories} });
}

// return the key/value pairs for everything except the group name
function groupData(idx){
  return d3.entries(theData[0])
  .filter(function(entry){
    return entry.key !== "x";
  });
}

function makeValueText(compName,compVal){
  return Math.round(100*compVal/theData[0][compName])+'%';
}

// makes HTML of an individual slider
function makeSlide(catName,outOf){
  return '<label for="'+catName+'" > '+catName+': <span id="'+catName+'-value">…</span></label> <input type="range" min="0" max="'+outOf+'" step="0.1" id="'+catName+'">';
}

function addSliders(count){

  newGroup = d3.select("#sliders")
              .append('div')
              .attr("class","sliderGroup group-"+count);

  newGroup.append('div')
          .attr("class","sliderGroup-title")
          .text("Hypothetical "+count);


  newGroup.selectAll('.hyp'+count)
  .data(groupData(0)).enter()
  .append('div').attr("class","hyp"+count)
  .html(function(d){return makeSlide(d.key,d.value);});

  // read a change in the input
  categories.forEach(function(cat){
    d3.select(".hyp"+count+" #"+cat).on("input", function() {
      updateComponent(count, cat,+this.value);
    });
  });
}

function removeSliders(count){
  d3.select("#sliders")
    .selectAll('.group-'+count)
    .remove();
}

function getCompName(selection){
  return selection.selectAll('input').attr('id');
}
