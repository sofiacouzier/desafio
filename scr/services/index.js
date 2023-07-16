import UsersManager from "../dao/mongo/Managers/users.js";
import CartsManager from "../dao/mongo/Managers/carts.js";
import ProductsManager from "../dao/mongo/Managers/products.js";
import MessageManager from "../dao/mongo/Managers/message.js";
import UserService from "./user.service.js";
import CartService from "./cart.service.js";
import ProductService from "./product.service.js";

export const userService = new UserService(new UsersManager())

export const productService = new ProductService(new ProductsManager())

export const cartService = new CartService(new CartsManager());

export const messageService = new MessageManager()