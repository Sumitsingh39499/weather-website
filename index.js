import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import pg from "pg";
//For storeing the search history in db
const  db = new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"Weather",
    password:"Sumits",
    port:5432
});
db.connect();
const app = express();
const port = 3000;
const apiURL = `https://api.openweathermap.org/data/2.5`;
const yourapikey = "f472d8352c6c5082c9d71d392dda0a69";

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/",(req,res)=>{
    res.render("index.ejs",{content:"",type:null});
});

app.get("/weather",async (req,res)=>{
    const startTime = Date.now();

    const query = req.query.city;
    const units = req.query.units
    const ip=req.ip;
    const agent=req.headers["user-agent"];

    if (!query) return res.status(400).send("City is required!");
    try{
    const result = await axios.get(apiURL+"/weather",{
        params:{
            q:query,
            units: units,
            appid : yourapikey
        }
    });

    const data=result.data;
    const duration=Date.now()-startTime;

    //extract API values 
    const city = data.name;
    const country=data.sys.country;
    const lat=data.coord.lat;
    const lon=data.coord.lon;

    //Insert into DB
    await db.query("INSERT INTO search_history(query,city,country,latitude,longitude,units, ip_address,user_agent,response_time_ms,result_status)VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",[query,city,country,lat,lon,units,ip,agent,duration,"success"]);
    res.render("index.ejs",{content :result.data ,type:"weather"});
}catch(error){
    const duration = Date.now()-startTime;
    //log failed
    await db.query("INSERT INTO search_history(query,units,ip_address,user_agent,response_time_ms,result_status) VALUES ($1,$2,$3,$4,$5,$6)",[query,units,ip,agent,duration,"failed"]);

    res.status(404).send(error.message);
}
});

app.get("/forecast",async(req,res)=>{
    const startTime = Date.now();

    const query = req.query.city;
    const units = req.query.units
    const ip =req.ip;
    const agent=req.headers["user-agent"];
    if (!query) return res.status(400).send("City is required!");
    try{
    const result = await axios.get(apiURL+"/forecast",{
        params:{
            q:query,
            units: units,
            appid : yourapikey
        }
    });

    const data=result.data;
    const duration=Date.now()-startTime;

    //extract API values 
    const city = data.city.name;
    const country=data.city.country;
    const lat=data.city.coord.lat;
    const lon=data.city.coord.lon;

    //Insert into DB
    await db.query("INSERT INTO search_history(query,city,country,latitude,longitude,units,ip_address,user_agent,response_time_ms,result_status)VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",[query,city,country,lat,lon,units,ip,agent,duration,"success"]);

    res.render("index.ejs",{content: result.data ,type:"forecast"});
    }catch(error){

    const duration = Date.now()-startTime;
    //log failed
    await db.query("INSERT INTO search_history(query,units,ip_address,user_agent,response_time_ms,result_status) VALUES ($1,$2,$3,$4,$5,$6)",[query,units,ip,agent,duration,"failed"]);

        res.status(404).send(error.message);
    }
});

app.get("/air_pollution",async(req,res)=>{
    const startTime = Date.now();

    const query = req.query.city;
    const units = req.query.units;
    const ip=req.ip;
    const agent=req.headers["user-agent"];

    if (!query) return res.status(400).send("City is required!");
    try{
    const weatherResult = await axios.get(apiURL+"/weather",{
        params:{
            q:query,
            units: units,
            appid : yourapikey
        }
    });

    const weatherData = weatherResult.data;
    const lat = weatherData.coord.lat;
    const lon = weatherData.coord.lon;
    const city = weatherData.name;
    const country = weatherData.sys.country;

    const  pollutionResult= await axios.get(apiURL+"/air_pollution",{
        params:{
            lat : lat,
            lon : lon,
            appid : yourapikey
        }
    });
    const duration=Date.now()-startTime;

    //Insert into DB
    await db.query("INSERT INTO search_history(query,city,country,latitude,longitude,units, ip_address,user_agent,response_time_ms,result_status)VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",[query,city,country,lat,lon,units,ip,agent,duration,"success"]);
    
    res.render("index.ejs",{content: pollutionResult.data ,type:"air_pollution"});
    }catch(error){

    const duration = Date.now()-startTime;

    //log failed
    await db.query("INSERT INTO search_history(query,units,ip_address,user_agent,response_time_ms,result_status) VALUES ($1,$2,$3,$4,$5,$6)",[query,units,ip,agent,duration,"failed"]);

        res.status(404).send(error.message);
    }
});






app.listen(port , ()=>{
    console.log(`server is running on port ${port}`);
});