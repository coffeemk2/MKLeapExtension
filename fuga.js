

var circle = document.createElement('div');
var element = document.createElement('div');


function addElement() {
	element.innerHTML = "hogehoge";
	element.style.backgroundColor = 'rgba(0,0,0,0.0)';
	element.style.position = "fixed";
	element.style.left = 0;
	element.style.top = 0;
	element.style.width = "100vw";
	element.style.height = "100vh";
	element.style.zIndex = 10000;

	// var circle = document.createElement('div');
	// circle.innerHTML = "hogehoge";
	circle.style.borderRadius = "25px"
	circle.style.backgroundColor = 'blue';
	circle.style.position = "relative";
	circle.style.left = "100px";
	circle.style.top = "100px";
	circle.style.width = "50px";
	circle.style.height = "50px";

	var objBody = document.getElementsByTagName("body").item(0);
	objBody.appendChild(element);
	element.appendChild(circle);
	// objBody.insertBefore(element,objBody.firstChild);
	// body要素にdivエレメントを追加
}

function getATagPositions(){
	var aTagElements = document.getElementsByTagName("a");

	var aTagPositions = [];
	for (var i=0;i<aTagElements.length;i++ ){
		//console.log(aTagElements[i]);
		try {
		var pos = $(aTagElements[i]).offset();

		var dotElement = document.createElement('div');
		dotElement.style.borderRadius = "5px"
		dotElement.style.backgroundColor = 'green';
		dotElement.style.position = "absolute";
		dotElement.style.left = pos.left + "px";
		dotElement.style.top =  pos.top+"px";
		dotElement.style.width = "5px";
		dotElement.style.height = "5px";
		console.log(dotElement);

		element.appendChild(dotElement);

		aTagPositions.push(pos);
	} catch (err) {console.log(err)}
	}
	return aTagPositions;
}

function getDistance(x1,y1,x2,y2){
	var x = x2 - x1;
	var y = y2 - y1;
	return Math.sqrt(Math.pow(x,2) + Math.pow(y,2));

}


var controllerOptions = {enableGestures: true};
var previousFrame = null;
var position = [100,100];



addElement();
var aTagPositions = getATagPositions();

Leap.loop(controllerOptions, function(frame) {
	circle.innerHTML = frame.timestamp;
	var hand = frame.hands[0];
	// Hand motion factors
	if (hand && previousFrame && previousFrame.valid) {
		var rotationAxis = hand.rotationAxis(previousFrame, 2);
		var roll = rotationAxis[0];
		var pitch = rotationAxis[1];
		var yaw = rotationAxis[2];

		// velocity
		position[0] += yaw*10;
		position[1] -= (roll-0.2)*10;

		// limit
		position[0] = Math.max(Math.min(position[0],window.innerWidth - 25),0);
		position[1] = Math.max(Math.min(position[1],window.innerHeight - 25),0);

		// gravity
		aTagPositions.forEach(function(aTagPosition,index){
			if ( getDistance(position[0],position[1],aTagPosition.left,aTagPosition.top) < 50){
				var x = aTagPosition.left - position[0];
				var y = aTagPosition.top - position[1];
				var theta = Math.atan(y/x);
				position[0] -= 3*Math.cos(theta);
				position[1] -= 3*Math.sin(theta);

				// position[0] += (aTagPosition.left - position[0])/10;
				// position[1] += (aTagPosition.top - position[1])/10;
			}
		});








		circle.style.left = position[0]+"px";
		circle.style.top = position[1]+"px";


	}

	previousFrame = frame;

})
