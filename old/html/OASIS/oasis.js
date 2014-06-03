/* OASIS GUI Simulation JavaScript Implementation
Matthew Guindin, March 2011
*/

var gps_f = 0; //Set GPS fix to 0 upon startup
var bft_f = 0; //Set BFT to 0 upon startup
var is_f = 0; //Set IS to 0 upon startup
var nightmode = 0; //Set nightmode to 0 on startup, starts up in day mode by default
var message='OASIS';
var canvas = '';
var context = '';
var dayMap = '';
var nightMap = '';
var mWidth = 480;
var mHeight = 640;
var x; //On Click x location
var y; //On Click y location
var d = new Date();
var date = "";

function acquireDirecty(gps,bft,is,night)
//Direct-Y GPS Acquisition Function
{
message='Attempting GPS Fix with Direct-Y';
displayMessage(message);
var ysuccess=Math.floor(Math.random()*11); //Gen random num between 0 and 10
pausecomp(2000); //Simulate Fix wait
if (ysuccess<2) // 20% fail rate
	{
	alert("Direct-Y Acquisition FAIL");
	gps_f=0;
	gps=0;
	getGpsStatus(gps_f);
	acquireNormal(gps,bft,is,night);
	}
else //fix acquired
	{
	message=('GPS Fix Acquired.  Location: 18T UM 76754 99686'); //Display current location data
	gps_f = 1;
	gps=1;
	getGpsStatus(gps_f);
	displayMessage(message);
	document.getElementById("button1").value="GPS";
	document.getElementById("button1").onclick=function() {searchTrack()};
	document.getElementById("button2").value="BFT";
	document.getElementById("button2").onclick=function() {bft(bft_f,is_f,gps_f,nightmode)};
	document.getElementById("button3").value="IS";
	document.getElementById("button3").onclick=function() {is(bft_f,is_f,gps_f,nightmode)};
	}
drawIcons(gps,bft,is,night);
}
function acquireNormal(gps,bft,is,night)
//Normal GPS Acquisition Function
{
pausecomp(2000); //Simulate Fix wait 2000=2 sec
message='Attempting GPS Fix with Normal';
displayMessage(message);
var nsuccess=Math.floor(Math.random()*11); //Gen random num between 0 and 10
if (nsuccess<2) //20% Fail rate
	{
	alert("GPS Fix FAIL");
	gps_f=0;
	getGpsStatus(gps_f);
	}
else
	{
	message = 'GPS Fix Acquired.  Location: 18T UM 76754 99686'; //8 Digit b/c Normal is less accurate than Direct-Y
	gps_f=1; //GPS Acquired
	gps=1;
	getGpsStatus(gps_f);
	displayMessage(message);
	document.getElementById("button1").value="GPS";
	document.getElementById("button1").onclick=function() {searchTrack()};
	document.getElementById("button2").value="BFT";
	document.getElementById("button2").onclick=function() {bft(bft_f,is_f,gps_f,nightmode)};
	document.getElementById("button3").value="IS";
	document.getElementById("button3").onclick=function() {is(bft_f,is_f,gps_f,nightmode)};
	}
drawIcons(gps,bft,is,night);
}
function bft(bft,is,gps,night)
//Blue Force Tracker Function
{
pausecomp(2000); //Simulate Fix wait
var bsuccess=Math.floor(Math.random()*11); //Gen random num between 0 and 10
if (bsuccess<2) //20% Fail rate
	{
	alert("BFT Server Connection FAIL");
	bft_f=0; //BFT Fail
	getTIStatus(bft,is);
	}
else
	{
	message='BFT Acquired';
	displayMessage(message);
	bft=1; //BFT Acquired
	getTIStatus(bft,is);
	bftSubListSelect(gps,bft,is,night);
	bft_f=1;
	}
}
function is(bft,is,gps,night) 
//Information Sharing Function
{
pausecomp(2000); //Simulate Fix wait
var isuccess=Math.floor(Math.random()*11); //Gen random num between 0 and 10
if (isuccess<2)
	{
	alert("IS Server Connection FAIL");
	is_f=0; //IS Fail
	is=0;
	getTIStatus(bft,is);
	}
else
	{
	message='IS Acquired';
	is_f=1; //IS Acquired
	is=1;
	displayMessage(message);
	getTIStatus(bft,is);
	isSubListSelect(gps,bft,is,night);
	}
}
function close_box()
//Quit OASIS Function
{
var r=confirm("Quit OASIS?"); //Alert Box asking to quit OASIS
if (r==true)
	{
	alert('Exiting OASIS');
	message = 'POWERING OFF';
	displayMessage(message);
	displayMessage2("");
	document.getElementById('bftStrength').innerHTML = "NONE";
	document.getElementById('tiStrength').innerHTML = "NONE";
	}
}
function getGpsStatus(gps_f)
{
if (gps_f==0)
	{
	document.getElementById('gpsStrength').innerHTML = "NONE";
	}
else
	{
	document.getElementById('gpsStrength').innerHTML = "GOOD";
	}
}
function getTIStatus(bft,is)
{
if (bft==0 && is==0)
	{
	document.getElementById('tiStrength').innerHTML = "NONE";
	}
else
	{
	document.getElementById('tiStrength').innerHTML = "GOOD";
	}
}
function displayMessage(message)
{
document.getElementById('message').innerHTML = message;
}
function displayMessage2(message2)
{
document.getElementById('message2').innerHTML = message2;
}

function pausecomp(millis) //Wait function
//Borrowed from www.sean.co.uk
{
var date = new Date();
var curDate = null;

do { curDate = new Date(); }
while(curDate-date < millis);
}
function nightMode(night,gps,bft,is)
{
canvas.width = canvas.width; //Clear Canvas
if (night == 0) //Day -> Night
	{
	nightmode = 1; //Set to Night
	nightMap = new Image();
	nightMap.onload = function() {
		context.drawImage(nightMap, 0, 0);
	};
	nightMap.src='image/night_map.gif';
	}
else // Night -> Day
	{
	nightmode = 0;
	dayMap = new Image();
	dayMap.onload = function() {
		context.drawImage(dayMap, 0, 0);
	};	
	dayMap.src='image/day_map.gif';
	}
drawIcons(gps,bft,is,nightmode);//Draw icons first?
}
function drawing()
{
	canvas = document.getElementById('mapCanvas');
	canvas.addEventListener("click", oasisOnClick, false);
	context = canvas.getContext('2d');
	dayMap = new Image();
	dayMap.onload = function() {
		context.drawImage(dayMap, 0, 0);
	};
	dayMap.src='image/day_map.gif';
	message='GPS Self-Test Active';
	displayMessage(message);
	pausecomp(2000); //Wait 2 seconds for Self-Test to operate
	message='GPS Self-Test SUCCESS.  BFT Self-Test SUCCESS.  IS Self-Test SUCCESS';
	displayMessage(message);
}
function drawIcons(gps,bft,is,night) //Draws GPS arrow, BFT, and IS points
{
	if ((gps == 1) && (night == 0) && (bft == 0) && (is == 0)) //Only GPS && BFT
	{
		//GPS triangle
		context.fillStyle = "rgba(255, 255, 0, 1)";
		context.beginPath();
		context.moveTo(235,340);
		context.lineTo(240,320);
		context.lineTo(245,340);
		context.fill();	
		buttonReset();
	}
	else if ((gps == 1) && (night == 0) && (bft == 1) && (is == 0)) //Only GPS && BFT
	{
		//GPS triangle
		context.fillStyle = "rgba(255, 255, 0, 1)";
		context.beginPath();
		context.moveTo(235,340);
		context.lineTo(240,320);
		context.lineTo(245,340);
		context.fill();
		//BFT dots
		context.moveTo(350,360);
		context.fillStyle = "rgba(0, 0, 255, 1)";
		context.arc(350,360,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(395,395);
		context.arc(395,395,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(285,535);
		context.arc(285,535,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(395,315);
		context.arc(395,315,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(375,405);
		context.arc(375,405,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(255,535);
		context.arc(255,535,5,0,Math.PI*2,true);
		context.fill();
		buttonReset();
	}
	else if ((gps == 1) && (night == 0) && (bft == 1) && (is==1)) //All - Daytime
	{
		//GPS triangle
		context.fillStyle = "rgba(255, 255, 0, 1)";
		context.beginPath();
		context.moveTo(235,340);
		context.lineTo(240,320);
		context.lineTo(245,340);
		context.fill();
		//BFT dots
		context.moveTo(350,360);
		context.fillStyle = "rgba(0, 0, 255, 1)";
		context.arc(350,360,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(395,395);
		context.arc(395,395,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(285,535);
		context.arc(285,535,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(395,315);
		context.arc(395,315,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(375,405);
		context.arc(375,405,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(255,535);
		context.arc(255,535,5,0,Math.PI*2,true);
		context.fill();
		//IS dots
		context.moveTo(115,105);
		context.fillStyle = "rgba(255,0, 0, 1)";
		context.arc(115,105,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(85,235);
		context.arc(85,235,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(215,405);
		context.arc(215,405,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(205,105);
		context.arc(205,105,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(435,105);
		context.arc(435,105,5,0,Math.PI*2,true);
		context.fill();
		buttonReset();
	}
	else if ((gps == 1) && (night == 0) && (bft ==0) && (is==1)) //Only GPS && IS
	{
		//GPS triangle
		context.fillStyle = "rgba(255, 255, 0, 1)";
		context.beginPath();
		context.moveTo(235,340);
		context.lineTo(240,320);
		context.lineTo(245,340);
		context.fill();
		//IS dots
		context.moveTo(115,105);
		context.fillStyle = "rgba(255,0, 0, 1)";
		context.arc(115,105,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(85,235);
		context.arc(85,235,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(215,405);
		context.arc(215,405,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(205,105);
		context.arc(205,105,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(435,105);
		context.arc(435,105,5,0,Math.PI*2,true);
		context.fill();
		buttonReset();
	}
	else if ((gps == 1) && (night == 1) && (bft == 0) && (is == 0)) //GPS has fix && Nighttime
	{
		//Nighttime GPS
		context.fillStyle = "rgba(255, 165, 0, 1)"
		context.beginPath();
		context.moveTo(235,340);
		context.lineTo(240,320);
		context.lineTo(245,340);
		context.fill();
	}
	else if ((gps == 1) && (night == 1) && (bft == 1) && (is == 0)) //Nighttime GPS && BFT
	{
		//Nighttime GPS
		context.fillStyle = "rgba(255, 165, 0, 1)"
		context.beginPath();
		context.moveTo(235,340);
		context.lineTo(240,320);
		context.lineTo(245,340);
		context.fill();
		//BFT dots
		context.moveTo(350,360);
		context.fillStyle = "rgba(0, 0, 255, 1)";
		context.arc(350,360,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(395,395);
		context.arc(395,395,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(285,535);
		context.arc(285,535,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(395,315);
		context.arc(395,315,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(375,405);
		context.arc(375,405,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(255,535);
		context.arc(255,535,5,0,Math.PI*2,true);
		context.fill();
		buttonReset();
	}
	else if ((gps == 1) && (night == 1) && (bft == 1) && (is == 1)) //Nighttime Everything
	{
		//Nighttime GPS
		context.fillStyle = "rgba(255, 165, 0, 1)"
		context.beginPath();
		context.moveTo(235,340);
		context.lineTo(240,320);
		context.lineTo(245,340);
		context.fill();
		//BFT dots
		context.moveTo(350,360);
		context.fillStyle = "rgba(0, 0, 255, 1)";
		context.arc(350,360,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(395,395);
		context.arc(395,395,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(285,535);
		context.arc(285,535,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(395,315);
		context.arc(395,315,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(375,405);
		context.arc(375,405,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(255,535);
		context.arc(255,535,5,0,Math.PI*2,true);
		context.fill();
		//IS dots
		context.moveTo(115,105);
		context.fillStyle = "rgba(255,0, 0, 1)";
		context.arc(115,105,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(85,235);
		context.arc(85,235,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(215,405);
		context.arc(215,405,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(205,105);
		context.arc(205,105,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(435,105);
		context.arc(435,105,5,0,Math.PI*2,true);
		context.fill();
		buttonReset();
	}
	else //Nighttime Everything
	{
		//Night time GPS
		context.fillStyle = "rgba(255, 165, 0, 1)"
		context.beginPath();
		context.moveTo(235,340);
		context.lineTo(240,320);
		context.lineTo(245,340);
		context.fill();
		//IS dots
		context.moveTo(115,105);
		context.fillStyle = "rgba(255,0, 0, 1)";
		context.arc(115,105,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(85,235);
		context.arc(85,235,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(215,405);
		context.arc(215,405,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(205,105);
		context.arc(205,105,5,0,Math.PI*2,true);
		context.fill();
		context.moveTo(435,105);
		context.arc(435,105,5,0,Math.PI*2,true);
		context.fill();
		buttonReset();
	}
}
function oasisOnClick(e) //Restricts mouseclick location to map
{
	if (e.pageX != undefined && e.pageY != undefined) 
	{
		x = e.pageX;
		y = e.pageY;
	}
	else {
		x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;
	positionInformation(x,y,gps_f,bft_f,is_f);
}
function positionInformation(x,y,gps,bft,is) //Determines which unit or location was clicked
{
	//Tolerance - 20px (x+-20px, y+-px)
	if ((x >= 220) && (x <=260) && (y >= 300) && (y <= 340)) //(240,320)
	{
		displayMessage("Current Location: 18T UM 76754 99686");
		displayMessage2("");
	}
	//if (bft == 1)
	{
		if ((x >= 330) && (x <=370) && (y >= 340) && (y <= 380)) //350,360
		{
			displayMessage("1st Plt Echo 2/25: 18T UM 76851 99663");
			displayMessage2("");
		}
		if ((x >= 375) && (x <=415) && (y >= 375) && (y <= 415)) //395,395
		{
			displayMessage("2nd Plt Golf 2/25: 18T UM 76890 99634");
			displayMessage2("");
		}
		if ((x >= 265) && (x <=305) && (y >= 515) && (y <= 555)) //285,535
		{
			displayMessage("3rd Plt Fox 2/25: 18T UM 76789 99511");
			displayMessage2("");
		}
		if ((x >= 375) && (x <=415) && (y >= 295) && (y <= 335)) //395,315
		{
			displayMessage("1st Fire team 516st MP Co: 18T UM 76889 99703");
			displayMessage2("");
		}
		if ((x >= 355) && (x <=395) && (y >= 385) && (y <= 425)) //375,405
		{
			displayMessage("1st Plt Bravo 1/6th: 18T UM 76871 99625");
			displayMessage2("");
		}
		if ((x >= 235) && (x <=275) && (y >= 515) && (y <= 555)) //255,535
		{
			displayMessage("2nd Plt Hotel 1/6th: 18T UM 76768 99515");
			displayMessage2("");
		}
	}
	//if (is == 1)
	{
		if ((x >= 95) && (x <=135) && (y >= 85) && (y <= 125)) //115,105
		{
			displayMessage("IED: 18T UM 76636 99895");
			displayMessage2("<b>Blew out Humvee, suspect in area</b>");
		}
		if ((x >= 65) && (x <=105) && (y >= 215) && (y <= 255)) //85,235
		{
			displayMessage("Hostile: 18T UM 76615 99781");
			displayMessage2("<b>3 tangos / AK-47s</b>");
		}
		if ((x >= 195) && (x <=235) && (y >= 385) && (y <= 425)) //215,405
		{
			displayMessage("Hostile: 18T UM 76727 99627");
			displayMessage2("<b>Sniper on 2nd floor</b>");
		}
		if ((x >= 185) && (x <=225) && (y >= 85) && (y <= 125)) //205,105
		{
			displayMessage("Chopper: 18T UM 76729 99892");
			displayMessage2("<b>Enemy helicopter circling area</b>");
		}
		if ((x >= 415) && (x <=455) && (y >= 85) && (y <= 125)) //435,105
		{
			displayMessage("IED: 18T UM 76928 99889");
			displayMessage2("<b>Saw something planted earlier</b>");
		}
	}
}
function searchTrack() //Menu for GPS acquisition commands
{
	message='Select Direct-Y or Normal Acquisition Mode above';
	displayMessage(message);
	//Change Button 2 to Direct-Y and Button 3 to Normal
	document.getElementById("button1").value="Direct-Y";
	document.getElementById("button1").onclick=function() {acquireDirecty(gps_f,bft_f,is_f,nightmode)};
	document.getElementById("button2").value="Normal";
	document.getElementById("button2").onclick=function() {acquireNormal(gps_f,bft_f,is_f,nightmode)};
	document.getElementById("button3").onclick=function() {buttonReset()};
	document.getElementById("button3").value="Cancel";
	displayMessage2("");
}
function isSubListSelect(gps,bft,is,night) //Menu for IS commands
{
	document.getElementById("button1").value="Dist List1";
	document.getElementById("button1").onclick=function() {drawIcons(gps,bft,is,night)};
	document.getElementById("button2").value="Dist List2";
	document.getElementById("button2").onclick=function() {drawIcons(gps,bft,is,night)};
	document.getElementById("button3").onclick=function() {buttonReset()};
	document.getElementById("button3").value="Cancel";
	message="Choose Distribution List Above";
	displayMessage(message);
	displayMessage2("");
}
function bftSubListSelect(gps,bft,is,night) //Menu for BFT commands
{
	document.getElementById("button1").value="Dist List1";
	document.getElementById("button1").onclick=function() {drawIcons(gps,bft,is,night)};
	document.getElementById("button2").value="Dist List2";
	document.getElementById("button2").onclick=function() {drawIcons(gps,bft,is,night)};
	document.getElementById("button3").onclick=function() {buttonReset()};
	document.getElementById("button3").value="Cancel";
	message="Choose Distribution List Above";
	displayMessage(message);
	displayMessage2("");
}	
function buttonReset() //Cancel button operation, returns buttons to default state
{
	document.getElementById("button1").value="GPS";
	document.getElementById("button1").onclick=function() {searchTrack()};
	document.getElementById("button2").value="BFT";
	document.getElementById("button2").onclick=function() {bft(bft_f,is_f,gps_f,nightmode)};
	document.getElementById("button3").value="IS";
	document.getElementById("button3").onclick=function() {is(bft_f,is_f,gps_f,nightmode)};
	message="OASIS - Choose Function Above";
	displayMessage(message);
	displayMessage2("");
}
function changeMessageToText()
{
	oldObject = document.getElementById('message2');
	var newObject = document.createElement('input');
	newObject.type = 'text';
	if(oldObject.size) newObject.size = oldObject.size;
	if(oldObject.value) newObject.value = oldObject.value;
	if(oldObject.name) newObject.name = oldObject.name;
	if(oldObject.id) newObject.id = oldObject.id;
	if(oldObject.className) newObject.className = oldObject.className;
	oldObject.parentNode.replaceChild(newObject,oldObject);
	document.getElementById("button4").value="Submit";
	document.getElementById("button4").onclick=function() {changeTextToMessage()};
}
function changeTextToMessage()
{
	oldObject = document.getElementById('message2');
	newObject = document.createElement('text');
	newObject.type = 'text';
	if(oldObject.size) newObject.size = oldObject.size;
	if(oldObject.value) newObject.value = oldObject.value;
	if(oldObject.name) newObject.name = oldObject.name;
	if(oldObject.id) newObject.id = oldObject.id;
	if(oldObject.className) newObject.className = oldObject.className;
	oldObject.parentNode.replaceChild(newObject,oldObject);
	document.getElementById("button4").value="IOI";
	document.getElementById("button4").onclick=function() {changeMessageToText()};
}
