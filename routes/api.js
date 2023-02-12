'use strict';

const { ObjectId } = require("mongodb");

module.exports = function (app, database) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      let project = req.params.project;
      let query = req.query;

      if(query._id){
        query._id = new ObjectId(query._id)
      }
      
      if(query.open){
        query.open = query.open == undefined ? undefined : (query.open === 'true') ? true : false
      }

      let filter = {
        ...query,
        project
      }

      const data = await database.read(filter)

      const resData = await data.toArray()
      const resData2 = resData.map(issue => {
        let newIssue = issue
        delete newIssue.project
        return newIssue
      })
      return res.json(resData2)
    })
    
    .post(async function (req, res){
      let project = req.params.project;
      let issue_title = req.body.issue_title
      let issue_text = req.body.issue_text
      let created_by = req.body.created_by
      let assigned_to = req.body.assigned_to
      let status_text = req.body.status_text

      let currentDate = new Date().toISOString()

      if(
        issue_title == '' || issue_title == undefined || 
        issue_text == '' || issue_text == undefined || 
        created_by == '' || created_by == undefined 
        ){
          return res.json({error: "required field(s) missing"})
      }

      if(assigned_to == undefined ){
        assigned_to = ''
      }
      if(status_text == undefined ){
        status_text = ''
      }
      let newIssue = {
        project,
        assigned_to,        
        status_text,
        open: true,        
        issue_title,        
        issue_text,        
        created_by,
        created_on: currentDate,
        updated_on: currentDate         
      }


      const r = await database.create(newIssue)
      delete newIssue.project
      return res.json({...newIssue, _id: r.insertedId})

    })
    
    .put(async function (req, res){
      let project = req.params.project;
      let id = req.body['_id']
      let issue_title = req.body.issue_title
      let issue_text = req.body.issue_text
      let created_by = req.body.created_by
      let assigned_to = req.body.assigned_to
      let status_text = req.body.status_text
      let open = req.body.open == undefined ? undefined : (req.body.open === 'true') ? true : false

      
      if(id == '' || id== undefined){
        return res.json({
          error: 'missing _id' 
        })
      }

      if(
        (issue_title == '' || issue_title == undefined) && 
        (issue_text == '' || issue_text == undefined) && 
        (created_by == '' || created_by == undefined ) &&
        (assigned_to == '' || assigned_to == undefined ) &&
        (status_text == '' || status_text == undefined ) &&
        (open == '' || open == undefined ) 
        ){
          return res.json(
            { error: 'no update field(s) sent', '_id': id }
          )
      }

      let currentDate = new Date().toISOString()

      let updatedIssue = {
        assigned_to,        
        status_text,
        issue_title,        
        issue_text,        
        created_by,
        open,
        updated_on: currentDate 
      }

      try{
        const data = await database.update(new ObjectId(id), updatedIssue)
        if(data.modifiedCount > 0){
          return res.json({
            result: 'successfully updated', '_id': id
          })
        }else {
          return res.json({ 
            error: 'could not update', '_id': id 
          })
        }
    }catch (e){
      res.json({
        error: 'could not update', '_id': id
      })
    }
      
    })
    
    .delete(async function (req, res){
      let project = req.params.project;
      let id = req.body._id

      if(id == '' || id== undefined){
        return res.json({
          error: 'missing _id' 
        })
      }

      try{
        const data = await database.delete(new ObjectId(id))
        if(data.deletedCount > 0){
          res.json({
            result: 'successfully deleted', '_id': id
          })
        }else {
          return res.json(
            { error: 'could not delete', '_id': id }
          )
        }
      }catch(e){
        return res.json(
          { error: 'could not delete', '_id': id }
        )
      }
    });
    
    //404 Not Found Middleware
    app.use(function(req, res, next) {
      res.status(404)
        .type('text')
        .send('Not Found');
    });   
    
};
