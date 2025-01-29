import walletServices from '../services/walletServices.js'

class WalletController {
    async getWallet(req, res)
    {
        try {
            const wallet = await walletServices.getWallet(req.params.id)
            res.status(200).json(wallet)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async walletNewEntry(req, res)
    {
        try {
            await walletServices.addBalance(req.body)
            res.status(201).json({
                status: 201,
                message:"Success"
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}

export default new WalletController()