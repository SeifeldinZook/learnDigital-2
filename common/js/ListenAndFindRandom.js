/* jshint node: true */
/* global ListenAndFind, log */
/**
*	Listen and Find activity class
*/
"use strict";
// constructor
function ListenAndFindRandom( json ) {
	ListenAndFind.call(this, json);
	this.afterCorrectVideo = null;
	this.afterCorrectAudio = null;
	this.afterCorrectAnimContainer = null;
}
// inherit from base Activity class
ListenAndFindRandom.prototype = Object.create(ListenAndFind.prototype);
// correct the constructor pointer because it points to Activity
ListenAndFindRandom.prototype.constructor = ListenAndFindRandom;
//
ListenAndFindRandom.prototype.layout = function(){
	ListenAndFind.prototype.layout.call(this);
	// add in the video of waldo flaming but hide it
        
        if (this.data.after_correct_video)
        {
            this.afterCorrectVideo = this.addVideo(this.data.after_correct_video, this.modal);
            this.afterCorrectVideo.setAttribute('id', 'AfterCorrectVideo');
            this.afterCorrectVideo.classList.add('yp-modal__background');
            this.hide(this.afterCorrectVideo);
        }
	
	if(this.data.after_correct_audio){
		// add audio button
		this.afterCorrectAudio = this.addAudio(this.data.after_correct_audio, this.modal);
                
	}
	
	// add in audio of walking
	
	// add in animation of smoke over each of the images
	this.afterCorrectAnimContainer = document.createElement('div');
	this.afterCorrectAnimContainer.classList.add('yp-after-correct-anim-container', 'yp-u-hide');
	this.modal.appendChild(this.afterCorrectAnimContainer);
	
	// add smoke animations
	this.imgs.forEach(function(img){
		var anim = document.createElement('div');
		var imgBounds = window.getComputedStyle(img);
		// apply class and add t odom for get bounds
		anim.classList.add('yp-after-correct-anim');
		this.afterCorrectAnimContainer.appendChild( anim );
		
		var animBounds = window.getComputedStyle(anim);

		anim.style.left = (parseInt(imgBounds.left) + (parseInt(imgBounds.width)/2)) - (parseInt(animBounds.width)/2) + 'px';
		anim.style.top = (parseInt(imgBounds.top) + (parseInt(imgBounds.height)/2)) - (parseInt(animBounds.height)/2) + 'px';
	}, this);
	
};
ListenAndFindRandom.prototype.randomise = function(){
	// loop the options and switch their x/y coords
	log('randomise now.');
	var imgsCopy = this.imgs.slice();
	this.shuffle(imgsCopy);
	imgsCopy.forEach(function(img, i){
		var item = this.data.items[i];
		img.style.left = item.x;
		img.style.top = item.y;
	}, this);
        
        if (!this.data.after_correct_video)
        {
            if (this.afterCorrectAnimContainer)
            {
                this.hide(this.afterCorrectAnimContainer);
                this.afterCorrectAnimContainer.classList.remove('yp-animate-children');
            }
        }
        
};
//
ListenAndFindRandom.prototype.afterCorrect = function() {
	var self = this;
	log('After correct.');
	// remove the anim 
	this.removeCorrectIncorrectAnims();
	// now show the walking in and flaming
    function showStars(){
            
                self.removeMediaEnded(self.afterCorrectAnimContainer, showStars);
                log("in showStars");
                self.show(self.afterCorrectAnimContainer);
                self.afterCorrectAnimContainer.classList.add('yp-animate-children');

            }
        // if the flaming dragon exists...
        if (this.data.after_correct_video)
        {
            this.show(this.afterCorrectVideo);
        }
        
        if (self.afterCorrectAudio)
        {
            self.afterCorrectAudio.play();
        }
        
        if (!this.data.after_correct_video)
        {
  
            this.addMediaEnded(this.afterCorrectAudio, showStars);
            
        }

       // var correctAudio = self.afterCorrectAudio;
    
	var videoDelay = 0;
	var animDelay = 3200; // could be on half video time?
	// fix bug with little bit of time between removing hidden and playing video
	window.setTimeout(function(){
                
                if (self.data.after_correct_video)
                {
                    log('play afterCorrectVideo');
                    
                    self.afterCorrectVideo.play();
                }
                else
                {
                    log('not playing afterCorrectVideo as dosn\'t exist');
                    
                }

		// add smoke
		window.setTimeout(function(){
			self.show(self.afterCorrectAnimContainer);
			self.afterCorrectAnimContainer.classList.add('yp-animate-children');
                        
                        if (!self.data.after_correct_video)
                        {
                            complete();
                        }
			self.randomise();

		}, animDelay);
		
	}, videoDelay);
	function complete(){
            
            log("in complete");
                if (self.data.after_correct_video)
                {
                    self.removeMediaEnded(self.afterCorrectVideo, complete);
                    // reset video and audio
                    self.afterCorrectVideo.currentTime = 0;
                }
		self.afterCorrectAudio.pause();
		self.afterCorrectAudio.currentTime = 0;
                if (self.data.after_correct_video)
                {
                    self.hide(self.afterCorrectVideo);

                    // reset animations of smoke
                    self.hide(self.afterCorrectAnimContainer);
                    self.afterCorrectAnimContainer.classList.remove('yp-animate-children');
                }
		//
		self.removeFeedback();
		// trigger nextQuestion
		self.nextQuestion();
	}
	
	// on complete of that show the smoke anim and during that, randomise the question layouts
        if (this.data.after_correct_video)
        {
            this.addMediaEnded(this.afterCorrectVideo, complete);
        }
};
