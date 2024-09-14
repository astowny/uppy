const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// Dossier public où sont stockés les fichiers à distribuer
const publicFolder = path.join(__dirname, 'public');

// Fonction pour servir les fichiers
const serveFile = (filePath, res) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.write('404 Not Found\n');
      res.end();
    } else {
      const ext = path.extname(filePath);
      const mimeType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.pdf': 'application/pdf',
      };

      res.writeHead(200, { 'Content-Type': mimeType[ext] || 'application/octet-stream' });
      res.write(data);
      res.end();
    }
  });
};

// Création du serveur HTTP
http.createServer((req, res) => {
  const filePath = path.join(publicFolder, req.url === '/' ? 'index.html' : req.url);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.write('404 Not Found\n');
      res.end();
    } else {
      serveFile(filePath, res);
    }
  });
}).listen(3000, () => {
  console.log('Serveur en écoute sur http://localhost:3000');
});
