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