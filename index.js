'use strict'

const request = require('request')
const fs = require('fs')
const express = require('express')

const app = express()

const loggerCreator = debug => ({
  log: log => debug && console.log(log),
  error: log => debug && console.error(log)
})

const options = {
  port: 8080,
  debug: true
}

const logger = loggerCreator(options.debug)

const staticDirectory = 'public'

app.use(express.static(staticDirectory))

app.get('/', (req, res) => {
  const filename = `${Date.now()}.jpg`

  const filepath = `/${staticDirectory}/${filename}`

  const options = {
    dest: `${__dirname}${filepath}`,
    encoding: null,
    uri: 'https://www.nps.gov/webcams-yell/washburn2.jpg'
  }

  const main = { req, res }

  request(options, (err, res, body) => {
    if (err) return logger.error('Problem with request.')

    if (!body || res.statusCode !== 200) return logger.error('Problem with response.')

    fs.writeFile(`${__dirname}${filepath}`, body, 'binary', err => {
      if (err) return logger.error(err)

      fs.createReadStream(`${__dirname}${filepath}`).pipe(fs.createWriteStream(`${__dirname}/${staticDirectory}/index.jpg`))

      main.res.writeHead(200)

      main.res.end(`
        <!DOCTYPE html>
        <img src="index.jpg" title="Latest wildlife image" />
        <script>
          setTimeout(function() { window.location.reload() }, 1000 * 60)
        </script>
      `)
    })
  })
})

app.listen(options.port, () => logger.log(`Server listening at port ${options.port}.`))
