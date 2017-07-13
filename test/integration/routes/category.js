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
  idcategory: 1,
  description: 'Node Unit Test ',
  lastchange: 4
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

describe('Routing Category', () => {
  before(() => {
    sandbox.stub(mock_middleware.getMiddleware('authenticate'), 'handle').callsFake(mock_middleware.authenticate);
    //sandbox.stub(mock_middleware.getMiddleware('csrf'), 'handle').callsFake((req, res, next) => next());
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

  describe('POST /api/category', () => {
    it('should create category', (done) => {
      getCSRFToken()
        .then((csrfToken) => {
          agent.post('/api/category')
            .send(payloadBase)
            .set('x-csrf-token', csrfToken)
            .set('Accept', 'application/json')
            .expect('Content-Type', /application\/json/)
            .expect(201, done);
        })
        .catch((err) => done(err));
    });

    it('should fail when create category', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.description = null;
      getCSRFToken()
        .then((csrfToken) => {
          agent.post('/api/category')
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
  });

  describe('GET /api/category', () => {
    it('should get categories', (done) => {
      agent.get('/api/category')
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

  describe('PUT /api/category/:id', () => {
    it('should update category', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.description += new Date().getTime();
      getCSRFToken()
        .then((csrfToken) => {
          agent.put('/api/category/' + payload.idcategory)
            .send(payload)
            .set('x-csrf-token', csrfToken)
            .set('Accept', 'application/json')
            .expect('Content-Type', /application\/json/)
            .expect(200, done);
        })
        .catch((err) => done(err));
    });

    it('should fail when update category', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.description = null;
      getCSRFToken()
        .then((csrfToken) => {
          agent.put('/api/category/' + payload.idcategory)
            .send(payload)
            .set('x-csrf-token', csrfToken)
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
        })
        .catch((err) => done(err));
    });

    it('should not find category to update', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.idcategory = 999999999;
      getCSRFToken()
        .then((csrfToken) => {
          agent.put('/api/category/' + payload.idcategory)
            .send(payload)
            .set('x-csrf-token', csrfToken)
            .set('Accept', 'application/json')
            .expect('Content-Type', /application\/json/)
            .expect(404, done);
        })
        .catch((err) => done(err));
    });
  });

  describe('DELETE /api/category/:id', () => {
    it('should delete category', (done) => {
      getCSRFToken()
        .then((csrfToken) => {
          agent.delete('/api/category/' + payloadBase.idcategory)
            .set('x-csrf-token', csrfToken)
            .set('Accept', 'application/json')
            .expect('Content-Type', /application\/json/)
            .expect(200, done);
        })
        .catch((err) => done(err));
    });

    it('should not find category to delete', (done) => {
      getCSRFToken()
        .then((csrfToken) => {
          agent.delete('/api/category/' + 'A')
            .set('x-csrf-token', csrfToken)
            .set('Accept', 'application/json')
            .expect('Content-Type', /application\/json/)
            .expect(404, done);
        })
        .catch((err) => done(err));
    });
  });
});
