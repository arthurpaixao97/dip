import recurrenceServices from '../services/recurrenceServices.js'

class RecurrenceController {
    async getRecurrence(req, res)
    {
        try {
            const recurrence = await recurrenceServices.getRecurrence(req.params.id)
            res.status(200).json(recurrence)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async getRecurrences(req, res)
    {
        try {
            const recurrences = await recurrenceServices.getRecurrences(req.query)
            res.status(200).json(recurrences)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async newRecurrence(req, res)
    {
        try {
            await recurrenceServices.newRecurrence(req.body)
            res.status(201).json({
                status: 201,
                message:"Success"
            })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async newRecurrency(req, res)
    {
        try {
            const recurrence = await recurrenceServices.newRecurrency(req.params.id)
            res.status(201).json(recurrence)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async recurrencyNewCharge(req, res)
    {
        try {
            const t = await recurrenceServices.recurrencyNewCharge(req.params.id)
            res.status(201).json(t)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}

export default new RecurrenceController()