import { loadProfile } from "./profile.js";

export function displaySearchResults(users) {
    const overlay = document.querySelector(".popup-overlay");
    const searchResults = document.getElementById("searchResults");
    
    searchResults.innerHTML = '';
    
    if (users.length === 0) {
        searchResults.innerHTML = "<p>No users found</p>";
    } else {
        users.forEach(user => {
            const userDiv = document.createElement("div");
            userDiv.className = "user-result";
            userDiv.innerHTML = `
                <a href="#" class="username-link">${user.username}</a>
            `;
            const usernameLink = userDiv.querySelector(".username-link");
            usernameLink.addEventListener("click", (event) => {
                event.preventDefault();
                loadProfile(user.username);
                closeSearchPopup();
            });

            searchResults.appendChild(userDiv);
        });
    }
    
    overlay.style.display = "block";
    
    document.getElementById("closeSearchButton").addEventListener("click", closeSearchPopup);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            closeSearchPopup();
        }
    });
}

function closeSearchPopup() {
    const overlay = document.querySelector(".popup-overlay");
    overlay.style.display = "none";
}