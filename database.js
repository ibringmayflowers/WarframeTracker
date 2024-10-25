require('dotenv').config();
const sqlite3 = require("better-sqlite3");
const fs = require("node:fs");
const readline = require('readline');



const INITIALIZE = true;
const frames_csv = './data/frames.csv';


class Database{
    #db
    constructor(filename, schemaFile = null){
        this.#db = new sqlite3(filename);

        if(schemaFile != null){
            try{
                const data = fs.readFileSync(schemaFile, 'utf-8');
                try{
                    this.#db.exec(data);
                } catch (err) {
                    console.error("Error loading db schema:", err);
                    return;
                }
            }catch (err) {
                console.error("Error reading file:", err);
                return;
            }
        }
    }

    close() {
        this.#db.close((err) => {
            if (err) {
                console.error("Database couldn't be closed:", err);
            }
        });
    }

    
    importFrame(name, blueprint, systems, neuroptics, chassis, isPrime=false, isVaulted=null, primeOf=null, hasExalted=false, exaltedName=null){
        const insert_statement = this.#db.prepare(`INSERT INTO warframes (frameName, blueprint, systems, neuroptics, chassis, isPrime, isVaulted, 
            primeOf, hasExalted, exaltedName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        const info = insert_statement.run(name, blueprint, systems, neuroptics, chassis, isPrime? 1:0, isVaulted || isVaulted? 1:0, primeOf, hasExalted?1:0, exaltedName);
        return info
    }

    getAllFrames(){
        const query = this.#db.prepare('SELECT * FROM warframes');
        return query.all();
    }

    findFrame(frameName){
        const query = this.#db.prepare('SELECT * FROM warframes WHERE frameName = ?')
        return query.get(frameName);
    }

    getFrameNames(){
        const query = this.#db.prepare('SELECT frameName from warframes');
        return query.all();
    }

    getFrameOwnership(user){
        const allFrames = this.getFrameNames();
        //console.log(user);
        for(let i = 0 ; i < allFrames.length; i++){
            let frameName = allFrames[i].frameName;
            let testQuery = this.#db.prepare('SELECT * FROM acquired where itemName = ? AND username = ?').all(frameName, user);
            //console.log(testQuery);
            let ownsFrameQuery =  this.#db.prepare('SELECT COUNT(*) AS owned FROM (SELECT * FROM acquired WHERE itemName = ? AND username = ?)').all(frameName, user)
            let ownsFrame = ownsFrameQuery[0].owned? true : false;
            allFrames[i] = {frameName: frameName, owned: ownsFrame}
        }
        //console.log(allFrames)
        return allFrames;
    }

    /**
     * adds a user to the database
     * @param {*} username 
     * @param {*} password 
     * @param {*} isAdmin if true will make user an admin
     * @returns true if user was added, false if user already exists
     */
    addUser(username, password, isAdmin = false){
        try{
            const query = this.#db.prepare('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)')
            query.run(username, password, isAdmin? 1 : 0);
            return true;
        }catch{
            return false
        }
    }

    /**
     * validates if a user's credentials are correct
     * @param {*} username 
     * @param {*} password 
     * @returns true if user credentials are correct, false if not
     */
    validateUser(username, password){
        const query = this.#db.prepare('SELECT username FROM users WHERE username = ? AND password = ?');
        return query.all(username, password).length > 0;
    }

    /**
     * checks whether a user owns an item
     * @param {*} username 
     * @param {*} itemName 
     * @returns true if the user owns the item, and false if not
     */
    userOwnsItem(username, itemName){
        const query = this.#db.prepare('SELECT * FROM acquired WHERE username = ? AND itemName = ?');
        return query.all(username, itemName).length > 0
    }

    addOwnership(username, itemName){
        this.#db.prepare('INSERT INTO acquired (username, itemName) VALUES (?, ?)').run(username, itemName);
    }

    removeOwnership(username, itemName){
        this.#db.prepare('DELETE FROM acquired WHERE username = ? and itemName = ?').run(username, itemName);
    }

    addRelic(relicType, relicCode, common1, common2, common3, uncommon1, uncommon2, rare){
        const query = this.#db.prepare('INSERT INTO relics (relicType, relicCode, common1, common2, common3, uncommon1, uncommon2, rare) VALUES (?,?,?,?,?,?,?,?)');
        query.run(relicType, relicCode, common1, common2, common3, uncommon1, uncommon2, rare)
        //console.log(this.#db.prepare('SELECT * FROM relics WHERE relicType=? AND relicCode = ?').all(relicType, relicCode));
    }

    getRelicDrops(dropName){
        let res = {}
        const queries = [
            this.#db.prepare('SELECT relicType, relicCode FROM relics where common1 = ? OR common2 = ? OR common3 = ?').all(dropName, dropName, dropName),
            this.#db.prepare('SELECT relicType, relicCode FROM relics where uncommon1 = ? OR uncommon2 = ?').all(dropName, dropName),
            this.#db.prepare('SELECT relicType, relicCode FROM relics where rare = ?').all(dropName)
        ]
        for(let i = 0; i < queries.length; i++){
            if(queries[i].length > 0){
                res.rarity = i==0? "Common" : i==1? "Uncommon":"Rare";
                res.relics = []
                for(let j = 0; j < queries[i].length; j++){
                    res.relics.push(queries[i][j].relicType + " " + queries[i][j].relicCode);
                }
                return res;
            }
        }
        return undefined;

    }

    /**
     * sets the ownership of a specific part
     * @param {*} frame 
     * @param {*} partName 
     * @param {*} userName 
     * @param {*} shouldAdd true if user should gain ownership, false if user should lose ownership
     */
    setFramePartOwnership(frame, partName, userName, shouldAdd){
        let query;
        if(shouldAdd){
            query = this.#db.prepare('INSERT INTO framePartsOwned (partType, frameName, user) VALUES (?, ?, ?)');
        }else{
            query = this.#db.prepare('DELETE FROM framePartsOwned WHERE partType = ? AND frameName = ? AND user=?');
        }
        query.run(partName, frame, userName);
    }
    /**
     * Returns a list of whether or not the user owns each part for a specific warframe
     * @param {*} frame 
     * @param {*} userName 
     * @returns 
     */
    getFramePartOwnership(frame, userName){
        let query = this.#db.prepare('SELECT * FROM framePartsOwned where frameName = ? AND user=?');
        let returnVal = {Blueprint: false, Neuroptics: false, Chassis: false, Systems: false};
        let queryResult = query.all(frame, userName);
        for(let i = 0; i < queryResult.length; i++){
            returnVal[queryResult[i].partType] = true
        }
        return returnVal;
    }

    resetPassword(username, newPassword){
        let query = this.#db.prepare('UPDATE users SET password=? WHERE username=?');
        query.run(newPassword, username);
    }

    unsafeSqlPrompt(prompt){
        this.#db.prepare(prompt).all();
    }
}






function askQuestionAsync(reader, question){
    return new Promise((resolve) =>{
        reader.question(question, (answer) =>{
            resolve(answer);
        })
    })
}

async function main(){
    let db
    if(INITIALIZE){
        db = new Database(process.env.DB_PATH,"./database_schema.sql");
        await initFrames(db);
        console.log(db.getAllFrames());
        
    }else{
        db = new Database(process.env.DB_PATH);
    }
    const r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    while(true){
        const answer = await askQuestionAsync(r1, "please enter a frame to search for: ");
        if(answer.trim() === ''){
            r1.close();
            break;
        }else{
            console.log(db.findFrame(answer));
        }
    }
}

//main();

module.exports = Database;