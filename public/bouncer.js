document.addEventListener('DOMContentLoaded', () => {
    const bouncingImages = ['/img1.png', '/img2.png']; // Your images
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
        x += dx * speed * deltaTime;
        y += dy * speed * deltaTime;

        // Bounce off edges
        if (x <= 0 || x + imgWidth >= screenWidth) {
            dx = -dx;
            x = Math.max(0, Math.min(screenWidth - imgWidth, x)); // clamp position
            changeImage();
        }

        if (y <= 0 || y + imgHeight >= screenHeight) {
            dy = -dy;
            y = Math.max(0, Math.min(screenHeight - imgHeight, y)); // clamp position
            changeImage();
        }

        bounceImg.style.left = `${x}px`;
        bounceImg.style.top = `${y}px`;

        requestAnimationFrame(animateBounce);
    }

    bounceImg.onload = () => {
        requestAnimationFrame(animateBounce);
    };
});
