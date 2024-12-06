const studentID = "M00931085";

window.onload = async function() {
    await checkLoginStatus();
    await loadPosts();
    loadContent("homeTemplate");
};

// Navigation button event listeners
document.getElementById("homePageButton").addEventListener("click", () => loadContent("homeTemplate"));
document.getElementById("registerPageButton").addEventListener("click", () => loadContent("registerTemplate"));
document.getElementById("loginPageButton").addEventListener("click", () => loadContent("loginTemplate"));
document.getElementById("logOutButton").addEventListener("click", logOut);

// Modify window.onload to load posts
window.onload = async function() {
    await checkLoginStatus();
    loadContent("homeTemplate");
};

// Modified loadContent to ensure posts are loaded
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
    }
}

// Function to load posts
async function loadPosts() {
    try {
        const response = await fetch(`/${studentID}/contents`);
        if (!response.ok) {
            throw new `Error(HTTP error! status: ${response.status})`;
        }
        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.log(`Error loading posts: ${error}`);
    }
}

// Function to display posts
async function displayPosts(posts) {
    const uploadedItems = document.getElementById("uploadedItems");
    if (!uploadedItems) return;
    
    uploadedItems.innerHTML = "";
    
    if (posts.length === 0) {
        uploadedItems.innerHTML = '<p>No posts yet!</p>';
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
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
        const usernameLink = postElement.querySelector('.username-link');
        usernameLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadProfile(post.username);
        });

        uploadedItems.appendChild(postElement);
    });
}

async function loadProfile(username) {
    let buttonText = "Follow";
    let isFollowing = false;
    
    try {
        const response = await fetch(`/${studentID}/following`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();
        for (let i = 0; i < result.following.length; i++) {
            if (result.following[i] == username) {
                buttonText = "Unfollow";
                isFollowing = true;
            }
        }

        const profileTemplate = document.getElementById("profileTemplate");
        profileTemplate.innerHTML = 
        `
        <p>${username}</p>
        <button id="followButton">${buttonText}</button>
        `;

        loadContent("profileTemplate");

        setTimeout(() => {
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
        }, 0);

    } catch (error) {
        console.log(error);
    }
}

function upload() {
    document.getElementById("uploadPopup").style.display = "block";
}

function closePopup() {
    document.getElementById("uploadPopup").style.display = "none";
}

async function handleUpload(e) {
    e.preventDefault();
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
            closePopup();
            await loadPosts();
            document.getElementById("uploadForm").reset();
        } else {
            console.log(result.message);
        }
    } catch (error) {
        console.log(`Error creating post: ${error}`);
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
            body: JSON.stringify({ user: username })  // Changed from username to user
        });
        
        if (!response.ok) {
            throw new Error('Failed to follow user');
        }
    } catch (error) {
        console.log(error);
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
        
        if (!response.ok) {
            throw new Error('Failed to unfollow user');
        }
    } catch (error) {
        console.log(error);
    }
}

async function register() {
    const registerUsername = document.getElementById("registerUsername").value;
    const registerPassword = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const teamSelection = document.querySelector('input[name="team"]:checked');

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
        console.log("Register attempt:", result.message);

    } catch (error) {
        console.log(`${error} (from sending register request)`);
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
                localStorage.setItem('userTeam', loginResult["team"]);
                console.log("Login successful!");
                loadContent("homeTemplate");
            } else {
                console.log("Login failed:", loginResult.message);
            }
        } else {
            console.log("Log out first")
        }

    } catch (error) {
        console.log(`${error} (from sending login request)`);
    }
}

async function logOut() {
    const navBar = document.getElementById("navBar");
    navBar.style.backgroundColor = "#333";
    localStorage.removeItem('userTeam');

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
        console.log(`${error} (from sending logout request)`);
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
            console.log("No user is currently logged in");
        }
    } catch (error) {
        console.log(`${error} (from checking login status)`);
    }
}

function applyTheme(team) {
    const navBar = document.getElementById("navBar");

    switch (team) {
        case "Red Bull":
            navBar.style.backgroundColor = "#1E41FF";
            break;
        case "Ferrari":
            navBar.style.backgroundColor = "#DC0000";
            break;
        case "McLaren":
            navBar.style.backgroundColor = "#FF8700";
            break;
        case "Mercedes":
            navBar.style.backgroundColor = "#00D2BE";
            break;
        case "Aston Martin":
            navBar.style.backgroundColor = "#006F62";
            break;
        case "Alpine":
            navBar.style.backgroundColor = "#0090FF";
            break;
        case "Haas":
            navBar.style.backgroundColor = "#FFFFFF";
            break;
        case "RB":
            navBar.style.backgroundColor = "#1E41FF";
            break;
        case "Williams":
            navBar.style.backgroundColor = "#005AFF";
            break;
        case "Sauber":
            navBar.style.backgroundColor = "#00D2BE";
            break;
        default:
            navBar.style.backgroundColor = "#333";
    }
};
