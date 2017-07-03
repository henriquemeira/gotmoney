'use strict';

const sinon = require('sinon');
const supertest = require('supertest');
const expect = require('chai').expect;
const app = require('../../../app');
const User = require('../../../controllers/user');
const mock_middleware = require('../../mock_middleware');
const sandbox = sinon.sandbox.create();
const request = supertest(app);
const payloadBase = {
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

describe('Routing Account', () => {
  before(() => {
    sandbox.stub(mock_middleware.getMiddleware('authenticate'), 'handle').callsFake(mock_middleware.authenticate);
    const user = new User(payloadBase);
    return user.create()
      .then(() => true)
      .catch((err) => err);
  });

  after(() => {
    sandbox.restore();
    const user = new User(payloadBase);
    return user.create()
      .then(() => true)
      .catch((err) => err);
  });

  describe('POST /api/account', () => {
    it('should create account', (done) => {
      request.post('/api/account')
        .send(payloadBase)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(201, done);
    });

    it('should fail when create account', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.description = null;
      request.post('/api/account')
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
  });

  describe('GET /api/account', () => {
    it('should get accounts', (done) => {
      request.get('/api/account')
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

  describe('PUT /api/account/:id', () => {
    it('should update account', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.description += new Date().getTime();
      request.put('/api/account/' + payload.idaccount)
        .send(payload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200, done);
    });

    it('should fail when update account', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.description = null;
      request.put('/api/account/' + payload.idaccount)
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

    it('should not find account to update', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.idaccount = 999999999;
      request.put('/api/account/' + payload.idaccount)
        .send(payload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(404, done);
    });
  });

  describe('DELETE /api/account/:id', () => {
    it('should delete account', (done) => {
      request.delete('/api/account/' + payloadBase.idaccount)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200, done);
    });

    it('should not find account to delete', (done) => {
      request.post('/api/account/' + 'A')
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(404, done);
    });
  });
});
