async function ownedButtonClick(frame){
    let button = document.getElementById('toggleOwnership');
    let initialText = button.textContent;
    let initialOwnership = initialText.startsWith(" I no longer own");
    let newText = !initialOwnership ? initialText.replace("I now own", "I no longer own") : initialText.replace("I no longer own", "I now own");
    let spanObj = document.getElementById('ownership')
    spanObj.textContent = initialOwnership? "do not" : "do";
    button.textContent = newText;

    try{
        currentPath = window.location.pathname;
        const response = await fetch(currentPath+"/ownership", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({frame: frame, nowOwns: !initialOwnership})
        });

        if(!response.ok){
            button.textContent("Nework Error");
        }
    }catch{
        console.error("Oh no! it all went wrong!");
    }
}


document.addEventListener("DOMContentLoaded", function() {
    // Toggle the visibility of the dropdown form
    document.getElementById("dropdownToggle").addEventListener("click", function() {
        const dropdownForm = document.getElementById("dropdownForm");
        dropdownForm.style.display = dropdownForm.style.display === "none" ? "block" : "none";
    });

    // Handle the form submission without calling the original button's method
    document.getElementById("checkboxForm").addEventListener("submit", async function(event) {
        event.preventDefault();  // Prevent the form from submitting normally

        // Gather checkbox values
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const selectedValues = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.name); // Get the name of checked checkboxes

        // Prepare the data to send
        const data = {
            selected: selectedValues,
            frameName: document.getElementById("frameName").value
        };

        try {
            // Send the data to the server asynchronously
            const response = await fetch('/warframes/updateFrameOwnership', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            // Check if the request was successful
            if (response.ok) {
                console.log("Ownership updated successfully.");
            } else {
                console.error("Error updating ownership:", response.statusText);
            }
        } catch (error) {
            console.error("Network error:", error);
        }

        // Close the dropdown form
        document.getElementById("dropdownForm").style.display = "none";
    });
});
