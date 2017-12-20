'use strict';

const passport = require('passport');
const router = require('express').Router();
const Account = require('../controllers/account');
const AccountType = require('../controllers/accounttype');
const Category = require('../controllers/category');
const User = require('../controllers/user');
const validator = require('../middleware/validate_user');

router.all('*', passport.isUserAuthenticated(), (req, res, next) => {
  return next();
});

router.get('/:id', (req, res, next) => {
  const account = new Account();
  const accountType = new AccountType();
  const category = new Category();
  const user = new User();
  Promise.all([user.findById(req.user.iduser), account.getAll(req.user.iduser),
               category.getAll(req.user.iduser), accountType.getAll()])
    .then((result) => {
      res.status(200).json({
        User: result[0].getProperties(),
        Account: result[1] || [],
        Category: result[2] || [],
        AccountType: result[3]
      });
    })
    .catch((err) => next(err));
});

router.put('/:id', validator.isValidUpdate(), async (req, res, next) => {
  const payload = req.body;
  payload.iduser = req.user.iduser;
  const user = new User(payload);

  try {
    await user.update();
    if (payload.passwdold && payload.passwd) {
      const userFound = await user.findByEmail(payload.email);
      await userFound.verifyPassword(payload.passwdold);
      await user.updatePassword();
    }
    res.status(200).json({});

  } catch (err) {
    next(err);
  }
});

module.exports = router;
