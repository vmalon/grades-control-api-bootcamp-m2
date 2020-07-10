import express from "express";
import winston from "winston";
import gradesRouter from "./routes/grades.js";

const app = express();
app.use(express.json());
app.use('/grades', gradesRouter);

const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});


global.logger = winston.createLogger({
    level: "silly",
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: "grades-api.log" })
    ],
    formart: combine(
        label({ label: "grades-api" }),
        timestamp(),
        myFormat
    )
});


app.listen(3000, () => {
    console.log('Api started')
})


