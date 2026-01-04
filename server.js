const express = require('express');
const path = require('path');

const app = express();
const PORT = 3333;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve model files with correct MIME type
app.use('/models', express.static(path.join(__dirname, 'models'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`JSCAD Workshop running at:`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://0.0.0.0:${PORT}`);
  console.log('\nOpen in your browser to view 3D models!');
});
