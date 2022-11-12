const express=require('express');
const mysql=require('mysql');
const axios=require('axios');
const dotenv=require('dotenv');
const app=express();

dotenv.config();
app.use(express.json());

var mysqlConnection = mysql.createConnection({
    host:process.env.SQL_HOST,
    user:process.env.SQL_USER,
    password:process.env.SQL_PASSWORD,
    database:process.env.SQL_DB_NAME
});

mysqlConnection.connect((err)=>{
    if(!err)console.log("DB Connection Succeeded");
    else console.log("DB Connection unsuccessful\nError:",err);
});

//Create Contact
app.post('/contacts',async (req,res)=>{
    const  {data_store,...rest}=req.body;
    if(data_store==="CRM"){
        const data = (await axios({
            method:'post',
            url:process.env.CRM_URL,
            headers:{
                "Authorization": `Token token=${process.env.API_KEY}`,
                "Content-Type": "application/json"
            },
            data:{
                "contact":rest
            },
        })).data;  
        res.send(data);  
    }
    else{
        mysqlConnection.query('INSERT INTO Contacts (first_name,last_name,mobile_number,email) VALUES (?,?,?,?)',[rest.first_name,rest.last_name,parseInt(rest.mobile_number),rest.email],(err,rows,fields)=>{
            console.log(rows);
            if(!err){
                res.send('Inserted Successfully');
            }
            else console.log(err);
        });
    }
});

//Get Contant with ID
app.get('/contacts',async (req,res)=>{
    const  {data_store,contact_id}=req.body;
    if(data_store==="CRM"){
        const data = (await axios({
            method:'get',
            url:`${process.env.CRM_URL}/${contact_id}?include=sales_accounts`,
            headers:{
                "Authorization": `Token token=${process.env.API_KEY}`,
                "Content-Type": "application/json"
            }
        })).data;  
        res.send(data);  
    }
    else{
        mysqlConnection.query('SELECT * FROM Contacts WHERE id = ?',[contact_id],(err,rows,fields)=>{
            if(!err){
                res.send(rows);
            }
            else console.log(err);
        });
    }
});

//Update Contact
app.post('/contacts/update',async (req,res)=>{
    const  {data_store,contact_id,new_email,new_mobile_number}=req.body;
    if(data_store==="CRM"){
        const data = (await axios({
            method:'put',
            url:`${process.env.CRM_URL}/${contact_id}`,
            headers:{
                "Authorization": `Token token=${process.env.API_KEY}`,
                "Content-Type": "application/json"
            },
            data:{
                "contact":{
                    "mobile_number":new_mobile_number,
                    "email":new_email,
                    "custom_field": {"cf_is_active": false} 
                }
            },
        })).data;  
        res.send(data);  
    }
    else{
        mysqlConnection.query('UPDATE Contacts SET mobile_number=?,email=? WHERE id=?',[new_mobile_number,new_email,contact_id],(err,rows,fields)=>{
            if(!err){
                res.send('Updated Successfully');
            }
            else console.log(err);
        });
    }
});

//Delete a Contact
app.post('/contacts/delete',async (req,res)=>{
    const  {data_store,contact_id}=req.body;
    if(data_store==="CRM"){
        const data = (await axios({
            method:'delete',
            url:`${process.env.CRM_URL}/${contact_id}?include=sales_accounts`,
            headers:{
                "Authorization": `Token token=${process.env.API_KEY}`,
                "Content-Type": "application/json"
            }
        })).data;  
        res.send(data);  
    }
    else{
        mysqlConnection.query('DELETE FROM Contacts WHERE id = ?',[contact_id],(err,rows,fields)=>{
            if(!err){
                res.send('Deleted Successfully');
            }
            else console.log(err);
        });
    }
});

app.listen(8000,()=>{
    console.log("Server running at 5500");
});