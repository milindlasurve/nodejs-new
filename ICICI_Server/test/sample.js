var casbin = require('casbin');

try {
    var test = casbin.newEnforcer("../path/model.conf", "../path/policy.csv").then(function (e) {
        // console.log("success =  ", e)
        const allSubjects = e.getAllSubjects()
        console.log("allSubjects =  ", allSubjects)

        const allNamedSubjects = e.getAllNamedSubjects('p')
        console.log("allNamedSubjects =  ", allNamedSubjects)

        const allObjects = e.getAllObjects()
        console.log("allObjects =  ", allObjects)

        const policies = e.getPolicy()
        console.log("load all policies = ", policies);

        const addPer = e.addPermissionForUser('akshay','data1','read')
        console.log("add permission to user = ", addPer);


        const sub = 'akshay'; // the user that wants to access a resource.
        const obj = 'data1'; // the resource that is going to be accessed.
        const act = 'write'; // the operation that the user performs on the resource.

        var sub = httpReq.user.userId;


        e.enforce(sub, obj, act, p1, p2).then(function (res) {
            console.log("success res for new user =  ", res)
        }).catch(function (error) {
            console.log("error =  ", error)
        })

    }).catch(function (error) {
        console.log("try = ", error)
    })
} catch (error) {
    console.log("catch = ", error)
}

