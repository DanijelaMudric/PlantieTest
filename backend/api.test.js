const request = require('supertest');
const express = require('express');
const mysql = require('mysql');

// Kreirajte mock MySQL vezu
const mockConnection = {
  query: jest.fn(), // Mockirajte funkciju query
  connect: jest.fn((cb) => cb()), // Odmah pozovite callback
  end: jest.fn(),
};

// Zamijenite stvarnu MySQL vezu s mock vezom za testove
jest.mock('mysql', () => ({
  createConnection: jest.fn(() => mockConnection),
}));

// *** KLJUČNO: POMOĆNA FUNKCIJA ZA NORMALIZACIJU SQL STRINGA ***
// Ova funkcija zamjenjuje više razmaka (uključujući nove redove) jednim razmakom
// i uklanja vodeće/prateće razmake.
const normalizeSql = (sql) => sql.replace(/\s+/g, ' ').trim();
// ***************************************************************

// Uvezite vaš API (Express aplikaciju)
const app = require('./Plantie'); // Pretpostavljamo da se vaš API nalazi u 'Plantie.js'

let server; // Deklarirajte server varijablu za zatvaranje

describe('API Endpoints', () => {
  beforeAll((done) => {
    // Pokrenite test server na slobodnom portu
    server = app.listen(0, () => { // Korištenje porta 0 omogućava Expressu da pronađe slobodan port
      done();
    });
  });

  afterAll((done) => {
    // Zatvorite test server nakon svih testova
    server.close(() => {
      // Zatvorite mock MySQL vezu
      if (mockConnection.end.mock.calls.length === 0) {
        mockConnection.end();
      }
      done();
    });
  });

  beforeEach(() => {
    // Resetirajte mockove prije svakog testa
    mockConnection.query.mockReset();
  });

  // Test za dohvat svih korisnika
  test('GET /api/korisnici should return all users', async () => {
    const mockUsers = [{
      ID_korisnika: 1,
      Ime_korisnika: 'Pero',
      Prezime_korisnika: 'Peric'
    }, {
      ID_korisnika: 2,
      Ime_korisnika: 'Ana',
      Prezime_korisnika: 'Anic'
    }];
    mockConnection.query.mockImplementationOnce((sql, callback) => {
      callback(null, mockUsers);
    });

    const res = await request(app).get('/api/korisnici');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(mockUsers);
    expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM Korisnik', expect.any(Function));
  });

  // Test za prijavu korisnika (GET /api/login)
  test('GET /api/login with valid credentials should return success', async () => {
    const mockUser = [{
      Ime_korisnika: 'Test',
      Prezime_korisnika: 'User'
    }];
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, mockUser);
    });

    const res = await request(app)
      .get('/api/login')
      .query({
        ID_korisnika: 'testId',
        Lozinka_korisnika: 'testPass'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      success: true,
      message: 'Uspješno ste logirani! Ime i prezime: Test User'
    });
    expect(mockConnection.query).toHaveBeenCalledWith(
      'SELECT Ime_korisnika, Prezime_korisnika FROM Korisnik WHERE ID_korisnika = ? AND Lozinka_korisnika = ?', ['testId', 'testPass'],
      expect.any(Function)
    );
  });

  test('GET /api/login with invalid credentials should return 404', async () => {
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, []); // Prazan rezultat za neuspješnu prijavu
    });

    const res = await request(app)
      .get('/api/login')
      .query({
        ID_korisnika: 'wrongId',
        Lozinka_korisnika: 'wrongPass'
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      error: 'Neispravan ID ili lozinka.'
    });
  });

  // Test za dohvat zahtjeva za admina
  test('GET /api/zahtjevi should return admin requests', async () => {
    const mockRequests = [{
      ID_Zahtjeva: 1,
      Zahtjev: 'Test zahtjev 1'
    }, {
      ID_Zahtjeva: 2,
      Zahtjev: 'Test zahtjev 2'
    }];
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, mockRequests);
    });

    const res = await request(app).get('/api/zahtjevi?adminId=123');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(mockRequests);
    expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM ZahtjeviZaAdmina', [], expect.any(Function));
  });

  // Test za objavu komentara (POST /api/zahtjev)
  test('POST /api/zahtjev should add a new request', async () => {
    const newRequest = {
      zahtjev: 'Novi test zahtjev'
    };
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, {
        insertId: 101
      });
    });

    const res = await request(app)
      .post('/api/zahtjev')
      .send(newRequest);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      insertId: 101,
      message: 'Poruka zabilježena'
    });
    expect(mockConnection.query).toHaveBeenCalledWith(
      'INSERT INTO ZahtjeviZaAdmina (Zahtjev) VALUES (?)', [newRequest.zahtjev],
      expect.any(Function)
    );
  });

  test('POST /api/zahtjev with empty request should return 400', async () => {
    const newRequest = {
      zahtjev: ''
    };
    const res = await request(app)
      .post('/api/zahtjev')
      .send(newRequest);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: 'Zahtjev ne može biti prazan.'
    });
    expect(mockConnection.query).not.toHaveBeenCalled(); // Nema poziva bazi
  });

  // Test za brisanje komentara (DELETE /api/zahtjev/:ID_Zahtjeva)
  test('DELETE /api/zahtjev/:ID_Zahtjeva should delete a request', async () => {
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, {
        affectedRows: 1
      });
    });

    const res = await request(app).delete('/api/zahtjev/123');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      message: 'Zahtjev uspješno obrisan'
    });
    expect(mockConnection.query).toHaveBeenCalledWith(
      'DELETE FROM ZahtjeviZaAdmina WHERE ID_Zahtjeva = ?', ['123'],
      expect.any(Function)
    );
  });

  // Test za dohvat svih narudžbi
  test('GET /api/narudzbe should return all orders', async () => {
    const mockOrders = [{
      ID_Kosarice: 1,
      nazivBiljke: 'Ruža',
      kolicina: 2
    }];
    mockConnection.query.mockImplementationOnce((sql, callback) => {
      callback(null, mockOrders);
    });

    const res = await request(app).get('/api/narudzbe');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(mockOrders);
    expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM Kosarica', expect.any(Function));
  });

  // Test za dodavanje korisnika
  test('POST /api/Korisnik should add a new user', async () => {
    const newUser = {
      ime: 'Novi',
      prezime: 'Korisnik',
      email: 'novi@example.com',
      lozinka: 'password123',
      adresa: 'Neka ulica 1',
      telefon: '123-456-7890'
    };
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, {
        insertId: 201
      });
    });

    const res = await request(app)
      .post('/api/Korisnik')
      .send(newUser);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      id: 201,
      message: 'Korisnik uspješno dodan'
    });
    expect(mockConnection.query).toHaveBeenCalledWith(
      'INSERT INTO Korisnik (Ime_korisnika, Prezime_korisnika, Email_korisnika,Lozinka_korisnika, Adresa_korisnika, Kontakt_korisnika) VALUES (?, ?, ?, ?, ?, ?)', [newUser.ime, newUser.prezime, newUser.email, newUser.lozinka, newUser.adresa, newUser.telefon],
      expect.any(Function)
    );
  });

  // Test za brisanje korisnika
  test('DELETE /api/Korisnik/:ID_korisnika should delete a user', async () => {
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, {
        affectedRows: 1
      });
    });

    const res = await request(app).delete('/api/Korisnik/456');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      message: 'Korisnik uspješno obrisan'
    });
    expect(mockConnection.query).toHaveBeenCalledWith(
      'DELETE FROM Korisnik WHERE ID_korisnika = ?', ['456'],
      expect.any(Function)
    );
  });

  // Test za dodavanje biljke
  test('POST /api/Biljka should add a new plant', async () => {
    const newPlant = {
      naziv: 'Nova Biljka',
      vrsta: 'Cvjetna',
      opis: 'Lijepa i mirisna',
      kolicina: 50,
      cijena: 15.99
    };
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, {
        insertId: 301
      });
    });

    const res = await request(app)
      .post('/api/Biljka')
      .send(newPlant);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      id: 301,
      message: 'Biljka uspješno dodana'
    });
    expect(mockConnection.query).toHaveBeenCalledWith(
      'INSERT INTO Biljka (nazivBiljke, vrstaBiljke, opisBiljke, dostupnaKolicina, cijena) VALUES (?, ?, ?, ?, ?)', [newPlant.naziv, newPlant.vrsta, newPlant.opis, newPlant.kolicina, newPlant.cijena],
      expect.any(Function)
    );
  });

  // Test za brisanje biljke
  test('DELETE /api/biljke/:sifraBiljke should delete a plant', async () => {
    
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {

      callback(null, {
        affectedRows: 1
      });
    });

    const res = await request(app).delete('/api/biljke/789');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      message: 'Biljka uspješno obrisana'
    });
    expect(mockConnection.query).toHaveBeenCalledWith(
      'DELETE FROM Biljka WHERE sifraBiljke = ?', ['789'],
      expect.any(Function)
    );
  });

  // Test za dodavanje narudžbe
  test('POST /api/dodavanjenarudzbe should add a new order', async () => {
    const newOrder = {
      nazivBiljke: 'Ruža',
      velicinaBiljke: 'mala',
      kolicina: 1,
      ID_korisnika: 1,
      sifraBiljke: 10
    };
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      // Normaliziramo SQL string unutar mock implementacije
      const normalizedSql = normalizeSql(sql);
      const expectedNormalizedSql = normalizeSql('INSERT INTO Kosarica (nazivBiljke, velicinaBiljke, kolicina, ID_korisnika, sifraBiljke) VALUES (?, ?, ?, ?, ?)');

      if (normalizedSql === expectedNormalizedSql &&
        JSON.stringify(params) === JSON.stringify([newOrder.nazivBiljke, newOrder.velicinaBiljke, newOrder.kolicina, newOrder.ID_korisnika, newOrder.sifraBiljke])) {
        callback(null, {
          insertId: 401
        });
      } else {
        callback(new Error('SQL mismatch in mock')); // Ako se ne podudaraju, prijavite grešku
      }
    });

    const res = await request(app)
      .post('/api/dodavanjenarudzbe')
      .send(newOrder);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      message: 'Narudžba uspješno dodana',
      narudzbaId: 401
    });
    // Ovdje više ne koristimo expect.stringContaining, već uspoređujemo primljeni SQL
    // direktno s očekivanim SQL-om (koji je također normaliziran)
    // Jest automatski uspoređuje argumente kada se pozove toHaveBeenCalledWith,
    // a mi smo obradu normalizacije prebacili u mockImplementation.
    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.any(String), // Očekujemo bilo koji string za SQL, jer je provjera premještena unutar mocka
      [newOrder.nazivBiljke, newOrder.velicinaBiljke, newOrder.kolicina, newOrder.ID_korisnika, newOrder.sifraBiljke],
      expect.any(Function)
    );
  });

  // Test za brisanje narudžbe
  test('DELETE /api/brisanjenarudzbe/:ID_Kosarice should delete an order', async () => {
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, {
        affectedRows: 1
      });
    });

    const res = await request(app).delete('/api/brisanjenarudzbe/501');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      message: 'Narudžba uspješno obrisana'
    });
    expect(mockConnection.query).toHaveBeenCalledWith(
      'DELETE FROM Kosarica WHERE ID_Kosarice = ?', ['501'],
      expect.any(Function)
    );
  });

  test('DELETE /api/brisanjenarudzbe/:ID_Kosarice should return 404 if order not found', async () => {
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, {
        affectedRows: 0
      });
    });

    const res = await request(app).delete('/api/brisanjenarudzbe/999');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      message: 'Narudžba nije pronađena'
    });
  });

  // Test za prijavu korisnika (POST /api/prijava)
  test('POST /api/prijava with valid credentials should return success', async () => {
    const mockUser = [{
      ID_korisnika: 1,
      Ime_korisnika: 'Mobile',
      Prezime_korisnika: 'User',
      Email_korisnika: 'mobile@example.com',
      Lozinka_korisnika: 'mobilepass',
      Adresa_korisnika: 'Mobile Adresa',
      Kontakt_korisnika: '111-222-333'
    }];
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, mockUser);
    });

    const res = await request(app)
      .post('/api/prijava')
      .send({
        Email_korisnika: 'mobile@example.com',
        Lozinka_korisnika: 'mobilepass'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      message: "Uspješan login!",
      korisnik: mockUser[0]
    });
    expect(mockConnection.query).toHaveBeenCalledWith(
      'SELECT ID_korisnika, Ime_korisnika, Prezime_korisnika, Email_korisnika, Lozinka_korisnika, Adresa_korisnika, Kontakt_korisnika FROM Korisnik WHERE Email_korisnika = ? AND Lozinka_korisnika = ?', ['mobile@example.com', 'mobilepass'],
      expect.any(Function)
    );
  });

  test('POST /api/prijava with missing credentials should return 400', async () => {
    const res = await request(app)
      .post('/api/prijava')
      .send({
        Email_korisnika: 'mobile@example.com'
      }); // Missing password

    expect(res.statusCode).toEqual(400);
    expect(res.text).toEqual('Molimo unesite email i lozinku.');
  });

  // Test za dohvat svih biljaka s pretraživanjem
  test('GET /api/biljke should return plants with search query', async () => {
    const mockPlants = [{
      sifraBiljke: 1,
      nazivBiljke: 'Ruža',
      vrstaBiljke: 'Cvjetna',
      slikaBiljke: Buffer.from('https://example.com/rose.jpg').toString('hex') // Mockirajte hex string
    }];
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, mockPlants);
    });

    const res = await request(app).get('/api/biljke?searchQuery=Ruža&searchByName=true');
    expect(res.statusCode).toEqual(200);
    expect(res.body[0].nazivBiljke).toEqual('Ruža');
    expect(res.body[0].slikaBiljke).toEqual('https://example.com/rose.jpg');
    expect(mockConnection.query).toHaveBeenCalledWith(
      'SELECT * FROM Biljka WHERE 1=1 AND nazivBiljke LIKE ?', ['%Ruža%'],
      expect.any(Function)
    );
  });

  // Test za dohvat jedne biljke po nazivu
  test('GET /api/biljke/:nazivBiljke should return a single plant', async () => {
    const mockPlant = [{
      sifraBiljke: 1,
      nazivBiljke: 'Ruža',
      vrstaBiljke: 'Cvjetna'
    }];
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, mockPlant);
    });

    const res = await request(app).get('/api/biljke/Ruža');
    expect(res.statusCode).toEqual(200);
    expect(res.body.nazivBiljke).toEqual('Ruža');
    expect(mockConnection.query).toHaveBeenCalledWith(
      'SELECT * FROM Biljka WHERE nazivBiljke = ?', ['Ruža'],
      expect.any(Function)
    );
  });

  test('GET /api/biljke/:nazivBiljke should return 404 if plant not found', async () => {
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      callback(null, []);
    });

    const res = await request(app).get('/api/biljke/NepostojecaBiljka');
    expect(res.statusCode).toEqual(404);
    expect(res.text).toEqual('Plant not found');
  });

  // Test za dobivanje narudžbi korisnika s detaljima o biljkama
  test('GET /NarudzbeKorisnika/:korisnikId should return user orders with plant details', async () => {
    const mockUserOrders = [{
      ID_Kosarice: 1,
      nazivBiljke: 'Orhideja',
      vrstaBiljke: 'Cvjetnica',
      opisBiljke: 'Egzotična biljka'
    }];
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      // Normaliziramo SQL string unutar mock implementacije
      const normalizedSql = normalizeSql(sql);
      const expectedNormalizedSql = normalizeSql('SELECT k.*, b.nazivBiljke, b.vrstaBiljke, b.opisBiljke FROM Kosarica k JOIN Biljka b ON k.sifraBiljke = b.sifraBiljke WHERE k.ID_korisnika = ?;');

      if (normalizedSql === expectedNormalizedSql &&
        JSON.stringify(params) === JSON.stringify(['1'])) {
        callback(null, mockUserOrders);
      } else {
        callback(new Error('SQL mismatch in mock'));
      }
    });

    const res = await request(app).get('/NarudzbeKorisnika/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(mockUserOrders);
    // Ovdje više ne koristimo expect.stringContaining, već uspoređujemo primljeni SQL
    // direktno s očekivanim SQL-om (koji je također normaliziran)
    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.any(String), // Očekujemo bilo koji string za SQL, jer je provjera premještena unutar mocka
      ['1'],
      expect.any(Function)
    );
  });
});