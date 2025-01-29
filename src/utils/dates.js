class Dates {
    addDays(date, days)
    {
        return new Date(new Date(date).getTime() + (86400000 * days))
    }

    ISODate(date)
    {
        try {
            return new Date(date).toISOString()   
        } catch (error) {
            throw error
        }
    }
}

export default new Dates()