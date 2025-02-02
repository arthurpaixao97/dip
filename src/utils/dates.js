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

    days(x)
    {
        return 86400000 * x
    }

    toDays(x)
    {
        return x/86400000
    }

    daysBetweenDates(earliest, latest)
    {
        var date1 = new Date(earliest).getTime()
        var date2 = new Date(latest).getTime()

        return this.toDays(date2 - date1)
    }
}

export default new Dates()