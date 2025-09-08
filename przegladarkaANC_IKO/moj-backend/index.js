import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { readFileSync } from "fs";

const app = express();
const PORT = 3000;

// Middleware CORS
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*"); // Zezwala na dostęp z dowolnej domeny
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
	next();
});

const html = "";

// Twoja trasa
app.get("/pobierz", async (req, res) => {
	const url =
		"https://rhus-103.man.poznan.pl/dlibra/indexsearch?rdfName=CollectionSpecimenNumber&ipp=10&p=1&filter=POZG-V";

	try {
		const response = await fetch(url);
		const html = await response.text();
		// console.log(html);
		dane(html);
		res.send(html);
	} catch (err) {
		res.status(500).send("Błąd");
	}
});

app.use(express.json()); // do obsługi JSON

const dataNumer = JSON.parse(
	readFileSync("./zmodyfikowany_plik.json", "utf-8")
);

// Endpoint do wywołania z frontendu

app.post("/get-manifest", async (req, res) => {
	const { klucz } = req.body;

	if (!klucz || !dataNumer[klucz]) {
		return res.status(400).json({ error: "Niepoprawny klucz" });
	}

	const numer = dataNumer[klucz];

	const url = `https://rhus-103.man.poznan.pl/iiif/manifest/${numer}.json`;
	try {
		const response = await fetch(url);
		if (!response.ok) {
			return res
				.status(500)
				.json({ error: "Błąd podczas pobierania manifestu" });
		}
		const jsonData = await response.json();
		const linkJPG = jsonData.sequences[0].canvases[0].images[0].resource["@id"];
		const label = jsonData.sequences[0].canvases[0].label;
		console.log(linkJPG);
		console.log(label);

		// Teraz pobierz obraz z linku
		const imgResponse = await fetch(linkJPG);
		if (!imgResponse.ok) {
			return res.status(500).json({ error: "Błąd podczas pobierania obrazu" });
		}

		const buffer = await imgResponse.buffer();
    const base64Image = buffer.toString("base64");

    res.json({
      label,
      imageBase64: base64Image,
      imageType: "image/jpeg", // lub PNG
    });
	} catch (err) {
		return res.status(500).json({ error: "Błąd sieci" });
	}
});

const dane = (x) => {
	html = x;

	const $ = cheerio.load(html);

	// Wyodrębnij pierwszy tag <a>
	const link = $("a").first();

	// Pobierz atrybut href i tekst
	const href = link.attr("href");
	const text = link.text();

	console.log("Link:", href);
	console.log("Tekst:", text);
};

app.listen(PORT, () => {
	console.log(`Serwer jest działa na http://localhost:${PORT}`);
});
