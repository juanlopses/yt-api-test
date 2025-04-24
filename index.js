const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
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

        // Hacer la solicitud a la API de YouTube
        const ytResponse = await axios.get(`https://api.vreden.my.id/api/ytplaymp3?query=${encodeURIComponent(query)}`);
        const ytData = ytResponse.data;

        // Descargar el archivo MP3
        const mp3Response = await axios.get(ytData.result.download.url, { responseType: 'arraybuffer' });
        const mp3Buffer = Buffer.from(mp3Response.data);

        // Preparar el formulario para subir el archivo a tmpfiles.org
        const form = new FormData();
        form.append('file', mp3Buffer, {
            filename: ytData.result.download.filename || 'audio.mp3',
            contentType: 'audio/mpeg'
        });

        // Subir el archivo a tmpfiles.org
        const uploadResponse = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
            headers: form.getHeaders()
        });
        // Ajustar la URL para obtener el enlace directo
        const uploadedUrl = uploadResponse.data.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');

        // Extraer solo los campos solicitados, con la URL del archivo subido
        const result = {
            url: uploadedUrl,
            image: ytData.result.metadata.image,
            title: ytData.result.metadata.title
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
