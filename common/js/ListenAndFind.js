/* jshint node: true */
/* global Activity, log */
/**
*	Listen and Find activity class
*/
"use strict";
// constructor
function ListenAndFind( json ) {
	Activity.call(this, json);
	//var _container = document.getElementById('ActivityContainer'); // abstract
	this.imgs = [];
	
	// game logic
	this.currentItemIndex = 0;
	
	// right/wrong
	this.correctAudio = null;
	this.incorrectAudio = null;
	
	// feedback layer
	this.feedback = null;
	this.correctAnim = null;
	this.incorrectAnim = null;
	
	return this;
}
// inherit from base Activity class
ListenAndFind.prototype = Object.create(Activity.prototype);
// correct the constructor pointer because it points to Activity
ListenAndFind.prototype.constructor = ListenAndFind;

// layout activity elements
ListenAndFind.prototype.layout = function() {
	
	Activity.prototype.layout.call(this);
	log('layout', this);
	// layout images 
	this.data.items.forEach(function(item, i){
		var img = document.createElement('img');
		img.src = item.image;
		// layout comes from json - !todo use class? or make function for abs. pos'd items?
		img.style.position = 'absolute';
		img.style.left = item.x;
		img.style.top = item.y;

                if (item.hasOwnProperty('percent'))
                {
                    if (this.validDimensionFilename(item.image))
                    {
                        var obj = this.getNewImageDimensions(item.image,item.percent);
                        img.style.width = obj.width;
                        img.style.height = obj.height;
                    }
                    else
                    {
                        // assume the width is set so just resize...
                        var obj = this.getNewImageDimensionWidthAndHeight(item.width,item.height,item.percent);
                        img.style.width = obj.width;
                        img.style.height = obj.height;
                    }
                }
                else
                {
                    img.style.width = item.width;
                    img.style.height = item.height;
                }           
                
//		img.style.width = item.width;
//		img.style.height = item.height;          

		img.classList.add('yp-u-clickable');
		img.setAttribute('data-index', i);
		if(item.hasOwnProperty('opacity')){
			img.style.opacity = item.opacity.toString();
		}
		if(item.hasOwnProperty('zindex')){
			img.style.zIndex = item.zindex.toString();
        		img.setAttribute('data-zindex', item.zindex.toString());
		}
		
		// check for label
		if(item.hasOwnProperty('label')){
			var labelData = item.label;
			var label = document.createElement('p');
			var labelText = document.createTextNode(labelData.text);
			label.style.position = 'absolute';
			label.style.left = labelData.x;
			label.style.top = labelData.y;
			label.classList.add( 'yp-label' );
			label.appendChild(labelText);
			this.modal.appendChild(label);
			// no need  to store labels?
		}
		
		this.modal.appendChild(img);
		this.imgs.push(img);
	}, this); // important to pass ref to this at end for context
	
	//  add right/wrong audio
	if(this.data.correct_audio){
		this.correctAudio = this.addAudio(this.data.correct_audio, this.modal);
	}
	if(this.data.correct_audio){
		this.incorrectAudio = this.addAudio(this.data.incorrect_audio, this.modal);
	}
	// !abstract? feedback non-json 
	// create a feedback layer
	this.feedback = document.createElement('div');
	this.feedback.classList.add('yp-feedback', 'yp-u-hide');
	this.stage.appendChild(this.feedback);
	
	// add right/wrong animation (no json involved)
        if (this.data.noanimation)
        {
            // don't load animation...
        }
        else
        {
            this.correctAnim = document.createElement('div');
            this.correctAnim.classList.add('yp-feedback-anim', 'yp-feedback-anim--correct', 'yp-u-hide');
            this.incorrectAnim = document.createElement('div');
            this.incorrectAnim.classList.add('yp-feedback-anim', 'yp-feedback-anim--incorrect', 'yp-u-hide');
            //
            this.feedback.appendChild(this.correctAnim);
            this.feedback.appendChild(this.incorrectAnim);
        }
        
	// shuffle?
	if(this.data.shuffle)
        {
            this.randomise();
	}    
};
// bind any events - e.g. click events to UI added in layout()
ListenAndFind.prototype.bindEvents = function() {
	var self = this;
	Activity.prototype.bindEvents.call(this);
	log('bind events', this);
                
	// images
	function optionSelect(e){
		
		var optionIndex = parseInt(e.target.getAttribute('data-index'));
		log('Selected otpion:',optionIndex);
		// if the optionIndex is equal to the index of the item in the array, we have a match 
		
		if(self.currentItemIndex === optionIndex){
			self.currentItemIndex++;
	
//			self.correctAudio.play();
			
			if(self.currentItemIndex === self.imgs.length){
				self.disableElements(self.imgs);
				self.currentItemIndex = 0; // pull into reset function?
			}
			
			// play anim and on anim complete unlock images again and play audio from next point
			self.showFeedback(true,e.target);

		}else{
			// play anim and on anim complete unlock images again
			self.showFeedback(false,e.target);
		}
		
	}
	// loop and give events
	this.imgs.forEach(function(img){
		this.addListener(img, 'click', optionSelect);
	}, this);

	this.disableElements(this.imgs);
	
	// time updates
	//remove the default timupdate listener
	this.removeListener(this.audio, 'timeupdate', this.resetMediaAtEnd);
	// we need to do the core work here that handles playing and pausing the audio
	function pauseAudioAtPoints(e){
		// retrieve the index of the current item we are looking for
		var timings = self.data.items[self.currentItemIndex].timings;		
		var audio = e.target;
		var elapsed = audio.currentTime;
		// if we've reached the current end timing
		if(elapsed >= timings.end && !audio.paused){
			self.enableElements(self.imgs);
			self.audioBtn.classList.remove('yp-btn-toggle');
			audio.pause();
		}
	}
	this.addListener(this.audio, 'timeupdate', pauseAudioAtPoints);
};
// overwrite Activity.toggleAudio();
ListenAndFind.prototype.toggleMedia = function(media, btn){
	// if paused then disable elements etc.
	if(media.paused){
		this.disableElements(this.imgs);
		
		var timings = this.data.items[this.currentItemIndex].timings;
		
		// check if we are at the end of the current timing
		if(media.currentTime >= timings.end){
			// reset
			media.currentTime = timings.start;
		}
		
		media.play();
		
		btn.classList.add('yp-btn-toggle');
	}else{
		
		media.pause();
		
		btn.classList.remove('yp-btn-toggle');
	}
		
};
ListenAndFind.prototype.showFeedback = function( correct, item ) {
	var self = this;
	var delay = 3000; // delay removal and trigger of any callback
	var audioElement = correct ? this.correctAudio : this.incorrectAudio;
	var animElement = correct ? this.correctAnim : this.incorrectAnim;
	this.show( this.feedback );
        var audioDelay = correct ? View.WELL_DONE_AUDIO_DELAY : View.OH_NO_AUDIO_DELAY;;
       
        if (animElement)
        {
            this.show( animElement );
            animElement.classList.add('yp-animate');
        }
        
        if (correct && this.data.showglow)
        {
            self.showGlow(item);
        }
        
        window.setTimeout(function(){
            audioElement.play();
        }, audioDelay);    
        
//	audioElement.play();
	//
	function complete(){
		self.removeMediaEnded(audioElement, complete);
		window.setTimeout(function(){
			if(correct){
				self.afterCorrect(item);

			}else{
				self.removeCorrectIncorrectAnims();
				self.removeFeedback();
			}
			
		}, delay);
	}

	self.addMediaEnded(audioElement, complete);
};
//
ListenAndFind.prototype.nextQuestion = function() {
	log('nextQuestion');
	// trigger nextQuestion
	this.audioBtn.click();
};
// !override to do other stuff after right/wrong
ListenAndFind.prototype.afterCorrect = function(item) {
	log('After correct.');
	this.removeFeedback();

        // remove glow...
        this.removeGlow(item);
        
        // trigger nextQuestion
	this.nextQuestion();
};
ListenAndFind.prototype.removeCorrectIncorrectAnims = function(){
    
//        var self = this;
        if (this.correctAnim)
        {
//            if (View.FADE_ANIMATION)
//            {
//                this.correctAnim.classList.add('fade-animation'); 
//                this.incorrectAnim.classList.add('fade-animation'); 
//
//                window.setTimeout(function(){
//                    self.correctAnim.classList.remove('fade-animation');
//                    self.incorrectAnim.classList.remove('fade-animation');
//                    self.hide( self.correctAnim );
//                    self.hide( self.incorrectAnim );
//                    self.correctAnim.classList.remove('yp-animate');
//                    self.incorrectAnim.classList.remove('yp-animate');
//                }, 2000);    
//            }
//            else
//            {
                this.hide( this.correctAnim );
                this.hide( this.incorrectAnim );
                this.correctAnim.classList.remove('yp-animate');
                this.incorrectAnim.classList.remove('yp-animate');
//            }
        }
};
ListenAndFind.prototype.removeFeedback = function() {
	this.removeCorrectIncorrectAnims();
	this.hide( this.feedback );
};

ListenAndFind.prototype.showGlow = function(el) {
	log('In showGlow');
        // glow the clicked on item...
        
        // increase zindex...
        el.style.zIndex = 999;      
        
        el.classList.add('yp-img-highlight-item-active');
        el.classList.add('yp-anim-300-eo');
	if(this.data.hasOwnProperty('glow_throb') && this.data.glow_throb){
            el.classList.add('yp-anim-throb');
        
        }
        
};

ListenAndFind.prototype.removeGlow = function(el) {
	log('In showGlow');
        // glow the clicked on item...
        
        // return zindex to what it was...

        if (el.hasAttribute('data-zindex'))
        {
            el.style.zIndex = el.getAttribute('data-zindex');      
        }

        if (this.data.showglow)
        {
            el.classList.remove('yp-img-highlight-item-active');
            if(this.data.hasOwnProperty('glow_throb') && this.data.glow_throb){
                el.classList.remove('yp-anim-throb');

            }
        }
};


ListenAndFind.prototype.randomise = function(){
    // loop the options and switch their x/y coords
        
    var imgsCopy = this.imgs.slice();

    this.shuffle(imgsCopy);
    imgsCopy.forEach(function(img, i){
    var item = this.data.items[i];
    img.style.left = item.x;
    img.style.top = item.y;



    }, this);
       
};