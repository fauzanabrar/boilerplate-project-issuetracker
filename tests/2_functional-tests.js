const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
// const server = "https://issue-tracker.freecodecamp.rocks";

chai.use(chaiHttp);
let _id = ""
suite('Functional Tests', function() {
    this.timeout(5000)
    test('Test POST /api/issues/apitest to make an issue with every field',(done)=>{
        let issue = {
            issue_title: 'test',
            issue_text: 'this is a test',
            created_by: 'tester',
            assigned_to: 'noone',
            status_text: 'bad'
        }
        chai
          .request(server)
          .post('/api/issues/apitest')
          .type('form')
          .send(issue)
          .end((err,res)=>{
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json')
            assert.equal(res.body.issue_title, 'test')
            assert.equal(res.body.issue_text, 'this is a test')
            assert.equal(res.body.created_by, 'tester')
            assert.equal(res.body.assigned_to, 'noone')
            assert.equal(res.body.status_text, 'bad')
            assert.equal(res.body.open, true)
            _id = res.body['_id']
            done()
          })
    })
    test('Test POST /api/issues/apitest to make an issue with required field',(done)=>{
        let issue = {
            issue_title: 'test',
            issue_text: 'this is a test',
            created_by: 'tester',
        }
        
        chai
          .request(server)
          .post('/api/issues/apitest')
          .type('form')
          .send(issue)
          .end((err,res)=>{
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json')
            assert.equal(res.body.issue_title, 'test')
            assert.equal(res.body.issue_text, 'this is a test')
            assert.equal(res.body.created_by, 'tester')
            assert.equal(res.body.assigned_to, '')
            assert.equal(res.body.status_text, '')
            assert.equal(res.body.open, true)
            _id2 = res.body['_id']
            done()
          })
    })
    test('Test POST /api/issues/apitest to make an issue with missing required field',(done)=>{
        let issue = {
            issue_text: 'this is a test',
            created_by: 'tester',
            assigned_to: 'noone',
            status_text: 'bad'
        }
        let error = { error: 'required field(s) missing' }
        chai
          .request(server)
          .post('/api/issues/apitest')
          .type('form')
          .send(issue)
          .end((err,res)=>{
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json')
            assert.equal(res.body.error, error.error)
            done()
          })
    })
    test('Test GET /api/issues/apitest view issues',(done)=>{
        chai
          .request(server)
          .get('/api/issues/apitest')
          .end((err,res)=>{
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json')
            assert.isArray(res.body, 'the result must be array')
            done()
          })
    })
    test('Test GET /api/issues/apitest view issues with one filter',(done)=>{
        chai
          .request(server)
          .get('/api/issues/apitest?open=false')
          .end((err,res)=>{
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json')
            assert.isArray(res.body)
            done()
          })
    })
    test('Test GET /api/issues/apitest view issues with multiple filter',(done)=>{
        chai
          .request(server)
          .get('/api/issues/apitest?open=true&assigned_to=noone')
          .end((err,res)=>{
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json')
            assert.isArray(res.body)
            done()
          })
    })
    test('Test PUT /api/issues/apitest update one field',(done)=>{
        let issue = {
            _id,
            assigned_to: 'me',
        }
        let expectRes = {  result: 'successfully updated', '_id': _id }
        chai
          .request(server)
          .put('/api/issues/apitest')
          .type('form')
          .send(issue)
          .end((err,res)=>{
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json')
            assert.equal(res.body.result, 'successfully updated')
            assert.equal(res.body['_id'], _id)
            chai.request(server).get(`/api/issues/apitest?_id=${_id}`).end((err, res)=>{
              assert.equal(res.status, 200)
              assert.equal(res.type, 'application/json')
              assert.equal(res.body[0].assigned_to, "me")
              assert.notEqual(res.body[0].updated_on, res.body[0].created_on)
              done()
            })
          })
    })
    test('Test PUT /api/issues/apitest update multiple field',(done)=>{
        let issue = {
            _id,
            issue_title: 'test update',
            issue_text: 'this is a test has been closed',
            status_text: 'okay',
            open: false
        }

        let expectRes = {  result: 'successfully updated', '_id': _id }
        chai
          .request(server)
          .put('/api/issues/apitest')
          .type('form')
          .send(issue)
          .end((err,res)=>{
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json')
            assert.equal(res.body.result, expectRes.result)
            assert.equal(res.body['_id'], expectRes['_id'])
            chai.request(server).get(`/api/issues/apitest?_id=${_id}`).end((err, res)=>{
              assert.equal(res.status, 200)
              assert.equal(res.type, 'application/json')
              console.log(res.body)
              assert.equal(res.body[0].issue_title, issue.issue_title)
              assert.equal(res.body[0].issue_text, issue.issue_text)
              assert.equal(res.body[0].status_text, issue.status_text)
              assert.equal(res.body[0].open, false)
              assert.notEqual(res.body[0].updated_on, res.body[0].created_on)
              done()
            })
          })
    })
    test('Test PUT /api/issues/apitest update with missing _id field',(done)=>{
        let issue = {
            issue_title: 'test missing id',
            issue_text: 'this is a test with missing id',
        }
        let expectRes = { error: 'missing _id' }
        chai
          .request(server)
          .put('/api/issues/apitest')
          .type('form')
          .send(issue)
          .end((err,res)=>{
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json')
            assert.equal(res.body.error, expectRes.error)
            done()            
          })
    })
    test('Test PUT /api/issues/apitest update with no field to update',(done)=>{
        let issue = {
            _id
        }
        let expectRes = { error: 'no update field(s) sent', '_id': _id }
        chai
          .request(server)
          .put('/api/issues/apitest')
          .type('form')
          .send(issue)
          .end((err,res)=>{
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json')
            assert.equal(res.body.error, expectRes.error)
            assert.equal(res.body['_id'], expectRes["_id"])
            done()  
          })
    })
    test('Test PUT /api/issues/apitest update an issue with invalid _id',(done)=>{
        let issue = {
            _id : "this is invalid id",
            issue_title: 'test invalid id',
        }
        let expectRes = { error: 'could not update', '_id': issue['_id'] }
        chai
          .request(server)
          .put('/api/issues/apitest')
          .type('form')
          .send(issue)
          .end((err,res)=>{
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json')
            assert.equal(res.body.error, expectRes.error)
            assert.equal(res.body['_id'], expectRes["_id"])
            done()  
          })
    })
    test('Test DELETE /api/issues/apitest an issue',(done)=>{
        let issue = {
          _id
        }
        let expectRes = { result: 'successfully deleted', '_id': _id }
        chai
          .request(server)
          .delete('/api/issues/apitest')
          .type('form')
          .send(issue)
          .end((err,res)=>{
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json')
            assert.equal(res.body.error, expectRes.error)
            assert.equal(res.body['_id'], expectRes["_id"])
            done()
          })
    })
    test('Test DELETE /api/issues/apitest an issue with invalid _id',(done)=>{
          let issue = {
            _id: "this is invalid id"
          }  
          let expectRes = { error: 'could not delete', '_id': issue['_id'] }
          // let expectRes = { error: 'missing _id' }
          chai
          .request(server)
          .delete('/api/issues/apitest')
          .send(issue)
          .end((err,res)=>{
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json')
            assert.equal(res.body.error, expectRes.error)
            assert.equal(res.body['_id'], expectRes["_id"])
            done()
          })
    })
    test('Test DELETE /api/issues/apitest an issue with missing _id',(done)=>{
        let issue = {
        } 
        let expectRes = { error: 'missing _id' }
        chai
          .request(server)
          .delete('/api/issues/apitest')
          .end((err,res)=>{
            assert.equal(res.status, 200)
            assert.equal(res.type, 'application/json')
            assert.equal(res.body.error, expectRes.error)
            done()
          })
    })
});
