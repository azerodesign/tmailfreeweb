export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { path } = req.query
  const targetPath = Array.isArray(path) ? path.join('/') : path || ''
  const targetUrl = `https://api.kisora.my.id/${targetPath}`

  try {
    const headers = {
      'content-type': 'application/json',
      'x-api-key': 'gp_dcf956689336bac081608fdbf0eb01cc',
    }

    const options = {
      method: req.method,
      headers,
    }

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    }

    const response = await fetch(targetUrl, options)
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    console.error('Kisora Proxy Error:', err)
    res.status(500).json({ error: 'Failed to proxy Kisora request' })
  }
}
