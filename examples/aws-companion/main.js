import AwsS3 from '@uppy/aws-s3'
import Uppy from '@uppy/core'
import Dashboard from '@uppy/dashboard'
import RemoteSources from '@uppy/remote-sources'
import French from '@uppy/locales/lib/fr_FR'

import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import '@uppy/webcam/dist/style.css'

const COMPANION_URL = 'http://localhost:3020'
const uppy = new Uppy({
  debug: true,
  autoProceed: true,
  locale:French
})
uppy.use(RemoteSources, {
  companionUrl: COMPANION_URL,
  sources: [
    'Box',
    'Dropbox',
    'GoogleDrive',
    'Instagram',
    'OneDrive',
    'Unsplash',
    'Url',
    'Zoom',
  ],
})
uppy.use(Dashboard, {
  inline: true,
  target: 'body',
  plugins: ['GoogleDrive',],
})
uppy.use(AwsS3, {
  companionUrl: 'http://localhost:3020',
})

const getPresignedGetURL = async (key) => {
  const { url } = await fetch('http://127.0.0.1:3020/get-presigned-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key,
      action: 'get',
    })
  })
  return url
}

// async function transcribeWithDeepgram(url) {
//   const a = await fetch('http://127.0.0.1:3020/transcribe', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       url,
//     })
//   })
//   console.log(a);
// }

uppy.addPostProcessor(async (fileIds) => { 
  const file = await uppy.getFile(fileIds[0])
  console.log(file);
  const { key } = file.meta
  console.log(key);
  const presignedUrl = await getPresignedGetURL(key)
  console.log(presignedUrl); 
  
})