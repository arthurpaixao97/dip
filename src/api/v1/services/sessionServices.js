import dotenv from 'dotenv'
dotenv.config()
import Session from '../models/session.js'
import dates from '../../../utils/dates.js'
import userServices from './userServices.js'
import jwt from 'jsonwebtoken'

class SessionServices {
    async newSession(data, expires){
        var ret = {}
        const user = await userServices.getUserByEmail(data.email)

        var session = {
            user: user.id
        }

        if(expires)
        {
            session.expiresAt = dates.ISODate(dates.addDays(new Date(Date.now()), 1))
        }

        const payload = session

        const token = jwt.sign(payload, process.env.SECRET)

        session.token = token

        await this.deleteOtherSessions(user.id)

        const newSession = new Session(session)
        await newSession.save()

        ret = newSession

        return ret
    }

    async getSession(token){
        const session = await Session.findOne({token: token})
        return session
    }

    async deleteSession(token){
        await Session.findOneAndDelete({token: token})
    }

    getTokenPayload(token){
        const payload = jwt.decode(token)
        return payload
    }

    async deleteOtherSessions(userID){
        await Session.deleteMany({user: userID})
    }
}

export default new SessionServices()