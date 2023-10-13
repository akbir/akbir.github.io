document.addEventListener("DOMContentLoaded", function() {
    const toggle = document.getElementById("darkModeToggle");
    const body = document.body;

    // Check for saved theme preference
    if (localStorage.getItem("dark-mode") === "enabled") {
        body.classList.add("dark-mode");
        toggle.checked = true;
    }

    toggle.addEventListener("change", function() {
        if (this.checked) {
            body.classList.add("dark-mode");
            localStorage.setItem("dark-mode", "enabled");
        } else {
            body.classList.remove("dark-mode");
            localStorage.setItem("dark-mode", null);
        }
    });
});
