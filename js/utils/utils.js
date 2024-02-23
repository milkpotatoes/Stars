/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT Licence
 */

import { AlertDialog } from "./alertdialog.js";
const colorfulImg = require('colorfulImg')

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

const MAX_STORAGE_BLOCK_SIZE = 1000 ** 2;

export function readLargeStorage(key) {
    let final_value = localStorage.getItem(key);
    if (final_value) {
        if (final_value.length >= MAX_STORAGE_BLOCK_SIZE) {
            let data_parts = 1;
            let splited_data = null;
            do {
                splited_data = localStorage.getItem(`${key}_${data_parts}`);
                if (splited_data) {
                    final_value += splited_data
                }
                data_parts++;
            } while (splited_data.length >= MAX_STORAGE_BLOCK_SIZE);
        }
    }
    return final_value;
}

export function saveLargeStorage(key, value) {
    const strVal = String(value);
    let part = 0;
    let savedSize = 0;
    do {
        const curKey = key + (part > 0 ? '_' + part : '');
        console.log(curKey, strVal.substring(savedSize, savedSize + MAX_STORAGE_BLOCK_SIZE))
        localStorage.setItem(curKey, strVal.substring(savedSize, savedSize + MAX_STORAGE_BLOCK_SIZE));
        part++;
        savedSize += MAX_STORAGE_BLOCK_SIZE;
    } while (savedSize < strVal.length);
}