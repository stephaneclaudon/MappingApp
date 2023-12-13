export function initializeMiniApp() {


// SETTING ALL VARIABLES
   
		var isMouseDown=false;
		var canvas = document.createElement('canvas');
		var body = document.getElementsByTagName("body")[0];
		var ctx = canvas.getContext('2d');
		var linesArray = [];
		currentSize = 5;
		var currentColor = "";
		var currentBg = "white";
        var currentSticker = '';
        var currentTool = 'pencil';
        var currentSize = '';
		// INITIAL LAUNCH
        
        var config = '';
        var origine = '../';
        fetch(origine+'config.json')
        .then((response) => response.json())
        .then((json) =>  init_canvas(json) );        
     
        function init_canvas(json){
            console.log(json);
            var ul = document.getElementById('stickersList');
            for (var i = 0; i < json.canvas.stickers.length; ++i) {
                var li = document.createElement('li');
                ul.appendChild(li);
                li.innerHTML = '<img class="sticker elementToFadeInAndOut" src="'+origine+json.canvas.stickers[i]+'" >';
            }
            var ul = document.getElementById('colorsSelector');
            for (var i = 0; i < json.canvas.colors.length; ++i) {
                console.log(json.canvas.colors[i]);
                var li = document.createElement('li'); 
                ul.appendChild(li);                            
                li.id = 'color'+(i+1);
                li.style.backgroundColor = json.canvas.colors[i];
                li.classList.add('item');
                li.setAttribute('data-value',  json.canvas.colors[i]);                
            }

            var ul = document.getElementById('sizeSelector');
            for (var i = 0; i < json.canvas.brushSizesArray.length; ++i) {
                console.log(json.canvas.brushSizesArray[i]);
                var li = document.createElement('li'); 
                ul.appendChild(li);  
                li.id = 'size'+(i+1);
                li.setAttribute('data-size',  json.canvas.brushSizesArray[i]);       
                li.classList.add('item');
                li.innerHTML = '<div style="height:'+json.canvas.brushSizesArray[i]+'px; width:'+json.canvas.brushSizesArray[i]+'px;"></div>';
                         
            }
            document.getElementById("color1").click();
            document.getElementById("size1").click();
        }

        

		// BUTTON EVENT HANDLERS
        document.getElementById('stickersList').addEventListener('click', function(e) {
            console.log('stickersList', e.target);
            if (e.target.classList.contains('sticker')){
                var elems = document.querySelector("#stickersList .active");
                if(elems !==null){
                    elems.classList.remove("active");
                }

                console.log(e.target.src);  // Check if the element is a LI
                e.target.parentElement.classList.add("active");
                currentTool = 'sticker';
                currentSticker=e.target.src;
            }else{
                console.log(e);
            }
        });

        function getRandomFloat(min, max, decimals) {
            const str = (Math.random() * (max - min) + min).toFixed(
              decimals,
            );
          
            return parseFloat(str);
          }

        function getCursorPosition(canvas, event) {
            const rect = canvas.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top
        var obj = {
            x: x,
            y: y
        }
            return obj;
        }
        
       
        canvas.addEventListener('mousedown', function(e) {
            if(currentTool == 'sticker'){
                var coord = getCursorPosition(canvas, e);
                console.log(coord);

                var newImage = new Image();
                newImage.src = currentSticker;
                newImage.onload = () => {
                    // Draw the image onto the context
                    
                    var random_scale = getRandomFloat(0.1,0.4,2);
                    var random_rotate = getRandomFloat(50,-50,0);
                    var w = 125;
                    var h = 104;

                    var x = coord.x - (w/2);
                   var  y = coord.y - (h/2);

                    random_rotate = random_rotate -90;
                    drawImageCentered(newImage, coord.x, coord.y,random_scale, random_rotate);     
                    //ctx.drawImage(newImage, 0, 0, 250, 208);                
                }
            }
        })


        function drawImageCentered(img, x, y, scale, rotation) {
            var alpha = 0;
            var scaledWidth = img.width * scale;
            var scaledHeight = img.height * scale;
        
            var interval = setInterval(function() {
                alpha += 0.05; // Ajustez la vitesse de la transition ici
                ctx.globalAlpha = alpha;
        
                // Dessiner l'image avec échelle et rotation
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation * (Math.PI / 180));
                ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
                ctx.restore();
        
                if (alpha >= 1) {
                    // Arrêter l'interval une fois que l'opacité atteint 1
                    clearInterval(interval);
                    ctx.globalAlpha = 1; // Réinitialiser l'opacité
                }
            }, 10); // Ajustez la fréquence de la transition ici (en millisecondes)
        }
        /*
        function drawImageCentered(img, x, y, scale, rotation) {
            var scaledWidth = img.width * scale;
            var scaledHeight = img.height * scale;
            var centerX = x - scaledWidth / 2;
            var centerY = y - scaledHeight / 2;
            var radians = rotation * (Math.PI / 180);

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(radians);
            ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
            ctx.restore();

            //ctx.drawImage(img, centerX, centerY, scaledWidth, scaledHeight);
        }*/

       

  
		

		/*document.getElementById('canvasUpdate').addEventListener('click', function() {
			createCanvas();
			redraw();
		});*/

        document.getElementById('colorsSelector').addEventListener('click', function(e) {
			if (e.target && e.target.matches("li.item")) {               
                var elems = document.querySelector("#colorsSelector .active");
                if(elems !==null){
                    elems.classList.remove("active");
                }
    
                e.target.classList.add("active");              
              
                console.log(e.target.getAttribute("data-value"));
                currentColor = e.target.getAttribute("data-value");
            }
		});


        document.getElementById('sizeSelector').addEventListener('click', function(e) {
			
            if (e.target && e.target.matches("li.item div")) {
                console.log(e.target);
                var elems = document.querySelector("#sizeSelector .active");
                if(elems !==null){
                    elems.classList.remove("active");
                }
    
                e.target.parentElement.classList.add("active");              
              
                console.log(e.target.parentElement.getAttribute("data-size"));
                currentSize = e.target.parentElement.getAttribute("data-size");
            }
            if (e.target && e.target.matches("li.item")) {
                console.log(e.target);
                var elems = document.querySelector("#sizeSelector .active");
                if(elems !==null){
                    elems.classList.remove("active");
                }
    
                e.target.classList.add("active");              
              
                console.log(e.target.getAttribute("data-size"));
                currentSize = e.target.getAttribute("data-size");
            }
		});

		/*document.getElementById('colorpicker').addEventListener('change', function() {
			currentColor = this.value;
		});
		document.getElementById('bgcolorpicker').addEventListener('change', function() {
			ctx.fillStyle = this.value;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			redraw();
			currentBg = ctx.fillStyle;
		});*/
		document.getElementById('controlSize').addEventListener('change', function() {
			currentSize = this.value;
			document.getElementById("showSize").innerHTML = this.value;
		});
		/*document.getElementById('saveToImage').addEventListener('click', function() {
			downloadCanvas(this, 'canvas', 'masterpiece.png');
		}, false);*/
		document.getElementById('eraser').addEventListener('click', eraser);
        document.getElementById('paintBTN').addEventListener('click', pencil);        
        document.getElementById('clear').addEventListener('click', createCanvas);
         document.getElementById('stickersPanel').addEventListener('click', stickersPanelSelect);
         document.getElementById('paintPanel').addEventListener('click', paintPanelSelect);


function stickersPanelSelect(){
    currentTool = 'sticker';
    if (currentSticker == ''){
        select_stickers_item = document.querySelector("#stickersList > li > img");
        select_stickers_item.classList.add('active');
        console.log(select_stickers_item.src);
        currentSticker = select_stickers_item.src;
    }
    console.log('stickersPanelSelect');
}


function paintPanelSelect(){
    currentTool = 'pencil';
    if (currentColor == ''){
        select_first_color_item = document.querySelector("#colorsSelector > li");
        select_first_color_item.classList.add('active');
        currentColor = select_first_color_item.dataset.value;
    }
    if(currentSize == ''){
        select_first_size_item = document.querySelector("#sizeSelector > li");
        select_first_size_item.classList.add('active');
        currentSize = select_first_size_item.dataset.size;
    }
    console.log('paintPanelSelect');
}
		/*document.getElementById('save').addEventListener('click', save);
		document.getElementById('load').addEventListener('click', load);
		document.getElementById('clearCache').addEventListener('click', function() {
			localStorage.removeItem("savedCanvas");
			linesArray = [];
			console.log("Cache cleared!");
		});*/


        function pencil() {
            console.log('pencil select');
			currentTool = 'pencil';
		}


		// REDRAW 

		function redraw() {
            for (var i = 1; i < linesArray.length; i++) {
                ctx.beginPath();
                ctx.moveTo(linesArray[i-1].x, linesArray[i-1].y);
                ctx.lineWidth  = linesArray[i].size;
                ctx.lineCap = "round";
                ctx.strokeStyle = linesArray[i].color;
                ctx.lineTo(linesArray[i].x, linesArray[i].y);
                ctx.stroke();
            }
		}

	

		function createCanvas() {
			canvas.id = "canvas";
			canvas.width = document.getElementById("canvasContainer").offsetWidth;
			canvas.height = document.getElementById("canvasContainer").offsetHeight;
			canvas.style.zIndex = 8;
			canvas.style.position = "absolute";
			/*canvas.style.border = "1px solid";*/
            ctx.fillStyle = "black";
			/*ctx.fillStyle = currentBg;*/
			//ctx.fillRect(0, 0, canvas.width, canvas.height);

            var canvasContainer = document.getElementById("canvasContainer");
            console.log('canvasContainer', canvasContainer);
			canvasContainer.appendChild(canvas);
		}

		// DOWNLOAD CANVAS

		function downloadCanvas(link, canvas, filename) {
			link.href = document.getElementById(canvas).toDataURL();
			link.download = filename;
		}

		// SAVE FUNCTION

		function save() {
			localStorage.removeItem("savedCanvas");
			localStorage.setItem("savedCanvas", JSON.stringify(linesArray));
			console.log("Saved canvas!");
		}

		// LOAD FUNCTION

		function load() {
			if (localStorage.getItem("savedCanvas") != null) {
				linesArray = JSON.parse(localStorage.savedCanvas);
				var lines = JSON.parse(localStorage.getItem("savedCanvas"));
				for (var i = 1; i < lines.length; i++) {
					ctx.beginPath();
					ctx.moveTo(linesArray[i-1].x, linesArray[i-1].y);
					ctx.lineWidth  = linesArray[i].size;
					ctx.lineCap = "round";
					ctx.strokeStyle = linesArray[i].color;
					ctx.lineTo(linesArray[i].x, linesArray[i].y);
					ctx.stroke();
				}
				console.log("Canvas loaded.");
			}
			else {
				console.log("No canvas in memory!");
			}
		}

		// ERASER HANDLING

		function eraser() {
			currentSize = 50;
			currentColor = ctx.fillStyle
		}




	// DRAWING EVENT HANDLERS

    canvas.addEventListener('mousedown', function(event) {mousedown(canvas, event);});
    canvas.addEventListener('mousemove',function(event) {mousemove(canvas, event);});
    canvas.addEventListener('mouseup',mouseup);
    



    var isIdle = true;
    function drawstart(event) {
      if(currentTool == 'pencil'){
        ctx.beginPath();
        ctx.lineWidth  = currentSize;
                ctx.strokeStyle = currentColor;
                ctx.lineCap = "round";
        ctx.moveTo(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop);
        isIdle = false;
      }
    }
    function drawmove(event) {
      if (isIdle) return;
      ctx.lineWidth  = currentSize;
            ctx.strokeStyle = currentColor;
			ctx.lineCap = "round";
      ctx.lineTo(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop);
      ctx.stroke();
    }
    function drawend(event) {
      if (isIdle) return;
      drawmove(event);
      isIdle = true;
    }
    function touchstart(event) { drawstart(event.touches[0]) }
    function touchmove(event) { drawmove(event.touches[0]); event.preventDefault(); }
    function touchend(event) { drawend(event.changedTouches[0]) }
  
    canvas.addEventListener('touchstart', touchstart, false);
    canvas.addEventListener('touchmove', touchmove, false);
    canvas.addEventListener('touchend', touchend, false);        
  

    console.log('TEST 2');
    // CREATE CANVAS





        
		// GET MOUSE POSITION

		function getMousePos(canvas, evt) {
			var rect = canvas.getBoundingClientRect();
			return {
				x: evt.clientX - rect.left,
				y: evt.clientY - rect.top
			};
		}




        createCanvas();





		// ON MOUSE DOWN

		function mousedown(canvas, evt) {
			var mousePos = getMousePos(canvas, evt);
			isMouseDown=true
			var currentPosition = getMousePos(canvas, evt);
			ctx.moveTo(currentPosition.x, currentPosition.y)
			ctx.beginPath();
			ctx.lineWidth  = currentSize;
            ctx.strokeStyle = currentColor;
			ctx.lineCap = "round";
			
		}

		// ON MOUSE MOVE

		function mousemove(canvas, evt) {
            console.log('move');
            if(currentTool == 'pencil'){
                if(isMouseDown){
                    var currentPosition = getMousePos(canvas, evt);
                    ctx.lineTo(currentPosition.x, currentPosition.y)
                    ctx.stroke();
                    store(currentPosition.x, currentPosition.y, currentSize, currentColor);
                }
            }
		}

		// STORE DATA

		function store(x, y, s, c) {
			var line = {
				"x": x,
				"y": y,
				"size": s,
				"color": c
			}
			linesArray.push(line);
		}

		// ON MOUSE UP

		function mouseup() {
			isMouseDown=false
			store()
		}

        
            console.log('DOMContentLoaded');
            // Définir une temporisation avec setTimeout
            window.setTimeout(function() {
                console.log('show sections');
              var sections = document.querySelectorAll('section');
              sections.forEach(function(section) {
                section.style.opacity = '1';
              });
            }, 2000);
          
            // Ajouter la classe 'default' à tous les éléments avec la classe 'toggle'
            var toggles = document.querySelectorAll('div.toggle');
            toggles.forEach(function(toggle) {
              toggle.classList.add('default');
            });
          
            // Ajouter un gestionnaire d'événements aux éléments avec la classe 'toggle'
            toggles.forEach(function(toggle) {
              toggle.addEventListener('click', function() {
                console.log('totgless');
                var sectionDiv = document.querySelector('div.expand');
                if (sectionDiv.classList.contains('expand')) {
                  sectionDiv.classList.remove('expand');
                  toggle.classList.add('expand');
                } else {
                  toggle.classList.add('expand');
                }
              });
            });
          
}
