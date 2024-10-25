document.addEventListener('DOMContentLoaded', function() {
    const filterTypeSelector = document.getElementById('checklistFilterType');
    const filterContainer = document.querySelector('.checklistFilter');

    filterTypeSelector.addEventListener('change', updateFilterType);

    // Initialize filter input or dropdown on page load
    updateFilterType();

    function updateFilterType() {
        const filterType = filterTypeSelector.value;
        const filterInput = document.getElementById('filterInput');

        // Change input to dropdown if ownership is selected
        if (filterType === 'ownership') {
            if (filterInput) {
                filterInput.style.display = 'none'; // Hide text input
            }
            createOwnershipDropdown();
            filterList('all');
        } else {
            // Show the filter input again
            if (filterInput) {
                filterInput.style.display = 'inline-block'; // Ensure input is visible
                filterInput.value = ''; // Clear input
            } else {
                // Create and add the input field back if it doesn't exist
                const newInput = document.createElement('input');
                newInput.type = 'text';
                newInput.id = 'filterInput'; // Set the ID correctly
                newInput.placeholder = 'Filter by name'; // Add placeholder
                newInput.addEventListener('input', filterList); // Re-add input listener
                filterContainer.appendChild(newInput); // Add input to the container
            }

            // Remove the ownership dropdown if it exists
            const existingDropdown = document.getElementById('ownershipFilter');
            if (existingDropdown) {
                existingDropdown.remove(); // Remove ownership dropdown
            }
            filterList('');
            
        }
        
    }

    function createOwnershipDropdown() {
        // Check if the dropdown already exists
        const existingDropdown = document.getElementById('ownershipFilter');
        if (existingDropdown) {
            return; // If it exists, do nothing
        }

        const dropdown = document.createElement('select');
        dropdown.setAttribute('id', 'ownershipFilter');
        dropdown.innerHTML = `
            <option value="" disabled selected>Select</option>
            <option value="owned">Owned</option>
            <option value="unowned">Unowned</option>
        `;

        dropdown.addEventListener('change', function() {
            const selectedValue = dropdown.value.toLowerCase();
            const filterInput = document.getElementById('filterInput');

            if (filterInput) {
                filterInput.style.display = 'none'; // Hide text input
            }

            filterList(selectedValue); // Filter based on ownership selection
        });

        filterContainer.appendChild(dropdown);
    }

    
});

function filterList(selectedValue = '') {
    const checklistItems = document.querySelectorAll('.checklist-item'); // Assuming checklist items have this class
    checklistItems.forEach(item => {
        const itemName = item.querySelector('a').getAttribute('data-element').toLowerCase(); // Adjust according to your markup 
        const isOwned = !item.textContent.includes("unowned");

        // Show/hide item based on filter
        if (selectedValue == 'all'){
            item.style.display = ''; //show every item
        }else if (selectedValue === 'owned' && isOwned) {
            item.style.display = ''; // Show owned items
        } else if (selectedValue === 'unowned' && !isOwned) {
            item.style.display = ''; // Show unowned items
        } else if (selectedValue === '' && itemName.includes(filterInput.value.toLowerCase())) {
            item.style.display = ''; // Show items matching the name filter
        } else {
            item.style.display = 'none'; // Hide items
        }
    });
}
