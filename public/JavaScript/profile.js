import { checkLoginStatus } from "./login.js";
import { loadContent } from "./pages.js";

const studentID = "M00931085";

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

export async function loadProfile(username) { 
    let buttonText = "Follow";
    let isFollowing = false;
    
    try {
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

        const postsResponse = await fetch(`/${studentID}/users/${username}/posts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const postsResult = await postsResponse.json();
        const posts = postsResult.posts || [];

        const loginStatus = await checkLoginStatus();
        const isLoggedIn = loginStatus.status === "logged_in";
        const currentUser = loginStatus.username;

        let postsHTML = "";
        for (const post of posts) {
            let fileDisplay = "";
            if (post.fileName) {
                const filePath = `/uploads/${post.fileName}`;
                const fileExtension = post.fileName.split(".").pop().toLowerCase();
                
                if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
                    fileDisplay = `
                        <div class="post-media">
                            <div class="post-image-container">
                                <img src="${filePath}" alt="Uploaded content" class="post-image">
                            </div>
                        </div>`;
                }
                else if (["mp4", "webm"].includes(fileExtension)) {
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
            }

            const likesCount = post.likes ? post.likes.length : 0;
            const isLiked = post.likes && currentUser && post.likes.includes(currentUser);
            const commentsCount = post.comments ? post.comments.length : 0;

            const actionButtons = isLoggedIn ? `
                <div class="post-actions">
                    <button class="like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post._id}">
                        ${isLiked ? 'Unlike' : 'Like'} (${likesCount})
                    </button>
                    <button class="comment-btn" data-post-id="${post._id}">
                        Comment (${commentsCount})
                    </button>
                </div>
            ` : `
                <div class="post-actions">
                    <span>Likes: ${likesCount}</span>
                    <span>Comments: ${commentsCount}</span>
                </div>
            `;

            postsHTML += `
                <div class="post">
                    <div class="post-content">
                        <h3 class="post-title">${post.title}</h3>
                        <p class="post-description">${post.description}</p>
                        ${fileDisplay}
                        <div class="post-footer">
                            <small>Posted by: ${post.username}</small>
                            ${actionButtons}
                        </div>
                    </div>
                </div>
            `;
        }

        const profileTemplate = document.getElementById("profileTemplate");

        let followButtonHTML = "";
        if (isLoggedIn && currentUser !== username) {
            followButtonHTML = `<button id="followButton">${buttonText}</button>`;
        }

        const postsSectionHTML = posts.length > 0 ? postsHTML : "<p>No posts yet.</p>";

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

        // Add event listeners for like and comment buttons if user is logged in
        if (isLoggedIn) {
            document.querySelectorAll('.like-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const postId = event.target.dataset.postId;
                    try {
                        const result = await toggleLike(postId, currentUser);
                        const newLikeCount = result.likes.length;
                        const newIsLiked = result.liked;
                        button.textContent = `${newIsLiked ? 'Unlike' : 'Like'} (${newLikeCount})`;
                        button.className = `like-btn ${newIsLiked ? 'liked' : ''}`;
                    } catch (error) {
                        console.error('Failed to toggle like:', error);
                        alert('Failed to update like status. Please try again.');
                    }
                });
            });

            document.querySelectorAll('.comment-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const postId = event.target.dataset.postId;
                    // Implement your comment functionality here
                    // This should open your comment modal or comment interface
                });
            });
        }

    } catch (error) {
        console.log(`${error} from: ()`);
    }
}