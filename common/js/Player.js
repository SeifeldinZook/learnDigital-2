/* jshint node: true */
/* globals View, log */
/** 
*	Player class
*	this class can havea  theme applied (from theme.css)
*	and functions that are specific to the theme defined in theme.js
*/
"use strict";
// constructor
function Player( json ) {
	View.call(this, json);
	log('Player created.');
	
	this.stage = document.getElementById('Player');
	var stageOrigStyle = window.getComputedStyle(this.stage);
	
	// get css width/height?
	this.stageWidth = parseInt(stageOrigStyle.width);
	this.stageHeight = parseInt(stageOrigStyle.height);
	
	// header/footer
	this.header = null;
	this.footer = null;
	
	// video/image bg
	this.videoBg = null;
	
	// activities
	this.activity = null;
	this.activityIndex = 0; // could come in from json? Or url?
	this.activityContainer = null;
	this.data = json;
	this.activities = this.data.activities;
	this.currentActData = this.activities[this.activityIndex];
        
	this.isTablet = false;
    
    // do check for auto play
    this.do_check_video_autoplay_support = true;   
    this.do_scale = true;
    
	// capbaility object
	this.capabilities = {};
	
	return this;
}
// inherit from base View class
Player.prototype = Object.create(View.prototype);
// correct the constructor pointer because it points to Activity
Player.prototype.constructor = Player;
// scale the player to the browser window
Player.prototype.scale = function(){
	// update to cater for mobile not reporting correct width
/*
	var browserHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
	var browserWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
*/
	var browserHeight = document.documentElement.clientHeight;
	var browserWidth = document.documentElement.clientWidth;
	var scaleFactor1 = browserHeight / this.stageHeight;
	var scaleFactor2 = browserWidth / this.stageWidth;
	var scaleFactor = Math.min(scaleFactor1, scaleFactor2);
	var bounds;
	var scaleEl = document.body;
	
	log(browserWidth, browserHeight, 'Scale the player by '+ (scaleFactor*100) + '%');
	//
	scaleEl.style.transform = 'scale( '+scaleFactor+', '+scaleFactor+' )';
	bounds = scaleEl.getBoundingClientRect();
	scaleEl.style.left = (browserWidth/2) - (bounds.width/2) + 'px';
};
//
Player.prototype.addHeader = function(data){
	//create the header if it doesn not exist
	if(!this.header){
		this.header = document.createElement('header');
		this.header.classList.add('yp-player__header');
		this.header.setAttribute('id', 'PlayerHeader');
		if(data.theme){
			this.header.classList.add('yp-player__header--'+data.theme);
		}
		this.stage.appendChild(this.header);
	}else{
		this.header.innerHTML = '';
	}
	if(data.text){
		// create the header
		// <header id="PlayerHeader" class="yp-player__header"></header>
		// <h1 class="yp-player__header-title"><span class="yp-player__header-badge">22</span>Listen, repeat and choose.</h1>
                
                // search for <font> and replace
                var title = document.createElement('h1');
                var titleText = document.createTextNode(data.text);
                title.classList.add('yp-player__header-title');
                title.appendChild(titleText);
                
                var indexPair = this.getIndexPair("@@!", data.text);
                
                var foundIndexPair = false;
                
                if (indexPair.length > 0)
                {
                    var headerStr = data.text;
                    var replacementStr,textToReplace;
                   // found something to replace..
                   foundIndexPair = true;
                   do
                    {
                        indexPair = this.getIndexPair("@@!", headerStr);
                        if (indexPair.length == 0)
                        {
                            break;
                        }
                        replacementStr = this.getString(headerStr,indexPair[0],indexPair[1]);
                        textToReplace = headerStr.substring(indexPair[0], (indexPair[1]+3));
                        headerStr = headerStr.replace(textToReplace, replacementStr);                        
                    }
                    while (indexPair.length > 0 ) 

                    if(data.num || data.icon){
                        
                        this.header.innerHTML = '<h1 class="yp-player__header-title">' + '<span class="yp-player__header-badge">' + data.num + '</span>' + headerStr + "</h1>";
                    }
                    else
                    {
                        this.header.innerHTML = '<h1 class="yp-player__header-title">' + headerStr + "</h1>";
                    }
            
//                    this.header.innerHTML = '<h1 class="yp-player__header-title">' + headerStr + "</h1>";
                }
                else
                {
                    this.header.appendChild(title);
                }

                if (!foundIndexPair)
                {
                    if(data.num || data.icon){
                            var badge = document.createElement('span');
                            var badgeContents = null;

                            badge.classList.add('yp-player__header-badge');

                            if(data.num){
                                    badgeContents = document.createTextNode(data.num);
                            }else{
                                    badgeContents = document.createElement('img');
                                    badgeContents.setAttribute('src', data.icon);
                                    badgeContents.classList.add('yp-player__header-badge-icon');
                            } 

                            badge.appendChild(badgeContents);

                            title.insertBefore(badge, titleText);
                    }
            }
	}
};
Player.prototype.removeHeader = function(){
	if(this.header){
		this.stage.removeChild(this.header);
	}
};
Player.prototype.addFooter = function(){
	if(!this.footer){
		this.footer = document.createElement('footer');
		this.footer.classList.add('yp-player__footer');
		this.footer.setAttribute('id', 'PlayerFooter');
		this.stage.appendChild(this.footer);	
	}
};
Player.prototype.removeFooter = function(){
	if(this.footer){
		this.stage.removeChild(this.footer);
                this.footer = null;
	}
};
// load in an activity class
Player.prototype.loadActivity = function(){
	var self = this;
	var defaultLoadDelay = 400;
	// based on an index?
	var actType = this.currentActData.type;
	// checks for extra or close button for activity
//	var hasNext = (this.activityIndex === 0 && this.activities.length > 1);
        var activityCount = this.activities.length;
	var hasNext = (this.activityIndex < (activityCount -1) && activityCount > 1);
	var hasPrev = (this.activityIndex > 0);
	var startDelay = this.currentActData.hasOwnProperty('load_delay') ? this.currentActData.load_delay : defaultLoadDelay;
	// log('startDelay', startDelay);
	// setup listeners
	var actReady = function(){
		self.activity.ready();	
	};
	
	// destroy old activity here as activity not updated yet, also destroy player listeners
	if(this.activity){
		// log('Destroy previous activity.', this.activity);
		this.activityContainer.classList.remove('yp-act__' + this.activity.type );
		// destroy next activity listeners
		this.destroy();
		//destroy activity
		this.activity.destroy();
		// clear the activity container
		this.activityContainer.innerHTML = '';
		// remove the class for the activity
		
	}
	
	// add/remove header/rubric
	if(this.currentActData.rubric){
		this.addHeader(this.currentActData.rubric);
	}else{
		this.removeHeader();
	}
	
	// add/remove footer
	if(this.currentActData.footer !== false){
		this.addFooter();
	}else{
		this.removeFooter();
	}
        
        // swap the background if there is one...
//	if(this.currentActData.background)
//        {
//		this.swapBackground(this.currentActData.background);
//            
//        }
	
	// add booleans to activity data for whether to show extra or pclose buttons
	this.currentActData.hasNextActivity = hasNext;
	this.currentActData.hasPrevActivity = hasPrev;
	// create the actvity base on the class name in the JSON
	this.activity = new window[actType](this.currentActData, this);
	
	
	// if there are more than 1 activity setup, then add listeners to their functions
	if(hasNext){
		this.addListener(this.activity.instance, 'NEXT_ACTIVITY', function(){ self.nextActivity(); });
	}
	if(hasPrev){
		this.addListener(this.activity.instance, 'PREV_ACTIVITY', function(){ self.previousActivity(); });
	}
	// let the activity set itself up
	this.activity.init();
	
	// !autoplay-detect

        if (this.runningMode === this.environment.PRODUCTION)
        {

            // if it has a background video wait for it to complete
            if(this.videoBg){
                this.addMediaEnded(this.videoBg, actReady);
                this.videoBg.play();
                this.videoBg.setAttribute('autoplay', ''); // added for online use (when video is still loading)
            }else{
                // otherwise set a delay before showing (so user can see bg image)
                window.setTimeout(function(){
                        actReady();
                }, startDelay);
            }

        }
        else
        {
            actReady();
        }

};
// load in next activity
Player.prototype.nextActivity = function(){
	this.activityIndex++;
	this.currentActData = this.activities[this.activityIndex];
	this.loadActivity();
};
// load in previous activity
Player.prototype.previousActivity = function(){
	this.activityIndex--;
	this.currentActData = this.activities[this.activityIndex];
	this.loadActivity();
};

// layout the player areas that do not change when an activity changes
Player.prototype.layout = function(){
	// create activity container
	this.activityContainer = document.createElement('div');
	this.activityContainer.classList.add('yp-player__main');
	this.activityContainer.setAttribute('id', 'ActivityContainer');
	this.stage.appendChild(this.activityContainer);
	
	// background video or image
	if(this.data.background){
		var bg = null;
		var img = null;
                
        // if array longer than 1, pick it a random 
        if(this.data.background.length > 1){
        	this.shuffle(this.data.background);
        }
        bg = this.data.background[0];
        
        
    // !autoplay-detect
    	
            if(bg.video)
            {
                if (this.runningMode === this.environment.PRODUCTION)
                {

                    this.videoBg = this.addVideo(bg.video, this.stage); // make media pass an object with props?
                    this.videoBg.setAttribute('id', 'BackgroundVideo');
                    this.videoBg.setAttribute('autoplay', 'autoplay');
                    this.videoBg.setAttribute('muted', ''); // add for iOS 10+ to autoplay video
                    this.videoBg.muted = true; // muted has to be set like this to work

                    this.videoBg.classList.add('yp-player__background');
                    if(bg.image){
                        this.videoBg.setAttribute('poster',bg.image);
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
                }
                else
                {
                    var bgImage = "common/assets/theme/imgs/bg.jpg";
                    var bgImage = "";
                    img = document.createElement('img');
                    img.setAttribute('src', bgImage);
                    img.classList.add('yp-player__background');
                    this.stage.appendChild(img);
                }


            }
            else
            {
                // no video, so check for image
                if(bg.image){
                    img = document.createElement('img');
                    img.setAttribute('src', bg.image);
                    img.classList.add('yp-player__background');
                    this.stage.appendChild(img);
                }
            }
                
	}
	
};
// bind any player events here - e.g. click events to elements in layout()
Player.prototype.bindEvents = function(){
	//
};
// when player's ready load in the activity based on the index
Player.prototype.ready = function(){
	this.loadActivity();
};
// kick things off
Player.prototype.init = function(){
	
	var self = this;
	if( this.do_scale ){
		// ! scaling
		window.addEventListener('resize', function(){
			self.scale();
		}, false);
		
		// bug fix: store window and doc heights for comparison after load, as they differ but should not...
		var startWinH = window.innerHeight;
		var startDocH = document.documentElement.clientHeight;
		window.setTimeout(function(){
			if(startWinH !== startDocH){
				self.scale();
			}
		}, 50);
		this.scale();
	}
	
	// check auoplay
	if( this.do_check_video_autoplay_support ){
		// prepended to Player.js /src/js/isAutoplaySupported.js
		this.isAutoplaySupported(function(supported) {
			self.capabilities.autoplayMedia = supported;
			if (supported) {
				// HTML5 Video Autoplay Supported!
				log('HTML5 Video Autoplay Supported!');
			} else {
				// HTML5 Video Autoplay Not Supported :(
				log('HTML5 Video Autoplay Not Supported :(');
			}
		});
	}else{
		// remove any past settings
		if (sessionStorage.autoplaySupported) {
			sessionStorage.removeItem('autoplaySupported');
		}
	}

    // determine what we are running on...
    this.isTablet = this.runningOnMobileOrTablet();
        
	this.layout();
	this.bindEvents();
	this.ready();
};
// detect autoplay feature
// see: https://gist.github.com/nathansearles/271870d4100f0f045c5c
// isAutoplaySupported(callback);
// Test if HTML5 video autoplay is supported
Player.prototype.isAutoplaySupported = function(callback) {
  // Is the callback a function?
  if (typeof callback !== 'function') {
    log('isAutoplaySupported: Callback must be a function!');
    return false;
  }
  // Check if sessionStorage exist for autoplaySupported,
  // if so we don't need to check for support again
  if (!sessionStorage.autoplaySupported) {
    // Create video element to test autoplay
    var video = document.createElement('video');
    video.autoplay = true;
    video.src = 'data:video/mp4;base64,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';
    video.load();
    video.style.display = 'none';
    video.playing = false;
    video.play();
    // Check if video plays
    video.onplay = function() {
      this.playing = true;
    };
    // Video has loaded, check autoplay support
    video.oncanplay = function() {
      if (video.playing) {
        sessionStorage.autoplaySupported = 'true';
        callback(true);
      } else {
        sessionStorage.autoplaySupported = 'false';
        callback(false);
      }
    };
  } else {
    // We've already tested for support
    // use sessionStorage.autoplaySupported
    if (sessionStorage.autoplaySupported === 'true') {
      callback(true);
    } else {
      callback(false);
    }
  }
};

// defunct?

Player.prototype.runningOnMobileOrTablet = function() {
  var check = false;
	  (function(a){
		  if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))){
			   check = true;
	}
		  
	})(navigator.userAgent||navigator.vendor||window.opera);
   return check;
};

Player.prototype.getOS = function(){
	
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    var os = "unknown";

      // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        os = "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        os = "Android";
    }

    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        os = "iOS";
    }
    
    return os;
};

Player.prototype.swapBackground = function(data)
{
    var img = null;
                
    // assume 1
   
    var bgImage = data[0].image;
    img = document.createElement('img');
    img.setAttribute('src', bgImage);
    img.classList.add('yp-player__background');
    this.stage.appendChild(img);
    
};

Player.prototype.getIndexPair = function(searchStr, str, caseSensitive) 
{
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        if (indices.length == 2)
        {
            break;
        }
        startIndex = index + searchStrLen;
    }
    return indices;
};

Player.prototype.getString = function(str, start, end)
{
    var ret = str.slice(start, end);
    ret = ret.replace("@@!", "");
    ret = '&nbsp;<span class="font1">' + ret + "</span>&nbsp;";    
    return ret;
    
};
