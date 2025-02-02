import User from '../models/user.js'
import ids from '../../../utils/ids.js'
import walletServices from './walletServices.js'
import bcrypt from 'bcrypt'


class UserServices {
    async newUser(obj)
    {
        const user = await this.getUsers({email: obj.email})
        if(user.length > 0)
        {
            return {status: 400, message: "E-mail já cadastrado"}
        } else
        {
            var newUser = {}
            try {
                if(obj.password)
                {
                    obj.password = bcrypt.hashSync(obj.password, 10)
                }
                await ids.productID()
                .then(async i => {
                    obj.id = i
                    const user = new User(obj)
                    await user.save()
                    const wallet = await walletServices.newWallet(user.id)
                    const uw = {user:user, wallet:wallet}
                    newUser = uw
                })
                return newUser
            } catch (error) {
                throw error
            }
        }
    }
    async getUser(uid)
    {
        const user = await User.findOne({id: uid})
        return user
    }

    async getUsers(query)
    {
        const users = await User.find(query)
        return users
    }
}

export default new UserServices()