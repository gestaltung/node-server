var request = require('supertest');
var app = require('../app.js');
require('./models');

describe('GET /', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/')
      .expect(200, done);
  });
});

describe('GET /landing', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/landing')
      .expect(200, done);
  });
});

describe('GET forgot', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/forgot')
      .expect(200, done);
  });
});

describe('GET /login', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/login')
      .expect(200, done);
  });
});

describe('GET /signup', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/signup')
      .expect(200, done);
  });
});

describe('GET /account', function() {
  it('should return 302 Found', function(done) {
    request(app)
      .get('/account')
      .expect(302, done);
  });
});

describe('GET /dashboard', function() {
  it('should return 302 Found', function(done) {
    request(app)
      .get('/dashboard')
      .expect(302, done);
  });
});

describe('GET /dashboard/custom', function() {
  it('should return 302 Found', function(done) {
    request(app)
      .get('/dashboard/custom')
      .expect(302, done);
  });
});

describe('GET /link', function() {
  it('should return 302 Found', function(done) {
    request(app)
      .get('/link')
      .expect(302, done);
  });
});


describe('GET /api', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/api')
      .expect(200, done);
  });
});

describe('GET /contact', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/contact')
      .expect(200, done);
  });
});

describe('GET /random-url', function() {
  it('should return 404', function(done) {
    request(app)
      .get('/reset')
      .expect(404, done);
  });
});
