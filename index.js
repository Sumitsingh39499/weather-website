import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const apiURL = `https://api.openweathermap.org/data/2.5`;
const yourapikey = "f472d8352c6c5082c9d71d392dda0a69";

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/",(req,res)=>{
    res.render("index.ejs",{content:"",type:null});
});

app.get("/guide",(req,res)=>{
    res.render("guide.ejs");
});

app.get("/city",(req,res)=>{
    res.render("city.ejs");
});

app.get("/units",(req,res)=>{
    res.render("units.ejs")
});

app.get("/weather",async (req,res)=>{
    const city = req.query.city;
    const units = req.query.units
    if (!city) return res.status(400).send("City is required!");
    try{
    const result = await axios.get(apiURL+"/weather",{
        params:{
            q:city,
            units: units,
            appid : yourapikey
        }
    });
    res.render("index.ejs",{content :result.data ,type:"weather"});
}catch(error){
    res.status(404).send(error.message);
}
});

app.get("/forecast",async(req,res)=>{
    const city = req.query.city;
    const units = req.query.units
    if (!city) return res.status(400).send("City is required!");
    try{
    const result = await axios.get(apiURL+"/forecast",{
        params:{
            q:city,
            units: units,
            appid : yourapikey
        }
    });
    res.render("index.ejs",{content: result.data ,type:"forecast"});
    }catch(error){
        res.status(404).send(error.message);
    }
});

app.get("/air_pollution",async(req,res)=>{
    const city = req.query.city;
    const units = req.query.units
    if (!city) return res.status(400).send("City is required!");
    try{
    const weatherResult = await axios.get(apiURL+"/weather",{
        params:{
            q:city,
            units: units,
            appid : yourapikey
        }
    });

    const { lat,lon } = weatherResult.data.coord;
    const  result= await axios.get(apiURL+"/air_pollution",{
        params:{
            lat : lat,
            lon : lon,
            appid : yourapikey
        }
    });
    
    res.render("index.ejs",{content: result.data ,type:"air_pollution"});
    }catch(error){
        res.status(404).send(error.message);
    }
});






app.listen(port , ()=>{
    console.log(`server is running on port ${port}`);
});