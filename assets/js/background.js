let backgroundLoaded = false;

function setRandomBackground() {
    if (backgroundLoaded) {
        return;
    }

    const backgroundImages = [
        '001.jpg',
        '002.jpg',
        '003.jpg',
        '004.jpg',
        '005.jpg',
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
            backgroundLoaded = true;

            loadExifData(this);
        };
        
        img.onerror = function() {
            console.error('Failed to load background image:', imagePath);
            backgroundLoaded = false;
        };
        
        img.src = imagePath;
    }
}

function loadExifData(imageObject) {
    const exifContainer = document.querySelector('.exif p');
    
    if (!exifContainer) return;

    if (!imageObject) {
        const bgImageUrl = window.currentBackgroundImage;
        if (!bgImageUrl) return;

        const img = new Image();
        img.src = bgImageUrl;
        
        img.onload = function() {
            loadExifData(this);
        };
        
        img.onerror = function() {
            exifContainer.innerHTML = 'Cant load Exif';
        };
        return;
    }

    if (typeof EXIF !== 'undefined') {
        EXIF.getData(imageObject, function() {
            const camera = EXIF.getTag(this, "Make") || "Unknown";
            const model = EXIF.getTag(this, "Model") || "Unknown";
            const dateTime = EXIF.getTag(this, "DateTime") || "Unknown";
            const focalLength = EXIF.getTag(this, "FocalLength") || "Unknown";
            const aperture = EXIF.getTag(this, "FNumber") || "Unknown";
            const iso = EXIF.getTag(this, "ISOSpeedRatings") || "Unknown";
            const shutterSpeed = EXIF.getTag(this, "ExposureTime") || "Unknown";

            let exifInfo = '';
            if (camera !== "Unknown" && model !== "Unknown") {
                exifInfo += `${camera} ${model}<br>`;
            }
            if (dateTime !== "Unknown") {
                exifInfo += `${dateTime}<br>`;
            }
            if (focalLength !== "Unknown") {
                exifInfo += `${focalLength}mm<br>`;
            }
            if (aperture !== "Unknown") {
                exifInfo += `f/${aperture}<br>`;
            }
            if (iso !== "Unknown") {
                exifInfo += `ISO ${iso}<br>`;
            }
            if (shutterSpeed !== "Unknown") {
                exifInfo += `${shutterSpeed}s`;
            }

            if (exifInfo === '') {
                exifInfo = 'No info';
            }

            exifContainer.innerHTML = exifInfo;
        });
    } else {
        exifContainer.innerHTML = 'EXIF library not loaded';
    }
}

document.addEventListener('DOMContentLoaded', setRandomBackground);