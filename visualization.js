var audioContext, analyser, dataArray, bufferLength;

function visualize() {
    const audio = document.querySelector("#audio-box > audio");
    audioContext = new (window.AudioContext || window.webkitAudioContext);
    const source = audioContext.createMediaElementSource(audio);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 1024;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    draw();
}

function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    const canvas = document.getElementById("visualizer");
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    const canvasCtx = canvas.getContext("2d");
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    const totalBars = analyser.fftSize / 2;
    const barWidth = WIDTH / totalBars;
    let barHeight;
    let x = 1;
    for (let i = 0; i < totalBars; i++) {
        barHeight = (dataArray[i] / 300) * HEIGHT;
        canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
        canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth - 1, barHeight);
        x += barWidth + 0.5;
    }
}
