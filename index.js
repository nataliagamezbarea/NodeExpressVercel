const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const cacheBusquedas = new Map();
const API_KEY = process.env.API_KEY;

const port = process.env.PORT || 8080;

app.get("/buscar", async (req, res) => {
  const consulta = req.query.q;
  if (!consulta) {
    return res.status(400).json({ error: "Falta el parámetro de consulta 'q'" });
  }

  if (cacheBusquedas.has(consulta)) {
    return res.json({ url: cacheBusquedas.get(consulta), desdeCache: true });
  }

  try {
    const urlApi = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(consulta)}&key=${API_KEY}&type=video`;
    const respuesta = await fetch(urlApi);
    const datos = await respuesta.json();

    if (datos.items && datos.items.length > 0) {
      const videoId = datos.items[0].id.videoId;
      const urlEmbed = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

      cacheBusquedas.set(consulta, urlEmbed);

      return res.json({ url: urlEmbed, desdeCache: false });
    } else {
      return res.status(404).json({ error: "No se encontró ningún video" });
    }
  } catch (error) {
    console.error("Error al buscar video:", error);
    return res.status(500).json({ error: "Error al realizar la búsqueda" });
  }
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
