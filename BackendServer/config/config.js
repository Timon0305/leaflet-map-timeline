require('dotenv').config();
module.exports = {
    dev: {
        url: process.env.Mongo_URL,
        influxhost: process.env.INFLUX_URL,
        influxDB: process.env.InfluxDB_NAME

    },
}