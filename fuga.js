

var indexCircle = document.createElement('div');
// var middleCircle = document.createElement('div');

var objBody = document.getElementsByTagName("body").item(0);



function addElement() {
	indexCircle.style.borderRadius = "7px"
	indexCircle.style.backgroundColor = 'rgba(255,255,255,0.5)';
	indexCircle.style.border = "solid 1px rgba(0,0,0,0.5)";
	indexCircle.style.position = "fixed";
	indexCircle.style.left = "100px";
	indexCircle.style.top = "100px";
	indexCircle.style.width = "14px";
	indexCircle.style.height = "14px";
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
	// if distance > 20 などで最大を決める
	return nearestIndex;
}


var controllerOptions = {enableGestures: true};
var previousFrame = null;
var indexPosition = [100,100];


addElement();



var circleTypeMap = ["invalid","move","stop","scroll","menu"];
var circleType = 0;
var isLoading = false;

window.onload = function(){
	isLoading = false;
}

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



	}


	// Pointable Control

	if (frame.pointables.length > 0) {
		// var fingerTypeMap = ["Thumb", "Index finger", "Middle finger", "Ring finger", "Pinky finger"];
		// var boneTypeMap = ["Metacarpal", "Proximal phalanx", "Intermediate phalanx", "Distal phalanx"];

		var indexDiff = [0,0,0];
		var currentScroll = window.pageYOffset;

		var indexFinger = frame.hands[0].indexFinger;
		var middleFinger = frame.hands[0].middleFinger;

		// Math.abs(indexFinger.touchDistance - middleFinger.touchDistance) < 0.05
		var pointables = frame.pointables;

		// Layouts
		indexCircle.style.visibility = "visible";
		if(pointables[1].extended == true && pointables[2].extended == true && pointables[3].extended == false && pointables[4].extended == false){
			circleType = 3;
			indexCircle.style.backgroundColor = "rgba(0,0,255,0.5)";
		}else if(pointables[1].extended == true && pointables[2].extended == true && pointables[3].extended == true && pointables[4].extended == true){
			circleType = 4;
			indexCircle.style.backgroundColor = "rgba(255,255,255,0.5)";

		}else{
			var d = indexFinger.touchDistance;
			if(d < 0){
				circleType = 1;
				indexCircle.style.backgroundColor = "rgba(0,255,0,0.5)";
			}else{
				circleType = 2;
				indexCircle.style.backgroundColor = "rgba(255,0,0,0.5)";//`rgba(${Math.floor(255*Math.abs(d))},0,0,0.5)`;
			}
		}




		// Controls
		if(circleType == 3){
			window.scrollTo(0, -frame.pointables[1].direction[1]*20 + currentScroll );
		}else{
				if(previousFrame && previousFrame.valid){
					if(previousFrame.pointables[1]){

						var oldIndexFinger = previousFrame.pointables[1];
						indexDiff[0] = frame.pointables[1].tipPosition[0] - oldIndexFinger.tipPosition[0];
						indexDiff[1] = frame.pointables[1].tipPosition[1] - oldIndexFinger.tipPosition[1];
						indexDiff[2] = frame.pointables[1].tipPosition[2] - oldIndexFinger.tipPosition[2];

						// console.log(circleType);
						switch (circleType){
							case 1:
							case 4:

							var d = Math.sqrt(Math.pow(indexDiff[0],2) + Math.pow(indexDiff[1],2));
							// if(indexDiff[2] < d){
							d = 0.7*d + 1;
							indexPosition[0] += indexDiff[0]*d;
							indexPosition[1] -= indexDiff[1]*d;
							// limit
							indexPosition[0] = Math.max(Math.min(indexPosition[0],window.innerWidth - 25),0);
							indexPosition[1] = Math.max(Math.min(indexPosition[1],window.innerHeight - 25),0);

							//
							indexCircle.style.left = indexPosition[0]+"px";
							indexCircle.style.top = indexPosition[1]+"px";

							// }
							break;
							case 2:

							var pointable = frame.pointables[1];
							var metacarpalBone = pointable.bones[0];
							var distalPhalanxBone = pointable.bones[3];
							var mDirection = metacarpalBone.direction();
							var dDirection = distalPhalanxBone.direction();
							var md = mDirection[1] - dDirection[1];

							var pPointable = previousFrame.pointables[1];
							var pMetacarpalBone = pPointable.bones[0];
							var pDistalPhalanxBone = pPointable.bones[3];
							var pmDirection = pMetacarpalBone.direction();
							var pdDirection = pDistalPhalanxBone.direction();
							var pmd = pmDirection[1] - pdDirection[1];
							if(pmd-md < -0.1){
								indexCircle.style.visibility = "hidden";
								var focusElement = document.elementFromPoint(indexPosition[0]+7,indexPosition[1]+7);
								var event = document.createEvent( "MouseEvents" ); // イベントオブジェクトを作成
								event.initEvent("click", false, true); // イベントの内容を設定
								focusElement.dispatchEvent(event); // イベントを発火させる
								indexCircle.style.visibility = "visible";
							}

							break;

							default:

						}
					}
				}
			}


	}else{
		circleType = 0;
		indexCircle.style.visibility = "hidden";
	}

	// Gesture Control
	// var gestureOutput = document.getElementById("gestureData");
	var gestureString = "";
	if (frame.gestures.length > 0) {


		var swipeAction = null;

		for (var i = 0; i < frame.gestures.length; i++) {
			var gesture = frame.gestures[i];
			gestureString += "Gesture ID: " + gesture.id + ", "
			+ "type: " + gesture.type + ", "
			+ "state: " + gesture.state + ", "
			+ "hand IDs: " + gesture.handIds.join(", ") + ", "
			+ "pointable IDs: " + gesture.pointableIds.join(", ") + ", "
			+ "duration: " + gesture.duration + " &micro;s, ";


			switch (gesture.type) {
				case "circle":
				break;
				case "swipe":
					if(!isLoading){
						console.log("swipe");
						window.history.go(-1);
						isLoading = true;
					}



				break;
				case "screenTap":
				break;
				case "keyTap":
				/* click  */
				if (circleType == 2){
				 	console.log("keyTapped");
				 	indexCircle.style.visibility = "hidden";
				 	var focusElement = document.elementFromPoint(indexPosition[0]+7,indexPosition[1]+7);
				 	var event = document.createEvent( "MouseEvents" ); // イベントオブジェクトを作成
				 	event.initEvent("click", false, true); // イベントの内容を設定
				 	focusElement.dispatchEvent(event); // イベントを発火させる
				 	indexCircle.style.visibility = "visible";
				}
				break;
				default:
			}
			// console.log(gestureString);

		}
	}

	previousFrame = frame;

})

function vectorToString(vector, digits) {
	if (typeof digits === "undefined") {
		digits = 1;
	}
	return "(" + vector[0].toFixed(digits) + ", "
	+ vector[1].toFixed(digits) + ", "
	+ vector[2].toFixed(digits) + ")";
}
