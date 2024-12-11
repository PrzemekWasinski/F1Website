import { logOut, checkLoginStatus } from "./login.js";
import { loadSeasonsTemplate } from "./api.js";
import { displaySearchResults } from "./search.js";
import { loadPosts, handleUpload } from "./contents.js";
import { loadContent } from "./pages.js";


const studentID = "M00931085";

document.getElementById("homePageButton").addEventListener("click", function() {
    loadContent("homeTemplate");
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
    logOut();
})

// Modify window.onload to load posts
window.onload = async function() {
    await checkLoginStatus();
    loadContent("homeTemplate");
    document.getElementById('uploadForm').addEventListener('submit', handleUpload());
};

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



