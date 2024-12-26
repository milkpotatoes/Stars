const FORMATTER = [
    {
        search: /(^|[^\\])\[(.+?)\]\((.+?)?\)/,
        replace: '<a href="$2" target="_blank">$1</a>',
    },
    {
        search: /(^|[^\\])\*{2}([^\*]+?)\*{2}/,
        replace: '<b>$1</b>',
    },
    {
        search: /(^|[^\\])\*([^\*]+?)\*/,
        replace: '<i>$1</i>',
    },
    {
        search: /(^|[^\\])~~([^~]+?)~~/,
        replace: '<del>$1</del>',
    },
    {
        search: /(^|[^\\])\{(\\w+?)\}/,
        replace: '<span class="material-icon">$1</span>',
    },
];

export function todoFormatter(content) {
    content = content.replace(/ {2,}/g, (str) => str.replace(/ /g, '&nbsp;'));
    for (let { search: reg, replace: repl } of FORMATTER) {
        console.log(reg, repl)
        let testResult = reg.exec(content);
        let watchDog = 0;
        while (testResult) {
            const [, $1, $2, $3] = testResult;
            const result = repl.replace(/\$1/, $2).replace(/\$2/, $3);
            content = content.replace(reg, $1 + result);
            testResult = reg.exec(content);
            console.log(testResult)
            watchDog++;
            if (watchDog > 1000) break; // 1000: max replace times.
        }
    }
    content = content.replace(/\\([*~\[\]\(\)\{\}\\])/g, '$1');
    return content;
};

