import virtual_buttons from "./virtual_buttons.js";

const REVERSE = true;

// ビデオのカメラ設定(デバイスのカメラ映像をビデオに表示)
function initVideoCamera() {
    const video = document.getElementById('video');    
    return new Promise( (resolve) => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
        })
        .catch(e => console.log(e))
        .then( () => resolve() );
    });
}
async function initDetector(){
    const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
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
    for(let pnt of keypoints){
        let x = pnt.x;
        let y = pnt.y;
        if(REVERSE){
            x = canvas.width - x;
        }
        if(pnt.score > 0.3)
        context.fillRect(x,y,10,10);
    };
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
        }
        virtual_buttons.draw(poses);
        // virtual_buttons.draw_grid();
                
        requestAnimationFrame( () => loop(detector,video) );
    }
    loop();
}
async function main(){
    await initVideoCamera();
    const detector = await initDetector();
    const video = document.getElementById('video');

    main_loop(detector,video);
}   

main();


