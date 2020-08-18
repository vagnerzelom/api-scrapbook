
const cors = require("cors");
const express = require("express");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(cors());
app.use(express.json());

const scraps = [];

function logRequests(request, response, next) {
  console.time("Time");

  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;
  console.log(logLabel);

  next();

  console.timeEnd("Time");
}

function validateScrapsId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response
      .status(400)
      .json({ error: "Param sent is not a valid UUID" });
  }
  next();
}

function validateInputs(request, response, next) {
  const { title, message } = request.body;

  if (title === "" || message === "") {
    return response.status(400).json({ error: "Empty input" });
  }
  next();
}

app.use(logRequests);
app.use("/scraps/:id", validateScrapsId);

app.get("/scraps", (request, response) => {
  const { title, message } = request.query;

  const results = title
    ? scraps.filter((scrap) =>
        scrap.title.toLowerCase().includes(title.toLowerCase())
      )
    : scraps;

  return response.json(results);
});

app.post("/scraps", validateInputs, (request, response) => {
  const { title, message } = request.body;
  const scrap = { id: uuid(), title, message };

  scraps.push(scrap);

  return response.json(scrap);
});

app.put("/scraps/:id", validateInputs, (request, response) => {
  const { id } = request.params;
  const { title, message } = request.body;

  const scrapIndex = scraps.findIndex((scrap) => scrap.id === id);

  if (scrapIndex < 0) {
    return response.status(400).json({ error: "Project not found" });
  }

  const scrap = {
    id,
    title,
    message,
  };

  scraps[scrapIndex] = scrap;

  return response.json(scrap);
});

app.delete("/scraps/:id", (request, response) => {
  const { id } = request.params;

  const scrapIndex = scraps.findIndex((scrap) => scrap.id === id);
  scraps.splice(scrapIndex, 1);

  return response.status(204).send();
});

const port = 3332;
app.listen(port, () => {
  console.log(`🚀 Server up and running on PORT ${port} 🚀`);
});
