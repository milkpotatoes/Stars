/*!
 * Stars
 * A simple index page
 * https://gitee.com/milkpotatoes/stars
 * Copyright (c) 2024 milkpotatoes
 * MIT Licence
 */

const LARGE_STORAGE_DB_KEY = 'largeStorage';
const LARGE_STORAGE_TB_KEY = 'data';
const LARGE_STORAGE_DATA_KEY = 'key';
const LARGE_STORAGE_DB_VERSION = 1;
let db = null;

function initDB() {
    return new Promise((resolve, reject) => {

        if (db === null) {
            const request = indexedDB.open(LARGE_STORAGE_DB_KEY, LARGE_STORAGE_DB_VERSION);

            request.onsuccess = (res) => {
                db = res.target.result;
                resolve(db.transaction([LARGE_STORAGE_TB_KEY], 'readwrite').objectStore(LARGE_STORAGE_TB_KEY));
            }
            request.onupgradeneeded = (res) => {
                db = res.target.result;
                db.createObjectStore(LARGE_STORAGE_TB_KEY, { keyPath: LARGE_STORAGE_DATA_KEY });
            }
        } else {
            resolve(db.transaction([LARGE_STORAGE_TB_KEY], 'readwrite').objectStore(LARGE_STORAGE_TB_KEY));
        }
    })
}

export default class LargeStorage {
    static async setData(key, value) {
        const store = await initDB();
        let req;
        try {
            req = store.put({ key: key, value: value });
        } catch {
            req = store.add({ key: key, value: value });
        }
        new Promise((reslove, reject) => {
            req.onsuccess = (event) => {
                reslove(event.target.result);
            };
            req.onerror = (event) => {
                reject(new Error(event));
            };
        })
            .then((result) => {
                Promise.resolve(result);
            })
            .catch((err) => {
                Promise.reject(err);
            });
    }

    static async getData(key) {
        return new Promise(async (reslove, reject) => {
            const store = await initDB();
            const req = store.get(key);
            req.onsuccess = (event) => {
                reslove(event.target.result?.value);
            };
            req.onerror = (event) => {
                reject(new Error(event));
            };
        });
    }
}