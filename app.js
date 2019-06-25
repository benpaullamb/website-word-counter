require('dotenv').config();
const express = require('express');
const rp = require('request-promise-native');
const app = express();
const PORT = process.env.PORT || 8991;

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.get('/counts', async (req, res) => {
    const urls = typeof req.query.websites === 'string' ? [req.query.websites] : req.query.websites;
    const words = typeof req.query.words === 'string' ? [req.query.words] : req.query.words;

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