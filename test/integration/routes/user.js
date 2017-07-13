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
  name: 'Node Unit Test',
  gender: 'F',
  birthdate: new Date().toJSON(),
  email: 'node@test.com',
  createdon: new Date().toJSON(),
  passwd: '123456',
  alert: true,
  facebook: null,
  google: null,
  twitter: null,
  lastchange: null
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

describe('Routing User', () => {
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
    return user.delete()
      .then(() => true)
      .catch((err) => err);
  });

  describe('GET /api/user/:id', () => {
    it('should get user', (done) => {
      agent.get('/api/user/' + payloadBase.iduser)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          done();
        });
    });
  });

  describe('PUT /api/user/:id', () => {
    it('should update user', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.name += new Date().getTime();
      getCSRFToken()
        .then((csrfToken) => {
          agent.put('/api/user/' + payload.iduser)
            .send(payload)
            .set('x-csrf-token', csrfToken)
            .set('Accept', 'application/json')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .end((err, res) => {
              console.dir(res.text);
              if (err) return done(err);
              done();
            });
        })
        .catch((err) => done(err));
    });

    it('should fail when update user', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.name = null;
      getCSRFToken()
        .then((csrfToken) => {
          agent.put('/api/user/' + payload.iduser)
            .send(payload)
            .set('x-csrf-token', csrfToken)
            .set('Accept', 'application/json')
            .expect('Content-Type', /application\/json/)
            .expect(400)
            .end((err, res) => {
              console.dir(res.text);
              expect(res.body).to.be.an('object')
                .and.to.have.deep.property('message', 'Invalid data!');
              expect(res.body).to.have.deep.property('error');
              if (err) return done(err);
              done();
            });
        })
        .catch((err) => done(err));
    });
  });
});
