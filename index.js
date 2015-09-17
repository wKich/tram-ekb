let tram = require('./tram')()
let express = require('express')
let app = express()

app.use(express.static('public'))
app.get('/get/:id', async function (req, res) {
    console.log(' -> Start getting route')
    let data = await tram.getRoute(req.params.id)
    res.send(data)
})

app.listen(process.env.PORT || 5000)