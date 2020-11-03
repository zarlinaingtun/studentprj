const express=require('express');
const route=express.Router();
module.exports=route;
const api=require('../controllers/api/post');
const dotenv=require('dotenv').config();
const secret=dotenv.parsed.SECRET;
const jwt=require('jsonwebtoken');
const {body,param,validationResult}=require('express-validator');


function view(req,res,next){
    const [type,token]=req.headers['authorization'].split(' ');

    if(type!='Bearer') return res.sendStatus(401);
    jwt.verify(token,secret,(err,userdata)=>{
        if(err) res.sendStatus(401);
        else{
            if(userdata.role==='student'||userdata.role=='teacher') next();
            else return res.sendStatus(403);
        }
    })
}
function onlyTeacher(req,res,next){
    const [type,token]=req.headers['authorization'].split(' ');
    if(type!='Bearer') return res.sendStatus(401);
    jwt.verify(token,secret,(err,user)=>{
        if(err) res.sendStatus(401);
        else{
            if(user.role==='teacher') next();
            else return res.sendStatus(403);
        }
    })
}
route.post('/api/login',api.upload);
route.get('/api/records',view,api.records);
route.post('/api/addRecords',onlyTeacher,
[   
    body('name').not().isEmpty(),
    body('phoneno').not().isEmpty(),
    body('address').not().isEmpty(),
    body('role').not().isEmpty()
],api.add);

route.patch('/api/updateRecords/:id',onlyTeacher,
[ param('id').isMongoId() ],
api.update);
route.delete('/api/deleteRecords/:id',onlyTeacher,
[ param('id').isMongoId() ],
api.delete);