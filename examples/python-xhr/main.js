import Uppy from '@uppy/core'
import Webcam from '@uppy/webcam'
import Dashboard from '@uppy/dashboard'
import XHRUpload from '@uppy/xhr-upload'

import '@uppy/core/dist/style.css'
import '@uppy/webcam/dist/style.css'
import '@uppy/dashboard/dist/style.css'

const uppy = new Uppy({
  debug: true,
  autoProceed: false,
})

uppy.use(Webcam)
uppy.use(Dashboard, {
  inline: true,
  target: 'body',
  plugins: ['Webcam'],
})

// upload should be before upload
async function upload() {
  // get presigned url // faire via AWS Lambda c'est simple normalement
  // ou bien en local sur ce serveur auquel cas il faut juste au moins le déployer
  const response = await fetch('https://lgq6d6awbqy2zj6m5ayy4q5cri0bmhtk.lambda-url.eu-west-3.on.aws/', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: {
      key: 'testfile.txt',
      action: 'put'
     }
  })
  console.log(await response.text());
  
  // use it to upload
  uppy.use(XHRUpload, {
    endpoint: await response.text() ,
  })
}

function setListeners() {
  uppy.on('upload', async () => {
    upload()
  })
}

async function main() {
  setListeners()
}

main()

// fetch('https://lgq6d6awbqy2zj6m5ayy4q5cri0bmhtk.lambda-url.eu-west-3.on.aws/', {
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   method: 'POST',
//   body: {
//     key: 'testfile.txt',
//     action: 'put'
//    }
// }).then(async (response) => {
//   console.log(response);
  
//   console.log(await response.json())


// })