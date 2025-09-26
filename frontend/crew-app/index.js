import express from 'express';

const app = express();
const PORT = 5173;

app.use(express.static('dist'));

app.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running on http://0.0.0.0:${5173}`);
});
