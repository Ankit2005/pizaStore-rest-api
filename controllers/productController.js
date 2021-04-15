import { Product } from '../models'
import multer from 'multer';
import path from 'path';
import CustomErrorHandler from '../services/CustomErrorHandler';
import Joi from 'Joi';
import fs from 'fs'
import productSchema from '../validators/productSchema'

// file upload function

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName)
    }
})

const handleMultiPartData = multer({
    storage, limits: { fileSize: 1000000 * 5 } // file size limit 5 Mb
}).single('image')


const productController = {

    async store(req, res, next) {

        handleMultiPartData(req, res, async (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError(err.message))
            }

            const filePath = req.file.path;

            const { error } = productSchema.validate(req.body);
            if (error) {

                // any field are empty then image is automatically deleted
                fs.unlink(`${appRoot}/${filePath}`, (err) => {
                    if (err) {
                        return next(CustomErrorHandler.serverError(err.message))
                    }
                })
                return next(error)
            }

            const { name, price, size } = req.body;

            const data = await Product.create({
                name, price, size, image: filePath
            });

            res.json({ "product": data });
        })
    },

    // Update Product 
    async update(req, res, next) {

        handleMultiPartData(req, res, async (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError(err.message))
            }

            let filePath;
            if (req.file) {
                filePath = req.file.path;
            }

            const { error } = productSchema.validate(req.body);
            if (error) {

                // any field are empty then image is automatically deleted
                if (req.file) {
                    fs.unlink(`${appRoot}/${filePath}`, (err) => {
                        if (err) {
                            return next(CustomErrorHandler.serverError(err.message))
                        }
                    })
                }
                return next(error)
            }

            const { name, price, size } = req.body;
            let document;
            try {
                // update product                
                document = await Product.findOneAndUpdate({ _id: req.params.id }, {
                    name,
                    price,
                    size,
                    ...(req.file && { image: filePath })
                }, { new: true });

            } catch (error) {
                return next(error)
            }

            res.json({ "product": document });
        })
    }
}

export default productController