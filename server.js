import express from 'express'
import { APP_PORT, DB_URL } from './config'
import errorHandler from './middlewares/errorHandler';
const app = express();
import routes from './routes'
import mongoose from 'mongoose'
import path from 'path'

// Database connection
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('DB connected...');
});

// declare global variable
global.appRoot = path.resolve(__dirname);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Middleware
app.use(express.urlencoded({extended : false})) // help this middleware use multipart form data
app.use(express.json()); // help this middleware send json data to client
app.use('/api', routes);
app.use('/uploads', express.static('uploads'))
app.use(errorHandler);


app.listen(APP_PORT, () => {
    console.log(`Server Running In Port : ${APP_PORT}`);
})