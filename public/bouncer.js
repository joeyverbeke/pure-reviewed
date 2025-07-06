//wonks is a squanks

document.addEventListener('DOMContentLoaded', () => {
    const bouncingImages = ['/1.png', '/2.png', '/3.png', '/4.png', '/5.png', '/6.png', '/7.png', '/8.png', '/9.png']; // Your images
    let currentImageIndex = 0;

    const bounceImg = document.createElement('img');
    bounceImg.src = bouncingImages[currentImageIndex];
    bounceImg.style.position = 'absolute';
    bounceImg.style.width = '100px';
    bounceImg.style.height = '100px';
    bounceImg.style.left = '100px';
    bounceImg.style.top = '100px';
    bounceImg.style.zIndex = '999';
    bounceImg.style.pointerEvents = 'none';
    document.body.appendChild(bounceImg);

    // Position and direction
    let x = 100, y = 100;
    let dx = 1, dy = 1;

    // Speed in pixels per second
    const speed = 200;

    let lastTime = null;
    let justBounced = false; // Prevent multiple bounces in rapid succession

    function changeImage() {
        currentImageIndex = (currentImageIndex + 1) % bouncingImages.length;
        bounceImg.src = bouncingImages[currentImageIndex];
    }

    function animateBounce(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const deltaTime = (timestamp - lastTime) / 1000; // convert ms to seconds
        lastTime = timestamp;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const imgWidth = bounceImg.offsetWidth;
        const imgHeight = bounceImg.offsetHeight;

        // Move based on direction and speed
        const newX = x + dx * speed * deltaTime;
        const newY = y + dy * speed * deltaTime;

        // Check for bounces and handle them
        let bounced = false;

        // Check horizontal bounds
        if (newX <= 0) {
            x = 0;
            dx = Math.abs(dx); // Ensure positive direction
            bounced = true;
        } else if (newX + imgWidth >= screenWidth) {
            x = screenWidth - imgWidth;
            dx = -Math.abs(dx); // Ensure negative direction
            bounced = true;
        } else {
            x = newX;
        }

        // Check vertical bounds
        if (newY <= 0) {
            y = 0;
            dy = Math.abs(dy); // Ensure positive direction
            bounced = true;
        } else if (newY + imgHeight >= screenHeight) {
            y = screenHeight - imgHeight;
            dy = -Math.abs(dy); // Ensure negative direction
            bounced = true;
        } else {
            y = newY;
        }

        // Change image only once per bounce event
        if (bounced && !justBounced) {
            changeImage();
            justBounced = true;
        } else if (!bounced) {
            justBounced = false;
        }

        bounceImg.style.left = `${x}px`;
        bounceImg.style.top = `${y}px`;

        requestAnimationFrame(animateBounce);
    }

    // Start animation immediately, don't wait for image load
    requestAnimationFrame(animateBounce);
});
