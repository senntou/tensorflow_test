/**
 * ビデオのカメラ設定(デバイスのカメラ映像をビデオに表示)
 */
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
        trackerType: poseDetection.TrackerType.BoundingBox
    };
    console.log('detector initializing');
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    console.log('detectoor initizlized');
    return detector;
}

// canvas上にkeypointsを元に点を描画する
// canvasはvideoと重ねて表示される
function draw(keypoints){
    // Canvas要素を取得
    const canvas = document.getElementById('canvas');
    const video = document.getElementById('video');
    const context = canvas.getContext('2d');

    // Canvasのサイズをvideoと合わせる
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    

    // 点を描画
    context.fillStyle = 'rgba(255, 255, 0, 1)';
    for(obj of keypoints){
        if(obj.score > 0.3)
            context.fillRect(obj.x,obj.y,10,10);
    };
}

async function main(){
    initVideoCamera();
    const detector = await initDetector();
    const video = document.getElementById('video');

    begin_loop(detector,video);
}

async function begin_loop(detector,video){
    let fps = 0;
    let frameCount = 0;
    let startTime;
    let endTime;

    startTime = new Date().getTime();

    async function loop(){
        frameCount += 1;
        endTime = new Date().getTime();

        if(endTime - startTime >= 1000){
            startTime = endTime;
            fps = frameCount;
            frameCount = 0;
            const fps_element = document.getElementById("fps");
            fps_element.innerText = "FPS : " + fps;
        }

        const poses = await detector.estimatePoses(video);
        if(poses.length == 1) draw(poses[0].keypoints);
                
        requestAnimationFrame( () => loop(detector,video) );
    }
    loop();
}

main();


