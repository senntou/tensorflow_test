
const REVERSE = true;

// ビデオのカメラ設定(デバイスのカメラ映像をビデオに表示)
function initVideoCamera() {
    const video = document.getElementById('video');
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
        })
        .catch(e => console.log(e));
}
async function initDetector(){
    const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        minPoseScore: 0.3,
        trackerType: poseDetection.TrackerType.BoundingBox
    };
    console.log('detector initializing');
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    console.log('detectoor initizlized');
    return detector;
}

// canvas上にkeypointsを元に点を描画する
// canvasはvideoと重ねて表示される
function draw_keypoints(keypoints){
    // Canvas要素を取得
    const canvas    = document.getElementById('canvas');
    const video     = document.getElementById('video');
    const context   = canvas.getContext('2d');

    // Canvasのサイズをvideoと合わせる
    canvas.width  = video.clientWidth;
    canvas.height = video.clientHeight;
    
    // 点を描画
    context.fillStyle = 'rgba(255, 255, 0, 1)';
    for(pnt of keypoints){
        let x = pnt.x;
        let y = pnt.y;
        if(REVERSE){
            x = canvas.width - x;
        }
        if(pnt.score > 0.3)
            context.fillRect(x,y,10,10);
    };
}

const areas = {
    size : 2,
    points:[ [0,0,10,6] , [20,0,10,6] ],
    colors:['rgba(100, 100, 100, 0.3)' , 'rgba(255, 100, 0, 0.3)'] ,
    width:30,
    height:20,
    draw_grid : function() {
        // Canvas要素を取得
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');        
        
        for(let i = 0;i < this.width;i++){
            let x = i * canvas.width / this.width;

            // パスの開始
            context.beginPath();
            // 線の開始位置
            context.moveTo(x, 0);
            // 開始以降の線の位置
            context.lineTo(x, canvas.height);
            // パスを閉じる
            context.closePath();
            context.stroke();
        }
        for(let i = 0;i < this.height;i++){
            let y = i * canvas.height/ this.height;

            // パスの開始
            context.beginPath();
            // 線の開始位置
            context.moveTo(0,y);
            // 開始以降の線の位置
            context.lineTo(canvas.width , y);
            // パスを閉じる
            context.closePath();
            context.stroke();
        }
    },
    draw : function (keypoints){
        // Canvas要素を取得
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');

        // 点を描画
        for(let i = 0;i < this.size;i++){
            context.fillStyle = this.colors[0];
            let x   = this.points[i][0] * canvas.width / this.width;
            let y   = this.points[i][1] * canvas.height/ this.height;
            let l1  = this.points[i][2] * canvas.width / this.width;
            let l2  = this.points[i][3] * canvas.height / this.height;  
            
            for(pnt of keypoints){
                if( x <= pnt.x && pnt.x <= x + l1 && y <= pnt.y && pnt.y <= y + l2){
                    context.fillStyle = this.colors[1];
                    console.log(pnt.name);
                    break;
                } 
            }

            x = canvas.width - x - l1;

            context.fillRect(x,y,l1,l2);
        }
    }
}

function clearCanvas(){
    // Canvas要素を取得
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    context.clearRect(0,0,canvas.width,canvas.height);
}

async function main_loop(detector,video){
    let fps = 0;
    let frameCount = 0;
    let startTime;
    let endTime;

    startTime = new Date().getTime();

    async function loop(){
        frameCount += 1;
        endTime = new Date().getTime();

        clearCanvas();

        if(endTime - startTime >= 1000){
            startTime = endTime;
            fps = frameCount;
            frameCount = 0;
            const fps_element = document.getElementById("fps");
            fps_element.innerText = "FPS : " + fps;
        }

        const poses = await detector.estimatePoses(video);
        if(poses.length == 1) {
            draw_keypoints(poses[0].keypoints);
            areas.draw(poses[0].keypoints);
        }
        // areas.draw_grid();
                
        requestAnimationFrame( () => loop(detector,video) );
    }
    loop();
}
async function main(){
    initVideoCamera();
    const detector = await initDetector();
    const video = document.getElementById('video');

    main_loop(detector,video);
}

main();


