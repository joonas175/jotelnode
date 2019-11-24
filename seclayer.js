const repo = require('./repo')

async function checkCookies(req, res, next) {
    console.log("Checking cookies")



    let identityHeader = req.cookies["Jotel-Identity"]
    if(identityHeader === null || identityHeader === undefined) {
        req.user = await repo.saveUser(createRandomToken())
        
        //res.set('Set-Cookie', `Jotel-Identity=${req.user.identifier}; HttpOnly; MaxAge=315360000`)
        res.cookie('Jotel-Identity', req.user.identifier, { maxAge: 315360000, httpOnly: true, domain: "localhost" })
        
        next()
    } else {
        user = await repo.findUserByIdentifier(identityHeader)
        if(user !== null && user !== undefined){
            req.user = user
            console.log("User ok, continuing")
            next()
        } else {
            console.log("Identity not found, creating new")
            req.user = await repo.saveUser(createRandomToken())
        
            res.cookie('Jotel-Identity', req.user.identifier, { maxAge: 315360000, httpOnly: true})
            next()
        }
    }

    
}

createRandomToken = () => {

    let charSet = 'abcdefghjiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    let token = ''

    while(token.length < 32){
        token += charSet[(Math.floor(Math.random() * 33))]
    }

    return token
}

exports.checkCookies = checkCookies