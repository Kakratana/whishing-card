const canvas = document.getElementById("result");
const preview = document.getElementById("preview");
preview.addEventListener("click", prev);

// canvas.height = canvas.width / 1.616;
const ctx = canvas.getContext("2d");


const image = document.getElementById("imgDisplayed");
const logo = document.getElementById("logo");

function prev(){
	  ctx.font = "14px Moul";
      var x = document.getElementById("form");
      x.style.display = "none";

      var xz = document.getElementById("show");
      xz.style.display = "block";


      let inName = document.getElementById("inName").value;


      const name = document.getElementById("name");


      name.innerHTML = inName;

      
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 800, 900);
      ctx.fillStyle = "#1876f2";
      ctx.fillRect(0, 0, 800, 100);
      // ctx.fillStyle = "#f1f3f4";
      // ctx.fillRect(0, 750, 800, 50);
      ctx.fillStyle = "#1876f2";

    ctx.drawImage(logo, 0, 0, 1280, 1816); //last size: 1280x1280

    //ctx.font = '34pt Moul'; 
    //ctx.fillStyle = "#fe4f27";
    //ctx.textAlign = "center";   
    //ctx.fillText(name.innerHTML, 640, 670);

    function drawStroked(text, x, y) {
        ctx.textAlign = "center"; 
        ctx.font = '50px Moul';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 6;
        ctx.strokeText(text, x, y);
        ctx.fillStyle = "#067606";
        ctx.fillText(text, x, y);
    }

    drawStroked(name.innerHTML, 640, 925); //last value 640, 670



      


}

const download = document.getElementById("down");
download.addEventListener("click", function(){

  if(window.navigator.msSaveBlob) {

    window.navigator.msSaveBlob(canvas.msToBlob(), "Card.png");
  } else {

    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = canvas.toDataURL();
    a.download = "Card.png";
    a.click();
    document.body.removeChild(a);
  }
});


