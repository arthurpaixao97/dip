import productServices from '../services/productServices.js'

class ProductController {
    async getProduct(req, res)
    {
        try {
            const product = await productServices.getProduct(query)
            res.status(200).json(product)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async getProducts(req, res)
    {
        try {
            const products = await productServices.getProduct(query)
            res.status(200).json(products)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async newProduct(req, res)
    {
        try {
            const product = await productServices.newProduct(req.body)
            res.status(201).json({
                status: 201,
                content:product
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}

export default new ProductController()