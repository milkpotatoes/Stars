const FORMATTER = {
    '(^|[^\\\\])\\[(.+?)\]\\((.+?)?\\)': '<a href="$2" target="_blank">$1</a>',
    '(^|[^\\\\])\\*\\*\\*([^\*]+?)\\*\\*\\*': '<i>$1</i>',
    '(^|[^\\\\])\\*\\*([^\*]+?)\\*\\*': '<b>$1</b>',
    '(^|[^\\\\])~~([^~]+?)~~': '<del>$1</del>',
    '(^|[^\\\\])\\{(\\w+?)\\}': '<span class="material-icon">$1</span>',
};

export function todoFormatter(content) {
    content = content.replace(/ {2,}/g, (str) => str.replace(/ /g, '&nbsp;'));
    for (let reg in FORMATTER) {
        let testResult = new RegExp(reg).exec(content);
        let watchDog = 0;
        while (testResult) {
            const tag = FORMATTER[reg];
            const [, $1, $2, $3] = testResult;
            const result = tag.replace(/\$1/, $2).replace(/\$2/, $3);
            content = content.replace(new RegExp(reg),$1 + result);
            testResult = new RegExp(reg).exec(content);
            watchDog++;
            if (watchDog > 1000) break;
        }
    }
    content = content.replace(/\\([*~\[\]\(\)\{\}\\])/g, '$1');
    return content;
};

