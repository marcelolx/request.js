const { TestServer } = require('./server')
const configuration = require('../intern.json')
const intern = require('intern').default

intern.configure(configuration)
intern.configure({ reporters: [ "runner" ] })

const { spawnSync } = require("child_process")
const { status, stderr } = spawnSync("java", [ "-version" ])

if (status != 0) {
  console.error(stderr.toString())
  process.exit(status)
}

intern.on("serverStart", server => {
  server._app.use(/\/__requestjs/, TestServer)

  const { stack } = server._app._router
  const staticLayerIndex = stack.findIndex(layer => layer.name == "serveStatic")
  const testLayer = stack.pop()
  stack.splice(staticLayerIndex - 1, 0, testLayer)
})

intern.run().catch(error => {
  console.error(error.toString())
  process.exit(1)
})