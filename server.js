#!/usr/local/bin/node

const Koa = require('koa')
const Router = require('koa-router')
const koaStatic = require('koa-static')
const koaBody = require('koa-body')
const {writeFileSync, copyFileSync, unlinkSync, existsSync, mkdirSync, readFileSync} = require('fs')
const https = require('https')
const open = require('open')
const mkCert = require('make-cert')
const { resolve } = require('path')
const { networkInterfaces } = require('os')

function getWifiIP () {
  const ips = Object.values(networkInterfaces()).flat()
  return ips.filter(ip => ip.family === 'IPv4' && ip.mac !== '00:00:00:00:00:00')[0].address
}

if (!existsSync('certs')) {
  mkdirSync('certs')
  const {key, cert} = mkCert('localhost')
  writeFileSync(resolve('certs', 'key.pem'), key)
  writeFileSync(resolve('certs', 'cert.pem'), cert)
}

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

router.delete('/audio/:voiceId', function (ctx) {
  unlinkSync(`public/audios/${ctx.params.voiceId}.wav`)
  ctx.body = ''
})

app.use(router.routes())
  .use(router.allowedMethods())

const port = 8800
https.createServer({
  key: readFileSync(resolve('certs', 'key.pem'), 'utf8').toString(),
  cert: readFileSync(resolve('certs', 'cert.pem'), 'utf8').toString()
}, app.callback())
  .listen(port, function () {
    console.log(`Listening on https://${getWifiIP()}:${port}/
      Use this url to access the application from your devices on the local network
    `)

    if ('PROD' in process.env) {
      open(`https://${getWifiIP()}:${port}`)
    }
  })