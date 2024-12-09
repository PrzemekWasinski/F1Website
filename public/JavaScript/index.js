const studentID = "M00931085";

window.onload = async function() {
    await checkLoginStatus();
    await loadPosts();
    loadContent("homeTemplate");
};

document.getElementById("homePageButton").addEventListener("click", function() {
    loadContent("homeTemplate"), setupSearchListener()
});

document.getElementById("registerPageButton").addEventListener("click", function() {
    loadContent("registerTemplate")
});

document.getElementById("loginPageButton").addEventListener("click", function() {
    loadContent("loginTemplate");
});

document.getElementById("seasonsButton").addEventListener("click", function() {
    loadSeasonsTemplate();
});

document.getElementById("logOutButton").addEventListener("click", function() {
    logOut()
});

// Modify window.onload to load posts
window.onload = async function() {
    await checkLoginStatus();
    loadContent("homeTemplate");
};

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

function loadSeasonsTemplate() {
    
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

const userSearchInput = document.getElementById("userSearch");
const userSearchButton = document.getElementById("userSearchButton");

const searchPopup = document.createElement("div");
searchPopup.innerHTML = `
    <div id="searchPopup" class="popup" style="display: none;">
        <div class="popup-content">
            <span class="close" onclick="closeSearchPopup()">&times;</span>
            <h3>Search Results</h3>
            <div id="searchResults"></div>
        </div>
    </div>
`;
document.body.appendChild(searchPopup);

userSearchButton.addEventListener("click", async () => {
    const searchTerm = userSearchInput.value.trim();
    if (searchTerm === "") return;

    try {
        const response = await fetch(`/${studentID}/users/search?term=${encodeURIComponent(searchTerm)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const users = await response.json();
        displaySearchResults(users);
    } catch (error) {
        console.error(`${error} from: User search GET`);
    }
});

function displaySearchResults(users) {
    const searchPopup = document.getElementById("searchPopup");
    const searchResults = document.getElementById("searchResults");
    
    searchResults.innerHTML = `
        <div class="search-header">
            <button id="closeSearchButton" class="close-button">×</button>
        </div>
    `;
    
    if (users.length === 0) {
        searchResults.innerHTML += "<p>No users found</p>";
    } else {
        users.forEach(user => {
            const userDiv = document.createElement("div");
            userDiv.className = "user-result";
            userDiv.innerHTML = `
                <p><strong>Username:</strong> <a href="#" class="profile-link" onclick="loadProfile('${user.username}'); closeSearchPopup(); return false;">${user.username}</a></p>
                <p><strong>Team:</strong> ${user.team}</p>
            `;
            searchResults.appendChild(userDiv);
        });
    }
    
    searchPopup.style.display = "block";
    document.getElementById("closeSearchButton").addEventListener("click", closeSearchPopup);
}

function closeSearchPopup() {
    document.getElementById("searchPopup").style.display = "none";
}

function setupSearchListener() {
    const searchButton = document.getElementById("postSearchButton");
    if (searchButton) {
        searchButton.addEventListener("click", async function() {
            const searchQuery = document.getElementById("postSearch").value.trim();
            if (searchQuery) {
                try {
                    const response = await fetch(`/${studentID}/contents/search?q=${encodeURIComponent(searchQuery)}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });

                    const posts = await response.json();
                    
                    const postsContainer = document.getElementById("posts-container");
                    postsContainer.innerHTML = ""; 
                    
                    for (let i = 0; i < posts.length; i++) {
                        const post = posts[i];
                        const postElement = document.createElement("div");
                        postElement.className = "post";
                        postElement.innerHTML = `
                            <h3>${post.title}</h3>
                            <p>${post.description}</p>
                            <div class="post-footer">
                                <small>Posted by: 
                                    <a href="#" class="username-link" data-username="${post.username}">
                                        ${post.username}
                                    </a>
                                </small>
                            </div>
                        `;
                        postsContainer.appendChild(postElement);
                    }                    

                } catch (error) {
                    console.log(`${error} from setupsSearchEventListener()`)
                }
            }
        });
    }
}

function upload() {
    document.getElementById("uploadPopup").style.display = "block";
}

function closePopup() {
    document.getElementById("uploadPopup").style.display = "none";
}

async function loadContent(templateId) {
    const contentDiv = document.getElementById("content");
    const template = document.getElementById(templateId);
    
    contentDiv.innerHTML = ""; 
    contentDiv.appendChild(template.content.cloneNode(true)); 

    if (templateId === "homeTemplate") {
        await loadPosts();
        
        // Only show button if user is logged in
        const isLoggedIn = await checkLoginStatus();
        const uploadButton = document.getElementById("uploadButton");
        if (uploadButton && isLoggedIn) {
            uploadButton.style.display = "block";
        }
        
        // Re-attach event listener to upload form
        const uploadForm = document.getElementById("uploadForm");
        if (uploadForm) {
            uploadForm.addEventListener("submit", handleUpload);
        }

        // Set up search functionality
        const searchButton = document.getElementById("postSearchButton");
        if (searchButton) {
            searchButton.addEventListener("click", async function() {
                const searchQuery = document.getElementById("postSearch").value.trim();
                const postsContainer = document.getElementById("posts-container"); // Make sure this matches your div ID
                const uploadsContainer = document.getElementById("posts-container");

                postsContainer.innerHTML = "";
                uploadsContainer.innerHTML = "";
                if (searchQuery) {
                    try {
                        const response = await fetch(`/${studentID}/contents/search?q=${encodeURIComponent(searchQuery)}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json"
                            }
                        });

                        const posts = await response.json();
                                               
                        if (posts.length === 0) {
                            postsContainer.innerHTML = "<p>No posts found matching your search.</p>";
                            return;
                        }
                        
                        posts.forEach(post => {
                            const postElement = document.createElement("div");
                            postElement.className = "post";
                            postElement.innerHTML = 
                            `<h3>${post.title}</h3>
                            <p>${post.description}</p>
                            <div class="post-footer">
                                <small>Posted by: 
                                    <a href="#" class="username-link" data-username="${post.username}">
                                        ${post.username}
                                    </a>
                                </small>
                            </div>
                        `;
                            postsContainer.appendChild(postElement);
                        });
                    } catch (error) {
                        console.log(`${error} from loadContent()`)
                        postsContainer.innerHTML = "<p>Error searching posts. Please try again.</p>";
                    }
                } else {
                    // If search is empty, reload all posts
                    loadPosts();
                }
            });
        }
    }
}

// Function to load posts
async function loadPosts(searchQuery) {
    try {
        const response = await fetch(`/${studentID}/contents`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.log(`${error} from: loadPosts()`);
    }
}


// Function to display posts
async function displayPosts(posts) {
    const uploadedItems = document.getElementById("posts-container");
    if (!uploadedItems) {
        return;
    }
    
    uploadedItems.innerHTML = "";
    
    if (posts.length === 0) {
        uploadedItems.innerHTML = "<p>No posts yet!</p>";
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.className = "post";
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.description}</p>
            <div class="post-footer">
                <small>Posted by: 
                    <a href="#" class="username-link" data-username="${post.username}">
                        ${post.username}
                    </a>
                </small>
            </div>
        `;

        // Add click event listener to username link
        const usernameLink = postElement.querySelector(".username-link");
        usernameLink.addEventListener("click", (event) => {
            event.preventDefault();
            loadProfile(post.username);
        });

        uploadedItems.appendChild(postElement);
    });
}

async function loadProfile(username) {
    let buttonText = "Follow";
    let isFollowing = false;
    
    try {
        // Fetch following status
        const followingResponse = await fetch(`/${studentID}/follow/:${username}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const followingResult = await followingResponse.json();
        
        if (followingResult.following && followingResult.following.length > 0) {
            if (followingResult["following"].includes(username)) {
                buttonText = "Unfollow";
            } else {
                buttonText = "Follow";
            }
        }

        // Fetch user's posts
        const postsResponse = await fetch(`/${studentID}/users/${username}/posts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const postsResult = await postsResponse.json();
        
        // Debug log to see the structure
        console.log("Profile posts result:", postsResult);

        // Check if posts exist in the response
        let posts;
        if (postsResult.posts) {
            posts = postsResult.posts;
        } else {
            posts = [];
        }

        let postsHTML = "";
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            postsHTML += `
                <div class="post">
                    <div class="post-details">
                        <span class="post-username">${post.username}</span>
                        <br>
                        <span class="post-description">${post.title}</span>
                        <br>
                        <span class="post-description">${post.description}</span>
                    </div>
                </div>
            `;
        }


        const profileTemplate = document.getElementById("profileTemplate");
        profileTemplate.innerHTML = `
            <div class="profile-header">
                <h2>${username}'s Profile</h2>
                <button id="followButton">${buttonText}</button>
            </div>
            <div class="posts-section">
                <h3>Posts</h3>
                ${posts.length > 0 ? postsHTML : "<p>No posts yet.</p>"}
            </div>
        `;

        loadContent("profileTemplate");

        // Set up follow button functionality
        const followButton = document.getElementById("followButton");

        if (followButton) {
            followButton.addEventListener("click", async () => {
                if (isFollowing) {
                    await unfollowUser(username);
                    followButton.textContent = "Follow";
                    isFollowing = false;
                } else {
                    await followUser(username);
                    followButton.textContent = "Unfollow";
                    isFollowing = true;
                }
            });
        }


    } catch (error) {
        console.log(`${error} from: loadProfile()`);
    }
}

async function handleUpload(event) {
    event.preventDefault();
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    try {
        const response = await fetch(`/${studentID}/contents`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, description })
        });
        const result = await response.json();
        if (response.ok) {
            document.getElementById("uploadPopup").style.display = "none";
            await loadPosts();
            document.getElementById("uploadForm").reset();
        } else {
            console.log(result.message);
        }
    } catch (error) {
        console.log(`${error} from: handleUpload()`);
    }
}

//When user presses follow in the displayPosts function
async function followUser(username) {
    try {
        const response = await fetch(`/${studentID}/follow`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user: username }) 
        });

        const result = await response.json();
        console.log(`${result} from: followUser()`)

    } catch (error) {
        console.log(`${error} from: followUser()`);
    }
}

async function unfollowUser(username) {
    try {
        const response = await fetch(`/${studentID}/follow`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user: username })  // Changed from username to user
        });

        const result = await response.json();
        console.log(`${result} from: unfollowUser()`)

    } catch (error) {
        console.log(error);
    }
}

async function register() {
    const registerUsername = document.getElementById("registerUsername").value;
    const registerPassword = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const teamSelection = document.querySelector("input[name='team']:checked");

    if (!registerUsername || !registerPassword || !confirmPassword || !teamSelection) {
        console.log("All fields must be filled!");
        return;
    }

    if (registerPassword !== confirmPassword) {
        console.log("Passwords do not match!");
        return;
    }

    const userJSON = JSON.stringify({
        "username": registerUsername,
        "password": registerPassword,
        "team": teamSelection.value,
        "follows": []
    });

    try {
        const response = await fetch(`/${studentID}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: userJSON
        });

        const result = await response.json();
        console.log(`${result} from: register()`);

    } catch (error) {
        console.log(`${error} from: register()`);
    }
}

async function login() {
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
        const statusResponse = await fetch(`/${studentID}/login?username=${encodeURIComponent(loginUsername)}`, {
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
                loadContent("homeTemplate");
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

async function logOut() {
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

async function checkLoginStatus() {
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

            return result
        } else {
            console.log("No user is logged in");
        }
    } catch (error) {
        console.log(`${error} from: checkLoginStatus()`);
    }
}

function applyTheme(team) {
    const navBar = document.getElementById("navBar");

    if (team in teamColours) {
        navBar.style.backgroundColor = teamColours[team];
    } else {
        navBar.style.backgroundColor = "#333";
    }
};


