const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql"); // Ostavite ovo za stvarnu vezu

const app = express();

app.use(cors({
  origin: '*'
}));
app.use(bodyParser.json());

// MYSQL VEZA
const connection = mysql.createConnection({
  host: 'ucka.veleri.hr',
  user: 'dmudric',
  password: '11',
  database: 'dmudric',
});

// VEZA S BAZOM PODATAKA
connection.connect((err) => {
  if (err) {
    console.error('Greška u povezivanju sa bazom:', err);
  } else {
    console.log('Povezano sa bazom podataka!');
  }
});

////ENDPOINTI ZA ADMINA:-------------------------------------------------------------------------------------------


// ENDPOINT POPIS KORISNIKA
app.get("/api/korisnici", (request, response) => {
  connection.query("SELECT * FROM Korisnik", (error, results) => {
    if (error) {
      console.error('Error querying database:', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
    response.send(results);
  });
});

// ENDPOINT LogIn korisnika
app.get('/api/login', (req, res) => {
  const { ID_korisnika, Lozinka_korisnika } = req.query;
  console.log('ID_korisnika:', ID_korisnika, 'Lozinka_korisnika:', Lozinka_korisnika);

  const query = 'SELECT Ime_korisnika, Prezime_korisnika FROM Korisnik WHERE ID_korisnika = ? AND Lozinka_korisnika = ?';
  connection.query(query, [ID_korisnika, Lozinka_korisnika], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ error: 'Greška pri prijavi korisnika' });
    }

    if (results.length > 0) {
      const korisnik = results[0];
      res.json({
        success: true,
        message: `Uspješno ste logirani! Ime i prezime: ${korisnik.Ime_korisnika} ${korisnik.Prezime_korisnika}`
      });
    } else {
      res.status(404).json({ error: 'Neispravan ID ili lozinka.' });
    }
  });
});
// ENDPOINT ZA DOHVAT KOMENTAA
app.get('/api/zahtjevi', (req, res) => {
  const zahtjev = req.query.adminId;
  const query = `SELECT * FROM ZahtjeviZaAdmina`

  connection.query(query, [], (err, results) => {
    if (err) {
      console.error('Error during query execution:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});
// ENDPOINT ZA OBJAVU KOMENTARA

app.post('/api/zahtjev', (req, res) => {
  const { zahtjev } = req.body;

  if (!zahtjev || zahtjev.trim() === '') {
    return res.status(400).json({ error: 'Zahtjev ne može biti prazan.' });
  }

  const query = 'INSERT INTO ZahtjeviZaAdmina (Zahtjev) VALUES (?)';
  connection.query(query, [zahtjev], (err, results) => {
    if (err) {
      console.error('Greška pri dodavanju zahtjeva:', err);
      res.status(500).json({ error: 'Greška pri slanju poruke' });
    } else {
      res.status(200).json({ insertId: results.insertId, message: 'Poruka zabilježena' });
    }
  });
});


//ENDPOINT ZA BRISANJE KOMENTARA
app.delete('/api/zahtjev/:ID_Zahtjeva', (req, res) => {
  const ID_Zahtjeva = req.params.ID_Zahtjeva;

  const query = 'DELETE FROM ZahtjeviZaAdmina WHERE ID_Zahtjeva = ?';
  connection.query(query, [ID_Zahtjeva], (err, results) => {
    if (err) {
      console.error('Greška prilikom brisanja korisnika:', err);
      return res.status(500).json({ error: 'Greška prilikom brisanja korisnika' });
    }
    res.json({ message: 'Zahtjev uspješno obrisan' });
  });
});


// ENDPOINT POPIS NARUDŽBA
app.get("/api/narudzbe", (request, response) => {
  connection.query("SELECT * FROM Kosarica", (error, results) => {
    if (error) {
      console.error('Error querying database:', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
    response.send(results);
  });
});

// ENDPOINT LogIn admina
app.get('/Admin', (req, res) => {
  const adminId = req.query.adminId;
  const query = `SELECT EXISTS(SELECT * FROM Admin WHERE ID_admina = ?) AS id_exists;`

  connection.query(query, [adminId], (err, results) => {
    if (err) {
      console.error('Error during query execution:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});


//ENDPOINT DODAJ KORISNIKA
app.post('/api/Korisnik', (req, res) => {
  const { ime, prezime, email, lozinka, adresa, telefon } = req.body;
  const query = `INSERT INTO Korisnik (Ime_korisnika, Prezime_korisnika, Email_korisnika,Lozinka_korisnika, Adresa_korisnika, Kontakt_korisnika) VALUES (?, ?, ?, ?, ?, ?)`;

  connection.query(query, [ime, prezime, email, lozinka, adresa, telefon], (err, results) => {
    if (err) {
      console.error('Greška pri dodavanju korisnika:', err);
      res.status(500).json({ error: 'Greška pri dodavanju korisnika' });
    } else {
      res.status(200).json({ id: results.insertId, message: 'Korisnik uspješno dodan' });
    }
  });
});


// API za brisanje korisnika
app.delete('/api/Korisnik/:ID_korisnika', (req, res) => {
  const ID_korisnika = req.params.ID_korisnika;

  const query = 'DELETE FROM Korisnik WHERE ID_korisnika = ?';
  connection.query(query, [ID_korisnika], (err, results) => {
    if (err) {
      console.error('Greška prilikom brisanja korisnika:', err);
      return res.status(500).json({ error: 'Greška prilikom brisanja korisnika' });
    }
    res.json({ message: 'Korisnik uspješno obrisan' });
  });
});


// Backend API za dodavanje biljke
app.post("/api/Biljka", (req, res) => {
  const { naziv, vrsta, opis, kolicina, cijena } = req.body;
  const query = `INSERT INTO Biljka (nazivBiljke, vrstaBiljke, opisBiljke, dostupnaKolicina, cijena) VALUES (?, ?, ?, ?, ?)`;

  connection.query(query, [naziv, vrsta, opis, kolicina, cijena], (err, results) => {
    if (err) {
      console.error('Greška prilikom dodavanja biljke:', err);
      res.status(500).json({ error: 'Greška prilikom dodavanja biljke' });
    } else {
      res.status(200).json({ id: results.insertId, message: 'Biljka uspješno dodana' });
    }
  });
});


// ENDPOINT - Brisanje biljke prema ID-u
app.delete("/api/biljke/:sifraBiljke", (req, res) => {
  const { sifraBiljke } = req.params;
  const query = 'DELETE FROM Biljka WHERE sifraBiljke = ?';

  connection.query(query, [sifraBiljke], (err, results) => {
    if (err) {
      console.error('Greška prilikom brisanja biljke:', err);
      return res.status(500).json({ error: 'Greška prilikom brisanja biljke' });
    }
    res.json({ message: 'Biljka uspješno obrisana' });
  });
});

// ENDPOINT - dodavanje narudzbe

app.post("/api/dodavanjenarudzbe", (req, res) => {
  const { nazivBiljke, velicinaBiljke, kolicina, ID_korisnika, sifraBiljke } = req.body;

  const query = `
    INSERT INTO Kosarica (nazivBiljke, velicinaBiljke, kolicina, ID_korisnika, sifraBiljke)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(query, [nazivBiljke, velicinaBiljke, kolicina, ID_korisnika, sifraBiljke], (err, results) => {
    if (err) {
      console.error('Greška prilikom dodavanja narudžbe:', err);
      return res.status(500).json({ error: 'Greška prilikom dodavanja narudžbe' });
    }

    res.status(201).json({
      message: 'Narudžba uspješno dodana',
      narudzbaId: results.insertId
    });
  });
});



// ENDPOINT - Brisanje narudžbe prema ID-u
app.delete("/api/brisanjenarudzbe/:ID_Kosarice", (req, res) => {
  const ID_Kosarice = req.params.ID_Kosarice;
  const query = 'DELETE FROM Kosarica WHERE ID_Kosarice = ?';

  connection.query(query, [ID_Kosarice], (err, results) => {
    if (err) {
      console.error('Greška prilikom brisanja narudžbe:', err);
      return res.status(500).json({ error: 'Greška prilikom brisanja narudžbe' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Narudžba nije pronađena' });
    }
    res.json({ message: 'Narudžba uspješno obrisana' });
  });
});




///KRAJ ADMINA--------------------------------------------------------------------------------------------------------------------------
// OVO JE OR MOBLINIH API
//LOG IN ****
app.post("/api/prijava", async (req, res) => {
  const { Email_korisnika, Lozinka_korisnika } = req.body;
  if (!Email_korisnika || !Lozinka_korisnika) {
    return res.status(400).send("Molimo unesite email i lozinku.");
  }

  const query =
    "SELECT ID_korisnika, Ime_korisnika, Prezime_korisnika, Email_korisnika, Lozinka_korisnika, Adresa_korisnika, Kontakt_korisnika FROM Korisnik WHERE Email_korisnika = ? AND Lozinka_korisnika = ?";
  connection.query(query, [Email_korisnika, Lozinka_korisnika], (err, results) => {
    if (err) {
      console.error("Greška u bazi:", err);
      return res.status(500).send("Greška u bazi podataka.");
    }

    if (results.length > 0) {
      res.status(200).send({ message: "Uspješan login!", korisnik: results[0] });
    } else {
      res.status(401).send("Neispravan email ili lozinka.");
    }
  });
});


// ENDPOINT za dohvat svih biljaka***
app.get("/api/biljke", (req, res) => {
  const { searchQuery, searchByCategory, searchByName } = req.query;

  let query = "SELECT * FROM Biljka WHERE 1=1";
  const params = [];

  if (searchQuery) {
    if (searchByCategory === "true") {
      query += " AND vrstaBiljke LIKE ?";
      params.push(`%${searchQuery}%`);
    }
    if (searchByName === "true") {
      query += " AND nazivBiljke LIKE ?";
      params.push(`%${searchQuery}%`);
    }
  }

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error("Greška prilikom pretrage biljaka:", error);
      return res.status(500).json({ error: "Greška prilikom pretrage biljaka" });
    }

    const transformedResults = results.map((biljka) => ({
      ...biljka,
      slikaBiljke: biljka.slikaBiljke
        ? Buffer.from(biljka.slikaBiljke, 'hex').toString('utf-8')
        : null,
    }));

    res.json(transformedResults);
  });
});

//ENDPOINT ZA DOHVAT 1 BILJE****
app.get('/api/biljke/:nazivBiljke', (req, res) => {
  const nazivBiljke = req.params.nazivBiljke;
  connection.query('SELECT * FROM Biljka WHERE nazivBiljke = ?', [nazivBiljke], (error, results) => {
    if (error) {
      res.status(500).send('Database error');
    } else if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('Plant not found');
    }
  });
});



// ENDPOINT 18 za dobivanje narudžbi korisnika s detaljima o biljkama,korisnik i narudzbi
app.get('/NarudzbeKorisnika/:korisnikId', (req, res) => {
  const korisnikId = req.params.korisnikId;
  const query = `
    SELECT k.*, b.nazivBiljke, b.vrstaBiljke, b.opisBiljke
    FROM Kosarica k
    JOIN Biljka b ON k.sifraBiljke = b.sifraBiljke
    WHERE k.ID_korisnika = ?;
  `;
  connection.query(query, [korisnikId], (err, results) => {
    if (err) {
      console.error('Greška tokom izvođenja query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

///KRAJ ADMINA--------------------------------------------------------------------------------------------------------------------------

// Middleware za obradu grešaka
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Greska u povezanosti!');
});

// Dodajte ove dvije linije na KRAJ vaše API datoteke
// Ovo omogućuje Jestu da uveze 'app' objekt bez pokretanja servera
module.exports = app;

// Opcionalno: Pokrenite server samo ako se datoteka pokreće direktno
if (require.main === module) {
  const port = 3000; // Definirajte port ovdje
  app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
  });
}