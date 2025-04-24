const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Endpoint de la API
app.get('/ytplaymp3', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        // Hacer la solicitud a la API externa
        const response = await axios.get(`https://api.vreden.my.id/api/ytplaymp3?query=${encodeURIComponent(query)}`);
        const data = response.data;

        // Extraer solo los campos solicitados
        const result = {
            url: data.result.download.url,
            image: data.result.metadata.image,
            title: data.result.metadata.title
        };

        // Enviar la respuesta
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
