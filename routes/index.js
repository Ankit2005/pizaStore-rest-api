import express from 'express'
const router = express.Router();
import {registerController, loginController, userController} from '../controllers'

router.post("/register", registerController.register)
router.post("/login", loginController.login)
router.get("/me", userController.me)

export default router;