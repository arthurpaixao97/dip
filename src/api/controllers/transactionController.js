import transactionServices from '../services/transactionServices.js'

class TransactionController {
    async getTransaction(req, res)
    {
        try {
            const transaction = await transactionServices.getTransaction(req.params.id)
            res.status(200).json(transaction)
        } catch (error) {
            res.status(500).json(error)
        }
    }

    async getTransactions(req, res)
    {
        try {
            const transactions = await transactionServices.getTransactions(req.query)
            res.status(200).json(transactions)
        } catch (error) {
            res.status(500).json(error)
        }
    }

    async newTransaction(req, res)
    {
        try {
            const transaction = await transactionServices.newTransaction(req.body)
            res.status(201).json({
                status: 201,
                content:transaction
            })
        } catch (error) {
            console.log(error)
            res.status(500).json(error)
        }
    }

    async setPendingTransaction(req, res)
    {
        try {
            await transactionServices.setPending(req.params.id)
            res.status(201).json({
                status: 201,
                message:"Success"
            })
        } catch (error) {
            res.status(error.status).json(error)
        }
    }

    async approveTransaction(req, res)
    {
        try {
            const approve = await transactionServices.approve(req.params.id)
            res.status(approve.status).json({
                status: approve.status,
                content: approve
            })
        } catch (error) {
            console.log(error)
            res.status(500).json(error)
        }
    }

    async cancelTransaction(req, res)
    {
        try {
            await transactionServices.cancel(req.params.id)
            res.status(201).json({
                status: 201,
                message:"Success"
            })
        } catch (error) {
            res.status(error.status).json(error)
        }
    }

    async protestTransaction(req, res)
    {
        try {
            await transactionServices.protest(req.params.id)
            res.status(201).json({
                status: 201,
                message:"Success"
            })
        } catch (error) {
            res.status(error.status).json(error)
        }
    }

    async refundTransaction(req, res)
    {
        try {
            await transactionServices.refund(req.params.id)
            res.status(201).json({
                status: 201,
                message:"Success"
            })
        } catch (error) {
            res.status(error.status).json(error)
        }
    }
}

export default new TransactionController()