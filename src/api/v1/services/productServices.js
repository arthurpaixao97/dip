import Product from '../models/product.js'
import ids from '../../../utils/ids.js'
import offerServices from './offerServices.js'


class ProductServices {
    async newProduct(obj)
    {
        var newProd = {}

        try {
            obj.product.status = 'ACTIVE'
            await ids.productID()
            .then(async i => {
                obj.product.id = i
                const product = new Product(obj.product)
                await product.save()
                newProd.product = product
                obj.offer.productID = product.id
                const offer = await offerServices.newOffer(obj.offer)
                newProd.offer = offer
            })

            return newProd

        } catch (error) {
            throw error
        }
    }

    async getProduct(pid)
    {
        const product = await Product.findOne({id: pid})
        return product
    }

    async getProducts(query)
    {
        const products = await Product.find(query)
        return products
    }

    async updateProduct(pid, updates)
    {
        await Product.findOneAndUpdate({id: pid}, updates, {new: true})
        .then(p => {
            return p
        })
    }
}

export default new ProductServices()