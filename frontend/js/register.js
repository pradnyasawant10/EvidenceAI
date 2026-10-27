// =====================================
// EvidenceAI - Registration
// =====================================

const registerForm = document.getElementById("registerForm");


registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    // =====================================
    // Get Form Values
    // =====================================

    const firstName =
        document.getElementById("firstName").value.trim();

    const lastName =
        document.getElementById("lastName").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const terms =
        document.getElementById("terms").checked;


    // =====================================
    // Frontend Validation
    // =====================================

    if (firstName === "") {

        alert("Please enter your first name.");
        return;

    }


    if (lastName === "") {

        alert("Please enter your last name.");
        return;

    }


    if (email === "") {

        alert("Please enter your email address.");
        return;

    }


    if (password.length < 6) {

        alert("Password must contain at least 6 characters.");
        return;

    }


    if (password !== confirmPassword) {

        alert("Passwords do not match.");
        return;

    }


    if (!terms) {

        alert("Please agree to the Terms & Conditions.");
        return;

    }


    // =====================================
    // Send Data to Flask
    // =====================================

var API_URL = window.API_URL || ((window.location.protocol === "file:" || ["5500", "5501", "3000", "8000"].includes(window.location.port)) ? "http://127.0.0.1:5000" : window.location.origin);
window.API_URL = API_URL;

    try {

        const response = await fetch(
            `${API_URL}/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password

                })
            }
        );


        const result = await response.json();


        // =====================================
        // Registration Successful
        // =====================================

        if (result.success) {

            document
                .getElementById("successModal")
                .style.display = "flex";

        }


        // =====================================
        // Registration Failed
        // =====================================

        else {

            alert(result.message);

        }


    }

    catch (error) {

        console.error("Registration Error:", error);

        alert(
            "Unable to connect to the server. " +
            "Please make sure Flask is running."
        );

    }

});


// =====================================
// OK Button
// =====================================

const successOkBtn =
    document.getElementById("successOkBtn");


successOkBtn.addEventListener("click", function () {

    window.location.href = "login.html";

});