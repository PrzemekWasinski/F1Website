const teamColours = {
    "Red Bull": "#090085",
    "Ferrari" : "#d90000",
    "McLaren": "#d95a00",
    "Mercedes": "#00d6c4",
    "Aston Martin": "#00472a",
    "Alpine F1 Team": "#ff36d3",
    "Haas F1 Team": "#d6d6d6",
    "RB F1 Team": "#0b00d4",
    "Williams": "#0051ff",
    "Sauber": "#02d610"
}

async function getSeasonResults(year) {
    const driversArray = [];
    const constructorsArray = [];

    const api = `https://ergast.com/api/f1/${year}`;

    try {
        const driverResponse = await fetch(`${api}/driverStandings.json`);
        const driverData = await driverResponse.json();

        const constructorResponse = await fetch(`${api}/constructorStandings.json`);
        const constructorData = await constructorResponse.json();


        const drivers = driverData["MRData"]["StandingsTable"]["StandingsLists"][0]["DriverStandings"];
        for (let i = 0; i < drivers.length; i++) {
            driversArray.push({
                "Position": drivers[i]["position"],
                "Name": `${drivers[i]["Driver"]["givenName"]} ${drivers[i]["Driver"]["familyName"]}`, 
                "Team": drivers[i]["Constructors"][0]["name"],
                "Points": drivers[i]["points"]      
            });
        }

        // for (let i = 0; i < driversArray.length; i++) {
        //     console.log(driversArray[i])
        // }

        const constructors = constructorData["MRData"]["StandingsTable"]["StandingsLists"][0]["ConstructorStandings"];

        for (let i = 0; i < constructors.length; i++) {
            constructorsArray.push({
                "Position": constructors[i]["position"],
                "Name": constructors[i]["Constructor"]["name"],
                "Points": constructors[i]["points"]
            });
        }

        // for (let i = 0; i < constructorsArray.length; i++) {
        //     console.log(constructorsArray[i])
        // }

        return {"driversArray": driversArray, "constructorsArray": constructorsArray};

    } catch (error) {
        console.log(`${error} from api.js`);
    }
}

export function loadSeasonsTemplate() {
    
    const date = new Date();
    let currentYear = date.getFullYear();

    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = "";  

    const select = document.createElement("select");
    select.id = "year";
    select.name = "year";

    for (let i = currentYear; i >= 1958; i--) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        select.appendChild(option); 
    }
    contentDiv.appendChild(select);

    const seasonDiv = document.createElement("div");
    seasonDiv.id = "yearDisplay";
    contentDiv.appendChild(seasonDiv);

    select.addEventListener("change", function() {
        loadHTML(select.value);
    });

    loadHTML(currentYear);

    async function loadHTML(year) {
        const result = await getSeasonResults(year); 
        const driversArray = result["driversArray"];
        const constructorsArray = result["constructorsArray"];

        seasonDiv.innerHTML = "";  

        const containerDiv = document.createElement("div");
        containerDiv.style.display = "flex";
        containerDiv.style.justifyContent = "space-between"; 
        containerDiv.style.alignItems = "flex-start"; 
        seasonDiv.appendChild(containerDiv);

        // Drivers Section
        const driversDiv = document.createElement("div");
        driversDiv.style.flex = "0 1 45%";
        driversDiv.style.paddingRight = "20px"; 
        const driversTitle = document.createElement("h3");
        driversTitle.textContent = "Drivers:";
        driversDiv.appendChild(driversTitle);

        const driversList = document.createElement("ul");
        driversList.style.listStyleType = "none";
        driversList.style.padding = "0";

        for (let i = 0; i < driversArray.length; i++) {
            const driverTeam = driversArray[i]["Team"];

            const li = document.createElement("li");
            if (driverTeam in teamColours) {
                li.style.background = teamColours[driverTeam];
            } else {
                li.style.background = "#8a8a8a";
            }

            li.style.display = "flex";
            li.style.alignItems = "center";
            li.style.padding = "5px 10px";

            const nameSpan = document.createElement("span");
            nameSpan.style.flex = "1"; 
            nameSpan.style.marginRight = "10px"; 
            nameSpan.textContent = `${i + 1}:  ${driversArray[i].Name}`;
            li.appendChild(nameSpan);

            const pointsSpan = document.createElement("span");
            pointsSpan.style.width = "80px"; 
            pointsSpan.textContent = `Pts: ${driversArray[i].Points.toString().padEnd(4)}`;
            li.appendChild(pointsSpan);

            const teamSpan = document.createElement("span");
            teamSpan.style.flex = "2";  
            teamSpan.textContent = `Team: ${driversArray[i].Team}`;
            li.appendChild(teamSpan);

            driversList.appendChild(li);
        }

        driversDiv.appendChild(driversList);
        containerDiv.appendChild(driversDiv);

        const constructorsDiv = document.createElement("div");
        constructorsDiv.style.flex = "0 1 45%"; 
        const constructorsTitle = document.createElement("h3");
        constructorsTitle.textContent = "Constructors:";
        constructorsDiv.appendChild(constructorsTitle);

        const constructorsList = document.createElement("ul");
        constructorsList.style.listStyleType = "none";
        constructorsList.style.padding = "0";

        for (let i = 0; i < constructorsArray.length; i++) {
            const li = document.createElement("li");
            const constructorName = constructorsArray[i]["Name"];

            if (constructorName in teamColours) {
                li.style.background = teamColours[constructorName];
            } else {
                li.style.background = "#8a8a8a";
            }
            li.style.display = "flex";
            li.style.alignItems = "center";
            li.style.padding = "5px 10px";

            const nameSpan = document.createElement("span");
            nameSpan.style.flex = "1";
            nameSpan.style.marginRight = "10px"; 
            nameSpan.textContent = `${i + 1}:  ${constructorsArray[i].Name}`;
            li.appendChild(nameSpan);

            const pointsSpan = document.createElement("span");
            pointsSpan.style.width = "80px";
            pointsSpan.textContent = `Pts: ${constructorsArray[i].Points.toString().padEnd(4)}`;
            li.appendChild(pointsSpan);

            constructorsList.appendChild(li);
        }

        constructorsDiv.appendChild(constructorsList);
        containerDiv.appendChild(constructorsDiv);
    }
}