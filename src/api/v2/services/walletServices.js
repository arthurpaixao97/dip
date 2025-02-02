import Wallet from '../models/wallet.js'
import dates from '../../../utils/dates.js'
import fin from '../../../utils/finances.js'

class WalletServices {
    async addStatementItem(obj){
        const wallet = await Wallet.findOne({userID: obj.user})
        if(!wallet.statement)
        {
            wallet.statement = []
        }
        wallet.statement.unshift({
            currency: obj.currency,
            amount: obj.amount,
            description: obj.description,
            transaction: obj.transaction,
            date: dates.ISODate(new Date())
        })

        await Wallet.updateOne({userID: obj.user}, wallet)
    }
    
    async addBalance(obj){
        const wallet = await Wallet.findOne({userID: obj.user})
        if(wallet)
        {
            if(wallet.balance[obj.currency] == undefined)
            {
                wallet.balance[obj.currency] = 0
            }
            wallet.balance[obj.currency] += fin.money(obj.amount)
    
            await Wallet.updateOne({userID: obj.user}, wallet)
            await this.addStatementItem(obj)
        }
    }
    
    async getWallet(user){
        const wallet = await Wallet.findOne({userID: user})
        return wallet
    }

    async newWallet(uid)
    {
        try {
            const wallet = new Wallet({
                userID: uid,
                balance: {
                    BRL: 0,
                    USD: 0,
                    EUR: 0,
                    GBP: 0
                },
                statement: []
            })
    
            await wallet.save()
            return wallet

        } catch (error) {
            throw error
        }
    }
}

export default new WalletServices()