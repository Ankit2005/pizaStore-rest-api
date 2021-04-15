import Joi from 'Joi';
import { User, Refreshtokens } from '../../models';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import JwtService from '../../services/JwtService'
import bcrypt from 'bcrypt';
import { REFRESH_SECRET } from '../../config'

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

            if (!match) {
                return next(CustomErrorHandler.wrongCredentials());
            }

            // return token 
            const access_token = JwtService.sign({ _id: user._id, role: user.role });
            const token_refresh = JwtService.sign({ _id: user._id, role: user.role }, '1y', REFRESH_SECRET);

            // store refresh token in database
            await Refreshtokens.create({ token: token_refresh });

            res.json({ access_token, refresh_token: token_refresh });

        } catch (err) {
            return next(err);
        }
    },

    async logout(req, res, next) {
        try {
            await Refreshtokens.deleteOne({ token: req.body.refresh_token })
        } catch (error) {
            return next(new Error("Something Went Wrong In The Database"))
        }
        res.json({ 'msg': "Logout Successfully" });
    }
}

export default loginController;