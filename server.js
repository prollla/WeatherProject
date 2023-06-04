const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
app.set('view engine', 'ejs');
app.set('Content-Type', 'text/html');


mongoose.connect('mongodb+srv://prolllaweloveyou:123@cluster0.uc4bfs7.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

// Модель Horoscope
const Horoscope = mongoose.model('Horoscope', new mongoose.Schema({
    zodiacSign: String,
    yesterday: String,
    today: String,
    tomorrow: String,
    tomorrow02: String,
    date: {
        type: Date,
        default: Date.now
    }
}));
const InputData = mongoose.model('InputData', new mongoose.Schema({
    inputText: String,
    date: {
        type: Date,
        default: Date.now
    }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post('/saveInput', async (req, res) => {
    console.log(req.body)
    try {
        const inputText = req.body.inputText;

        const newInputData = new InputData({
            inputText: inputText
        });

        await newInputData.save();

        res.json({ success: true, message: 'Input data saved successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred.' });
    }
});
app.get('/', async (req, res) => {
    try {
        const zodiacSign = req.query.zodiac;
        const response = await axios.get('https://ignio.com/r/export/utf/xml/daily/com.xml');
        const parser = new xml2js.Parser({ explicitArray: false });
        parser.parseString(response.data, function (err, result) {
            if (!result['horo'][zodiacSign]) {
                res.render('index', { horoscope: null });
            } else {
                const horoscope = result['horo'][zodiacSign];
                res.render('index', { horoscope: horoscope });
            }
        });
    } catch (error) {
        console.log(error);
    }
});

app.get('/api/horoscope/:zodiacSign', async (req, res) => {
    try {
        const zodiacSign = req.params.zodiacSign;
        const response = await axios.get('https://ignio.com/r/export/utf/xml/daily/com.xml');
        const parser = new xml2js.Parser({ explicitArray: false });
        parser.parseString(response.data, function (err, result) {
            if (!result['horo'][zodiacSign]) {
                res.json({ error: 'Zodiac sign not found.' });
            } else {
                const horoscope = result['horo'][zodiacSign];
                res.json({ zodiacSign: zodiacSign, horoscope: horoscope });
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ error: 'An error occurred.' });
    }
});

app.get('/save', async (req, res) => {
    try {
        const zodiacSign = req.query.zodiac;
        const response = await axios.get('https://ignio.com/r/export/utf/xml/daily/com.xml');
        const parser = new xml2js.Parser({ explicitArray: false });
        parser.parseString(response.data, async function (err, result) {
            if (!result['horo'][zodiacSign]) {
                res.json({ error: 'Zodiac sign not found.' });
            } else {
                const horoscopeObject = result['horo'][zodiacSign];

                // Создать новый экземпляр модели Horoscope
                const newHoroscope = new Horoscope({
                    zodiacSign: zodiacSign,
                    yesterday: horoscopeObject.yesterday,
                    today: horoscopeObject.today,
                    tomorrow: horoscopeObject.tomorrow,
                    tomorrow02: horoscopeObject.tomorrow02,
                });

                // Сохранить гороскоп в базе данных
                await newHoroscope.save();

                res.json({ success: true, message: 'Horoscope saved successfully.' });
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ error: 'An error occurred.' });
    }
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/views'));
app.use('/scripts', express.static(__dirname + '/scripts'));
app.use('/images', express.static(__dirname + '/images'));


app.listen(3000, () => {
    console.log('App is listening on port 3000!');
});

