let { network, set, get } = require("good-js")

window.network = network

// const databaseUrl = "http://192.168.86.198:3000"
// const databaseUrl = "http://localhost:3000"
// const databaseUrl = "http://paradise.cs.tamu.edu:3000"
const databaseUrl = "http://128.194.4.15:3000"
// const databaseUrl = "http://192.168.192.57:3000"
const key = "4a75cfe3cdc1164b67aae6b413c9714280d2f102"


let databaseApiCall = async (methodName, args=[])=> {
    let {value, error} = await network.post({ data: { args, key } , to: `${databaseUrl}/${methodName}`})
    if (error) {
        throw Error(`Error from backend:\n${error}`)
    }
    return value
}

// 
// setup the database API (auto-generate all the methods)
//
let endpoints = new Promise(async (resolve, reject)=>{
    let actualEndpoints = {}
    let endpointPaths
    try {
        endpointPaths = await databaseApiCall("smartEndpoints")
        console.debug(`endpointPaths is:`,endpointPaths)
    } catch (error) {
        console.error("couldn't get the endpoints from the database")
        endpointPaths = []
    }
    for (let each of endpointPaths) {
        set({
            keyList: each.split("/"),
            to: (...args) => { return databaseApiCall(each, args) },
            on: actualEndpoints
        })
    }
    resolve(actualEndpoints)
    window.endpoints = await endpoints
})
window.endpoints = endpoints


module.exports = {
    endpoints,
    mixin: {
        data: ()=>({
            endpoints,
        }),
    },
}