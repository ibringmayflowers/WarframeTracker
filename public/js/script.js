function validateInput() {
    const input = document.getElementById('warframe');
    const options = document.getElementById('warframeOptions').options;
    let valid = false;
    let matchedValue = ''; // Variable to store the correctly capitalized value

    // Check if input matches any option in the datalist (case insensitive)
    for (let i = 0; i < options.length; i++) {
        if (input.value.trim().toLowerCase() === options[i].value.toLowerCase()) {
            valid = true;
            matchedValue = options[i].value; // Store the correct casing
            break;
        }
    }

    if (!valid) {
        alert('Please select a valid Warframe from the dropdown menu.');
        return false; // Prevent form submission
    }

    // Set the value of the input to the matched value with correct capitalization
    input.value = matchedValue;
    return true; // Allow form submission
}

function validatePasswords() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorMessage = document.getElementById('error-message');
    
    // Check if password is at least 7 characters long
    if (password.length < 7) {
        errorMessage.textContent = 'Password must be at least 7 characters long!';
        return false; // Prevent form submission
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match!';
        return
    }
    // Clear any previous error messages if all validations pass
    errorMessage.textContent = '';
    return true;
}


  