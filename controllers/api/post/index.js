const mongojs=require('mongojs');
const db=mongojs('studentinfo',['student']);
const jwt=require('jsonwebtoken');
const { validationResult } = require('express-validator');
const dotenv=require('dotenv').config();
const secret=dotenv.parsed.SECRET;
const users=[
    {username:"Poe Thandar",password:"poepoe",role:"student"},
    {username:"Naw Naw",password:"12345",role:"teacher"},
    {username:"Techel Hnin",password:"12345",role:"teacher"},
]

module.exports={
    
    upload:(req,res)=>{
        db.login.find((err,data)=>{
            if(err) return res.sendStatus(500);
            else {
                for(i in data){
                    //const{username,passoword,role}=data[i];
                    //console.log(data[i]);
                    users[i]=data[i];
                    console.log(users[i]);
                }
            
                        const {username,password}=req.body;
                        const user=users.find((u=>{
                            return u.username===username && u.password===password;
                        }))
                        if(user){
                            jwt.sign(user,secret,{
                                expiresIn:"1h"
                            },(err,token)=>{
                                if(err){console.log(err)}
                                return res.status(200).json({token});
                            })
                        }
                        else{
                            console.log("Username or password is incorrect");
                            return res.sendStatus(401);
                        }
                    
                }
            
            })
    },
    records:(req,res)=>{
        const option=req.query;
        const filter=option.filter || {}
        const sort=option.sort || {}
        const limit=20;
        const page=parseInt(option.page) || 1;
        const skip=(page-1)*limit;
        for(i in sort){
            sort[i]=parseInt(sort[i]);
        }
        db.student.find(filter).sort(sort).skip(skip).limit(limit,(err,data)=>{
            if(err) return res.status(500);
            else{
                return res.status(200).json({
                    meta:{
                        filter,
                        sort,
                        skip,
                        limit,
                        page,
                        total:data.length
                    },
                    data,
                    links:{
                        self:req.originalUrl,
                    }
                })
            }
        })


    },
    add:(req,res)=>{
        const error=validationResult(req);
        if(!error.isEmpty()){
            return res.status(400).json( {error:error.array()} )
        }
        db.student.insert(req.body,(err,data)=>{
        if (err) return res.sendStatus(500);
        const _id=data._id;
        res.append("Location","/api/addRecords/"+_id);
        return res.status(201).json({
            meta: {
                _id
            },
            data
        })  
})

},
update:(req,res)=>{
    const _id=req.params.id;
    const error=validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({error:error.array()})
    }
    db.student.count({_id:mongojs.ObjectID(_id)},(err,count)=>{
        if(count)
        {
            db.student.update(
                { _id: mongojs.ObjectID(_id) },
                { $set:req.body },
                { multi:false },(err,data)=>{
                    if(err) return res.sendStatus(500);
                    else{
                        console.log(`Id ${_id} updating is success.`);
                        db.student.find({_id:mongojs.ObjectID(_id) },(err,data)=>{
                            if(err) return res.sendStatus(500);
                            else{

                                return res.status(200).json({
                                meta:{_id},
                                data
                            })
                            }
                        })
                    }
                })
        }
        else{
            console.log(`Your id ${_id} is not found`);
            return res.sendStatus(404);

        }
    })
},
delete:(req,res)=>{
    const _id=req.params.id;
    const error=validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({error:error.array()})
    }
    db.student.count({_id:mongojs.ObjectID(_id)},(err,count)=>{
        if(count){
            db.student.remove({_id:mongojs.ObjectID(_id)},(err,data)=>{
                if(err) return res.sendStatus(500);
                else {
                    console.log(`Id ${_id} deletion is success.`);
                    return res.sendStatus(204);
                }
            })
        }
        else{
            console.log(`Your id ${_id} is not found.`);
            return res.sendStatus(404);
        }
    })
}

}