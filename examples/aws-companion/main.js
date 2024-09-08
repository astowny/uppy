import AwsS3 from '@uppy/aws-s3'
import Uppy from '@uppy/core'
import Dashboard from '@uppy/dashboard'
import GoogleDrive from '@uppy/google-drive'
import Webcam from '@uppy/webcam'

import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import '@uppy/webcam/dist/style.css'

const uppy = new Uppy({
  debug: true,
  autoProceed: true,
})

uppy.use(GoogleDrive, {
  companionUrl: 'http://localhost:3020',
})
uppy.use(Webcam)
uppy.use(Dashboard, {
  inline: true,
  target: 'body',
  plugins: ['GoogleDrive', 'Webcam'],
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


uppy.addPostProcessor(async (fileIds) => { 
  const file = await uppy.getFile(fileIds[0])
  console.log(file);
  const { key } = file.meta
  console.log(key);
  const presignedUrl = await getPresignedGetURL(key)
  console.log(presignedUrl); // this is the get presi
  
})