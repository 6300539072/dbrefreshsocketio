const express = require('express')
const { Server } = require('socket.io')
const {Pool } = require('pg')
const http =require('http')
const path = require('path')
require('dotenv').config()
const cors = require("cors");

const app = express()
const server = http.createServer(app)
// const io = new Server(server,{ cors:{origin :"*"}})
const io = new Server(server, { cors: { origin: "*" } });

const pool = new Pool({
    user:'postgres',
    databse:'postgres',
    password:'amma2049',
    host:'localhost',
    port:'5432',
})
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

async function fetchData(){
   try{
    const result= await pool.query(`select id,name,email,age from users`)
    console.log("rowws",result.rows)
    return result.rows
   }catch(err){
    console.error("Database error:", err);
    return []
   }
}
app.get('/', (req, res) => {
    res.sendFile(Path2D.join(__dirname ,'public','index.html'));
});


io.on('connection',async (socket)=>{
    console.log("client connected")

    // Send initial data when user connects
    socket.emit('userData', await fetchData())
    console.log("*******************",await fetchData())
   
   
    // Listen for database changes
    const notifyClient = async () =>{
        const updateUsers = await fetchData()
        console.log("Database updated, sending new data:", updateUsers);
        io.emit('userData',updateUsers) //// Broadcast new data to all clients
    }

    pool.connect((err,client) =>{
        if(err){
            console.error("postgressql connection error:",err)
            return
        }
        client.query("LISTEN user_update")
        client.on("notification",notifyClient)
    })
    // const client = await pool.connect()
    // client.on('notification', async () => {
    //     socket.emit('userData', await fetchUsers());
    // });


    socket.on('disconnect', () => {
        console.log('Client disconnected');
        client.release();
    });
})

server.listen(3005, () => console.log('Server running on port 3005'));