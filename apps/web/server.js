const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 4200;
const distPath = path.join(__dirname, 'dist/web');

app.use(express.static(distPath));

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Frontend server running on port ${port}`);
});
