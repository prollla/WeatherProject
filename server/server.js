const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const xml2js = require('xml2js');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const User = require('./models/user');
const PORT = process.env.PORT || 5000
const app = express();


const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Horoscope API',
            version: '1.0.0',
            description: 'API for getting horoscope',
        },
        servers: [
            {
                url: 'http://localhost:5000', // Ваш URL сервера
            },
        ],
    },
    apis: ['./server/server.js'], // путь к файлу, в котором описаны маршруты
};
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

mongoose.connect('mongodb+srv://prolllaweloveyou:123@cluster0.uc4bfs7.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Successfully connected to database'))
    .catch((error) => console.log(error));


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(express.json());
app.use(express.static('./public'));

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Регистрация
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name
 *               email:
 *                 type: string
 *                 description: The user's email
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: User registered successfully
 *       500:
 *         description: Error message
 */
app.post('/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    });

    user.save((err) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send('User registered successfully');
        }
    });
});
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Авторизация
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The access token for the user
 *       400:
 *         description: User not found
 *       401:
 *         description: Not Allowed
 *       500:
 *         description: Internal server error
 */
app.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (user == null) {
        return res.status(400).send('User not found');
    }

    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = jwt.sign(user.toJSON(), 'mySuperSecretKey2023');
            res.json({ accessToken: accessToken });
        } else {
            res.send('Not Allowed');
        }
    } catch {
        res.status(500).send();
    }
});

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
/**
 * @swagger
 * /saveInput:
 *   post:
 *     summary: Сохраняет введённый город
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inputText:
 *                 type: string
 *                 description: The input text to be saved
 *     responses:
 *       200:
 *         description: Input data saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the input data was saved successfully
 *                 message:
 *                   type: string
 *                   description: A success message
 *       500:
 *         description: An error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
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
/**
 * @swagger
 * /api/horoscope/{zodiacSign}:
 *   get:
 *     summary: Получить гороскоп по знаку зодиака
 *     parameters:
 *       - in: path
 *         name: zodiacSign
 *         schema:
 *           type: string
 *         required: true
 *         description: The zodiac sign
 *     responses:
 *       200:
 *         description: The horoscope for the specified zodiac sign
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 zodiacSign:
 *                   type: string
 *                   description: The zodiac sign
 *                 horoscope:
 *                   type: object
 *                   description: The horoscope for the zodiac sign
 *       404:
 *         description: Zodiac sign not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: An error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
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
/**
 * @swagger
 * /save:
 *   get:
 *     summary: Сохраняет гороскоп в БД
 *     parameters:
 *       - in: query
 *         name: zodiac
 *         schema:
 *           type: string
 *         required: true
 *         description: The zodiac sign
 *     responses:
 *       200:
 *         description: Horoscope saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the horoscope data was saved successfully
 *                 message:
 *                   type: string
 *                   description: A success message
 *       400:
 *         description: Zodiac sign not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: An error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
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
                const newHoroscope = new Horoscope({
                    zodiacSign: zodiacSign,
                    yesterday: horoscopeObject.yesterday,
                    today: horoscopeObject.today,
                    tomorrow: horoscopeObject.tomorrow,
                    tomorrow02: horoscopeObject.tomorrow02,
                });
                await newHoroscope.save();

                res.json({ success: true, message: 'Horoscope saved successfully.' });
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ error: 'An error occurred.' });
    }
});


app.listen(PORT, () => {
    console.log('App is listening on port' + ' ' + PORT);
});
