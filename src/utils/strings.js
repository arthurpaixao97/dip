class Strings {
    stringToJSON(s)
    {
        var obj = {}
        var arr = s.split('; ')
        arr.forEach(i => {
            i = i.split("=")
            obj[i[0]] = i[1]
        })

        return obj
    }
}

export default new Strings()