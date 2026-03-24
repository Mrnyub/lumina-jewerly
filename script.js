document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const productCards = document.querySelectorAll('.product-card');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            
            productCards.forEach(card => {
                // Get the text from the title, category, and description
                const title = card.querySelector('h3').textContent.toLowerCase();
                const category = card.querySelector('.category').textContent.toLowerCase();
                const desc = card.querySelector('.desc').textContent.toLowerCase();

                // If the search term matches any of the text, show the card. Otherwise, hide it.
                if (title.includes(term) || category.includes(term) || desc.includes(term)) {
                    card.style.display = 'flex'; // Uses flex for the new Lookbook layout
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});