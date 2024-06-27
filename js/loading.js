var c = document.getElementById("hourglasscanvas");
var ctx = c.getContext("2d");

i = 0;

async function desenharHourglass(rot){
    ctx.beginPath();
    ctx.moveTo(25, 25);
    ctx.quadraticCurveTo(10, 25, 10, 5);
    ctx.lineTo(40, 5);
    ctx.quadraticCurveTo(40, 25, 25, 25);
    ctx.quadraticCurveTo(10, 25, 10, 45);
    ctx.lineTo(40, 45);
    ctx.quadraticCurveTo(40, 25, 25, 25);
    ctx.translate(25, 25);
    ctx.rotate(rot);
    ctx.translate(-25, -25);
    ctx.stroke();
    
}


async function renderLoop() {

    d = new Date();
    let time = d.getSeconds();
    rot =time * Math.PI / 5000;
    ctx.clearRect(0, 0, c.width, c.height);

    desenharHourglass(rot);

    requestAnimationFrame(renderLoop);

}

requestAnimationFrame(renderLoop);