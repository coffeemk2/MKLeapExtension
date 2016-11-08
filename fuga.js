

var indexCircle = document.createElement('div');
var middleCircle = document.createElement('div');

var objBody = document.getElementsByTagName("body").item(0);



function addElement() {
	indexCircle.style.borderRadius = "20px"
	indexCircle.style.backgroundColor = 'rgba(255,255,255,0.5)';
	indexCircle.style.border = "solid 2px rgba(0,0,0,0.5)";
	indexCircle.style.position = "fixed";
	indexCircle.style.left = "100px";
	indexCircle.style.top = "100px";
	indexCircle.style.width = "40px";
	indexCircle.style.height = "40px";
	indexCircle.style.zIndex = 10000;

	middleCircle.style.borderRadius = "20px"
	middleCircle.style.backgroundColor = "rgba(255,255,255,0.5)";
	middleCircle.style.border = "solid 2px rgba(0,0,0,0.5)";
	middleCircle.style.position = "fixed";
	middleCircle.style.left = "100px";
	middleCircle.style.top = "100px";
	middleCircle.style.width = "40px";
	middleCircle.style.height = "40px";
	middleCircle.style.zIndex = 10000;
	// middleCircle.style.visibility = "hidden"

	objBody.appendChild(indexCircle);
	objBody.appendChild(middleCircle);

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
	// if distance > 20 などで最大を決める
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


			// velocity

		}

	}


	// Pointable Control

	if (frame.pointables.length > 0) {
		// var fingerTypeMap = ["Thumb", "Index finger", "Middle finger", "Ring finger", "Pinky finger"];
		// var boneTypeMap = ["Metacarpal", "Proximal phalanx", "Intermediate phalanx", "Distal phalanx"];

		var diff = [0,0,0];
		var speed = 5;
		var currentScroll = window.pageYOffset;

		var indexFinger = frame.hands[0].indexFinger;
		var middleFinger = frame.hands[0].middleFinger;


		var scrollMode = false;
		if(Math.abs(indexFinger.touchDistance - middleFinger.touchDistance) < 0.03){
			scrollMode = true;
		}

		var d = indexFinger.touchDistance;
		if(d < 0){
			indexCircle.style.backgroundColor = "rgba(0,255,0,0.3)";
		}else{
			indexCircle.style.backgroundColor = "rgba(255,0,0,0.3)";//`rgba(${Math.floor(255*Math.abs(d))},0,0,0.5)`;
		}




		if(scrollMode){
			window.scrollTo(0, frame.pointables[2].direction[1]*20 + currentScroll );
		}else{
			if(indexFinger.touchDistance < 0){

				if(previousFrame && previousFrame.valid){
					if(previousFrame.pointables[1]){
						var oldIndexFinger = previousFrame.pointables[1];
						// diff[0] = frame.pointables[1].stabilizedTipPosition[0] - oldIndexFinger.stabilizedTipPosition[0];
						// diff[1] = frame.pointables[1].stabilizedTipPosition[1] - oldIndexFinger.stabilizedTipPosition[1];
						diff[0] = frame.pointables[1].tipPosition[0] - oldIndexFinger.tipPosition[0];
						diff[1] = frame.pointables[1].tipPosition[1] - oldIndexFinger.tipPosition[1];
						diff[2] = frame.pointables[1].tipPosition[2] - oldIndexFinger.tipPosition[2];

						if(diff[2] < Math.sqrt(Math.pow(diff[0],2) + Math.pow(diff[1],2))){
							position[0] += diff[0]*speed;
							position[1] -= diff[1]*speed;

							// limit
							position[0] = Math.max(Math.min(position[0],window.innerWidth - 25),0);
							position[1] = Math.max(Math.min(position[1],window.innerHeight - 25),0);
							//
							indexCircle.style.left = position[0]+"px";
							indexCircle.style.top = position[1]+"px";

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
