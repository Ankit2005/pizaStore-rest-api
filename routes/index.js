import express from 'express'
const router = express.Router();
import { registerController, loginController, userController, refreshTokenController } from '../controllers'
import auth from '../middlewares/auth'

router.post("/register", registerController.register)
router.post("/login", loginController.login)
router.post("/logout", auth, loginController.logout)
router.get("/me", auth, userController.me)
router.post("/refresh", refreshTokenController.refresh)

export default router;