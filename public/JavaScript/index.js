const studentID = "M00931085";

window.onload = async function() {
    await checkLoginStatus();
    await loadPosts();
    loadContent("homeTemplate");
};

document.getElementById("homePageButton").addEventListener("click", function() {
    loadContent("homeTemplate");
    setupSearchListener();
    initializeUploadHandlers();
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
    document.getElementById('uploadForm').addEventListener('submit', uploadFile());
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
            <button id="closeSearchButton" class="close-button">x</button>
        </div>
    `;
    
    if (users.length === 0) {
        searchResults.innerHTML += "<p>No users found</p>";
    } else {
        users.forEach(user => {
            const userDiv = document.createElement("div");
            userDiv.className = "user-result";
            userDiv.innerHTML = `
                <a href="#" class="profile-link" onclick="loadProfile('${user.username}'); closeSearchPopup(); return false;">${user.username}</a>
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

                        const usernameLink = postElement.querySelector(".username-link");
                        usernameLink.addEventListener("click", (event) => {
                            event.preventDefault();
                            loadProfile(post.username);
                        });
                        postsContainer.appendChild(postElement);
                    }                    

                } catch (error) {
                    console.log(`${error} from setupsSearchEventListener()`)
                }
            }
        });
    }
}

function uploadFile(e) {
    console.log('Upload function called!');
    e.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput.files[0];

    console.log("File selected:", file);

    const formData = new FormData();
    formData.append('uploadFile', file);
    formData.append('title', title);
    formData.append('description', description);

    fetch(`/${studentID}/upload`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Server response:", data);
        alert(data.message);
        if (data.message === "upload successful") {
            closePopup();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during upload');
    });
}

// Function to show the upload popup
function upload() {
    document.getElementById('uploadPopup').style.display = 'block';
}

// Function to close the popup
function closePopup() {
    document.getElementById('uploadPopup').style.display = 'none';
}

function initializeUploadHandlers() {
    const form = document.getElementById('uploadForm');
    if (form) {
        form.addEventListener('submit', uploadFile);
        console.log('Upload form handler initialized');
    }
}


async function loadContent(templateId) {
    const contentDiv = document.getElementById("content");
    const template = document.getElementById(templateId);
    
    contentDiv.innerHTML = ""; 
    contentDiv.appendChild(template.content.cloneNode(true)); 

    if (templateId === "homeTemplate") {
        await loadPosts();

        const isLoggedIn = await checkLoginStatus();
        const uploadButton = document.getElementById("uploadButton");
        if (uploadButton && isLoggedIn["status"] == "logged_in") {
            uploadButton.style.display = "block";
        }

        const uploadForm = document.getElementById("uploadForm");
        if (uploadForm) {
            uploadForm.addEventListener("submit", handleUpload);
        }

        const searchButton = document.getElementById("postSearchButton");
        if (searchButton) {
            searchButton.addEventListener("click", async function() {
                const searchQuery = document.getElementById("postSearch").value.trim();
                const postsContainer = document.getElementById("posts-container");

                postsContainer.innerHTML = "";
                
                if (searchQuery) {
                    try {
                        const response = await fetch(`/${studentID}/contents/search?q=${encodeURIComponent(searchQuery)}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json"
                            }
                        });

                        const posts = await response.json();
                        console.log("Search results:", posts); // Debug log
                                               
                        if (posts.length === 0) {
                            postsContainer.innerHTML = "<p>No posts found matching your search.</p>";
                            return;
                        }
                        
                        for (let i = 0; i < posts.length; i++) {
                            const post = posts[i];
                            console.log("Processing post:", post); // Debug log

                            const postElement = document.createElement("div");
                            postElement.className = "post";

                            // Check for file in multiple possible property names FIXLATER
                            const file = post.fileName || post.file || post.uploadFile || post.filepath || post.file_name;
                            
                            if (file) {
                                let fileDisplay = '';
                                if (post.fileName) {
                                    const filePath = `/uploads/${post.fileName}`; //path to uploads folder
                                    const fileExtension = post.fileName.split('.').pop().toLowerCase();
                                    
                                    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                                        fileDisplay = `
                                            <div class="media-container">
                                                <img src="${filePath}" alt="Uploaded content" class="post-image">
                                            </div>`;
                                    }
                                    else if (['mp4', 'webm'].includes(fileExtension)) {
                                        fileDisplay = `
                                            <div class="media-container">
                                                <video controls class="post-video">
                                                    <source src="${filePath}" type="video/${fileExtension}">
                                                    Your browser does not support the video tag.
                                                </video>
                                            </div>`;
                                    }
                                    else if (['mp3', 'wav'].includes(fileExtension)) {
                                        fileDisplay = `
                                            <div class="media-container">
                                                <audio controls class="post-audio">
                                                    <source src="${filePath}" type="audio/${fileExtension}">
                                                    Your browser does not support the audio tag.
                                                </audio>
                                            </div>`;
                                    }
                                    else {
                                        fileDisplay = `
                                            <div class="media-container">
                                                <a href="${filePath}" download class="file-download">Download ${post.fileName}</a>
                                            </div>`;
                                    }
                                }

                                postElement.innerHTML = `
                                    <h3>${post.title}</h3>
                                    <p>${post.description}</p>
                                    ${fileDisplay}
                                    <div class="post-footer">
                                        <small>Posted by: 
                                            <a href="#" class="username-link" data-username="${post.username}">
                                                ${post.username}
                                            </a>
                                        </small>
                                    </div>
                                `;

                                const usernameLink = postElement.querySelector(".username-link");
                                usernameLink.addEventListener("click", (event) => {
                                    event.preventDefault();
                                    loadProfile(post.username);
                                });
                                postsContainer.appendChild(postElement);  
                            }
                        }

        
                    
                    } catch (error) {
                        console.log(`${error} from loadContent()`);
                        postsContainer.innerHTML = "<p>Error searching posts. Please try again.</p>";
                    }
                } else {
                    // If search is empty, reload all posts
                    await loadPosts();
                }
            });

            // Add Enter key support for search
            const searchInput = document.getElementById("postSearch");
            if (searchInput) {
                searchInput.addEventListener("keypress", function(event) {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        searchButton.click();
                    }
                });
            }
        }
    }
}

// Function to load posts
async function loadPosts() {
    try {
        const response = await fetch(`/${studentID}/contents`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const posts = await response.json();
        console.log(posts)
        displayPosts(posts);
    } catch (error) {
        console.log(`${error} from: loadPosts()`);
    }
}


// Function to display posts
function displayPosts(posts) {
    const postsContainer = document.getElementById("posts-container");
    postsContainer.innerHTML = "";

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const postElement = document.createElement("div");
        postElement.className = "post";
        
        let fileDisplay = '';
        if (post.fileName) {
            const filePath = `/uploads/${post.fileName}`; //path to uploads folder
            const fileExtension = post.fileName.split('.').pop().toLowerCase();
            
            if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                fileDisplay = `
                    <div class="media-container">
                        <img src="${filePath}" alt="Uploaded content" class="post-image">
                    </div>`;
            }
            else if (['mp4', 'webm'].includes(fileExtension)) {
                fileDisplay = `
                    <div class="media-container">
                        <video controls class="post-video">
                            <source src="${filePath}" type="video/${fileExtension}">
                            Your browser does not support the video tag.
                        </video>
                    </div>`;
            }
            else if (['mp3', 'wav'].includes(fileExtension)) {
                fileDisplay = `
                    <div class="media-container">
                        <audio controls class="post-audio">
                            <source src="${filePath}" type="audio/${fileExtension}">
                            Your browser does not support the audio tag.
                        </audio>
                    </div>`;
            }
            else {
                fileDisplay = `
                    <div class="media-container">
                        <a href="${filePath}" download class="file-download">Download ${post.fileName}</a>
                    </div>`;
            }
        }

        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.description}</p>
            ${fileDisplay}
            <div class="post-footer">
                <small>Posted by: 
                    <a href="#" class="username-link" data-username="${post.username}">
                        ${post.username}
                    </a>
                </small>
            </div>
        `;

        const usernameLink = postElement.querySelector(".username-link");
        usernameLink.addEventListener("click", (event) => {
            event.preventDefault();
            loadProfile(post.username);
        });
        
        postsContainer.appendChild(postElement);
    }
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
            
            let fileDisplay = '';
            if (post.fileName) {
                const filePath = `/uploads/${post.fileName}`;
                const fileExtension = post.fileName.split('.').pop().toLowerCase();
                
                if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
                    fileDisplay = `
                        <div class="post-media">
                            <div class="post-image-container">
                                <img src="${filePath}" alt="Uploaded content" class="post-image">
                            </div>
                        </div>`;
                }
                else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
                    fileDisplay = `
                        <div class="post-media">
                            <div class="post-video-container">
                                <video controls class="post-video">
                                    <source src="${filePath}" type="video/${fileExtension}">
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>`;
                }
                else if (['mp3', 'wav'].includes(fileExtension)) {
                    fileDisplay = `
                        <div class="post-media">
                            <div class="post-audio-container">
                                <audio controls class="post-audio">
                                    <source src="${filePath}" type="audio/${fileExtension}">
                                    Your browser does not support the audio tag.
                                </audio>
                            </div>
                        </div>`;
                }
                else {
                    fileDisplay = `
                        <div class="post-media">
                            <div class="post-file-container">
                                <a href="${filePath}" download class="file-download">
                                    <i class="fas fa-download"></i> Download ${post.fileName}
                                </a>
                            </div>
                        </div>`;
                }
            }

            postsHTML += `
                <div class="post">
                    <div class="post-content">
                        <h3 class="post-title">${post.title}</h3>
                        <p class="post-description">${post.description}</p>
                        ${fileDisplay}
                        <div class="post-footer">
                            <small>Posted by: ${post.username}</small>
                        </div>
                    </div>
                </div>
            `;
        }

        const isLoggedIn = await checkLoginStatus();
        let currentUser = null;

        const profileTemplate = document.getElementById("profileTemplate");

        let followButtonHTML = "";
        if (isLoggedIn["status"] === "logged_in" && currentUser != username) {
            followButtonHTML = `<button id="followButton">${buttonText}</button>`;
            currentUser = isLoggedIn["username"]
        }

        let postsSectionHTML;
        if (posts.length > 0) {
            postsSectionHTML = postsHTML;
        } else {
            postsSectionHTML = "<p>No posts yet.</p>";
        }

        profileTemplate.innerHTML = `
            <div class="profile-header">
                <h2>${username}'s Profile</h2>
                ${followButtonHTML}
            </div>
            <div class="posts-section">
                <h3>Posts</h3>
                ${postsSectionHTML}
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

const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mp3', 'wav']; 

async function handleUpload(event) {
    event.preventDefault();
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput.files[0];

    try {
        if (file) {
            // Get file extension and check if it's allowed
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (!allowedExtensions.includes(fileExtension)) {
                alert(`Invalid file type. Allowed types are: ${allowedExtensions.join(', ')}`);
                return;
            }
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (file) {
            formData.append('uploadFile', file);
        }
        
        const response = await fetch(`/${studentID}/contents`, {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            document.getElementById("uploadPopup").style.display = "none";
            await loadPosts();
            document.getElementById("uploadForm").reset();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Upload error:", error);
        alert("Error uploading: " + error.message);
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

            console.log(result)
            return result
        } else {
            console.log("No user is logged in");
            return result;
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


