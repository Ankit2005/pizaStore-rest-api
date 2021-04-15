import Joi from 'Joi'
import { REFRESH_SECRET } from '../../config';
import { User, Refreshtokens } from '../../models'
import CustomErrorHandler from '../../services/CustomErrorHandler';
import JwtService from '../../services/JwtService';

const refreshTokenController = {

    async refresh(req, res, next) {

        const refreshTokenSchema = Joi.object({
            token: Joi.string().required()
        });

        const { error } = refreshTokenSchema.validate(req.body);
        if (error) {
            return next(error);
        }

        try {

            const refreshToken = await Refreshtokens.findOne({ token: req.body.token });
            console.log("refresh token")
            console.log(refreshToken);

            if (!refreshToken) {
                return next(CustomErrorHandler.auth())
            }

            let userId;
            try {
                const { _id } = await JwtService.verify(refreshToken.token, REFRESH_SECRET)
                userId = _id;
            } catch (error) {
                return next(error);
            }

            const user = await User.findOne({ _id: userId })
            console.log("user");
            console.log(user);
            if (!user) {
                return next(CustomErrorHandler.auth("User Not Found !"))
            }

            // jwt token generate
            const access_token = JwtService.sign({ _id: user._id, role: user.role });
            const token_refresh = JwtService.sign({ _id: user._id, role: user.role }, '1y', REFRESH_SECRET);

            // store refresh token in database
            await Refreshtokens.create({ token: token_refresh });
            res.json({ 'access_token': access_token, refresh_token: token_refresh });

        } catch (error) {
            console.log("err");
            return next(error);
        }

    }

}

export default refreshTokenController;