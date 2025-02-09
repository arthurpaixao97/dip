import User from '../api/v1/models/user.js'
import bcrypt from 'bcrypt'

class AuthServices {
    async validateCredentials(data)
    {
        const user = await User.findOne({email: data.email})
        if(!user)
        {
            return false
        }

        if(!(bcrypt.compareSync(data.password, user.password)))
        {
            return false
        }

        return true
    }
}

export default new AuthServices()