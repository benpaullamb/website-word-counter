require('dotenv').config();
const express = require('express');
const rp = require('request-promise-native');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 8991;

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.get('/counts', async (req, res) => {
    const words = typeof req.query.words === 'string' ? [req.query.words] : req.query.words;
    console.log(req.query);
    const urls = (await google(req.query.search)).map(result => result.url);

    const websites = await getWebsites(urls);
    const counts = getCounts(words, websites);

    res.json(counts);
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});

function getCounts(words, websites) {
    if (!words || !websites) return {};

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
            urls.map(url => rp(url))
        );
        return websites.map(website => website.toLowerCase());
    } catch (err) {
        console.error(err.message);
    }
}

async function google(search) {
    if (!search) return [];

    try {
        const html = await rp(`https://www.google.co.uk/search?q=${search.replace(/\s/gi, '+')}`);
        const $ = cheerio.load(html);

        const webResults = $('body > div > div > div').has('div > a[href^="/url"]').has('div > div > div > div > div');

        const results = [];
        webResults.each((i, el) => {
            const linkTag = $(el).find('div:first-child > a');
            const href = linkTag.attr('href');
            const url = href.slice(7).split('&')[0];

            const title = linkTag.find('div:first-child').text();

            const summary = $(el).find('div > div > div > div > div').text();

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