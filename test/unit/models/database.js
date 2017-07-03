'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const db = require('../../../models/database');
const expect = chai.expect;

chai.use(chaiAsPromised);

describe('Database', () => {
  describe('ENV variables', () => {
    it('should get ENV variables', () => {
      expect(process.env).to.have.property('NODE_ENV', 'test');
      expect(process.env).to.have.property('DB_HOST');
      expect(process.env).to.have.property('DB_PORT');
      expect(process.env).to.have.property('DB_USER');
      expect(process.env).to.have.property('DB_PASSWORD');
      expect(process.env).to.have.property('DB_NAME');
    });
  });

  describe('#executePromise()', () => {
    it('should execute SQL command', () => {
      const sql = 'SELECT 1 AS res';
      return expect(db.executePromise(sql, [])).to.eventually.be.fulfilled
        .and.be.an('array')
        .and.to.have.deep.nested.property('[0].res', 1);
    });

    it('should execute SQL command with parameters', () => {
      const sql = 'SELECT ? + ? AS res';
      const parameters = [5, 10];
      return expect(db.executePromise(sql, parameters)).to.eventually.be.fulfilled
        .and.be.an('array')
        .and.to.have.deep.nested.property('[0].res', 15);
    });

    it('should execute SQL command and return empty array', () => {
      const sql = 'SELECT * FROM accounttypes WHERE 1 = 2';
      return expect(db.executePromise(sql, [])).to.eventually.be.fulfilled
        .and.be.an('array');
    });

    it('should execute SQL command with error', () => {
      const sql = 'SELECT ? + ?';
      const parameters = ['a'];
      return expect(db.executePromise(sql, parameters)).to.eventually.be.rejectedWith(Error);
    });
  });

  describe('#queryPromise()', () => {
    it('should execute SQL command', () => {
      const sql = 'SELECT 1 AS res';
      return expect(db.queryPromise(sql, [])).to.eventually.be.fulfilled
        .and.be.an('array')
        .and.to.have.deep.nested.property('[0].res', 1);
    });

    it('should execute SQL command with parameters', () => {
      const sql = 'SELECT ? + ? AS res';
      const parameters = [5, 10];
      return expect(db.queryPromise(sql, parameters)).to.eventually.be.fulfilled
        .and.be.an('array')
        .and.to.have.deep.nested.property('[0].res', 15);
    });

    it('should execute SQL command and return error for not found', () => {
      const sql = 'SELECT * FROM accounttypes WHERE 1 = 2';
      return expect(db.queryPromise(sql, [])).to.eventually.be.rejectedWith(Error);
    });

    it('should execute SQL command with error', () => {
      const sql = 'SELECT ? + ?';
      const parameters = ['a'];
      return expect(db.queryPromise(sql, parameters)).to.eventually.be.rejectedWith(Error);
    });
  });
});
