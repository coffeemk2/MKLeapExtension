

var indexCircle = document.createElement('div');
// var middleCircle = document.createElement('div');

var objBody = document.getElementsByTagName("body").item(0);



function addElement() {
	indexCircle.style.borderRadius = "10px"
	indexCircle.style.backgroundColor = 'rgba(255,255,255,0.5)';
	indexCircle.style.border = "solid 1px rgba(0,0,0,0.5)";
	indexCircle.style.position = "fixed";
	indexCircle.style.left = "100px";
	indexCircle.style.top = "100px";
	indexCircle.style.width = "20px";
	indexCircle.style.height = "20px";
	indexCircle.style.zIndex = 10000;

	objBody.appendChild(indexCircle);

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
	// TODO: if distance > 20 などで最大を決める
	return nearestIndex;
}


var controllerOptions = {enableGestures: true};
var previousFrame = null;
var indexPosition = [100,100];
var scrollMode = false;


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


			// velocity

		}

	}


	// Pointable Control

	if (frame.pointables.length > 0) {
		// var fingerTypeMap = ["Thumb", "Index finger", "Middle finger", "Ring finger", "Pinky finger"];
		// var boneTypeMap = ["Metacarpal", "Proximal phalanx", "Intermediate phalanx", "Distal phalanx"];

		var indexDiff = [0,0,0];
		var speed = 5;
		var currentScroll = window.pageYOffset;

		var indexFinger = frame.hands[0].indexFinger;
		var middleFinger = frame.hands[0].middleFinger;


		// Layouts
		if(Math.abs(indexFinger.touchDistance - middleFinger.touchDistance) < 0.03){
			scrollMode = true;
			indexCircle.style.backgroundColor = "rgba(0,0,255,0.3)";
		}else{
			scrollMode = false;
			var d = indexFinger.touchDistance;
			if(d < 0){
				indexCircle.style.backgroundColor = "rgba(0,255,0,0.3)";
			}else{
				indexCircle.style.backgroundColor = "rgba(255,0,0,0.3)";//`rgba(${Math.floor(255*Math.abs(d))},0,0,0.5)`;
			}

		}






		if(scrollMode){
			window.scrollTo(0, frame.pointables[2].direction[1]*20 + currentScroll );
		}else{
			if(indexFinger.touchDistance < 0){
				if(previousFrame && previousFrame.valid){
					if(previousFrame.pointables[1]){
						var oldIndexFinger = previousFrame.pointables[1];

						indexDiff[0] = frame.pointables[1].tipPosition[0] - oldIndexFinger.tipPosition[0];
						indexDiff[1] = frame.pointables[1].tipPosition[1] - oldIndexFinger.tipPosition[1];
						indexDiff[2] = frame.pointables[1].tipPosition[2] - oldIndexFinger.tipPosition[2];

						if(indexDiff[2] < Math.sqrt(Math.pow(indexDiff[0],2) + Math.pow(indexDiff[1],2))){
							indexPosition[0] += indexDiff[0]*speed;
							indexPosition[1] -= indexDiff[1]*speed;
							// limit
							indexPosition[0] = Math.max(Math.min(indexPosition[0],window.innerWidth - 25),0);
							indexPosition[1] = Math.max(Math.min(indexPosition[1],window.innerHeight - 25),0);

							//
							indexCircle.style.left = indexPosition[0]+"px";
							indexCircle.style.top = indexPosition[1]+"px";
						}
					}
				}
			}
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
					// 	if (gesture.state == "start"){
					// 	window.history.back();
					// }
					break;
					case "screenTap":
					break;
					case "keyTap":
					// gestureString += "position: " + vectorToString(gesture.position) + " mm";
					// circle.style.backgroundColor = 'red'
					// var nearestIndex = getNearestATagIndex(position[0],position[1]);
					// if(nearestIndex > 0){
					// 	var aTagElements = document.getElementsByTagName("a");
					// 	// console.log(nearestIndex);
					// 	var event = document.createEvent( "MouseEvents" ); // イベントオブジェクトを作成
					// 	event.initEvent("click", false, true); // イベントの内容を設定
					// 	aTagElements[nearestIndex].dispatchEvent(event); // イベントを発火させる
					// }
					break;
					default:
				}
			}
		}
	}

	previousFrame = frame;

})
