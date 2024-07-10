import express, { Express, Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';
import morgan from 'morgan';
import {handleValidationErrors, checkAdmin, checkAuth } from './utils/index.js';
import { UserController, PostController } from './controllers/index.js'
import { 
    registerValidator, 
    loginValidator, 
    editValidator,
    postCreateValidation, 
    postEditValidation 
} from './validations/index.js';



dotenv.config()


mongoose.connect(
    'mongodb+srv://admin:root@cluster0.7ryog7a.mongodb.net/practice',
).then(() => {
    console.log('🌌 [Database] DB connected');
}).catch((err) => console.log('db err:', err))

const app: Express = express();

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    },
})

const upload = multer({ storage });

app.use(cors());
app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));

const server = http.createServer(app);
const port = process.env.PORT;


app.post('/reg', registerValidator, handleValidationErrors, UserController.register)
app.post('/login', loginValidator, handleValidationErrors, UserController.login)
app.get('/profile', checkAuth, UserController.getProfile)
app.patch('/profile', editValidator, handleValidationErrors, checkAuth, UserController.editProfile)
app.delete('/profile', checkAuth, UserController.deleteProfile)

app.post('/upload', checkAuth, upload.single('image'), (req: Request, res: Response) => {
    if(req.file){
        return res.json({
            url: `/uploads/${req.file.originalname}`
        })
    }
    res.json({
        message: 'error'
    })
})

app.get('/posts', checkAuth, PostController.getAll)
app.get('/posts/:id', checkAuth, PostController.getOne)
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create)
app.patch('/posts/:id', checkAuth, postEditValidation, handleValidationErrors, PostController.edit)
app.delete('/posts/:id', checkAuth, PostController.deleteOne)
app.delete('/posts', checkAdmin, PostController.deleteAll)



server.listen(port, () => {
    console.log(`⚡️ [server]: Server is running at http://localhost:${port}`);
  });
