import { Router } from "express";
import ProductManager from "../../Managers/ProductManager.js";

const productmanager = new ProductManager

const router = Router()


router.get('/', async (req, res) => {
    try {

        const products = await productmanager.getProducts()
        let query = req.query // encontrar el query
        let limit = Number(Object.values(query))// conseguir que numero es el limit
        //console.log(limit)
        //console.log(products)
        if (!limit) {
            res.send(products)
        } else if (limit < products.length) {
            const limitedProd = products.slice(0, limit)// slice: (de donde empieza hasta el ultimo incluido)
            return res.status(200).send(limitedProd)
        }
    } catch (error) {
        console.log(error)
    }

})

router.get('/:pid', async (req, res) => {
    const products = await productmanager.getProducts()
    let id = Number(Object.values(req.params))
    //console.log(id)
    const prod = await productmanager.getProductByID(id)
    // console.log(prod)
    res.send(prod)
})


router.post("/", async (req, res) => {
    try {
        const product = req.body

        const result = await productmanager.addProducts(product)

        if (result.status === 'error') return res.status(400).send({ result });

        return res.status(200).send({ result });
    } catch (error) {
        console.log(error)
    }

})


router.put("/:pid", async (req, res) => {
    try {
        const updateProduct = req.body
        const id = Number(Object.values(req.params))
        const result = await productmanager.updateProduct(id, updateProduct)

        if (result.status === 'error') return res.status(400).send({ result });

        return res.status(200).send({ result });
    } catch (error) {
        console.log(error)
    }
})

router.delete("/:pid", async (req, res) => {
    try {
        const id = Number(Object.values(req.params))
        const result = await productmanager.deleteProduct(id)

        if (result.status === 'error') return res.status(400).send({ result });

        return res.status(200).send({ message: "producto eliminado" });

    } catch (error) {
        console.log(error)
    }
})


export default router