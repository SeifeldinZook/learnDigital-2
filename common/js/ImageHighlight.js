/* jshint node: true */
/* global Activity, log */
/**
*	ImageHighlight activity class
*/
"use strict";
// constructor
function ImageHighlight( json ) {
	Activity.call(this, json);
	
	this.imgs = [];
	this.currentItemIndex = 0; // abstract for both image highlight and lear and find?
	this.labels = [];
	
	return this;
}
// inherit from base Activity class
ImageHighlight.prototype = Object.create(Activity.prototype);
// correct the constructor pointer because it points to Activity
ImageHighlight.prototype.constructor = ImageHighlight;

// layout activity elements
ImageHighlight.prototype.layout = function() {
	
	Activity.prototype.layout.call(this);
	log('layout', this);
	// layout images 
	this.data.items.forEach(function(item,i){
		var img = document.createElement('img');
		img.src = item.image;
		// layout comes from json - !todo use class? or make function for abs. pos'd items?
		img.style.position = 'absolute';
                             
                // now has a percent param which is 50, 30 for example
                // takes original size and divides...
                // this only works if the filename has the dimensions in it...
                // i.e. board_671x448.png
		img.style.left = item.x;
		img.style.top = item.y;

                if (item.hasOwnProperty('percent'))
                {
                    var obj = null;
                    if (this.validDimensionFilename(item.image))
                    {
                        obj = this.getNewImageDimensions(item.image,item.percent);
                        img.style.width = obj.width;
                        img.style.height = obj.height;
                    }
                    else
                    {
                        // assume the width is set so just resize...
                        obj = this.getNewImageDimensionWidthAndHeight(item.width,item.height,item.percent);
                        img.style.width = obj.width;
                        img.style.height = obj.height;
                    }
                }
                else
                {
                    img.style.width = item.width;
                    img.style.height = item.height;
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
                        var itemLabel = "ItemLabel"+i;
                        label.setAttribute('id', itemLabel);
                        
			this.modal.appendChild(label);
                        this.labels.push(label);

                        img.setAttribute('data-label-id', itemLabel);
                        
		}
               
                
		this.addCssClasses(img, ['yp-anim-300-eo', 'yp-img-highlight-item']);
		this.modal.appendChild(img);
		this.imgs.push(img);
	}, this); // important to pass ref to this at end for context

	// shuffle?
	if(this.data.shuffle){
            this.randomise();
	}    
    
};
// bind any events - e.g. click events to UI added in layout()
ImageHighlight.prototype.bindEvents = function() {
	var self = this;
	Activity.prototype.bindEvents.call(this);
	log('bind events', this);

	// time updates
        var glowCssClassArr;
	if(this.data.hasOwnProperty('coloured_highlight') && !this.data.coloured_highlight)
        {
            glowCssClassArr =  ['yp-img-highlight-item-no-colour-active'];
        }
        else
        {
            glowCssClassArr =  ['yp-img-highlight-item-active'];
        }

    
    
//    var glowCssClassArr =  ['yp-img-highlight-item-active'];
	if(this.data.hasOwnProperty('glow_throb') && this.data.glow_throb){
		glowCssClassArr.push('yp-anim-throb');
	}
	// we need to do the core work here that handles playing and pausing the audio
	this.removeListener(this.audio, 'timeupdate', this.resetMediaAtEnd);
        
        var endTime = self.data.items[(self.imgs.length -1)].timings.end;
        
	function highlight(e){

    	if(self.currentItemIndex < self.imgs.length)
        {
            
            // retrieve the index of the current item we are looking for
            var timings = self.data.items[self.currentItemIndex].timings;	
                    
            var highlightTimings = 0;

            if (self.data.items[self.currentItemIndex].highlight){
                highlightTimings = self.data.items[self.currentItemIndex].highlight;	
            }
            // Andy added ability to add a timer to the glow timings.
            var startHighlightTime  = timings.start;
            var endHighlightTime    = timings.end;

            if (highlightTimings.start){
                startHighlightTime = highlightTimings.start;
            }

            if (highlightTimings.end){
                endHighlightTime = highlightTimings.end;
            }
            
            var audio = e.target;
            var elapsed = audio.currentTime;
            var img = self.imgs[ self.currentItemIndex ];
            
            // make sure it stopps 
            if (elapsed >= endTime)
            {
                self.pauseMedia(self.audio, self.audioBtn);
                self.audio.currentTime = 0;
                self.currentItemIndex = 0;
            }
            
            // if we've reached the current end timing
            if(elapsed >= startHighlightTime && !audio.paused){
//log('highlight on', self.currentItemIndex);
                // self.imgs[ self.currentItemIndex ].classList.add('yp-img-highlight');
                self.addCssClasses(img, glowCssClassArr);
            }
            if(elapsed >= endHighlightTime && !audio.paused){
//log('highlight off', self.currentItemIndex);
                // self.imgs[ self.currentItemIndex ].classList.remove('yp-img-highlight');
                self.removeCssClasses(img, glowCssClassArr);
            }

            if (elapsed >=  self.data.items[(self.imgs.length-1)].timings.end)
            {
                self.removeCssClasses(img, glowCssClassArr);
//                self.currentItemIndex = 0;

            }
            else
            {
                if (elapsed >= timings.end && !audio.paused)
                {
                    self.currentItemIndex++;
                }
            }
	}
        else
        {
            self.pauseMedia(self.audio, self.audioBtn);
            self.audio.currentTime = 0;
            self.currentItemIndex = 0;
	}
		
	}
	this.addListener(this.audio, 'timeupdate', highlight);
};

ImageHighlight.prototype.randomise = function(){
	// loop the options and switch their x/y coords
        
    var labelsCopy = [];
	var imgsCopy = this.imgs.slice();
    
    if (this.labels.length){
        labelsCopy = this.labels.slice();
    }
        
	this.shuffle(imgsCopy);
	imgsCopy.forEach(function(img, i){
        var item = this.data.items[i];
        img.style.left = item.x;
        img.style.top = item.y;

        if (labelsCopy.length)
        {
            var labelId = img.getAttribute('data-label-id');

            labelsCopy.forEach(function(label){

                if (label.id === labelId){          
                    label.style.left = this.data.items[i].label.x;
                    label.style.top = this.data.items[i].label.y;
                }
            },this);
        }                
                    
	}, this);
        

       
};
