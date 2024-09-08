const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const companion = require('@uppy/companion')

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') })
const app = require('express')()

const DATA_DIR = path.join(__dirname, 'tmp')

app.use(require('cors')({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}))
app.use(require('cookie-parser')())
app.use(require('body-parser').json())
app.use(require('express-session')({
  secret: 'hello planet',
  saveUninitialized: false,
  resave: false,
}))

const options = {
  providerOptions: {
    drive: {
      key: process.env.COMPANION_GOOGLE_KEY,
      secret: process.env.COMPANION_GOOGLE_SECRET,
    },
  },
  s3: {
    getKey: (req, filename) => `${crypto.randomUUID()}-${filename}`,
    key: process.env.COMPANION_AWS_KEY,
    secret: process.env.COMPANION_AWS_SECRET,
    bucket: process.env.COMPANION_AWS_BUCKET,
    region: process.env.COMPANION_AWS_REGION,
    endpoint: process.env.COMPANION_AWS_ENDPOINT,
  },
  server: { host: 'localhost:3020' },
  filePath: DATA_DIR,
  secret: 'blah blah',
  debug: true,
}

// get presigned url from wasabi
app.post('/get-presigned-url', async (req, res) => {
  try {
    const { key, action } = req.body;

    const response = await fetch('https://lgq6d6awbqy2zj6m5ayy4q5cri0bmhtk.lambda-url.eu-west-3.on.aws/', {
      headers: {
        'Content-Type': 'application/json',
        'x-api-secret': "l#z=61WQTGNQqTz-]#w*alWbyI2W;}<7ufMxwvr&7}n.:~(7Xdz4WT@@&zx'@nW"
      },
      method: 'POST',
      body: JSON.stringify({
        key, // or just `key,` in modern JS syntax
        action
      })
    });

    const result = await response.json();

    res.json(result); // Send the fetched result to the client
  } catch (error) {
    console.error('Error fetching presigned URL:', error);
    res.status(500).json({ error: 'Failed to fetch presigned URL' });
  }
})

// Create the data directory here for the sake of the example.
try {
  fs.accessSync(DATA_DIR)
} catch (err) {
  fs.mkdirSync(DATA_DIR)
}
process.on('exit', () => {
  fs.rmSync(DATA_DIR, { recursive: true, force: true })
})

const { app: companionApp } = companion.app(options)

app.use(companionApp)

const server = app.listen(3020, () => {
  console.log('listening on port 3020')
})

companion.socket(server)
