var jsonData= {
    background:[ 
        {video: "common/assets/theme/video/background1.mp4"},
        {video: "common/assets/theme/video/background2.mp4"},
        {video: "common/assets/theme/video/background3.mp4"},
        {video: "common/assets/theme/video/background4.mp4"}
    ],
    activities:[ {
        rubric: {
            num: 1, 
            text: "Listen and point"
        }
        ,
        type:"ImageHighlight",
        shuffle:false,
        audio:"media/common/audio/KG1_1.38.mp3",
        glow_throb:!0,
        items:[ {
            image:"media/common/imgs/KG_U04_PB33_1_1.png",
            x:"120px",
            y:"140px",
            width:"408px",
            height: "550px",
            percent: 65,
            timings: {
                start: 0.7, 
                end: 6.7
            }
        }
        ,
        {
            image:"media/common/imgs/KG_U04_PB33_1_2.png",
            x:"480px",
            y:"140px",
            width:"408px",
            height: "550px",
            percent: 65,
            timings: {
                start: 9.5, 
                end: 16.3
            }
        }
        ,
        {
            image:"media/common/imgs/KG_U04_PB33_1_3.png",
            x:"820px",
            y:"140px",
            width:"408px",
            height: "550px",
            percent: 65,
            timings: {
                start: 18.5, 
                end: 26.4
            }
        }
        ]
    }
    ,
    {
        rubric: {
            num: 1, text: "Listen and touch"
        }
        ,
        type:"ListenAndFindRandom",
        shuffle:!1,
        audio:"media/common/audio/KG1_1.38.mp3",
        correct_audio:"common/assets/theme/audio/correct.mp3",
        incorrect_audio:"common/assets/theme/audio/buzz_oh_no_sorry.mp3",
        after_correct_audio:"common/assets/theme/audio/silence.mp3",
        items:[ {
            image:"media/common/imgs/KG_U04_PB33_1_1.png",
            x:"120px",
            y:"140px",
            width:"408px",
            height: "550px",
            percent: 65,
            timings: {
                start: 1.1, 
                end: 6.5
            }
        }
        ,
        {
            image:"media/common/imgs/KG_U04_PB33_1_2.png",
            x:"480px",
            y:"140px",
            width:"408px",
            height: "550px",
            percent: 65,
            timings: {
                start: 9.9, 
                end: 15.2
            }
        }
        ,
        {
            image:"media/common/imgs/KG_U04_PB33_1_3.png",
            x:"820px",
            y:"140px",
            width:"408px",
            height: "550px",
            percent: 65,
            timings: {
                start: 19, 
                end: 25.1
            }
        }
        ]
    }
    ]
};