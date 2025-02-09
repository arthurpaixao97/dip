import userServices from '../api/v1/services/userServices.js'
import sessionServices from '../api/v1/services/sessionServices.js'
import authServices from '../auth/authServices.js'
import dates from '../utils/dates.js'
import jwt from 'jsonwebtoken'

class Auth {
    async authAPI(req, res, next){
        
        var sessionToken = req.headers['authorization']
        if(!(sessionToken !== null && sessionToken !== undefined && sessionToken !== ''))
        {
            res.status(401).json({ message: "Unauthorized" })
        }
        
        sessionToken = sessionToken.split(' ')[1]
        
        const session = await sessionServices.getSession(sessionToken)

        if(!session)
        {
            res.status(401).json({ message: "Unauthorized" })
        } else if(session.expiresAt !== null && session.expiresAt !== undefined)
        {
            if(dates.isOverdue(session.expiresAt))
            {
                await sessionServices.deleteSession(session.token)
                res.status(401).json({ message: "Session expired" })
            } else {
                next()
            }
        } else {
            next()
        }
    }

    async authCookie(req, res, next){
        var sessionToken = strings.stringToJSON(req.headers.cookie)['dip-session']
        if(!(sessionToken !== null && sessionToken !== undefined && sessionToken !== ''))
        {
            res.status(401).json({ message: "Unauthorized" })
        }
        
        sessionToken = sessionToken.split(' ')[1]
        
        const session = await sessionServices.getSession(sessionToken)

        if(!session)
        {
            res.status(401).json({ message: "Unauthorized" })
        } else if(session.expiresAt !== null && session.expiresAt !== undefined)
        {
            if(dates.isOverdue(session.expiresAt))
            {
                await sessionServices.deleteSession(session.token)
                res.status(401).json({ message: "Session expired" })
            } else {
                next()
            }
        } else {
            next()
        }
    }

    async authRole(role){
        return async (req, res, next) => {
            const token = req.headers.authorization.split(' ')[1]
            const user = await userServices.getUser(sessionServices.getTokenPayload(token).user)
            if(user.role != role)
            {
                res.status(403).json({ message: "Forbidden" })
            } else {
                next()
            }
        }
    }
}

export default new Auth()