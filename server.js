const express = require('express')
const { Server } = require('socket.io')
const {Pool } = require('pg')
const http =require('http')
const path = require('path')
require('dotenv').config()
const bodyParser = require('body-parser');
const cors = require("cors");

const app = express()
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

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

app.patch('/update_user/:id',async (req,res)=>{
try {
    const userId = req.params.id;
    const fields = [];
    const values = [];

    Object.entries(req.body).forEach(([key, value], index) => {
      fields.push(`${key} = $${index + 1}`);
      values.push(value);
    });

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    values.push(userId); // Add ID at the end for WHERE condition

    const result = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
})
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