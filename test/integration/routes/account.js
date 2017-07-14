'use strict';

const sinon = require('sinon');
const supertest = require('supertest');
const expect = require('chai').expect;
const app = require('../../../app');
const User = require('../../../controllers/user');
const mock_middleware = require('../../mock_middleware');
const sandbox = sinon.sandbox.create();
const agent = supertest.agent(app);
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

function getCSRFToken() {
  return new Promise((resolve, reject) => {
    agent.get('/api/session/token')
      .expect(200)
      .end((err, res) => {
        if (err) return reject(err);
        resolve(res.body.csrfToken);
      });
  });
}

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
      agent.get('/api/session/token')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const csrfToken = res.body.csrfToken;
          agent.post('/api/account')
            .send(payloadBase)
            .set('x-csrf-token', csrfToken)
            .set('Accept', 'application/json')
            .expect('Content-Type', /application\/json/)
            .expect(201, done);
        });
    });

    it('should fail when create account', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.description = null;
      agent.get('/api/session/token')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const csrfToken = res.body.csrfToken;
          agent.post('/api/account')
            .send(payload)
            .set('x-csrf-token', csrfToken)
            .set('Accept', 'application/json')
            .expect('Content-Type', /application\/json/)
            .expect(400)
            .end((err, res) => {
              expect(res.body).to.be.an('object')
                .and.to.have.nested.property('message', 'Invalid data!');
              expect(res.body).to.have.nested.property('error');
              if (err) return done(err);
              done();
            });
        });
    });
  });

  describe('GET /api/account', () => {
    it('should get accounts', (done) => {
      agent.get('/api/account')
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
      getCSRFToken()
        .then((csrfToken) => {
          agent.put('/api/account/' + payload.idaccount)
            .send(payload)
            .set('x-csrf-token', csrfToken)
            .set('Accept', 'application/json')
            .expect('Content-Type', /application\/json/)
            .expect(200, done);
        })
        .catch((err) => done(err));
    });

    it('should fail when update account', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.description = null;
      getCSRFToken()
        .then((csrfToken) => {
          agent.put('/api/account/' + payload.idaccount)
            .send(payload)
            .set('x-csrf-token', csrfToken)
            .set('Accept', 'application/json')
            .expect('Content-Type', /application\/json/)
            .expect(400)
            .end((err, res) => {
              expect(res.body).to.be.an('object')
                .and.to.have.nested.property('message', 'Invalid data!');
              expect(res.body).to.have.nested.property('error');
              if (err) return done(err);
              done();
            });
        })
        .catch((err) => done(err));
    });

    it('should not find account to update', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.idaccount = 999999999;
      getCSRFToken()
        .then((csrfToken) => {
          agent.put('/api/account/' + payload.idaccount)
            .send(payload)
            .set('x-csrf-token', csrfToken)
            .set('Accept', 'application/json')
            .expect('Content-Type', /application\/json/)
            .expect(404, done);
        })
        .catch((err) => done(err));
    });
  });

  describe('DELETE /api/account/:id', () => {
    it('should delete account', (done) => {
      getCSRFToken()
        .then((csrfToken) => {
          agent.delete('/api/account/' + payloadBase.idaccount)
            .set('x-csrf-token', csrfToken)
            .set('Accept', 'application/json')
            .expect('Content-Type', /application\/json/)
            .expect(200, done);
        })
        .catch((err) => done(err));
    });

    it('should not find account to delete', (done) => {
      getCSRFToken()
        .then((csrfToken) => {
          agent.delete('/api/account/' + 'A')
            .set('x-csrf-token', csrfToken)
            .set('Accept', 'application/json')
            .expect('Content-Type', /application\/json/)
            .expect(404, done);
        })
        .catch((err) => done(err));
    });
  });
});
