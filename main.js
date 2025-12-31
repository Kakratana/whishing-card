const canvas = document.getElementById("result");
const preview = document.getElementById("preview");
preview.addEventListener("click", prev);

// canvas.height = canvas.width / 1.616;
const ctx = canvas.getContext("2d");


const image = document.getElementById("imgDisplayed");
const logo = document.getElementById("logo");

// ADD THIS: Get the new logo and checkbox
const brandLogo = document.getElementById("brandLogo");
const chkLogo = document.getElementById("chkLogo");

function prev(){
    var x = document.getElementById("form");
    x.style.display = "none";

    var xz = document.getElementById("show");
    xz.style.display = "block";
    let inName = document.getElementById("inName").value;
    const name = document.getElementById("name");
    name.innerHTML = inName;

    // Draw the background
    ctx.drawImage(logo, 0, 0, 1280, 1280);

    // ADD THIS: Check if checkbox is checked and draw logo
    if (chkLogo.checked) {
        // Draw the logo. 
        // Arguments: image, x, y, width, height
        // Adjust these numbers to position the logo where you want it.
        // Example: Top Right corner (0, 0) with size 1280x1280
        ctx.drawImage(brandLogo, 0, 0, 1280, 1280); 
    }

    ctx.font = "34px 'Moul'"; 
    ctx.fillStyle = "#fff200";
    ctx.textAlign = "center";   
    ctx.fillText(name.innerHTML, 640, 670);
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

async function onShares() {

    const dataUrl = canvas.toDataURL();
    const blob = await (await fetch(dataUrl)).blob();
    const filesArray = [
        new File(
            [blob],
            'Card.png',
            {
                type: blob.type,
                lastModified: new Date().getTime()
            }
        )
    ];
    const shareData = {
        files: filesArray
    };
    navigator.share(shareData);
}


