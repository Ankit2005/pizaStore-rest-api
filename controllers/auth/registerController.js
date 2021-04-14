import Joi from 'Joi'
import CustomErrorHandler from '../../services/CustomErrorHandler';
import { User } from '../../models';
import bcrypt from 'bcrypt';
import JwtService from '../../services/JwtService';

const registerController = {

    async register(req, res, next) {
        const { name, email, password } = req.body;
        // Validations CheckList

        // [] validate the request
        // [] authorizes the request
        // [] check if user is in the database already
        // [] prepare model
        // [] store in database
        // [] generate jwt token
        // [] send response

        // validation 
        const registerSchema = Joi.object({
            name: Joi.string().min(2).max(20).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
            repeat_password: Joi.ref("password")
        })
        console.log(req.body);
        const { error } = registerSchema.validate(req.body);

        if (error) {
            return next(error)
        }

        // Check User Is Already Exists
        try {
            const exist = await User.exists({ email: email });

            if (exist) {
                return next(CustomErrorHandler.alreadyExist("This Email Is Already Taken."))
            }

        } catch (err) {
            return next(err)
        }

        // hash user password using bcrypt
        const hashPassword = await bcrypt.hash(password, 10);

        // prepare the model

        const user = new User({
            name: name,
            email: email,
            password: hashPassword
        })

        let access_token;

        try {
            const result = await user.save();

            // jwt token generate
           access_token = JwtService.sign({_id : result._id, role : result.role });

        } catch (err) {
            return next(err)
        }

        res.json({ 'access_token': access_token });
    }
}

export default registerController