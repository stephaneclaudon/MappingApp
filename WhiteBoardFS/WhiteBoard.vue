<template>
<div id="canvasContainer"></div>



<div id="sidebarContainer">
  <section>
    <div class="no-toggle">  
      <div class='toggle-content'>
        <div id="clear" class='menu_img small' style="background-image: url(src/assets/reload.svg);"></div>  
      </div>
    </div>
    <div class="toggle expand">
      <div class='toggle-content'>
      <div class='menu_img' id ='paintBTN' style="background-image: url(src/assets/paint-brush.svg);"></div>
      <ul id="toolList"     style="list-style: none;">                       
        
          <li style="display:none">
              <div class="toolsButtons">          
              <button id="pencil" class="btn btn-default"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button><br>
              <button id="eraser" class="btn btn-default"><span class="glyphicon glyphicon-erase" aria-hidden="true"></span></button><br>
              <!--<button id="clear" class="btn btn-danger"> <span class="glyphicon glyphicon-repeat" aria-hidden="true"></span></button><br>-->
              </div>
          </li>
          <li>
            <div class="buttonSize" style="display:none;">
                <h3>Size (<span id="showSize">5</span>)</h3>
                <input type="range" min="1" max="50" value="5" step="1" id="controlSize">
            </div>
          </li>

          <li>
            <ul id="sizeSelector" style="list-style:none;">
                                     
            </ul>
          </li>
          <li>
              <ul id="colorsSelector">
                       
              </ul>
          </li>
          
          
      </ul>
    </div>
    </div>
    <div class="toggle">
      <div class='toggle-content'>
        <div class='menu_img' id ='stickersBTN' style="background-image: url(src/assets/sticker.svg);"></div>
        <ul id="stickersList">			
        </ul>
      </div>
    </div>
    
  </section>



    <section class="row accHorizontal">
      <div  id="reloadPanel">
          
      </div> 

        <aside class="accHorizontal__item" id="paintPanel">
          <input type="radio" name="group-1" class="state" id="acc-1" />
          <label class="backdrop" for="acc-1" ><i class="fa fa-times"></i></label>
          <article class="acc_cBox">
            <div class="acc_cImg">
                <div class='menu_img' id='paintBTN' style="background-image: url(src/assets/paint-brush.svg);"></div>  
            </div>
            <div class="acc_cCont">
               
            </div>
          </article>
        </aside>
        
        <aside class="accHorizontal__item" id="stickersPanel">
          <input type="radio" name="group-1" class="state" id="acc-2" />
          <label class="backdrop" for="acc-2"><i class="fa fa-times"></i></label>
          <article class="acc_cBox">
            <div class="acc_cImg">
              <div class='menu_img' id='stickersBTN' style="background-image: url(src/assets/sticker.svg);  ">              </div>
            </div>
            <div class="acc_cCont">
                <ul id="stickersList">			
                </ul>
            </div>
          </article>
        </aside>
        

        
      </section>
      
    

</div>




  
<div class="illustration">
            <div class="i-large"></div>
            <div class="i-medium"></div>
            <div class="i-small"></div>
        </div>
      
    
     

  </template>
  
  <script>
    import json from '../config.json';
    import { initializeMiniApp } from '../WhiteBoardFS/script.js';
    import bootstrap from '../src/assets/bootstrap.min.css';


    export default {
    mounted() {
        console.log(document.getElementById("canvasContainer"));
        initializeMiniApp();
    }
    }
             
</script>










  
  <style>

.illustration {
    position: absolute;
    margin: 0 auto;
    width: 100%;
    height: 100%;
    top: 0;
    z-index: 10;
    pointer-events: none;
    opacity: 0.5;	
}
 
.i-large,
.i-medium,
.i-small {
	position : absolute;
	top: 0; right: 0; bottom: 0; left: 0;

}
 
.i-large {
	background: url("src/assets/snow/particules_large.png") repeat 0px 0px;;
	-webkit-animation: dropFlowParticles 8s linear infinite;
	     -o-animation: dropFlowParticles 8s linear infinite;
	        animation: dropFlowParticles 8s linear infinite;
}
.i-medium {
	background: url("src/assets/snow/particules_medium.png") repeat 0px 0px;
	-webkit-animation: dropFlowParticles 22s linear infinite;
	     -o-animation: dropFlowParticles 22s linear infinite;
	        animation: dropFlowParticles 22s linear infinite;
}
.i-small {
	background:url("src/assets/snow/particules_small.png") repeat 0px 0px;
	-webkit-animation: dropFlowParticles 36s linear infinite;
	     -o-animation: dropFlowParticles 36s linear infinite;
	        animation: dropFlowParticles 36s linear infinite;
}
.i-large,
.i-medium,
.i-small {
    background-size: contain;
}
 
@-webkit-keyframes dropFlowParticles {
	from { background-position: 0 0; }
	to { background-position: 0 100vw; }
}
@keyframes dropFlowParticles {
	from { background-position: 0 0; }
	to { background-position: 100vw 0; }
}


  #canvasContainer{
    /*background: red;*/
    width: 100%;
    min-height:90vh;
}

#sidebarContainer{
    /*background: yellow;*/
    width: 100%;
    height:10%
}




.menu_img{
width: 4em;            
background-size: contain;
background-repeat: no-repeat;
background-position: center;

}

.menu_img.small{
width: 3em;
margin: auto;
height: 3em;
}

#toolList li{
float:left;
}


.elementToFadeInAndOut {
    opacity: 1;
    animation: fade 2s linear;
} 

@keyframes fade {
    0% { opacity: 0 }
    100% { opacity: 1 }
}



#reloadPanel{
width: 7em;
}
    
    
body{
    background-color: black!important;
    overflow: hidden;
}

.colorButtons {
    display: block;
    margin: 20px 0;
}

canvas {
    cursor: crosshair;
}

		div#sidebar {
			position: absolute;
			left: 0;
			width: 150px;
			padding: 20px 20px;
			top: 0;
		}

		canvas#canvas {
			/*left: 150px;
			top: 45px;*/
            background-color: black;
		}

		.btn {
			margin-bottom: 10px;
			width: 100%;
		}
		input {
			width: 100%;
			margin-bottom: 10px;
		}

		.input-group {
			margin-bottom: 10px;
		}

		.toolsButtons .btn {
			width: auto!important;
		}

		.sizeButtons .btn {
			width: 48%;
		}

		.colorpicker {
			background: transparent;
			height: 40px;
		}

        #stickersList{
            height: 100%;
            width: 5000px;
            
            display: inline-flex;
            align-items: center;
            margin:0!important;
        }

        #stickersList li img{
            width: 50px;
            /*height: 50px;*/
            transform: rotate(-90deg);
        }

        #stickersList li img.active{
            border :2px solid black;
        }

        #colorsSelector li div{
            background-color: red;
            border-radius: 100%;
            margin: 5px auto;            
        }

        #stickersList {
            list-style:none;
            padding: 0;
        }
        #colorsSelector,  #sizeSelector{
            list-style:none;
            display: table;  
        }

        #colorsSelector li.item, #sizeSelector li.item{
            border-radius: 100%;
            height: 40px;
            width: 40px;
            margin: 5px auto;
            /*display: inline-block;*/
            vertical-align: middle;
            margin-right: 0.5em;
        }
        
        #sizeSelector li.active,#colorsSelector li.active, #stickersList li.active{
            border: 2px solid black;

        }

        #sizeSelector li div{
            background-color: black;
            border-radius: 100%;
            margin: auto;
        }


        #stickerAdded {
            opacity: 0; /* Initialiser l'opacité à 0 pour cacher l'image au départ */
            transition: opacity 1s ease-in-out; /* Ajouter une transition de l'opacité sur l'image */
        }


        #stickersList li{
            float:left;
            vertical-align: middle;
        }

        #sizeSelector{
            padding-left: 0;
            display: table;
        }
        #sizeSelector li{
            display: flex;
            align-items: center;
        }



        #toolList{
            margin-bottom: 0px;
            min-width: 1000px;

            display: flex;
            align-items: center;
        }

        #toolList, #stickersList{
            padding-left: 2em;
        }
















        *{
            box-sizing: border-box;
        }
        
        section{
            display: flex!important;
            flex-direction: row;
            justify-content: center;
            align-items: top;
            align-content: center;
            position: relative;           
            left: 1em;
            min-height: 50vh;
            width: 90vw;            
            transition: all 200ms ease-in-out 50ms;
            opacity: 0;
        }

        section div.toggle{
            margin-left: 5px;
            margin-right: 5px;
            border-radius: 10px;
            background: rgba(220,220,220,.5);
            transition: all 200ms ease-in-out 50ms;
            font-family: Helvetica, Arial, Sans-Serif;
            font-weight: 500;
            cursor: pointer;
            font-size: 16pt;
        }
        
        section .toggle.default{
            height: 4em;
            width: 100px;
            color: rgba(255,255,255,0);
            font-size: 16pt;
            overflow: hidden;
                
        }
            
        section .toggle.expand{
            height: 4em;
            width: 100vw;
            background: #b1b1b1;
            color: rgba(255,255,255,1);                
        }
            
        

        section div.toggle{
            height: 4em;
            width: 4em;
            margin-left: 5px;
            margin-right: 5px;
            border-radius: 10px;
            background: rgba(220,220,220,.5);
            transition: all 200ms ease-in-out 50ms;
            font-family: Helvetica, Arial, Sans-Serif;
            font-weight: 500;
            cursor: pointer;
            font-size: 16pt;
        }

        section div.no-toggle{
            height: 4em;
            width: 100px;
            margin-left: 5px;
            margin-right: 10px;
            border-radius: 10px;
            background: rgba(220,220,220,.5);
            transition: all 200ms ease-in-out 50ms;
            font-family: Helvetica, Arial, Sans-Serif;
            font-weight: 500;
            cursor: pointer;
            font-size: 16pt;
        }

        .toggle-content{
            display: inline-flex;
            min-width: 500px;
            height: 100%;
        }

        .no-toggle .toggle-content{
            min-width: 100%;
        }


        .no-toggle .menu_img{

        }


        #appContener{
            background: black;
        }
  </style>