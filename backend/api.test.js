const request = require('supertest');
const express = require('express');
const mysql = require('mysql');

const mockConnection = {
  query: jest.fn(),
  connect: jest.fn((cb) => cb()),
  end: jest.fn(),
};

jest.mock('mysql', () => ({
  createConnection: jest.fn(() => mockConnection),
}));

const normalizeSql = (sql) => sql.replace(/\s+/g, ' ').trim();

const app = require('./Plantie');

let server;

describe('API Endpoints', () => {
  beforeAll((done) => {
    server = app.listen(0, () => {
      done();
    });
  });

  afterAll((done) => {
    server.close(() => {
      if (mockConnection.end.mock.calls.length === 0) {
        mockConnection.end();
      }
      done();
    });
  });

  beforeEach(() => {
    mockConnection.query.mockReset();
  });

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
      callback(null, []);
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

  test('POST /api/dodavanjenarudzbe should add a new order', async () => {
    const newOrder = {
      nazivBiljke: 'Ruža',
      velicinaBiljke: 'mala',
      kolicina: 1,
      ID_korisnika: 1,
      sifraBiljke: 10
    };
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
      const normalizedSql = normalizeSql(sql);
      const expectedNormalizedSql = normalizeSql('INSERT INTO Kosarica (nazivBiljke, velicinaBiljke, kolicina, ID_korisnika, sifraBiljke) VALUES (?, ?, ?, ?, ?)');

      if (normalizedSql === expectedNormalizedSql &&
        JSON.stringify(params) === JSON.stringify([newOrder.nazivBiljke, newOrder.velicinaBiljke, newOrder.kolicina, newOrder.ID_korisnika, newOrder.sifraBiljke])) {
        callback(null, {
          insertId: 401
        });
      } else {
        callback(new Error('SQL mismatch in mock'));
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
    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.any(String),
      [newOrder.nazivBiljke, newOrder.velicinaBiljke, newOrder.kolicina, newOrder.ID_korisnika, newOrder.sifraBiljke],
      expect.any(Function)
    );
  });

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

  test('GET /api/biljke should return plants with search query', async () => {
    const mockPlants = [{
      sifraBiljke: 1,
      nazivBiljke: 'Ruža',
      vrstaBiljke: 'Cvjetna',
      slikaBiljke: Buffer.from('https://example.com/rose.jpg').toString('hex')
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

  test('GET /NarudzbeKorisnika/:korisnikId should return user orders with plant details', async () => {
    const mockUserOrders = [{
      ID_Kosarice: 1,
      nazivBiljke: 'Orhideja',
      vrstaBiljke: 'Cvjetnica',
      opisBiljke: 'Egzotična biljka'
    }];
    mockConnection.query.mockImplementationOnce((sql, params, callback) => {
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
    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.any(String),
      ['1'],
      expect.any(Function)
    );
  });
});