import cookieParser from "cookie-parser"
import strings from "../utils/strings.js"
import sessionServices from "../api/v1/services/sessionServices.js"
import authServices from "./authServices.js"
import userServices from "../api/v1/services/userServices.js"
import dates from '../utils/dates.js'

class AuthController {

    async authenticate(req, res){
        const validation = await authServices.validateCredentials(req.body)
        if(!validation)
        {
            res.status(401).json({message: "Invalid credentials"})
        } else {
            const newSession = await sessionServices.newSession(req.body, req.body.expires)
            res.status(200).json(newSession)
        }
    }

    async login(req, res){
        const validation = await authServices.validateCredentials(req.body)
        if(!validation)
        {
            res.status(401).json({message: "Invalid credentials"})
        } else {
            const newSession = await sessionServices.newSession(req.body, req.body.expires)
            var cookieExpiration = null

            try {
                cookieExpiration = dates.ISODate(newSession.expiresAt)
            } catch (error) {}

            res.cookie('dip-session', newSession.token, {
                Expires: cookieExpiration
            })
            res.status(200).json(newSession)
        }
    }

    async logout(req, res){
        const token = strings.stringToJSON(req.headers.cookie)['dip-session']
        await sessionServices.deleteSession(token)
        res.clearCookie('dip-session').status(204).json({ message: "Session deleted" })
    }
}

export default new AuthController()