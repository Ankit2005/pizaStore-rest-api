import express from 'express'
const router = express.Router();
import {
    registerController,
    loginController, userController,
    refreshTokenController, productController
} from '../controllers'
import auth from '../middlewares/auth'
import admin from '../middlewares/admin'

router.post("/register", registerController.register)
router.post("/login", loginController.login)
router.post("/logout", auth, loginController.logout)
router.get("/me", auth, userController.me)
router.post("/refresh", refreshTokenController.refresh)

router.post("/products", [auth, admin], productController.store)
router.get("/products", productController.index)
router.get("/products/:id", productController.fetchSingle)
router.put("/products/:id", [auth, admin], productController.update)
router.delete("/products/:id", [auth, admin], productController.destroy)

export default router;