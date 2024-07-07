import express, { Express, Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { registerValidator, loginValidator } from './validations/auth.js'
import checkAuth from './utils/checkAuth.js';
import * as UserController from './controllers/UserController.js'
import * as PostController from './controllers/PostController.js'


import morgan from 'morgan';
dotenv.config()


mongoose.connect(
    'mongodb+srv://admin:root@cluster0.7ryog7a.mongodb.net/practice',
).then(() => {
    console.log('⚡️[Database] DB connected');
}).catch((err) => console.log('db err:', err))

const app: Express = express();
app.use(cors());
app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);
const port = process.env.PORT;


app.get('/profile', checkAuth, UserController.getProfile)
app.post('/login', loginValidator, UserController.login)
app.post('/reg', registerValidator, UserController.register)
app.delete('/profile', checkAuth, UserController.deleteProfile)

app.get('/post', checkAuth, PostController.getPost)
app.post('/post', checkAuth, PostController.create)
app.patch('/post', checkAuth, PostController.edit)
app.delete('/post', checkAuth, PostController.delete)



server.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
  
  