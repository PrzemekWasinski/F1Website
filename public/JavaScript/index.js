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

// Function to set up search functionality

const userSearchInput = document.getElementById('userSearch');
const userSearchButton = document.getElementById('userSearchButton');

// Create a popup element for displaying search results
const searchPopup = document.createElement('div');
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

userSearchButton.addEventListener('click', async () => {
    const searchTerm = userSearchInput.value.trim();
    if (searchTerm === '') return;

    try {
        const response = await fetch(`/${studentID}/users/search?term=${encodeURIComponent(searchTerm)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const users = await response.json();
        displaySearchResults(users);
    } catch (error) {
        console.error('Error searching users:', error);
        alert('Failed to search users');
    }
});

// Function to display search results
// Update the displaySearchResults function in index.js
function displaySearchResults(users) {
    const searchPopup = document.getElementById('searchPopup');
    const searchResults = document.getElementById('searchResults');
    
    searchResults.innerHTML = `
        <div class="search-header">
            <button id="closeSearchButton" class="close-button">×</button>
        </div>
    `;
    
    if (users.length === 0) {
        searchResults.innerHTML += '<p>No users found</p>';
    } else {
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'user-result';
            userDiv.innerHTML = `
                <p><strong>Username:</strong> <a href="#" class="profile-link" onclick="loadProfile('${user.username}'); closeSearchPopup(); return false;">${user.username}</a></p>
                <p><strong>Team:</strong> ${user.team}</p>
            `;
            searchResults.appendChild(userDiv);
        });
    }
    
    searchPopup.style.display = 'block';

    // Add event listener for close button
    document.getElementById('closeSearchButton').addEventListener('click', closeSearchPopup);
}

// Add this new function
function closeSearchPopup() {
    const searchPopup = document.getElementById('searchPopup');
    searchPopup.style.display = 'none';
}

// Add this style to the existing style element
style.textContent += `
    .profile-link {
        color: #2196F3;
        text-decoration: none;
    }

    .profile-link:hover {
        text-decoration: underline;
        cursor: pointer;
    }
`;

// Function to close the search popup
function closeSearchPopup() {
    document.getElementById('searchPopup').style.display = 'none';
}

// Close popup when clicking outside
window.addEventListener('click', (event) => {
    const searchPopup = document.getElementById('searchPopup');
    if (event.target === searchPopup) {
        searchPopup.style.display = 'none';
    }
});

function setupSearchListener() {
    const searchButton = document.getElementById('postSearchButton');
    if (searchButton) {
        searchButton.addEventListener('click', async function() {
            const searchQuery = document.getElementById('postSearch').value.trim();
            if (searchQuery) {
                try {
                    const response = await fetch(`http://localhost:8080/103600677/contents/search?q=${encodeURIComponent(searchQuery)}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Search failed');
                    }

                    const posts = await response.json();
                    
                    const postsContainer = document.getElementById('posts-container');
                    postsContainer.innerHTML = ''; // Clear existing posts
                    
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
                        postsContainer.appendChild(postElement);
                    });
                } catch (error) {
                    console.error('Error searching posts:', error);
                }
            }
        });
    }
}

// Call this function when loading the home template
function loadHome() {
    const template = document.getElementById('homeTemplate');
    const content = document.getElementById('content');
    
    content.innerHTML = '';
    const clone = template.content.cloneNode(true);
    content.appendChild(clone);
    
    // Set up search listener after the template is loaded
    setupSearchListener();
    
    // Rest of your loadHome function...
}

// If you have a router or navigation system, make sure to call loadHome() when navigating to the home page

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

        // Set up search functionality
        const searchButton = document.getElementById('postSearchButton');
        if (searchButton) {
            searchButton.addEventListener('click', async function() {
                const searchQuery = document.getElementById('postSearch').value.trim();
                const postsContainer = document.getElementById('posts-container'); // Make sure this matches your div ID
                const uploadsContainer = document.getElementById("posts-container");

                postsContainer.innerHTML = '';
                uploadsContainer.innerHTML = "";
                if (searchQuery) {
                    try {
                        const response = await fetch(`http://localhost:8080/${studentID}/content/search?q=${encodeURIComponent(searchQuery)}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        if (!response.ok) {
                            throw new Error(`Search failed with status ${response.status}`);
                        }

                        const posts = await response.json();
                        
                        // Clear existing posts and only show search results
                        
                        
                        if (posts.length === 0) {
                            postsContainer.innerHTML = '<p>No posts found matching your search.</p>';
                            return;
                        }
                        
                        posts.forEach(post => {
                            const postElement = document.createElement('div');
                            postElement.className = 'post';
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
                        console.error('Error searching posts:', error);
                        postsContainer.innerHTML = '<p>Error searching posts. Please try again.</p>';
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
    const uploadedItems = document.getElementById("posts-container");
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
        // Fetch following status
        const followingResponse = await fetch(`/${studentID}/following`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const followingResult = await followingResponse.json();
        
        if (followingResult.following && followingResult.following.length > 0) {
            isFollowing = followingResult.following.includes(username);
            buttonText = isFollowing ? "Unfollow" : "Follow";
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
        console.log('Posts result:', postsResult);

        // Check if posts exist in the response
        const posts = postsResult.posts || [];

        const postsHTML = posts.map(post => `
            <div class="post">
                <div class="post-details">
                    <span class="post-username">${post.username}</span>
                    <br>
                    <span class="post-description">${post.title}</span>
                    <br>
                    <span class="post-description">${post.description}</span>
                </div>
            </div>
        `).join('');

        const profileTemplate = document.getElementById("profileTemplate");
        profileTemplate.innerHTML = `
            <div class="profile-header">
                <h2>${username}'s Profile</h2>
                <button id="followButton">${buttonText}</button>
            </div>
            <div class="posts-section">
                <h3>Posts</h3>
                ${posts.length > 0 ? postsHTML : '<p>No posts yet.</p>'}
            </div>
        `;

        loadContent("profileTemplate");

        // Set up follow button functionality
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
        console.error('Profile loading error:', error);
        console.log('Error details:', error.message);
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


