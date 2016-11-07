

var circle = document.createElement('div');
// var element = document.createElement('div');
var objBody = document.getElementsByTagName("body").item(0);



function addElement() {
	// element.innerHTML = "hogehoge";
	// element.style.backgroundColor = 'rgba(0,0,0,0.0)';
	// element.style.position = "fixed";
	// element.style.left = 0;
	// element.style.top = 0;
	// element.style.width = "100vw";
	// element.style.height = "100vh";
	// element.style.zIndex = 10000;

	// var circle = document.createElement('div');
	// circle.innerHTML = "hogehoge";
	circle.style.borderRadius = "20px"
	circle.style.backgroundColor = 'blue';
	circle.style.position = "fixed";
	circle.style.left = "100px";
	circle.style.top = "100px";
	circle.style.width = "40px";
	circle.style.height = "40px";
	circle.style.zIndex = 10000;

	// objBody.appendChild(element);
	objBody.appendChild(circle);
	// objBody.insertBefore(element,objBody.firstChild);
	// body要素にdivエレメントを追加
}

function getATagPositions(){
	var aTagElements = document.getElementsByTagName("a");

	var aTagPositions = [];
	for (var i=0;i<aTagElements.length;i++ ){
		try {
			var pos = $(aTagElements[i]).offset();

			var dotElement = document.createElement('div');
			dotElement.style.borderRadius = "5px"
			dotElement.style.backgroundColor = 'green';
			dotElement.style.position = "absolute";
			dotElement.style.left = pos.left + "px";
			dotElement.style.top =  pos.top + "px";
			dotElement.style.width = "5px";
			dotElement.style.height = "5px";
			// console.log(dotElement);

			objBody.appendChild(dotElement);

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

function getNearestATagIndex(x,y){
	var aTagPositions = getATagPositions();
	var distance = -1;
	var nearestIndex = -1;
	aTagPositions.forEach(function(aTagPosition,index ){
		var currentDistance = getDistance(x,y,aTagPosition.left,aTagPosition.top);
		if(currentDistance < distance || distance < 0){
			distance = currentDistance;
			nearestIndex = index;
		}
	});
	return nearestIndex;
}


var controllerOptions = {enableGestures: true};
var previousFrame = null;
var position = [100,100];



addElement();
var aTagPositions = getATagPositions();
var allowPointer = true


Leap.loop(controllerOptions, function(frame) {

	// circle.innerHTML = frame.timestamp;
	var hand = frame.hands[0];
	// Hand motion factors
	if (hand && previousFrame && previousFrame.valid) {
		var rotationAxis = hand.rotationAxis(previousFrame, 2);
		var roll = rotationAxis[0];
		var pitch = rotationAxis[1];
		var yaw = rotationAxis[2];
		var speed = 0;

		if(allowPointer){

			speed = hand.sphereRadius / 30 ;


			// velocity
			position[0] += yaw*speed;
			position[1] -= (roll-0.2)*speed;

			// limit
			position[0] = Math.max(Math.min(position[0],window.innerWidth - 25),0);
			position[1] = Math.max(Math.min(position[1],window.innerHeight - 25),0);

			// gravity
			aTagPositions.forEach(function(aTagPosition,index){
				if ( getDistance(position[0],position[1],aTagPosition.left,aTagPosition.top) < 30){
					// var x = position[0] - aTagPosition.left;
					// var y = position[1] - aTagPosition.top;
					// var theta = Math.atan(y/x);
					// position[0] -= 5*Math.cos(theta);
					// position[1] -= 5*Math.sin(theta);
			
					if (Math.abs(yaw) < 0.6){
						position[0] += (aTagPosition.left - position[0])/5;
					}
					if (Math.abs(roll) < 0.6){
						position[1] += (aTagPosition.top - position[1])/5;
					}
				}
			});

			circle.style.left = position[0]+"px";
			circle.style.top = position[1]+"px";

			circle.innerHTML = hand.sphereRadius;
		}

	}


	// Pointable Control

	if (frame.pointables.length > 0) {
		// var fingerTypeMap = ["Thumb", "Index finger", "Middle finger", "Ring finger", "Pinky finger"];
		// var boneTypeMap = ["Metacarpal", "Proximal phalanx", "Intermediate phalanx", "Distal phalanx"];
		var currentScroll = window.pageYOffset;
		if(frame.pointables[3].extended == false && frame.pointables[4].extended == false && frame.pointables[1].extended == true && frame.pointables[2].extended == true ){
			allowPointer = false
			window.scrollTo(0, frame.pointables[2].direction[1]*20 + currentScroll );
		}else{
			allowPointer = true
		}


	}

	if(allowPointer){
		// Gesture Control
		// var gestureOutput = document.getElementById("gestureData");
		if (frame.gestures.length > 0) {
			for (var i = 0; i < frame.gestures.length; i++) {
				var gesture = frame.gestures[i];

				switch (gesture.type) {
					case "circle":
					break;
					case "swipe":
					if (gesture.state == "start"){
					window.history.back();
				}
					break;
					case "screenTap":
					break;
					case "keyTap":
					// gestureString += "position: " + vectorToString(gesture.position) + " mm";
					circle.style.backgroundColor = 'red'
					var nearestIndex = getNearestATagIndex(position[0],position[1]);
					if(nearestIndex > 0){
						var aTagElements = document.getElementsByTagName("a");
						// console.log(nearestIndex);
						var event = document.createEvent( "MouseEvents" ); // イベントオブジェクトを作成
						event.initEvent("click", false, true); // イベントの内容を設定
						aTagElements[nearestIndex].dispatchEvent(event); // イベントを発火させる
					}
					break;
					default:
				}
			}
		}
	}

	previousFrame = frame;

})
