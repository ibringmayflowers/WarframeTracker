PRAGMA foreign_keys = ON;


drop table if exists framePartsOwned;
drop table if exists relics;
drop table if exists acquired;
drop table if exists users;
drop table if exists vehicles;
drop table if exists companions;
drop table if exists weapons;
drop table if exists warframes;


CREATE TABLE warframes(
    frameName TEXT PRIMARY KEY,
    blueprint TEXT,
    systems TEXT,
    neuroptics TEXT,
    chassis TEXT,
    isPrime INTEGER, --0 for no, 1 for yes
    isVaulted INTEGER, -- 0 for no, 1 for yes
    primeOf TEXT,
    hasExalted INTEGER, -- 0 for no, 1 for yes
    exaltedName TEXT,
    FOREIGN KEY(primeOf) REFERENCES warframes(frameName)
);

CREATE TABLE weapons(
    weaponName TEXT PRIMARY KEY,
    acquisition TEXT,
    variantOf TEXT,
    isVaulted INTEGER, --0 for no, 1 for yes
    hasIncarnon INTEGER, --0 for no, 1 for yes
    incarnonWeek INTEGER,
    weaponSlot TEXT NOT NULL,
    weaponType TEXT NOT NULL,
    masteryRequired INTEGER,
    CHECK(weaponSlot in ('primary', 'secondary', 'melee', 'archgun', 'archmelee')),
    FOREIGN KEY (variantOf) REFERENCES weapons(weaponName)
);

CREATE TABLE companions(
    companionName TEXT PRIMARY KEY,
    acquisition TEXT,
    isPrime INTEGER,
    isVaulted INTEGER,
    primeOf TEXT,
    companionType TEXT,
    companionSubtype TEXT,
    CHECK(companionType in ('beast', 'robotic')),
    FOREIGN KEY (primeOf) REFERENCES companions(companionName)
);

CREATE TABLE vehicles(
    vehicleName TEXT PRIMARY KEY,
    vehicleType TEXT,
    isPrime INTEGER,
    primeVaulted INTEGER,
    primeOf TEXT,
    check (vehicleType in ('archwing', 'k-drive', 'voidrig')),
    FOREIGN KEY (primeOf) REFERENCES vehicles(vehicleName)
);


CREATE TABLE users(
    username TEXT PRIMARY KEY,
    password TEXT,
    isAdmin INTEGER
);

CREATE TABLE acquired(
    itemName TEXT,
    username TEXT,
    FOREIGN KEY (username) REFERENCES users(username),
    primary key (username, itemName)
);



CREATE TABLE relics(
    relicType TEXT,
    relicCode TEXT,
    common1 TEXT,
    common2 TEXT,
    common3 TEXT,
    uncommon1 TEXT,
    uncommon2 TEXT,
    rare TEXT
);

CREATE TABLE framePartsOwned(
    partType TEXT,
    frameName TEXT,
    user TEXT,
    FOREIGN KEY (frameName) REFERENCES warframes(frameName),
    FOREIGN KEY (user) REFERENCES users(username),
    primary key (partType, frameName, user),
    check (partType in ('Blueprint', 'Neuroptics', 'Chassis', 'Systems'))
);