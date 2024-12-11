import { loadProfile } from "./profile.js";

function closeSearchPopup() {
    document.getElementById("searchPopup").style.display = "none";
}

export function displaySearchResults(users) {
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
                <a href="#" class="username-link"; closeSearchPopup(); return false;">${user.username}</a>
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
    searchPopup.style.display = "block";
    document.getElementById("closeSearchButton").addEventListener("click", closeSearchPopup);
}
