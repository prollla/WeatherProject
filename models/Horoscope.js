const mongoose = require('mongoose');

const horoscopeSchema = new mongoose.Schema({
    zodiacSign: String,
    horoscope: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});



const Horoscope = mongoose.model('Horoscope', horoscopeSchema);


module.exports = Horoscope;
