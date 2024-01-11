import { AlertDialog } from "./alertdialog.js";
import { colorfulImg } from "./colorfulimg.js";

export function alertMessage(msg) {
    new AlertDialog()
        .setMessage(msg)
        .setPositiveButton('确定')
        .show()
}

export async function getPrimaryColor(image) {
    let img = new Image();
    return new Promise((reslove, _reject) => {
        img.onload = () => {
            reslove(colorfulImg(img));
        }
        img.src = image;
    });
}

export function setWallpaper(wallpaper) {
    document.querySelector('.wallpaper').style.backgroundImage = `url(${wallpaper})`;
    getPrimaryColor(wallpaper)
        .then(e => {
            document.documentElement.style.backgroundColor = `rgb(${e.r}, ${e.g}, ${e.b})`;
        });
};

export function showMessage(msg = '') {
    new AlertDialog()
        .setMessage(msg)
        .setPositiveButton('关闭')
        .show();
};
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            const base64String = reader.result;
            resolve(base64String);
        };

        reader.onerror = function () {
            reject(new Error("Failed to load file"));
        };
    });
};