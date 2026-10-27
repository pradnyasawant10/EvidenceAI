var API_URL = window.API_URL || ((window.location.protocol === "file:" || ["5500", "5501", "3000", "8000"].includes(window.location.port)) ? "http://127.0.0.1:5000" : window.location.origin);
window.API_URL = API_URL;

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginBtn = document.getElementById("loginBtn");


loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;


    loginMessage.textContent = "";
    loginMessage.style.color = "";


    if (!email || !password) {

        loginMessage.textContent =
            "Please enter email and password.";

        loginMessage.style.color = "red";

        return;
    }


    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";


    try {

        const response = await fetch(
            `${API_URL}/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );


        const data = await response.json();


        if (response.ok && data.success) {

            loginMessage.textContent =
                "Login successful. Redirecting...";

            loginMessage.style.color = "green";


            // Save current user information
            if (data.user) {
                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(data.user)
                );
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );
                localStorage.setItem(
                    "user_id",
                    data.user.user_id
                );
                localStorage.setItem(
                    "loggedIn",
                    "true"
                );
            }


            setTimeout(function () {

                window.location.href =
                    "dashboard.html";

            }, 600);

        } else {

            loginMessage.textContent =
                data.message ||
                "Invalid email or password.";

            loginMessage.style.color = "red";
        }


    } catch (error) {

        console.error(
            "Login Error:",
            error
        );


        loginMessage.textContent =
            "Unable to connect to EvidenceAI backend.";

        loginMessage.style.color = "red";

    } finally {

        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }

});