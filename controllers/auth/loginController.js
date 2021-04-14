import Joi from 'Joi';
import {User} from '../../models';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import JwtService from '../../services/JwtService'
import bcrypt from 'bcrypt';

const loginController = {

    async login(req, res, next) {

        const loginSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        });

        const { error } = loginSchema.validate(req.body);
        if (error) {
            return next(error);
        }

        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email: email });

            if (!user) {
                return next(CustomErrorHandler.wrongCredentials());
            }

            // compare the password
            const match = await bcrypt.compare(password, user.password);

            if(!match){
                return next(CustomErrorHandler.wrongCredentials());
            }

            // return token 
            const access_token = JwtService.sign({_id : user._id, role : user.role });
            res.json({access_token});

        } catch (err) {
            return next(err);
        }
    }

}

export default loginController;