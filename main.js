async function prev(event) {
    if (event) event.preventDefault();

    const inName = document.getElementById("inName").value.trim();
    const font = "38px 'Moul'";

    // Wait for the font before measuring and drawing the name.
    // Moul must already be declared in your page's stylesheet.
    if (document.fonts) {
        try {
            await document.fonts.load(font, inName || "ក");
        } catch (error) {
            console.error("Could not load Moul:", error);
            alert("The font could not load. Please try again.");
            return;
        }
    }

    document.getElementById("name").textContent = inName;

    // Match your original artwork size.
    // Setting these also clears the canvas and resets its settings.
    canvas.width = 1280;
    canvas.height = 1280;

    // Draw the background.
    ctx.drawImage(logo, 0, 0, canvas.width, canvas.height);

    // Draw the optional logo.
    if (chkLogo.checked) {
        ctx.drawImage(brandLogo, 0, 0, canvas.width, canvas.height);
    }

    // Set the font BEFORE measuring.
    ctx.font = font;
    ctx.direction = "ltr";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    // Center the text manually in canvas coordinates.
    const textWidth = ctx.measureText(inName).width;
    const textX = (canvas.width - textWidth) / 2;
    const textY = 680;

    // White outline.
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 7;
    ctx.lineJoin = "round";
    ctx.strokeText(inName, textX, textY);

    // Orange text.
    ctx.fillStyle = "#ff6000";
    ctx.fillText(inName, textX, textY);

    document.getElementById("form").style.display = "none";
    document.getElementById("show").style.display = "block";
}
