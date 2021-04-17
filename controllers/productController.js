import { Product } from '../models'
import multer from 'multer';
import path from 'path';
import CustomErrorHandler from '../services/CustomErrorHandler';
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
    },

    async fetchSingle(req, res, next) {

        try {
            const singleProduct = await Product.findOne({ _id: req.params.id }).select('-updatedAt -__v');
            if (!singleProduct) {
                return next(new Error("Product Not Found"))
            }
            res.json(singleProduct);
        } catch (error) {
            return next(CustomErrorHandler.serverError());
        }
    },

    async destroy(req, res, next) {

        try {
            const productDetails = await Product.findOneAndRemove({ _id: req.params.id });
            const imagePath = productDetails._doc.image;

            // delete image            
            if (!productDetails) {
                return next(new Error('Nothing to delete'));
            }

            fs.unlink(`${appRoot}/${imagePath}`, (err) => {
                if (err) {
                    return next(CustomErrorHandler.serverError(err.message))
                }
                res.json(productDetails)
            })


        } catch (error) {
            return next(error)
        }
    },

    async index(req, res, next) {
        try {
            let documents;
            documents = await Product.find().select('-updatedAt -__v').sort({ _id: -1 });
            res.json(documents);

        } catch (error) {
            return next(error)
        }

    }
}

export default productController