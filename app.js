const express = require('express')
const repo = require('./repo')
const seclayer = require('./seclayer')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
const port = 8081

const corsConfig = {
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true
  }

app.use(cors(corsConfig))

app.use(cookieParser())
app.use(bodyParser.json())

app.use(seclayer.checkCookies)

app.get('/posts', (req, res) => {

    repo.getPosts(req.user).then((values) => {
        res.send(values)
    })
    
})

app.post('/posts', (req, res) => {
    repo.savePost(req, user).then((post) => {
        res.send(post)
    })
}) 

app.delete('/posts/:id', (req, res) => {
    repo.deletePost(req.params.id, req.user).then((value) => {
        res.send(value)
    })
})

app.post('/posts/:id/like', (req, res) => {
    repo.votePost(req.params.id, false, req.user).then((value) => {
        res.send(value)
    })
})

app.post('/posts/:id/dislike', (req, res) => {
    repo.votePost(req.params.id, true, req.user).then((value) => {
        res.send(value)
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))