  
// Declaring the global variables
//var express     = require('http');
var payload = {};
   var connection = new Postmonger.Session();
   var steps = [
   {'key': 'dekey', 'label': 'Select Data Extension key'},
   {'key': 'DEmapping', 'label': 'Mapping'}
];
var currentStep = steps[0].key;
var pkColumnNumber = 0;
var columnNumber = 0;
var eventDefinitionKey;
var dataExtensionID;

connection.trigger('ready');
// Below event is executed anytime and is used to get the event definition key

connection.trigger('requestTriggerEventDefinition');
connection.on('requestedTriggerEventDefinition',
function(eventDefinitionModel) {
   if(eventDefinitionModel){
     eventDefinitionKey = eventDefinitionModel.eventDefinitionKey;
     dataExtensionID = eventDefinitionModel.dataExtensionId;
     console.log('DE ObjectID in RTED is : ' + dataExtensionID);
     addSrcColumnNames(dataExtensionID);
   }
});


// Below event is executed when activity is loaded on UI

connection.on('initActivity',function(data){
   console.log(data);
   if (data) {
       payload = data;
   }
   var pkColumnNumberData =  payload['arguments'].execute.inArguments[0].pkColumnNumber;
   var columnNumberData =  payload['arguments'].execute.inArguments[0].columnNumber;
   document.getElementById('DEName').value= payload['arguments'].execute.inArguments[0].DEName;
   document.getElementById('pkColumnNumber').value= pkColumnNumberData;
   document.getElementById('columnNumber').value= columnNumberData;
   console.log('DE ObjectID in initActivity is : ' + dataExtensionID)
   createrows();
   getDEList();
   for (var i=1;i<=pkColumnNumberData;i++){
    document.getElementById('pkSrcColumnName'+i).value = payload['arguments'].execute.inArguments[0]['pkSrcColumnName'+i];
   // document.getElementById('pkDestColumnName'+i).value = payload['arguments'].execute.inArguments[0]['pkDestColumnName'+i];
   }
   for (var i=1;i<=columnNumberData;i++){
    document.getElementById('checkBoxElement'+i).checked = payload['arguments'].execute.inArguments[0]['enableDefaultValue'+i];   
    document.getElementById('srcColumnName'+i).value = payload['arguments'].execute.inArguments[0]['srcColumnName'+i];
   // document.getElementById('destColumnName'+i).value = payload['arguments'].execute.inArguments[0]['destColumnName'+i];
   }
   
}); 



// Below event is executed when next/Done/Back is clicked on UI

connection.on('clickedNext',onClickedNext);
connection.on('clickedBack', onClickedBack);
connection.on('gotoStep', onGotoStep);


function onClickedNext () {
   if (currentStep.key == 'DEmapping') {
       save();
   } else {
    createrows();
       connection.trigger('nextStep');
   }
}

// deleteRows function is used to delete the rows from table

function deleteRows(table,rowCount,columnCount){
    do{
        table.deleteRow(rowCount);
        rowCount--;
    }
    while(rowCount>columnCount);
}

// deleteRows function is used to add the rows into the table

function createrows(){
    pkColumnNumber = parseInt(document.getElementById('pkColumnNumber').value);
    columnNumber = parseInt(document.getElementById('columnNumber').value);
    var table = document.getElementById('pkColumnTable');
    var rowCount = table.rows.length-1;
    console.log('pkColumnNumber : ' + pkColumnNumber);
    console.log('columnNumber : ' + columnNumber);
    console.log('rowCount : ' + rowCount);
    if (rowCount > pkColumnNumber){
        deleteRows(table,rowCount,pkColumnNumber);
    } 
    for (var i=1;i<=pkColumnNumber;i++){
    var htmlId = document.getElementById('pkSrcColumnName'+i);
    if (htmlId != null) {
       continue;
    }
    var row = table.insertRow(i);
    var cell1 = row.insertCell(0);
    cell1.innerHTML="Primary Column "+i;
    var cell2 = row.insertCell(1);
    var element1 = document.createElement("textarea");
    element1.id="pkSrcColumnName"+i;
    cell2.appendChild(element1);
    var cell3 = row.insertCell(2);
    var element2 = document.createElement("select");
    element2.id="pkDestColumnName"+i;
    cell3.appendChild(element2);
    }
    var table2 = document.getElementById('columnTable');
    var rowCount2 = table2.rows.length-1; 
    console.log('rowCount2 : ' + rowCount2);
    if (rowCount2 > columnNumber){
        deleteRows(table2,rowCount2,columnNumber);
    } 
    for (var i=1;i<=columnNumber;i++){
    var htmlId = document.getElementById('srcColumnName'+i);
    if (htmlId != null) {
       continue;
    }
    var row = table2.insertRow(i);
    var cell1 = row.insertCell(0);
    cell1.innerHTML="Non-Primary Column "+i;
    var cell2 = row.insertCell(1);
    var element1 = document.createElement("textarea");
    element1.id="srcColumnName"+i;
    cell2.appendChild(element1);
    var cell3 = row.insertCell(2);
    var element2 = document.createElement("select");
    element2.id="destColumnName"+i;
    cell3.appendChild(element2);
    var cell4 = row.insertCell(3);
    // Code for Checkbox Start
    var checkBoxElement1 = document.createElement("input");
    checkBoxElement1.type="checkbox"
    checkBoxElement1.id="checkBoxElement" + i;
    cell4.appendChild(checkBoxElement1);
    //Code for checkbox Stop
    }
}

// onClickedBack function is called when user click on back button on UI

function onClickedBack () {
   connection.trigger('prevStep');
}

// onGotoStep function is called when user click on back/Next button on UI

function onGotoStep (step) {
   showStep(step);
   connection.trigger('ready');
}

// showStep function is used to hide/show content in the UI

function showStep (step, stepIndex) {
   if (stepIndex && !step) {
       step = steps[stepIndex - 1];
   }

   currentStep = step;

   document.getElementById("step1").style.display = 'none';
   document.getElementById("step2").style.display = 'none';
   console.log('Current step 1-'+currentStep.key);

   switch (currentStep.key) {
   case 'dekey':
      document.getElementById("step1").style.display = 'block';
       break;
   case 'DEmapping':
       console.log('In the DE mapping- ');
       document.getElementById("step2").style.display = 'block';
       break;
   }
}

// save function is used to save the content from the UI

function save () {
    console.log('DE ObjectID in save is : ' + dataExtensionID)
    var DEName = document.getElementById('DEName').value;
    console.log('DEName: '+DEName);
    var inArguments = {};
    for (var i=1;i<=pkColumnNumber;i++){
        var sourceColumnName = document.getElementById('pkSrcColumnName'+i).value;
        var destColumnName = document.getElementById('pkDestColumnName'+i).value;
        inArguments["pkSrcColumnName"+i]=sourceColumnName;
        inArguments["pkSrcColumnValue"+i]="{{Event."+ eventDefinitionKey +".\""+sourceColumnName+"\"}}";
        inArguments["pkDestColumnName"+i]=destColumnName;
    }
    for (var i=1;i<=columnNumber;i++){
        var sourceColumnName = document.getElementById('srcColumnName'+i).value;
        var destColumnName = document.getElementById('destColumnName'+i).value;
        var enableDefaultValue = document.getElementById('checkBoxElement'+i).checked;
        inArguments["enableDefaultValue"+i]=enableDefaultValue;
        inArguments["srcColumnName"+i]=sourceColumnName;
        if (enableDefaultValue == true){
        inArguments["srcColumnValue"+i]=sourceColumnName;
        }
        else {
        inArguments["srcColumnValue"+i]="{{Event."+ eventDefinitionKey +".\""+sourceColumnName+"\"}}";
        }
        inArguments["destColumnName"+i]=destColumnName;
    }
    inArguments["pkColumnNumber"]=pkColumnNumber;
    inArguments["columnNumber"]=columnNumber;
    inArguments["DEName"]=DEName;
    console.log("Built inArguments are ::: " + JSON.stringify(inArguments))
   payload['arguments'].execute.inArguments = [inArguments];  
   payload['arguments'].execute.useJwt = true;
   payload['configurationArguments'].save.useJwt = true;
   payload['metaData'].isConfigured = true;
   payload['key'] = 'REST-1';
   payload['type'] = 'REST';
   connection.trigger('updateActivity', payload);
}


function getEntrySourceColumnList(objectID,pkColumnNumber,columnNumber){
    var http = new XMLHttpRequest();
    var ID = objectID;
    var url = 'https://mcservicecall-dev.herokuapp.com/MCService/getColumnList?ID='+ID + '&DEName=false';
    var data = new FormData();
    http.open('GET', url);
    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            var obj = {};
            obj = JSON.parse(this.responseText);
            console.log(obj);
            var select = document.getElementById("pkSrcColumnName1");
            select.innerHTML = "";
            for(var index in obj) {
            select.options[select.options.length] = new Option(obj[index], obj[index]);
            }
            document.getElementById('pkSrcColumnName1').value= payload['arguments'].execute.inArguments[0].pkSrcColumnName1;
            for (var i=2;i<=pkColumnNumber;i++){
                document.getElementById('pkSrcColumnName'+i).innerHTML= select.innerHTML;
                document.getElementById('pkSrcColumnName'+i).value= payload['arguments'].execute.inArguments[0]['pkSrcColumnName'+i];
                }
            for (var i=1;i<=columnNumber;i++){
                document.getElementById('srcColumnName'+i).innerHTML= select.innerHTML;
                document.getElementById('srcColumnName'+i).value= payload['arguments'].execute.inArguments[0]['srcColumnName'+i];
                }
        }
    }
    http.send(data); 
  }
  
  function getColumnList(option){ 
      console.log('pkCOlumn Number in getColumnslist' + pkColumnNumber);
    var http = new XMLHttpRequest();
    var ID = option.value;
    var url = 'https://mcservicecall-dev.herokuapp.com/MCService/getColumnList?ID='+ID+ '&DEName=true';
    var data = new FormData();
    http.open('GET', url);
    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            var obj = {};
            obj = JSON.parse(this.responseText);
            console.log(obj);
            var select = document.getElementById("pkDestColumnName1");
            select.innerHTML = "";
            for(var index in obj) {
            select.options[select.options.length] = new Option(obj[index], obj[index]);
            }
            document.getElementById('pkDestColumnName1').value= payload['arguments'].execute.inArguments[0].pkDestColumnName1;
            for (var i=2;i<=pkColumnNumber;i++){
                document.getElementById('pkDestColumnName'+i).innerHTML= select.innerHTML;
                document.getElementById('pkDestColumnName'+i).value= payload['arguments'].execute.inArguments[0]['pkDestColumnName'+i];
                }
            for (var i=1;i<=columnNumber;i++){
                document.getElementById('destColumnName'+i).innerHTML= select.innerHTML;
                document.getElementById('destColumnName'+i).value= payload['arguments'].execute.inArguments[0]['destColumnName'+i];
                }
           }
    }
    http.send(data); 
  }

  function getDEList(){
    var http = new XMLHttpRequest();
    var url = 'https://mcservicecall-dev.herokuapp.com/MCService/getDEList/';
    var data = new FormData();
    http.open('GET', url);
    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            var obj = {};
            obj = JSON.parse(this.responseText);
            var select = document.getElementById("DEName");
            for(var index in obj) {
            select.options[select.options.length] = new Option(obj[index], index);// new Option(text-DEName, value-CustomerKey)
            }
            document.getElementById('DEName').value= payload['arguments'].execute.inArguments[0].DEName;
            console.log('CheckPoint 1 :')
            if(document.getElementById('DEName').selectedIndex >= 0){
            getColumnList(document.getElementById('DEName'));} 
        } 
    }
    http.send(data); 
  }

  function addSrcColumnNames(){
      console.log('DE ObjectID is : ' + dataExtensionID)
      console.log('pkColumnNumber is : ' + pkColumnNumber)
    getEntrySourceColumnList(dataExtensionID,pkColumnNumber,columnNumber);    
  }


