const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.static('public'));

app.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running on http://0.0.0.0:${PORT}`);
});
