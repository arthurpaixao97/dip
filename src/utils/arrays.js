class Arrays {
    union(a1, a2){

        let arr1 = a1
        let arr2 = a2
    
        if(!Array.isArray(arr1))
        {
            arr1 = [arr1]
        }
        if(!Array.isArray(arr2))
        {
            arr2 = [arr2]
        }
    
        var ret = []
        
        for(let i = 0; i < arr1.length; i++)
        {
            ret.push(arr1[i])
        }
    
    
        for(let i = 0; i < arr2.length; i++)
        {
            if(!ret.find(j => j == arr2[i]))
            {
                ret.push(arr2[i])
            }
        }
        
        return ret
    }
    
    intersection(a1, a2){
        
        let arr1 = a1
        let arr2 = a2
    
        if(!Array.isArray(arr1))
        {
            arr1 = [arr1]
        }
        if(!Array.isArray(arr2))
        {
            arr2 = [arr2]
        }
        
        var result = []
        result = this.union(arr1, arr2)
        var ret = []
    
        for(let i = 0; i < result.length; i++)
        {
            if((arr1.find(j => j == result[i]) && arr2.find(j => j == result[i])) != undefined)
            {
                ret.push(result[i])
            }
        }
    
        return ret
    }
    
    difference(a1, a2){
        let arr1 = a1
        let arr2 = a2
    
        if(!Array.isArray(arr1))
        {
            arr1 = [arr1]
        }
        if(!Array.isArray(arr2))
        {
            arr2 = [arr2]
        }
        
        var ret = {
            unique1: [],
            unique2: []
        }
    
        for(let i = 0; i < arr1.length; i++)
        {
            if(!arr2.find(j => j == arr1[i]))
            {
                ret.unique1.push(arr1[i])
            }
        }
    
        for(let i = 0; i < arr2.length; i++)
        {
            if(!arr1.find(j => j == arr2[i]))
            {
                ret.unique2.push(arr2[i])
            }
        }
    
        return ret
    }
}

export default new Arrays()