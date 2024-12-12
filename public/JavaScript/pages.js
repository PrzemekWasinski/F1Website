import { login, checkLoginStatus } from "./login.js";
import { register } from "./register.js";
import { loadPosts, handleUpload, upload, closePopup, displayPosts } from "./contents.js";

const studentID = "M00931085";

export async function loadContent(templateId) {
    const contentDiv = document.getElementById("content");
    const template = document.getElementById(templateId);
    
    contentDiv.innerHTML = ""; 
    contentDiv.appendChild(template.content.cloneNode(true)); 

    const loginStatus = await checkLoginStatus();

    if (loginStatus["status"] === "logged_in") {
        document.getElementById("loginPageButton").style.display = "none";
        document.getElementById("logOutButton").style.display = "block";
    } else {
        document.getElementById("logOutButton").style.display = "none";
        document.getElementById("loginPageButton").style.display = "block";
    }

    if (templateId === "homeTemplate") {
        if (loginStatus["status"] !== "logged_in") {
            document.getElementById("followedPostsToggle").style.display = "none";
        }
        const followedPostsToggle = document.getElementById("followedPostsToggle");
        if (followedPostsToggle) {
            followedPostsToggle.addEventListener("click", async function() {
                const button = this;
                try {
                    if (loginStatus.status !== "logged_in") {
                        return;
                    }
        
                    const showingFollowed = button.textContent === "Show All Posts";
                    button.disabled = true;
        
                    await loadPosts(!showingFollowed);
                    
                    button.textContent = showingFollowed 
                        ? "Show Followed Users' Posts"
                        : "Show All Posts";
        
                } catch (error) {
                    console.error('Error toggling posts:', error);
                } finally {
                    button.disabled = false;
                }
            });
        }
        try {
            await loadPosts();

            const loginResponse = await checkLoginStatus();
            // Ensure loginResponse is properly parsed
            const loginStatus = typeof loginResponse === 'string' ? JSON.parse(loginResponse) : loginResponse;
            
            const uploadButton = document.getElementById("uploadButton");
            if (uploadButton && loginStatus.status === "logged_in") {
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
                    
                    try {
                        let posts;
                        const response = await fetch(searchQuery 
                            ? `/${studentID}/contents/search?q=${encodeURIComponent(searchQuery)}`
                            : `/${studentID}/contents/all`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json"
                            }
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const text = await response.text();
                        if (!text) {
                            throw new Error('Empty response received');
                        }

                        try {
                            posts = JSON.parse(text);
                        } catch (error) {
                            console.error('Failed to parse JSON:', text);
                            throw new Error('Invalid JSON response');
                        }

                        if (!Array.isArray(posts) || posts.length === 0) {
                            const postsContainer = document.getElementById("posts-container");
                            postsContainer.innerHTML = "<p>No posts found matching your search.</p>";
                            return;
                        }

                        await displayPosts(posts);

                    } catch (error) {
                        console.error('Search error:', error);
                        const postsContainer = document.getElementById("posts-container");
                        postsContainer.innerHTML = `<p>Error searching posts: ${error.message}</p>`;
                    }
                });
            }

            const uploadButtonElement = document.getElementById("uploadButton");
            if (uploadButtonElement) {
                uploadButtonElement.addEventListener("click", function() {
                    upload();
                });
            }

            const closeUploadPopupElement = document.getElementById("closeUploadPopup");
            if (closeUploadPopupElement) {
                closeUploadPopupElement.addEventListener("click", function() {
                    closePopup();
                });
            }

        } catch (error) {
            console.error('Error in loadContent:', error);
            contentDiv.innerHTML = `<p>Error loading content: ${error.message}</p>`;
        }

    } else if (templateId === "loginTemplate") {
        const loginButton = document.getElementById("loginButton");
        if (loginButton) {
            loginButton.addEventListener("click", function() {
                login();
            });
        }

        const registerPageButton = document.getElementById("loginRegisterPageButton");

        if (registerPageButton) {
            registerPageButton.addEventListener("click", function() {
                const contentDiv = document.getElementById("content");
                const template = document.getElementById("registerTemplate");

                if (template) {
                    contentDiv.innerHTML = "";
                    contentDiv.appendChild(template.content.cloneNode(true));
                } else {
                    console.error("registerTemplate not found");
                }

                const registerButton = document.getElementById("registerButton");
                if (registerButton) {
                    registerButton.addEventListener("click", function() {
                        register();
                    });
                }
            });
        }
    }
}