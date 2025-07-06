function setRandomBackground() {
    const backgroundImages = [
        '001.jpg',
        '002.jpg',
        '003.jpg',
        '004.jpg',
    ];

    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    const selectedImage = backgroundImages[randomIndex];
    const imagePath = `./assets/images/Background/${selectedImage}`;

    const leftSection = document.querySelector('.left');
    if (leftSection) {
        const img = new Image();
        img.onload = function() {
            leftSection.style.backgroundImage = `url('${imagePath}')`;
            leftSection.style.backgroundSize = 'cover';
            leftSection.style.backgroundPosition = 'center';
            leftSection.style.backgroundRepeat = 'no-repeat';

            window.currentBackgroundImage = imagePath;

            if (typeof loadExifData === 'function') {
                loadExifData();
            }
        };
        img.src = imagePath;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setRandomBackground);
} else {
    setRandomBackground();
}