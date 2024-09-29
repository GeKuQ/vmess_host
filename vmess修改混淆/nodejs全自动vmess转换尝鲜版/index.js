const crypto = require('crypto')

const express = require('express')
const URI = require('urijs')
const bluebird = require('bluebird')
const _ = require('lodash')
const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

const app = express()

function base64Encode(str) {
  return Buffer.from(str, 'utf-8').toString('base64')
}
function base64Decode(str) {
  return Buffer.from(str, 'base64').toString('utf-8')
}

const getFakeID = () => crypto.randomBytes(22 / 2).toString('hex')

const genUrl = (ip, port) => {
  const path = `if5ax/?fakeid=${getFakeID()}&spid=81117&pid=81117&spip=${ip}&spport=${port}`
  return `http://dir.wo186.tv:809/${path}&spkey=${crypto
    .createHash('md5')
    .update(`${path}3d99ff138e1f41e931e58617e7d128e2`, 'utf8')
    .digest('hex')}`
}

const getUrl = async url => {
  const { default: got } = await import('got')
  return _.get(await got.get(url).json(), 'url')
}
const parseUrl = url => {
  const uri = new URI(url)
  const query = uri.query(true)
  let expire
  let lsttm = _.get(query, 'lsttm')
  if (lsttm) {
    lsttm = dayjs(lsttm, 'YYYYMMDDHHmmss')
    if (lsttm.isValid()) {
      expire = lsttm.format('(MM/DD HH:mm)')
    }
  }
  return {
    hostname: uri.hostname(),
    host: uri.host(),
    port: uri.port(),
    path: uri.path(),
    query: uri.query(),
    search: uri.search(),
    expire,
  }
}

app.get('/getUrl', async (req, res) => {
  const { default: got } = await import('got')
  const {
    query: { ip, port },
  } = req
  res.send(parseUrl(await getUrl(genUrl(ip, port))))
})

app.get('/getProxyList', async (req, res) => {
  const {
    query: { name, ip, port: proxyPort, uuid },
  } = req

  const result = await bluebird.map(ip, async (ip, index) => {
    const { hostname, host, port, path, search, expire } = parseUrl(await getUrl(genUrl(ip, proxyPort[index])))

    return `${name[index]}${expire} = vmess, ${hostname}, ${port}, username=${uuid[index]}, skip-cert-verify=true, ws=true, ws-path=${path}${search}, ws-headers=host:"${host}", vmess-aead=true, tfo=true`
  })

  res.send(result.join('\n'))
})

app.get('/getV2', async (req, res) => {
  const {
    query: { name, ip, port: proxyPort, uuid },
  } = req

  const result = await bluebird.map(ip, async (ip, index) => {
    const { hostname, host, port, path, search, expire } = parseUrl(await getUrl(genUrl(ip, proxyPort[index])))

    return `vmess://${base64Encode(
      JSON.stringify({
        add: `${hostname}`,
        aid: '0',
        host: `${hostname}`,
        id: `${uuid[index]}`,
        net: 'ws',
        path: `${path}${search}`,
        port: `${port}`,
        ps: `${name[index]}${expire}`,
        sni: `${host}`,
        tls: '',
        type: 'none',
        // scy: 'auto',
        // alpn: 'http/1.1',
        v: '2',
      })
    )}`
  })

  res.send(base64Encode(result.join('\n')))
})

app.get('/getV2FromVmess', async (req, res) => {
  const {
    query: { vmess },
  } = req

  const result = await bluebird.map(vmess, async (vmess, index) => {
    const { add: ip, port: proxyPort, id: uuid, ps: name } = JSON.parse(base64Decode(new URI(vmess).host()))

    const { hostname, host, port, path, search, expire } = parseUrl(await getUrl(genUrl(ip, proxyPort)))

    return `vmess://${base64Encode(
      JSON.stringify({
        add: `${hostname}`,
        aid: '0',
        host: `${hostname}`,
        id: `${uuid}`,
        net: 'ws',
        path: `${path}${search}`,
        port: `${port}`,
        ps: `${name}${expire}`,
        sni: `${host}`,
        tls: '',
        type: 'none',
        // scy: 'auto',
        // alpn: 'http/1.1',
        v: '2',
      })
    )}`
  })

  res.send(base64Encode(result.join('\n')))
})

app.get('/getV2FromVmessSub', async (req, res) => {
  const {
    query: { vmessSub },
  } = req

  const { default: got } = await import('got')

  const vmess = _.chain(base64Decode(await got.get(vmessSub).text()))
    .split(/\r?\n/)
    .compact()
    .value()

  const result = await bluebird.map(vmess, async (vmess, index) => {
    const { add: ip, port: proxyPort, id: uuid, ps: name } = JSON.parse(base64Decode(new URI(vmess).host()))

    const { hostname, host, port, path, search, expire } = parseUrl(await getUrl(genUrl(ip, proxyPort)))

    return `vmess://${base64Encode(
      JSON.stringify({
        add: `${hostname}`,
        aid: '0',
        host: `${hostname}`,
        id: `${uuid}`,
        net: 'ws',
        path: `${path}${search}`,
        port: `${port}`,
        ps: `${name}${expire}`,
        sni: `${host}`,
        tls: '',
        type: 'none',
        // scy: 'auto',
        // alpn: 'http/1.1',
        v: '2',
      })
    )}`
  })

  res.send(base64Encode(result.join('\n')))
})

const server = app.listen(process.env.PORT || '2222', process.env.HOST || '::', async () => {
  const { address, port } = server.address()
  console.log(`Express is now listening for incoming connections on ${address}:${port}`)
})
