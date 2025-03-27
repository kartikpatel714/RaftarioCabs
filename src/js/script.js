document.addEventListener("DOMContentLoaded", function () {
    // Load header and footer dynamically
    fetch("header.html")
        .then(response => response.text())
        .then(data => document.getElementById("header-container").innerHTML = data);

    fetch("footer.html")
        .then(response => response.text())
        .then(data => document.getElementById("footer-container").innerHTML = data);
});

// Highlight active menu item
function setActiveMenu(element) {
    document.querySelectorAll(".navbar-nav .nav-link").forEach(link => link.classList.remove("active-menu"));
    element.classList.add("active-menu");
}

// Show different booking forms
function showForm(type, element) {
    document.querySelectorAll(".form-container").forEach(form => form.style.display = "none");
    document.querySelectorAll(".header-field button").forEach(btn => btn.classList.remove("active-button"));

    document.getElementById(type + "-form").style.display = "block";
    element.classList.add("active-button");
}


// Initialize Google Places Autocomplete
function initAutocomplete() {
    const pickupFields = ['daily-pickup', 'rental-pickup', 'outstation-pickup'];
    const dropFields = ['daily-drop', 'rental-drop', 'outstation-drop'];

    pickupFields.forEach(id => {
        new google.maps.places.Autocomplete(document.getElementById(id));
    });
    dropFields.forEach(id => {
        new google.maps.places.Autocomplete(document.getElementById(id));
    });
}

// google.maps.event.addDomListener(window, "load", initAutocomplete);

document.addEventListener("DOMContentLoaded", function () {
    async function submitForm(type) {
        const pickup = document.getElementById(`${type}-pickup`).value;
        const drop = document.getElementById(`${type}-drop`).value;

        if (!pickup || !drop) {
            alert("Please enter both pickup and drop locations.");
            return;
        }

        const requestData = { type, pickup, drop };

        try {
            const response = await fetch("http://localhost:3000/api/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const result = await response.json();

            if (response.ok) {
                // Store data in sessionStorage
                sessionStorage.setItem("fareData", JSON.stringify(result));
                sessionStorage.setItem("tripDetails", JSON.stringify(requestData));

                // Redirect to fare page
                window.location.href = "fare.html";
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Something went wrong. Please try again.");
        }
    }

    // Attach event listeners to buttons
    document.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", function () {
            const type = this.getAttribute("onclick").match(/'(\w+)'/)[1];
            submitForm(type);
        });
    });
});

