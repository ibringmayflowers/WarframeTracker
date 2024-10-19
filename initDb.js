const database = require('./database.js');
const fs = require("node:fs");
const csv = require('csv-parser');

const frames_csv = './data/frames.csv';
const relics_csv = './data/relics.csv';

function printRelicList(relicData){
    if(!relicData){
        return "Vaulted Void Relics"
    }
    const relics = relicData.relics;
    let str = ""
    for(let i = 0; i < relics.length; i++){
        //console.log(item);
        str += relics[i] + " Relic (" + relicData.rarity + ")\n";
    }
    return str;
}


function initFrames(db){
    return new Promise((resolve, reject) => {
        fs.createReadStream(frames_csv).pipe(csv()).on('data', (row) =>{
            db.importFrame(row.name, row.blueprint, row.sytems, row.neuroptics, row.chassis, false);
            if(row.hasPrime == "TRUE" && row.name != "Excalibur"){
                //console.log(db.getRelicDrops(row.name + " Prime Blueprint"));
                db.importFrame(row.name + " Prime",
                     printRelicList(db.getRelicDrops(row.name+" Prime Blueprint")),
                     printRelicList(db.getRelicDrops(row.name+" Prime Systems Blueprint")),
                     printRelicList(db.getRelicDrops(row.name+" Prime Neuroptics Blueprint")),
                     printRelicList(db.getRelicDrops(row.name+" Prime Chassis Blueprint"))
                     , true, row.isVaulted=="TRUE", row.name);
            }
            if(row.name == "Excalibur"){
                db.importFrame(row.name + " Umbra",  "Full frame acquired from The Sacrifice Quest", "n/a", "n/a", "n/a", true, false, row.name);
            }
        }).on('end', () =>{
            resolve();
        }).on('error', (error) =>{
            reject(error);
        });
    });
}

function initRelics(db){
    return new Promise((resolve, reject) => {
        fs.createReadStream(relics_csv).pipe(csv()).on('data', (row) =>{
            //console.log(row);
            db.addRelic(row.relicType, row.relicCode, row.common1, row.common2, row.common3, row.uncommon1, row.uncommon2, row.rare);
        }).on('end', () =>{
            resolve();
        }).on('error', (error) =>{
            reject(error);
        });
    });
}

async function main(){
    db = new database("db.db","./database_schema.sql");
            await initRelics(db);
            await initFrames(db);
            db.addUser("bob", "12341234", true);
            //console.log(db.getAllFrames());
}

main();