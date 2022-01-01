const Koa = require('koa')
const Router = require('koa-router')
const koaStatic = require('koa-static')
const koaBody = require('koa-body')
const {writeFileSync, copyFileSync} = require('fs')

const app = new Koa
const router = new Router

app.use(koaStatic('public'))
app.use(koaBody({ multipart: true }))

router.put('/data', function (ctx) {
  writeFileSync('public/data.json', JSON.stringify(ctx.request.body))
  ctx.body = ''
})

router.post('/audio/:voiceId', function (ctx) {
  copyFileSync(ctx.request.files.audio.path, `public/audios/${ctx.params.voiceId}.wav`)
  ctx.body = ''
})

app.use(router.routes())

const port = 8800
app.listen(port, function () {
  console.log(`Listening on http://localhost:${port}/`)
})