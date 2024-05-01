const express = require("express");

const {open} = require("sqlite");
const sqlite3 = require("sqlite3");

const dotenv = require("dotenv" );
dotenv.config()

const path = require("path");
const dbPath = path.join(__dirname, "taskManagement.db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



const app = express();

app.use(express.json());


const PORT = process.env.PORT || 4000;

let db = null;

const initializeDbAndServer = async() => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
        await db.run(
            `
                CREATE TABLE  IF NOT EXISTS Users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    password_hash TEXT
                );
            `
        );
        
        await db.run(
            `
                CREATE TABLE  IF NOT EXISTS Tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT,
                    description TEXT,
                    status TEXT,
                    assignee_id INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(assignee_id) REFERENCES Users(id)
                );
            `
        );
        console.log("DB initialized");
        app.listen(PORT, ()=> {
                console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log(`DB Error: ${error.message}`);
        process.exit(1)
    }
}

initializeDbAndServer();

  

// Midleware fuction 

const authorizationToken = (request, response, next) => {
    const authHeader = request.headers["authorization"];
    let jwtToken;
    if (authHeader !== undefined) {
      jwtToken = authHeader.split(" ")[1];
    }
    if (jwtToken === undefined) {
      response.status(401).send("Invalid JWT Token");
    } else {
      jwt.verify(jwtToken, "SECRECT_KEY", async (error, payload) => {
        if (error) {
          response.status(401).send("Invalid JWT Token");
        } else {
            request.username = payload.username;
            next();
        }
      });
    }
  };

//Register API 
app.post( '/register/', async (request, response)=> {
    const {username, password} = request.body;
    const passowrd_length = password.length;
    const hashedPassword = await bcrypt.hash(password, 10);
    const selectUserQuery = `SELECT * FROM Users WHERE username = '${username}';`;
    const userDataResponse = await db.get(selectUserQuery);
    if (!username || !password) {
        return response.status(400).send("Missing data").end();
    } 
    if(userDataResponse === undefined){
        if(passowrd_length > 6){
            const  insertUserQuery = `
            INSERT INTO Users 
                (username, password_hash)
             VALUES
                ('${username}','${hashedPassword}');        
            `
            await db.run(insertUserQuery)
            response.status(200).send({"message": "User registered successfully."});
        } else{
            response.status(400).send({"Error":"The password must be more than six characters long."})
        }
    }else{
        response.status(409).send({"Error":"Username already exists."})
    }
});

//Login API 
app.post( "/login/",async (request, response)=> {
    const  {username, password}= request.body;
    if(!username || !password ) {
        return response.status(400).send('Missing Data').end()
    }
    
    const selectUserQuery= `SELECT * FROM Users WHERE username='${username}'`
    const user = await db.get(selectUserQuery)
    if (user === undefined) {
        response.status(400).send("Invalid user");
    } else {
        const isMatched = await bcrypt.compare(password, user.password_hash);
        if (isMatched) {
          const payLoad = { username: username };
          const jwtToken = await jwt.sign(payLoad, "SECRECT_KEY");
          response.status(200).send({ jwtToken });
        } else {
          response.status(400).send("Invalid password");
        }
    }
});

//GET All Tasks 
app.get("/tasks",authorizationToken, async (request, response) => {
    try {
        const getAllTasksQuery = `SELECT * FROM Tasks`; 
        const allTasks = await db.all(getAllTasksQuery);
        response.status(200).send(allTasks);
      } catch (error) {
        console.error("Error retrieving tasks:", error);
        response.status(500).send("Internal Server Error"); // Send a 500 status code for internal server error
      }
});

//GET  a task by ID 
app.get("/tasks/:id", authorizationToken, async (request, response) => {
    try {
        const { id } = request.params;
        const selectTaskIdDetailQuery = `
            SELECT 
                *
            FROM
                Tasks 
            WHERE 
                id = ${id}
        `;
        const selectedTask = await db.get(selectTaskIdDetailQuery);
        if (!selectedTask) {
            return response.status(404).json({ message: "No task found with that ID" });
        }
        response.status(200).send(selectedTask);
    } catch (error) {
        console.error("Error fetching task:", error);
        response.status(500).send({ message: "Error fetching task" });
    }
});


// POST A New Task
app.post("/tasks", authorizationToken ,async (request, response) => {
    try {
        const {title, description, status, assignee_id} = request.body;
        const createATaskQuery = `
            INSERT INTO Tasks 
                (title, description, status, assignee_id, created_at, updated_at)
            VALUES 
                ('${title}', '${description}', '${status}', ${assignee_id}, datetime('now'), datetime('now'));
            `;

        await db.run(createATaskQuery);
        response.status(201).send("Task Created Successfully");
    } catch (error) {
        console.error("Error creating task:", error);
        response.status(500).send("Error creating task");
    }
})

//PUT  Update An Existing Task /tasks/:id
app.put("/tasks/:id",authorizationToken, async (request, response)=>{
    const {id} = request.params;
    const {title, description, status, assignee_id} = request.body;
    const updateTaskIdDetails = `
        UPDATE Tasks 
        SET 
            title = '${title}',
            description = '${description}',
            status = '${status}',
            assignee_id = '${assignee_id}',
            updated_at = datetime('now')
        WHERE
            id = ${id};
    `;
    try {
        await db.run(updateTaskIdDetails);
        response.send("Task Updated Successfully");
    } catch (error) {
        console.error("Error updating task:", error);
        response.status(500).send("Error updating task");
    }
});

//DELETE Remove A Task From The List /tasks/:id
app.delete('/tasks/:id', authorizationToken ,async (request, response) =>{
    const {id} = request.params;
    const deleteOneTask = `
        DELETE FROM Tasks WHERE id = ${id};
    `;
    try {
        await db.run(deleteOneTask);
        response.send(`Deleted the task with ID ${id}`);
    } catch (error){
        console.log(error);
        response.status(400).send("Unable to delete that task.");
    }
});

module.exports = app;