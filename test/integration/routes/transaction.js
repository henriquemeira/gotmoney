'use strict';

const sinon = require('sinon');
const supertest = require('supertest');
const expect = require('chai').expect;
const app = require('../../../app');
const Account = require('../../../controllers/account');
const User = require('../../../controllers/user');
const mock_middleware = require('../../mock_middleware');
const sandbox = sinon.sandbox.create();
const request = supertest(app);
const payloadBase = {
  iduser: 1,
  idtransaction: 1,
  idaccount: 1,
  idparent: null,
  idstatus: 1,
  description: 'Node Unit Test',
  instalment: '1/1',
  amount: 123.45,
  type: 'D',
  startdate: new Date(),
  duedate: new Date(),
  tag: null,
  origin: 'W',
  lastchange: 14
};
const payloadBaseAccount = {
  iduser: 1,
  idaccount: 1,
  idtype: 3,
  description: 'Node Unit Test',
  creditlimit: 5,
  balance: 6,
  openingdate: new Date().toJSON(),
  duedate: 8,
  lastchange: 9
};

describe('Routing Transaction', () => {
  before(() => {
    sandbox.stub(mock_middleware.getMiddleware('authenticate'), 'handle').callsFake(mock_middleware.authenticate);
    sandbox.stub(mock_middleware.getMiddleware('csrf'), 'handle').callsFake((req, res, next) => next());
    const user = new User(payloadBase);
    return user.create()
      .then(() => {
        const account = new Account(payloadBaseAccount);
        return account.create();
      })
      .catch((err) => err);
  });

  after(() => {
    sandbox.restore();
    const user = new User(payloadBase);
    return user.create()
      .then(() => {
        const account = new Account(payloadBaseAccount);
        return account.delete();
      })
      .catch((err) => err);
  });

  describe('POST /api/transaction', () => {
    it('should create transaction', (done) => {
      const payload = {data: [payloadBase]};
      request.post('/api/transaction')
        .send(payload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(201, done);
    });

    it('should fail when create transaction', (done) => {
      const payload = {data: [Object.assign({}, payloadBase)]};
      payload.data[0].description = null;
      request.post('/api/transaction')
        .send(payload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .end((err, res) => {
          expect(res.body).to.be.an('object')
            .and.to.have.deep.property('message', 'Invalid data!');
          expect(res.body).to.have.deep.property('error');
          if (err) return done(err);
          done();
        });
    });

    it('should fail when create transaction, payload is not an Array', (done) => {
      request.post('/api/transaction')
        .send({})
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .end((err, res) => {
          expect(res.body).to.be.an('object')
            .and.to.have.deep.property('message', 'Invalid data!');
          expect(res.body).to.have.deep.property('error');
          if (err) return done(err);
          done();
        });
    });
  });

  describe('GET /api/transaction', () => {
    it('should get categories', (done) => {
      request.get('/api/transaction')
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.be.an('array').that.is.not.empty;
          done();
        });
    });
  });

  describe('PUT /api/transaction/:id', () => {
    it('should update transaction', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.description += new Date().getTime();
      request.put('/api/transaction/' + payload.idtransaction)
        .send(payload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200, done);
    });

    it('should fail when update transaction', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.description = null;
      request.put('/api/transaction/' + payload.idtransaction)
        .send(payload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .end((err, res) => {
          expect(res.body).to.be.an('object')
            .and.to.have.deep.property('message', 'Invalid data!');
          expect(res.body).to.have.deep.property('error');
          if (err) return done(err);
          done();
        });
    });

    it('should not find transaction to update', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.idtransaction = 999999999;
      request.put('/api/transaction/' + payload.idtransaction)
        .send(payload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(404, done);
    });
  });

  describe('DELETE /api/transaction/:id', () => {
    it('should delete transaction', (done) => {
      request.delete('/api/transaction/' + payloadBase.idtransaction)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200, done);
    });

    it('should not find transaction to delete', (done) => {
      request.post('/api/transaction/' + 'A')
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(404, done);
    });
  });
});
