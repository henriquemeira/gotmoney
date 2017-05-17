'use strict';

const nodemailer = require('nodemailer');
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
  name: 'Node Unit Test',
  gender: 'F',
  birthdate: new Date().toJSON(),
  email: 'node@unit.test',
  passwd: '123456@ABC',
  alert: true,
  facebook: null,
  google: null,
  twitter: null,
  lastchange: 12
};

describe('Routing Session', () => {
  before(() => {
    const fakeSendEmailResolved = {
      sendMail: (data, callback) => {
        return Promise.resolve();
      }
    };

    sandbox.stub(nodemailer, 'createTransport').returns(fakeSendEmailResolved);
  });

  after(() => {
    sandbox.restore();
    const user = new User(payloadBase);
    return user.delete()
      .then(() => true)
      .catch((err) => err);
  });

  describe('POST /api/session/signup', () => {
    it('should signup a user', (done) => {
      request.post('/api/session/signup')
        .send(payloadBase)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(201)
        .end((err, res) => {
          console.dir(res.text);
          expect(res.body).to.be.an('object');
          if (err) return done(err);
          done();
        });
    });

    it('should fail when signup a user, email already exist', (done) => {
      request.post('/api/session/signup')
        .send(payloadBase)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(400, done);
    });

    it('should fail when signup a user', (done) => {
      const payload = Object.assign({}, payloadBase);
      payload.email = 'email';
      request.post('/api/session/signup')
        .send(payload)
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
    });
  });

  describe('POST /api/session/login', () => {
    it('should log in user', (done) => {
      request.post('/api/session/login')
        .send({
          email: payloadBase.email,
          passwd: payloadBase.passwd
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200, done);
    });

    it('should return user is not authenticated', (done) => {
      request.post('/api/session/login')
        .send({
          email: payloadBase.email,
          passwd: '1234567890ZZZ'
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(401, done);
    });
  });

  describe('PUT /api/session/recovery', () => {
    it('should update password', (done) => {
      request.put('/api/session/recovery')
        .send(payloadBase)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200, done);
    });

    it('should fail when update password', (done) => {
      request.put('/api/session/recovery')
        .send({email: 'xxxxx@xxxxx.xxxxx'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(404, done);
    });
  });

  describe('GET /api/session/loggedin', () => {
    before(() => {
      sandbox.stub(mock_middleware.getMiddleware('authenticate'), 'handle').callsFake(mock_middleware.authenticate);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return user is logged in', (done) => {
      request.get('/api/session/loggedin')
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200, done);
    });

    it('should return user is not logged in', (done) => {
      request.get('/api/session/loggedin')
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(401, done);
    });
  });

  describe('GET /api/session/logout', () => {
    it('should logout user', (done) => {
      request.get('/api/session/logout')
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200, done);
    });
  });

  describe('POST /api/session/facebook', () => {
    it('should fail when login Facebook', (done) => {
      request.post('/api/session/facebook')
        .set('Authorization', 'Bearer fakeToken')
        .set('Accept', 'application/json')
        .expect(500, done);
    });
  });

  describe('POST /api/session/google', () => {
    it('should fail when login Google', (done) => {
      request.post('/api/session/google')
        .set('Access_token', 'fakeToken')
        .set('Accept', 'application/json')
        .expect(401, done);
    });
  });
});
