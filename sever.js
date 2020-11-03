var express=require('express');
var bodyParser=require('body-parser');
var app=express();
var index=require('./route');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true,
}))
app.use('/',index);
const port=process.env.PORT||4000;
app.listen(port,()=>{
    console.log(`My Sever is running with port ${port}`);
})