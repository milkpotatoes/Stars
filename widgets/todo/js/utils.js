const FORMATTER = {
    '\\[(.+?)\]\\((.+?)\\)': '<a href="$2" target="_blank">$1</a>',
    '\\*\\*\\*([^\*]+?)\\*\\*\\*': '<i>$1</i>',
    '\\*\\*([^\*]+?)\\*\\*': '<b>$1</b>',
    '~~([^~]+?)~~': '<del>$1</del>',
};

export function todoFormatter(content) {
    for (let reg in FORMATTER) {
        let testResult = new RegExp(reg).exec(content);
        let watchDog = 0;
        while (testResult) {
            const tag = FORMATTER[reg];
            const [,$1, $2] = testResult;
            const result = tag.replace(/\$1/, $1).replace(/\$2/, $2);
            content = content.replace(new RegExp(reg), result);
            testResult = new RegExp(reg).exec(content);
            watchDog++;
            if (watchDog > 1000) break;
        }
    }
    return content;
};

