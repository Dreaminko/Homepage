function loadExifData() {
    const backgroundImage = document.querySelector('.left');
    const exifContainer = document.querySelector('.exif p');

    // 获取背景图片URL
    const bgImageUrl = '../assets/images/Background/001.jpg';

    // 创建图片对象
    const img = new Image();
    img.src = bgImageUrl;

    img.onload = function() {
        EXIF.getData(img, function() {
            // 获取EXIF数据
            const camera = EXIF.getTag(this, "Make") || "未知";
            const model = EXIF.getTag(this, "Model") || "未知";
            const dateTime = EXIF.getTag(this, "DateTime") || "未知";
            const focalLength = EXIF.getTag(this, "FocalLength") || "未知";
            const aperture = EXIF.getTag(this, "FNumber") || "未知";
            const iso = EXIF.getTag(this, "ISOSpeedRatings") || "未知";
            const shutterSpeed = EXIF.getTag(this, "ExposureTime") || "未知";

            // 格式化并显示EXIF信息
            let exifInfo = '';
            if (camera !== "未知" && model !== "未知") {
                exifInfo += `${camera} ${model}<br>`;
            }
            if (dateTime !== "未知") {
                exifInfo += `${dateTime}<br>`;
            }
            if (focalLength !== "未知") {
                exifInfo += `${focalLength}mm<br>`;
            }
            if (aperture !== "未知") {
                exifInfo += `f/${aperture}<br>`;
            }
            if (iso !== "未知") {
                exifInfo += `ISO ${iso}<br>`;
            }
            if (shutterSpeed !== "未知") {
                exifInfo += `${shutterSpeed}s`;
            }

            if (exifInfo === '') {
                exifInfo = '暂无EXIF信息';
            }

            exifContainer.innerHTML = exifInfo;
        });
    };

    img.onerror = function() {
        exifContainer.innerHTML = '无法读取图片信息';
    };
}

document.addEventListener('DOMContentLoaded', loadExifData);