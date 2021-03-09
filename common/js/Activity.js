/* jshint node: true */
/* globals View, log */
/*
*	Activity base class
*/
"use strict";
// constructor
// ANDY IN TEST BRANCH
function Activity( json ) {
	View.call(this, json);
	// audio
	this.audio = null;
	this.audioBtn = null;
	this.extraBtn = null;
	this.type = this.constructor.name.toLowerCase();
	//
	this.stage = document.getElementById('ActivityContainer');
	//
	this.stage.classList.add('yp-act__'+this.type);
	this.instance = this.stage;
	// all activities have modals that contain their content
	this.modal = null;
	return this;
}
// css
Activity.CSS_FORCE_TOP           = "yp-force-top"
Activity.CSS_BTN_FOOTER_CENTER_1 = 'yp-btn--footer-center-1';
Activity.CSS_BTN_FOOTER_CENTER_2 = 'yp-btn--footer-center-2';
Activity.CSS_BTN_FOOTER_CENTER_3 = 'yp-btn--footer-center-3';
Activity.CSS_BTN_FOOTER_BTM_LEFT = 'yp-btn--footer-btm-left';
Activity.CSS_BTN_FOOTER_BTM_RIGHT = 'yp-btn--footer-btm-right';
// inherit from base Activity class
Activity.prototype = Object.create(View.prototype);
// correct the constructor pointer because it points to Activity
Activity.prototype.constructor = Activity;
//
Activity.prototype.layout = function(){

	// if the activity json does not specifically say it DOESN'T have a modal, then set it up
	if(this.data.modal !== false){
    
        // modal - presumed all had modals, they dont... so would need to overide this?
	this.modal = document.createElement('div');
	this.modal.setAttribute('id', 'Modal');
	this.modal.classList.add('yp-modal');
	// if it has a background image, add it
	if(this.data.modal_background_image){

		// !fix for andy's random bg issue
		var modalBg = document.createElement('div');
		modalBg.classList.add(View.CSS_POS_ABS);
		modalBg.style.zIndex = '-1';
		modalBg.style.width = modalBg.style.height = '100%';
		modalBg.style.backgroundImage = 'url("'+this.data.modal_background_image+'")';
		this.modal.appendChild(modalBg);

		// this.modal.style.backgroundImage = 'url("'+this.data.modal_background_image+'")';

	}

        // added to allow any number of additional images in the modal window.
        if (this.data.modal_items)
        {
            // loop around the possible images...
            this.data.modal_items.forEach(function(modalItem)
            {
                var el;
                var obj;
    		if(modalItem.hasOwnProperty('image'))
                {
                    el = document.createElement('img');
                }
		else if(modalItem.hasOwnProperty('text'))
                {
                    el = document.createElement('p');

                    var labelText = document.createTextNode(modalItem.text);
                    el.classList.add( 'yp-label' );
                    el.classList.add( 'yp-label-center' );
                    el.appendChild(labelText);
		}

                el.src = modalItem.image;
                el.style.position = 'absolute';

                el.style.left = modalItem.x;
                el.style.top = modalItem.y;

                if (modalItem.hasOwnProperty('percent'))
                {
                    if (this.validDimensionFilename(modalItem.image))
                    {
                        obj = this.getNewImageDimensions(modalItem.image,modalItem.percent);
                        el.style.width = obj.width;
                        el.style.height = obj.height;
                    }
                    else
                    {
                        // assume the width is set so just resize...
                        obj = this.getNewImageDimensionWidthAndHeight(modalItem.width,modalItem.height,modalItem.percent);
                        el.style.width = obj.width;
                        el.style.height = obj.height;
                    }
                }
                else
                {
                    el.style.width = modalItem.width;
                    el.style.height = modalItem.height;
                }

//                el.style.width = modalItem.width;
//                el.style.height = modalItem.height;
                this.modal.appendChild(el);
            }, this);
        }

	// off screen
	this.modal.classList.add('yp-anim-1000-eo', 'yp-pos-off-screen-left');

	this.stage.appendChild(this.modal);

        // adds default audio button to the activity modal
	if(this.data.audio){
		// add audio button
		this.audio = this.addAudio(this.data.audio, this.modal);
		this.audioBtn = this.createAudioButton(['yp-modal__btn--bottom-left']);
		this.modal.appendChild(this.audioBtn);
		log('has audio, add btn');
	}
    }
    
    // if the activity has a background specified, then add it from there, overwriting the oine inthe player. note - should also remove
    if( this.data.hasOwnProperty('background') ){
        this.addBackground( this.data.background, this.stage, 'yp-activity__background');
    }
    
    
    this.layoutNextPrev();

};
Activity.prototype.layoutNextPrev = function() {
	// check for extra
	if(this.data.hasNextActivity){

                if (this.data.showExtraNextBtn && this.data.showExtraNextBtn == true)
                {
                    this.extraBtn = this.createExtraNextButton(View.CSS_HIDE);

                }
                else
                {
                    this.extraBtn = this.createExtraButton(View.CSS_HIDE);
                }
		this.stage.appendChild(this.extraBtn);
	}
	// check for extra
	if(this.data.hasPrevActivity){
		this.closeBtn = this.createCloseButton(View.CSS_HIDE);
		this.stage.appendChild(this.closeBtn);
	}
};
//
Activity.prototype.bindEvents = function() {
	//log('Base bind events');
	var self = this;

	if(this.audioBtn){
		this.addListener(this.audioBtn, 'click', function(){ self.toggleMedia(self.audio, self.audioBtn); });
		this.addListener(this.audio, 'ended', function(){ self.resetMediaAtEnd(self.audio, self.audioBtn); });
	}

	this.bindNextPrev();

};
Activity.prototype.bindNextPrev = function() {
	var self = this;
	if(this.extraBtn){
		this.addListener(this.extraBtn, 'click', function(){
			self.instance.dispatchEvent(new Event('NEXT_ACTIVITY')); // dispatch next activity event
		});
	}
	if(this.closeBtn){
		this.addListener(this.closeBtn, 'click', function(){
			self.instance.dispatchEvent(new Event('PREV_ACTIVITY')); // dispatch next activity event
		});
	}
};
// when everything is ready and good to go
Activity.prototype.ready = function() {
	//log('Base ready');

	// if it has a modal that's off screen, bring it in
	if(this.modal){
            this.modal.classList.remove('yp-pos-off-screen-left');

            this.onTransitionComplete(this.modal, function(){
                            // do something when anim complete e.g. enable clicks?
            });	
	}

        // remove the hide class from extra button
        if (this.extraBtn)
        {
            this.extraBtn.classList.remove(View.CSS_HIDE);
        }

        if (this.closeBtn)
        {
            this.closeBtn.classList.remove(View.CSS_HIDE);
        }
};
// kick things off
Activity.prototype.init = function() {
	//log('Base init');
	// could shuffle here?
	this.layout();
	this.bindEvents();
};

// force content to the top of the player
Activity.prototype.forceTop = function(boo) {
	if(boo !== false){
		this.stage.classList.add( Activity.CSS_FORCE_TOP );
	}else{
		this.stage.classList.remove( Activity.CSS_FORCE_TOP );
	}
};
/**
 * This allows resizing of images by percentage
 * based on filename - has to be of name name_30x20.png
 * where 30x20 is the width and height respectively
 * Currently used in image highlight
 *
 * @param {type} str
 * @param {type} percent
 * @returns {.Object@call;create.getNewImageDimensions.resizedObj}
 */
Activity.prototype.getNewImageDimensions = function(str,percent)
{
    str = str.split("_").pop();

    // remove extension...
    str = str.replace(/\.[^/.]+$/, "");

    // now split by x...

    var obj  = str.split("x");

    var factor = percent/100;

    var resizedObj = {};

    resizedObj.width = parseInt(obj[0]*factor) + "px";
    resizedObj.height = parseInt(obj[1]*factor) + "px";

    return resizedObj;
};

Activity.prototype.validDimensionFilename = function(filename)
{

    // remove extension...
    var str = filename.replace(/\.[^/.]+$/, "");

    // get only filenamenot paths...
    str = str.replace(/^.*[\\\/]/, '');

    str = str.split("_").pop();

    var val = /(\d+\s*\d+\s*\/\d+|\d+\s*\/\d+|\d+)["']?(\s*[xX]\s*(\d+\s*\d+\s*\/\d+|\d+\s*\/\d+|\d+)["']?)+/.test(str);

    return val;


};

Activity.prototype.getNewImageDimensionWidthAndHeight = function(width,height,percent){

    var factor = percent/100;

    var resizedObj = {};

    // remove px..
    width = width.replace("px", '');
    height = height.replace("px", '');

    resizedObj.width = parseInt(width*factor) + "px";
    resizedObj.height = parseInt(height*factor) + "px";

    return resizedObj;

};
