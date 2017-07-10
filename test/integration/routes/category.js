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
  idcategory: 1,
  description: 'Node Unit Test ',
  lastchange: 4
};

describe('Routing Category', () => {
  before(() => {
    sandbox.stub(mock_middleware.getMiddleware('authenticate'), 'handle').callsFake(mock_middleware.authenticate);
    sandbox.stub(mock_middleware.getMiddleware('csrf'), 'handle').callsFake((req, res, next) => next());
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
      request.post('/api/category')
        .send(payloadBase)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(201, done);
    });

    it('should fail when create category', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.description = null;
      request.post('/api/category')
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

  describe('GET /api/category', () => {
    it('should get categories', (done) => {
      request.get('/api/category')
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
      request.put('/api/category/' + payload.idcategory)
        .send(payload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200, done);
    });

    it('should fail when update category', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.description = null;
      request.put('/api/category/' + payload.idcategory)
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

    it('should not find category to update', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.idcategory = 999999999;
      request.put('/api/category/' + payload.idcategory)
        .send(payload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(404, done);
    });
  });

  describe('DELETE /api/category/:id', () => {
    it('should delete category', (done) => {
      request.delete('/api/category/' + payloadBase.idcategory)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200, done);
    });

    it('should not find category to delete', (done) => {
      request.post('/api/category/' + 'A')
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(404, done);
    });
  });
});
