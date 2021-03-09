/* jshint node: true */
/*
*	View base class - used by both player, activity, and components
*/
"use strict";
//
// !dev log wrapper - should be disabled when released
var debug = true;
var log = debug ? console.log.bind(window.console) : function(){};

// temporary logger to div as well as console...
//if (debug)
//{
//    var elemDiv = document.createElement('pre');
//    elemDiv.setAttribute('id', 'logger');
//    document.body.appendChild(elemDiv);
//
//    (function (logger) {
//        console.old = console.log;
//        console.log = function () {
//            var output = "", arg, i;
//
//            for (i = 0; i < arguments.length; i++) {
//                arg = arguments[i];
//                output += "<span class=\"log-" + (typeof arg) + "\">";
//
//                if (
//                    typeof arg === "object" &&
//                    typeof JSON === "object" &&
//                    typeof JSON.stringify === "function"
//                ) {
//                    output += JSON.stringify(arg);   
//                } else {
//                    output += arg;   
//                }
//
//                output += "</span>&nbsp;";
//            }
//
//            logger.innerHTML += output + "<br>";
//            console.old.apply(undefined, arguments);
//        };
//    })(document.getElementById("logger"));
//}
// constructor
function View( json ) {
	log('View (base) created.');
	this.data = json;
	// store any listeners added 
	this.listeners = [];
	
	this.environment = {"DEV":1, "PRODUCTION":2};

	// change this to PRODUCTION for release!!
	this.runningMode = this.environment.DEV;

	return this;
}
// css
View.CSS_HIDE = 'yp-u-hide';
View.CSS_DISABLE = 'yp-u-disable';
View.CSS_VISUAL_DISABLE = 'yp-u-visual-disable';
View.CSS_CLICKABLE = 'yp-u-clickable';
View.CSS_FADED = 'yp-u-f-50';

View.CSS_POS_ABS = 'yp-pos-abs';
View.POS_CENTER_CENTER = 'yp-pos-center-center';

View.CSS_BTN = 'yp-btn';
View.CSS_BTN_ROUNDED = View.CSS_BTN + '-rounded';
View.CSS_BTN_PLAY = View.CSS_BTN + '-play';
View.CSS_BTN_TOGGLE = View.CSS_BTN + '-toggle';

View.CSS_MEDIA_PLAYING = 'yp-media-playing';

View.WELL_DONE_AUDIO_DELAY = 0;
View.OH_NO_AUDIO_DELAY = 700;
View.FADE_ANIMATION = false;

// !media
View.prototype.stopAllSounds = function(){
	var audio = document.getElementsByTagName('audio');
	var video = document.getElementsByTagName('video');
	var media = Array.prototype.slice.call( audio, 0 );
	media.concat( Array.prototype.slice.call( video, 0 ) );
	media.forEach(function(item){item.pause();});
};

View.prototype.addAudio = function(path, parentEl){
	// creates an audio button
	var audio = this.createAudio(path);
	parentEl.appendChild(audio);
	audio.currentTime = 0;
	return audio;
};

View.prototype.createAudio = function(path){
	// creates an audio button
	var media = document.createElement('audio');
	media.setAttribute('src', path);
	media.setAttribute('preload', '');
	media.type = 'audio/mpeg';
	return media;
};

View.prototype.addVideo = function(path, parentEl, reverse){
	// creates an audio button
	var video = this.createVideo(path);
	if(reverse===true){
		parentEl.insertBefore(video, parentEl.childNodes[0]);
	}else{
		parentEl.appendChild(video);
	}
	
	video.currentTime = 0;
	return video;
};

View.prototype.createVideo = function(path){
	var media = document.createElement('video');
	
	//media.setAttribute('autoplay', 'autoplay');

	media.setAttribute('preload', '');
	media.preload = true;
	media.setAttribute('playsinline', ''); // add for iOS 10+ to autoplay video
	media.playsinline = true;
	
	var src = document.createElement('source');
	src.src = path;
	src.type = 'video/mp4';
	
	media.appendChild(src);
	media.load(); // force Loader
	
	return media;
};
// !buttons
//
View.prototype.createAudioButton = function(cssClassArr){
	// creates an audio button
	var arr = ['yp-btn-audio', 'yp-btn-rounded'];
	if(cssClassArr){
		arr = arr.concat(cssClassArr);
	}
	return this.createButton(arr, 'Play audio');
};
View.prototype.createPlayButton = function(cssClassArr){
	// creates an audio button
	var arr = ['yp-btn-play', 'yp-btn-rounded'];
	if(cssClassArr){
		arr = arr.concat(cssClassArr);
	}
	return this.createButton(arr, 'Play');
};
View.prototype.createMuteButton = function(cssClassArr){
	// creates an audio button
	var arr = ['yp-btn-mute', 'yp-btn-rounded'];
	if(cssClassArr){
		arr = arr.concat(cssClassArr);
	}
	return this.createButton(arr, 'Mute');
};
View.prototype.createCloseButton = function(cssClassArr){
	// creates an audio button
	var arr = ['yp-btn-close', 'yp-btn-rounded'];
	if(cssClassArr){
		arr = arr.concat(cssClassArr);
	}
	return this.createButton(arr, 'Close');
};
View.prototype.createResetButton = function(cssClassArr){
	// creates an audio button
	var arr = ['yp-btn-reset', 'yp-btn-rounded'];
	if(cssClassArr){
		arr = arr.concat(cssClassArr);
	}
	return this.createButton(arr, 'Reset');
};
View.prototype.createFlipButton = function(cssClassArr){
	// creates an audio button
	var arr = ['yp-btn-flip', 'yp-btn-rounded'];
	if(cssClassArr){
		arr = arr.concat(cssClassArr);
	}
	return this.createButton(arr, 'Flip');
};
View.prototype.createSubmitButton = function(cssClassArr){
	// creates an audio button
	var arr = ['yp-btn-submit'];
	if(cssClassArr){
		arr = arr.concat(cssClassArr);
	}
	return this.createButton(arr, 'Submit');
};
View.prototype.createAnswerButton = function(cssClassArr){
	// creates an audio button
	var arr = ['yp-btn-answer'];
	if(cssClassArr){
		arr = arr.concat(cssClassArr);
	}
	return this.createButton(arr, 'Show answer');
};
View.prototype.createExtraButton = function(cssClassArr){
	// creates an audio button
	var arr = ['yp-btn-extra'];
	if(cssClassArr){
		arr = arr.concat(cssClassArr);
	}
	return this.createButton(arr, 'Extra');
};
View.prototype.createExtraNextButton = function(cssClassArr){
	// creates an audio button
	var arr = ['yp-btn-extra-next'];
	if(cssClassArr){
		arr = arr.concat(cssClassArr);
	}
	return this.createButton(arr, 'ExtraNext');
};
View.prototype.createButton = function(cssClassArr, ariaTitle){
	// creates an audio button
	var btn = document.createElement('a');
	var arr = ['yp-btn'];
	if(cssClassArr){
		arr = arr.concat(cssClassArr);
	}
	// add classes
	this.addCssClasses(btn, arr);
	//
	if(ariaTitle){
		btn.setAttribute('aria-title', ariaTitle);
	}
	return btn;
};
// function that adds an array of css classes to an element
View.prototype.addCssClasses = function(element, arr){
	arr.forEach(function(item){
		element.classList.add(item);
	});
};
// function that adds an array of css classes to an element
View.prototype.removeCssClasses = function(element, arr){
	arr.forEach(function(item){
		element.classList.remove(item);
	});
};
View.prototype.toggleBtnState = function(element){
	element.classList.toggle('yp-btn-toggle');
};
// buttons
View.prototype.resetMediaAtEnd = function(media, btn){
	media.currentTime = 0;
	this.pauseMedia(media, btn);
};
View.prototype.resetMedia = function(media){
	media.currentTime = 0;
	
};
View.prototype.playAudio = function(media, btn){
	media.play();
	btn.classList.add('yp-btn-toggle');
};
View.prototype.pauseMedia = function(media, btn){
	media.pause();
	// log('pause media now');
	btn.classList.remove('yp-btn-toggle');
};
// toggles play/pause - note uses passed in argulents rather than this.pauseAudio as context of this is wrong
View.prototype.toggleMedia = function(media, btn){	
	if(media.paused){
		media.play();
		btn.classList.add('yp-btn-toggle');
	}else{
		media.pause();
		btn.classList.remove('yp-btn-toggle');
	}
};
// toggles sound
View.prototype.toggleMediaSound = function(media, btn){
	// a toggle button. note could toggle class, but not too reliable...
	
	if(media.volume > 0){
		media.volume = 0;
		btn.classList.add('yp-btn-toggle');
	}else{
		media.volume = 1;
		btn.classList.remove('yp-btn-toggle');
	}

};
// utils
View.prototype.show = function(element){
	element.classList.remove('yp-u-hide');
};
//
View.prototype.hide = function(element){
	element.classList.add('yp-u-hide');
};
//
View.prototype.addMediaEnded = function(element, func){
	this.addListener(element, 'ended', func);
};
//
View.prototype.removeMediaEnded = function(element, func){
	this.removeListener(element, 'ended', func);
};
//
View.prototype.onTransitionComplete = function( element, func){
	this.addListener(element, 'transitionend', func);
};
// addEventListener wrapper function
View.prototype.addListener = function(element, event, func, cancel){
	var cancellable = cancel === true;
	element.addEventListener(event, func, cancellable);
	this.listeners.push({'element': element, 'event': event, 'func': func, 'cancel': cancellable}); // add to array for removal
	//log('addList', this.listeners.slice());
};
View.prototype.removeListener = function(element, event, func, cancel){
	var cancellable = cancel === true;
	var match = false;
	//log('listeners:',this.listeners.slice());
	//log('removelistener', element);
	// element.removeEventListener(event, func, cancellable);
	// remove from listeners array
	this.listeners.forEach(function(item, i, obj){
		//log(item.element, item.event, item.func);
		
		if(!match && item.element === element && item.event === event && item.func === func){
			item.element.removeEventListener(item.event, item.func, cancellable);

			obj.splice(i, 1);
			//log('Match:',i, element, (item.element === element), (item.event === event),  (item.func === func),  (item.cancel === cancellable));
			match = true;
		}
		
	});
	//log('listeners now:',this.listeners);
};
// shuffle array (operates on array)
View.prototype.shuffle = function(arr){
    var j;
    var x;
    var i;
    var len = arr.length - 1;
    for(i = len; i > 0; i--){
        j = Math.floor(Math.random() * (i + 1));
        x = arr[i];
        arr[i] = arr[j];
        arr[j] = x;
    }
};
View.prototype.shuffleChildNodes = function(parentEl){
	for (var i = parentEl.children.length; i >= 0; i--) {
		var randomNum = Math.floor(Math.random() * i);
		var child = parentEl.childNodes[randomNum];
	    parentEl.appendChild(child);
	}
};

// add a background iamge or video to a container
View.prototype.addBackground = function( arr, cont, cssClass ){
	var bg = null;
    var bgElement = null;     
    var bgType = null;
    // if array longer than 1, pick it a random 
    if(arr.length > 1){
    	this.shuffle(arr);
    }
    bg = arr[0];
    
    
	// !autoplay-detect
	
    if(bg.video){
		bgType = 'video';
        bgElement = this.addVideo(bg.video, cont); // make media pass an object with props?
        bgElement.setAttribute('id', 'BackgroundVideo');
        bgElement.setAttribute('autoplay', 'autoplay');
        bgElement.setAttribute('muted', ''); // add for iOS 10+ to autoplay video
        bgElement.muted = true; // muted has to be set like this to work
        
        bgElement.classList.add(cssClass);
        
        if(bg.image){
            bgElement.setAttribute('poster',bg.image);
        }
        
        log(this.capabilities.autoplayMedia);
        if(!this.capabilities.autoplayMedia){
/*
            window.setTimeout(function(){
	            
	            document.body.addEventListener('touchstart', function(){
		            log('bob', self.videoBg);
		            self.videoBg.play();
	            });
					
            }, 500);
*/
            
        }
        
    }else{
        // no video, so check for image
        if(bg.image){
	        bgType = 'image';
            bgElement = document.createElement('img');
            bgElement.setAttribute('src', bg.image);
            bgElement.setAttribute('draggable', false);
            bgElement.classList.add(cssClass);
            cont.appendChild(bgElement);
        }
    }
    return {'type': bgType, 'element': bgElement};
};

// enable/disable elements
View.prototype.disable = function(element, doFade, visualOnly){
	if(doFade === true){
		element.classList.add( View.CSS_FADED );
	}
	element.classList.add(visualOnly !== true ? View.CSS_DISABLE : View.CSS_VISUAL_DISABLE);
};
View.prototype.enable = function(element){
	if(element.classList.contains( View.CSS_FADED )){
		element.classList.remove( View.CSS_FADED );
	}
	element.classList.remove(View.CSS_DISABLE, View.CSS_VISUAL_DISABLE);
};
View.prototype.disableElements = function(arr, doDisable, doFade){
	var disable = doDisable !== false;
	var fade = doFade === true;
	arr.forEach(function(element) {
		if(disable){
			this.disable(element, fade);
		}else{
			this.enable(element);
		}
	}, this);
};
View.prototype.enableElements = function(arr){
	this.disableElements(arr, false);
};
// collision detection
View.prototype.collided = function(element1, element2){
	var rect1 = element1.getBoundingClientRect();
	var rect2 = element2.getBoundingClientRect();
	return !(rect1.right < rect2.left || rect1.left > rect2.right ||  rect1.bottom < rect2.top || rect1.top > rect2.bottom);
};
// prepares activity for deletion
View.prototype.destroy = function(){
	var listnrs = this.listeners.slice(); // important, make a copy so that we do not manipulate the actual array of listeners as it changes as we go
	listnrs.forEach(function(item){
		// log('Item to remove:', item.element, item.event);
		this.removeListener(item.element, item.event, item.func, item.cancel); 
		
	}, this);
	//log(listnrs, this.listeners);
};
View.prototype.layout = function(){
	// layout
};
//
View.prototype.bindEvents = function() { 
	// bind any events
};
// when everything is ready and good to go
View.prototype.ready = function() {
	// when ready to go
};
// kick things off
View.prototype.init = function() {
	this.layout();
	this.bindEvents();
};