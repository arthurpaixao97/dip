import Role from '../models/role.js'
import arrays from '../../../utils/arrays.js'

class RoleServices {
    async newRole(name, permissions)
    {
        if(!Array.isArray(permissions))
        {
            permissions = [permissions]
        }

        const newRole = new Role({
            name: name,
            permissions: permissions
        })
        await newRole.save()
        return newRole
    }

    //PERMISSIONS MUST BE FORMATTED AS "resource:scope:action", e.g. "offer:own:delete" or "user:all:view"

    async roleAddPermissions(name, permissions)
    {
        const role = await Role.findOne({name: name})

        if(!role){
            throw new Error("Role not found");
        } else {
            var newPermissions = arrays.union(role.permissions, permissions)
            const newRole = await Role.findOneAndUpdate({name: name}, {permissions: newPermissions}, {new: true})
            return newRole
        }
    }

    
}

export default new RoleServices()