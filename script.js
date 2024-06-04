const video = document.getElementById('video');

Promise.all([   //load all the models
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.ageGenderNet.loadFromUri('/models')
]).then(startVideo)
.catch(error => console.error('Error loading models:', error));

function startVideo() {     //video streaming from browser
    navigator.mediaDevices.getUserMedia(
        { video: {} })
        .then(
            (stream) => {
            video.srcObject = stream;
        })
        .catch(
            (error) => {
                console.error('Error accessing the camera:', error);
        });
}

video.addEventListener('play', () => {      //when video starts playing do these actions
    const canvas = faceapi.createCanvasFromMedia(video);    //upon this the detections are to be drawn
    document.body.append(canvas)    //placing upon the original video footage which is currently streaming

    faceapi.matchDimensions(canvas, {height : video.height, width : video.width})

    setInterval(async () => {       //we want to run this mltiple times in a row
        const detections = await faceapi.detectAllFaces(video,
            new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()  //this is going to draw faces on screen
            .withFaceExpressions().withAgeAndGender();

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);   //clear the previous drawn detections

            const resizedDetections = faceapi.resizeResults(detections, {height : video.height, width : video.width})

            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

            resizedDetections.forEach((detection) => {
                const box = detection.detection.box;
                const drawBox = new faceapi.draw.DrawBox(box, {
                    label : Math.round(detection.age) + " years old " + detection.gender,
                });
                drawBox.draw(canvas);
            });
    }, 2000)
})