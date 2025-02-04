import dotenv from 'dotenv'
dotenv.config()

const PROTOCOL = process.env.PROTOCOL || 'http'
const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 3000
const BASEURL = `${PROTOCOL}://${HOST}:${PORT}`

class URI {
    baseURL()
    {
        return BASEURL
    }
}

export default new URI()