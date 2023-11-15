//-------------------
// GLOBAL variables
//-------------------
let model;

var canvasWidth           	= 150;
var canvasHeight 			= 150;
var canvasStrokeStyle		= "white";
var canvasLineJoin			= "round";
var canvasLineWidth       	= 10;
var canvasBackgroundColor 	= "black";
var canvasId              	= "canvas";

var clickX = new Array();
var clickY = new Array();
var clickD = new Array();
var drawing;


//---------------
// Create canvas
//---------------
let canvas = document.getElementsByClassName('canvas')[0]

// if(typeof G_vmlCanvasManager != 'undefined') {
//     canvas = G_vmlCanvasManager.initElement(canvas);
// }

ctx = canvas.getContext("2d");

//---------------------
// MOUSE DOWN function
//---------------------
canvas.addEventListener("mousedown",function(e) {
    var rect = canvas.getBoundingClientRect();
    var mouseX = e.clientX- rect.left;;
    var mouseY = e.clientY- rect.top;
    drawing = true;
    addUserGesture(mouseX, mouseY);
    drawOnCanvas();
});

//-----------------------
// TOUCH START function
//-----------------------
canvas.addEventListener("touchstart", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }

    var rect = canvas.getBoundingClientRect();
    var touch = e.touches[0];

    var mouseX = touch.clientX - rect.left;
    var mouseY = touch.clientY - rect.top;

    drawing = true;
    addUserGesture(mouseX, mouseY);
    drawOnCanvas();

}, false);

//---------------------
// MOUSE MOVE function
//---------------------
canvas.addEventListener("mousemove",function(e) {
    if(drawing) {
        var rect = canvas.getBoundingClientRect();
        var mouseX = e.clientX- rect.left;;
        var mouseY = e.clientY- rect.top;
        addUserGesture(mouseX, mouseY, true);
        drawOnCanvas();
    }
});

//---------------------
// TOUCH MOVE function
//---------------------
canvas.addEventListener("touchmove", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
    if(drawing) {
        var rect = canvas.getBoundingClientRect();
        var touch = e.touches[0];

        var mouseX = touch.clientX - rect.left;
        var mouseY = touch.clientY - rect.top;

        addUserGesture(mouseX, mouseY, true);
        drawOnCanvas();
    }
}, false);

//-------------------
// MOUSE UP function
//-------------------
canvas.addEventListener("mouseup",function(e) {
    drawing = false;
});

//---------------------
// TOUCH END function
//---------------------
canvas.addEventListener("touchend", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
    drawing = false;
}, false);

//----------------------
// MOUSE LEAVE function
//----------------------
canvas.addEventListener("mouseleave",function(e) {
    drawing = false;
});

//-----------------------
// TOUCH LEAVE function
//-----------------------
canvas.addEventListener("touchleave", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
    drawing = false;
}, false);

//--------------------
// ADD CLICK function
//--------------------
function addUserGesture(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickD.push(dragging);
}

//-------------------
// RE DRAW function
//-------------------

//------------------------
// CLEAR CANVAS function
//------------------------
document.getElementsByClassName("clear")[0].addEventListener("click",async function () {
    clickX = new Array();
    clickY = new Array();
    clickD = new Array();
    document.getElementsByClassName("prediction-text")[0].empty();
    document.getElementsByClassName("result_box")[0].classList.add('d-none');
});

//-------------------------------------
// loader for cnn model
//-------------------------------------
async function loadModel() {
    console.log("model loading..");

    // clear the model variable
    model = undefined;

    // load the model using a HTTPS request (where you have stored your model files)
    model = await tf.loadLayersModel("../models/model.js");

    console.log("model loaded..");
}

loadModel();

//-----------------------------------------------
// preprocess the canvas
//-----------------------------------------------
function preprocessCanvas(image) {
    // resize the input image to target size of (1, 28, 28)
    let tensor = tf.browser.fromPixels(image)
        .resizeNearestNeighbor([28, 28])
        .mean(2)
        .expandDims(2)
        .expandDims()
        .toFloat();
    console.log(tensor.shape);
    return tensor.div(255.0);
}

//--------------------------------------------
// predict function
//--------------------------------------------
document.getElementsByClassName("predict-button")[0].addEventListener("click",async function () {
    // get image data from canvas
    var imageData = canvas.toDataURL();

    // preprocess canvas
    let tensor = preprocessCanvas(canvas);

    // make predictions on the preprocessed image tensor
    let predictions = await model.predict(tensor).data();

    // get the model's prediction results
    let results = Array.from(predictions);

    // display the predictions in chart
    document.getElementsByClassName("result_box")[0].classList.remove('d-none');
    displayChart(results);
    displayLabel(results);

    console.log(results);
});

//------------------------------
// Chart to display predictions
//------------------------------
var chart = "";
var firstTime = 0;
function loadChart(label, data, modelSelected) {
    var ctx = document.getElementById('chart_box').getContext('2d');
    chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'bar',

        // The data for our dataset
        data: {
            labels: label,
            datasets: [{
                label: modelSelected + " prediction",
                backgroundColor: '#f50057',
                borderColor: 'rgb(255, 99, 132)',
                data: data,
            }]
        },

        // Configuration options go here
        options: {}
    });
}

//----------------------------
// display chart with updated
// drawing from canvas
//----------------------------
function displayChart(data) {
    var select_model  = document.getElementById("select_model");
    var select_option = "CNN";

    label = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    if (firstTime == 0) {
        loadChart(label, data, select_option);
        firstTime = 1;
    } else {
        chart.destroy();
        loadChart(label, data, select_option);
    }
    document.getElementById('chart_box').style.display = "block";
}

function displayLabel(data) {
    var max = data[0];
    var maxIndex = 0;

    for (var i = 1; i < data.length; i++) {
        if (data[i] > max) {
            maxIndex = i;
            max = data[i];
        }
    }
    document.getElementsByClassName(".prediction-text")[0].html("Predicting you draw <b>"+maxIndex+"</b> with <b>"+Math.trunc( max*100 )+"%</b> confidence")
}
