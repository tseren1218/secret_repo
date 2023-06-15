const express = require("express");
const { Pool, Client } = require('pg')
const cors = require("cors");
const app = express();
const port = 5555;
const serverURL = "https://localhost";
app.use(cors());
app.use(express.json());


const credentials = {
    user: 'user',
    host: 'dpg-ci57oc5ph6eh6mo49n4g-a.singapore-postgres.render.com',
    database: 'secret',
    password: 'TjYEXstQd4VvM4decMRwFP2okoEgbbPk',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
}

async function poolDemo() {
  const pool = new Pool(credentials);
  const now = await pool.query("SELECT NOW()");
  await pool.end();

  return now;
}


async function clientDemo() {
  const client = new Client(credentials);
  await client.connect();
  const now = await client.query("SELECT NOW()");
  await client.end();

  return now;
}


async function insert(ip, cookie) {
    const pool = new Pool(credentials);
    try {
        await pool.connect();
        await pool.query("INSERT INTO user_data(ip_address, cookie_info) VALUES($1, $2)", [ip, cookie]); 
        return true;
    } catch (err) {
        console.log("Inserting failed: " + err);
        return false;
    }
    finally {
        await pool.end();
    }


}

(async () => {
  const poolResult = await poolDemo();
  console.log("Time with pool: " + poolResult.rows[0]["now"]);

  const clientResult = await clientDemo();
  console.log("Time with client: " + clientResult.rows[0]["now"]);
})();

app.listen(port, () => {
    console.log("Server started at " + serverURL + ":" + port);
})

app.get('/', (req, res) => {
    res.status(200).send("Hi");
})


app.post('/', (req, res) => {
    const jsob = req.body;
    const cookie = jsob.cookie;
    const ipAddress = req.socket.remoteAddress.toString();

    console.log(typeof (ipAddress));
    console.log(typeof (cookie));
    
    const finalIpAddress = ipAddress == "::1" ? "127.0.0.1" : ipAddress;

    const isSuccessful = insert(finalIpAddress, cookie);
    if (isSuccessful)
        res.status(201).send("Successfully inserted");
    else
        res.status(200).send("Insert unsuccessful");
})