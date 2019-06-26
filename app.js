require('dotenv').config();
const express = require('express');
const rp = require('request-promise-native');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 8991;

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.get('/counts', async (req, res) => {
    if (!req.query.words || !req.query.search) return res.json([]);

    const words = typeof req.query.words === 'string' ? [req.query.words] : req.query.words;
    const urls = (await google(req.query.search)).map(result => result.url);
    const uniqueUrls = Array.from(new Set(urls));

    const websites = await getWebsites(uniqueUrls);
    const counts = getCounts(words, websites);

    res.json(counts);
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});

function getCounts(words, websites) {
    if (!words || !websites) return [];

    return words.map(word => {
        const regExp = new RegExp(`${word.toLowerCase()}`, 'gi');
        let matchCount = 0;

        websites.forEach(website => {
            const matches = website.match(regExp);
            if (!matches) return;
            matchCount += matches.length;
        });

        return {
            word,
            count: matchCount
        };
    });
}

async function getWebsites(urls) {
    if (!urls) return [];
    try {
        const websites = await Promise.all(
            urls.map(async url => {
                try {
                    return await rp(url);
                } catch (err) {
                    console.error(`Failed to get website (${url})`);
                    return '';
                }
            })
        );
        return websites.map(website => website.toLowerCase());
    } catch (err) {
        console.error('Failed to get all websites');
        return [];
    }
}

async function google(search) {
    if (!search) return [];

    try {
        const html = await rp(`https://www.google.co.uk/search?q=${search.replace(/\s/gi, '+')}`);
        const $ = cheerio.load(html);

        const webResultsSelector = 'body > div > div > div';
        const linkSelector = 'div > a[href^="/url"]';
        const summarySelector = 'div > div > div > div > div';
        const webResults = $(webResultsSelector).has(linkSelector).has(summarySelector);

        const results = [];
        webResults.each((i, el) => {
            const linkTag = $(el).find(linkSelector);
            const href = linkTag.attr('href');
            const url = href.slice(7).split('&')[0];

            const title = linkTag.find('div:first-child').text();

            const summary = $(el).find(summarySelector).text();

            results.push({
                url,
                title,
                summary
            });
        });

        return results;

    } catch (err) {
        console.error(err.message);
    }
}