function loadExifData() {
    const backgroundImage = document.querySelector('.left');
    const exifContainer = document.querySelector('.exif p');

    const bgImageUrl = window.currentBackgroundImage;

    const img = new Image();
    img.src = bgImageUrl;

    img.onload = function() {
        EXIF.getData(img, function() {
            // 获取EXIF数据
            const camera = EXIF.getTag(this, "Make") || "Unknown";
            const model = EXIF.getTag(this, "Model") || "Unknown";
            const dateTime = EXIF.getTag(this, "DateTime") || "Unknown";
            const focalLength = EXIF.getTag(this, "FocalLength") || "Unknown";
            const aperture = EXIF.getTag(this, "FNumber") || "Unknown";
            const iso = EXIF.getTag(this, "ISOSpeedRatings") || "Unknown";
            const shutterSpeed = EXIF.getTag(this, "ExposureTime") || "Unknown";

            // 格式化并显示EXIF信息
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
    };

    img.onerror = function() {
        exifContainer.innerHTML = 'Cant load Exif';
    };
}

document.addEventListener('DOMContentLoaded', loadExifData);