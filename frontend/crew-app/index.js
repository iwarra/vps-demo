const express = require('express');
const app = express();
const path = require('path');
const PORT = 5173;

app.use(express.static(path.join(__dirname, '../frontend/crew-app/dist')));

app.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running on http://0.0.0.0:${5173}`);
});
