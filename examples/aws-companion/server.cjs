const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const companion = require('@uppy/companion')

const deepgramUrl = 'https://api.deepgram.com/v1/listen';
const apiKey = 'YOUR_API_KEY'; // Remplacez par votre clé API

const headers = {
  'Accept': 'application/json',
  'Authorization': `Token ${apiKey}`,
  'Content-Type': 'application/json',
};


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
    dropbox: {
      key: process.env.COMPANION_DROPBOX_KEY,
      secret: process.env.COMPANION_DROPBOX_SECRET,
    },
    box: {
      key: process.env.COMPANION_BOX_KEY,
      secret: process.env.COMPANION_BOX_SECRET,
    },
    onedrive: {
      key: process.env.COMPANION_ONEDRIVE_KEY,
      secret: process.env.COMPANION_ONEDRIVE_SECRET,
    },
    zoom: {
      key: process.env.COMPANION_ZOOM_KEY,
      secret: process.env.COMPANION_ZOOM_SECRET,
    },
  },
  s3: {
    getKey: ({ filename }) => `${crypto.randomUUID()}-${filename}`,
    key: process.env.COMPANION_AWS_KEY,
    secret: process.env.COMPANION_AWS_SECRET,
    bucket: process.env.COMPANION_AWS_BUCKET,
    region: process.env.COMPANION_AWS_REGION,
    endpoint: process.env.COMPANION_AWS_ENDPOINT,
    forcePathStyle: process.env.COMPANION_AWS_FORCE_PATH_STYLE === 'true',
  },
  server: { host: 'localhost:3020' },
  filePath: DATA_DIR,
  secret: 'blah blah',
  debug: true,
  // enableUrlEndpoint: true
}

app.get('/', (req, res) => res.send('Hello World!'))

// app.get('/transform-youtube-url', async (req, res) => { 
//   try {
//     const { url } = req.query;
//     const response = await fetch('http://157.173.114.28/download', {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       method: 'POST',
//       body: JSON.stringify({
//         url
//       })
//     }).then(resp => resp.json());
//     console.log(response);
//     await res.json(response);
//   } catch (error) {
//     console.error('error', error)
//   }
// })

// get presigned url from wasabi
app.post('/get-presigned-url', async (req, res) => {
  try {
    const { key, action } = req.body;

    const response = await fetch('https://lgq6d6awbqy2zj6m5ayy4q5cri0bmhtk.lambda-url.eu-west-3.on.aws/', {
      headers: {
        'Content-Type': 'application/json',
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

app.post('/transcribe', async (req, res) => {
  const audioUrl = req.body.url;

  const data = {
    url: audioUrl,
  };

  try {
    const response = await fetch(deepgramUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const transcription = await response.json();
    
    // Retourner la transcription au client
    res.status(200).json(transcription);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur lors de la transcription.' });
  }
});


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
