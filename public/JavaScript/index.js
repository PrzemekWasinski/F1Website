loadContent("homeTemplate")

const fileName = "index.js"
const studentID = "M00931085";

document.getElementById("loginPageButton").addEventListener("click", function() {
    loadContent("loginTemplate");
});

document.getElementById("registerPageButton").addEventListener("click", function() {
    loadContent("registerTemplate");
});

document.getElementById("homePageButton").addEventListener("click", function() {
    loadContent("homeTemplate");
});

function loadContent(templateId) {
    const contentDiv = document.getElementById("content");
    const template = document.getElementById(templateId);
    
    contentDiv.innerHTML = ""; 
    contentDiv.appendChild(template.content.cloneNode(true)); 
}

/////////////////////////BS/////////////////////

async function register() {
    const registerUsername = document.getElementById("registerUsername").value; //Extract input field text
    const registerPasword = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const teams = document.getElementsByName("team");
    let selectedTeam = null;

    for (let i = 0; i < teams.length; i++) { //Find the team that the user has selected
        if (teams[i].checked) {
            selectedTeam = teams[i].value; 
            break;
        }
    }

    if (!registerUsername || !registerPasword || !confirmPassword || !selectedTeam) { //
        console.log(`All fields must be filled (from ${fileName})`);
    } else if (registerPasword !== confirmPassword) {
        console.log(`Passwords don't match (from ${fileName})`);
    } else {
        const userJSON = JSON.stringify({
            "username": registerUsername, 
            "password": registerPasword, 
            "team": selectedTeam
        });

        try {
            const response = await fetch(`/${studentID}/users`, {
                method: "Post",
                headers: {
                    "Content-Type": "application/json"
                },
                body: userJSON
            });

            const result = await response.json();
            console.log(result["message"]);

            if (result["message"] == "User added successfully") {
                applyTheme(selectedTeam);
            }

        } catch (error) {
            console.log(`${error} (from sending post request)`)
        }
    }
}

function applyTheme(team) {
    const navBar = document.getElementById("navBar");

    if (team === "Red Bull") {
        navBar.style.backgroundColor = "#03022E";
    } else if (team === "Ferrari") {
        navBar.style.backgroundColor = "#DC0000";
    } else if (team === "McLaren") {
        navBar.style.backgroundColor = "#FF8700";
    } else if (team === "Mercedes") {
        navBar.style.backgroundColor = "#00D2BE";
    } else if (team === "Aston Martin") {
        navBar.style.backgroundColor = "#006F62";
    } else if (team === "Alpine") {
        navBar.style.backgroundColor = "#0090FF";
    } else if (team == "RB") {
        navBar.style.backgroundColor = "#0D1AA8"
    } else if (team === "Haas") {
        navBar.style.backgroundColor = "#FFFFFF";
    } else if (team === "Williams") {
        navBar.style.backgroundColor = "#005AFF";
    } else if (team === "Sauber") {
        navBar.style.backgroundColor = "#0DED09";
    }
}

async function login() {
    const loginUsername = document.getElementById("loginUsername").value;
    const loginPassword = document.getElementById("loginPassword").value;

    if (!loginUsername || !loginPassword) {
        console.log("All fields must be filled!")
    } else {
        console.log("Username: " + loginUsername)
        console.log("Password: " + loginPassword)
    }
}
