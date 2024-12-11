import { loadContent } from "./pages.js";

const studentID = "M00931085";

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

function applyTheme(team) {
    const navBar = document.getElementById("navBar");

    if (team in teamColours) {
        navBar.style.backgroundColor = teamColours[team];
        console.log("yes")
    } else {
        navBar.style.backgroundColor = "#333";
        console.log("no")
    }
};

export async function login() {
    const loginUsername = document.getElementById("loginUsername").value;
    const loginPassword = document.getElementById("loginPassword").value;

    if (!loginUsername || !loginPassword) {
        console.log("All fields must be filled!");
        return;
    }

    const userJSON = JSON.stringify({
        "username": loginUsername, 
        "password": loginPassword
    });

    try {
        const statusResponse = await fetch(`/${studentID}/login`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const statusResult = await statusResponse.json();
        console.log("Login status:", statusResult.message);
        if (statusResult.message == "No active session") {
            const loginResponse = await fetch(`/${studentID}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: userJSON
            });

            const loginResult = await loginResponse.json();
            console.log("Login attempt:", loginResult);

            if (loginResult.status === "success") {
                applyTheme(loginResult["team"]);
                localStorage.setItem("userTeam", loginResult["team"]);
                console.log("Login successful!");
            } else {
                console.log(`${loginResult} from: login()`);
            }
        } else {
            console.log("Log out first")
        }

    } catch (error) {
        console.log(`${error} from: login()`);
    }
}

export async function logOut() {
    const navBar = document.getElementById("navBar");
    navBar.style.backgroundColor = "#333";
    localStorage.removeItem("userTeam");

    try {
        const response = await fetch(`/${studentID}/login`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();
        console.log("Logout attempt:", result.message);
        loadContent("homeTemplate");

    } catch (error) {
        console.log(`${error} from: logOut()`);
    }
}

export async function checkLoginStatus() {
    try {
        const response = await fetch(`/${studentID}/login`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const result = await response.json();
        console.log(result)
        
        if (result.status === "logged_in") {
            console.log(`User ${result.username} is currently logged in`);
            const savedTeam = localStorage.getItem('userTeam');
            
            if (savedTeam) {
                applyTheme(savedTeam);
            }

            console.log(result)
            return result
        } else {
            console.log("No user is logged in");
            return result;
        }

        
    } catch (error) {
        console.log(`${error} from: checkLoginStatus()`);
        return JSON.stringify({ "status": error })
    }
}