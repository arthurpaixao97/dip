import userServices from '../services/userServices.js'

class UserController {
    async getUser(req, res)
    {
        try {
            const user = await userServices.getUser(req.params.id)
            res.status(200).json(user)
        } catch (error) {
            res.status(500).json(error)
        }
    }

    async getUsers(req, res)
    {
        try {
            const users = await userServices.getUsers(req.query)
            res.status(200).json(users)
        } catch (error) {
            res.status(500).json(error)
        }
    }

    async newUser(req, res)
    {
        try {
            const user = await userServices.newUser(req.body)
            res.status(201).json({
                status: 201,
                content:user
            })
        } catch (error) {
            res.status(error.status || 500).send(error)
        }
    }
}

export default new UserController()