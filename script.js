// Wait for the entire website to load before running scripts
document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       1. PRODUCT SEARCH FILTER (For Collections Page)
       ========================================= */
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            const query = event.target.value.toLowerCase();
            const productCards = document.querySelectorAll('.product-card');

            productCards.forEach(card => {
                const nameElement = card.querySelector('h3');
                const productName = nameElement ? nameElement.textContent.toLowerCase() : '';

                if (productName.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    /* =========================================
       2. DYNAMIC CLIENT REVIEWS SYSTEM
       ========================================= */
    const reviewForm = document.getElementById('reviewForm');
    const reviewGrid = document.getElementById('dynamicReviewGrid');
    const successMessage = document.getElementById('reviewSuccessMessage');

    // Default jewelry reviews
    let reviewsData = [
        { name: "Sophia M.", rating: 5, text: "Absolutely breathtaking! The rose gold eternity ring exceeds all my expectations. The craftsmanship is flawless." },
        { name: "Elena R.", rating: 5, text: "The packaging was luxurious, and the sapphire pendant is a true statement piece. Lumina's customer service was also highly attentive." }
    ];

    // Load saved reviews from memory (using a specific Lumina key)
    if (localStorage.getItem('luminaReviews')) {
        reviewsData = JSON.parse(localStorage.getItem('luminaReviews'));
    }

    function renderReviews() {
        if (!reviewGrid) return;
        reviewGrid.innerHTML = ''; 
        
        // Reverse the array so the newest reviews show up first!
        const reversedReviews = [...reviewsData].reverse(); 
        
        reversedReviews.forEach(review => {
            let starsHTML = '⭐'.repeat(review.rating);
            const reviewHTML = `
                <div class="review-card">
                    <div class="stars">${starsHTML}</div>
                    <p>"${review.text}"</p>
                    <h4>- ${review.name}</h4>
                </div>
            `;
            reviewGrid.innerHTML += reviewHTML;
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const name = document.getElementById('reviewName').value;
            const rating = parseInt(document.getElementById('reviewRating').value);
            const text = document.getElementById('reviewText').value;

            reviewsData.push({ name: name, rating: rating, text: text });
            localStorage.setItem('luminaReviews', JSON.stringify(reviewsData));
            
            renderReviews();
            
            reviewForm.reset();
            if (successMessage) {
                successMessage.style.display = "block";
                setTimeout(() => {
                    successMessage.style.display = "none";
                }, 4000); // Hides the success text after 4 seconds
            }
        });
        
        // Render the default/saved reviews immediately on page load
        renderReviews();
    }

    /* =========================================
       3. SECURE ORDER TRACKING SIMULATOR
       ========================================= */
    const trackingForm = document.getElementById('trackingForm');
    
    if (trackingForm) {
        trackingForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Stop page reload
            
            // Get the tracking number the user typed in
            const trackingInput = this.querySelector('input').value.trim();
            
            if (trackingInput) {
                // Pop up a fake high-end shipping status
                alert(`Tracking status for ${trackingInput}:\n\n🔒 In Transit - Currently secured with our insured courier in Makati City. Expected delivery in 1-2 business days.`);
                this.reset(); // Clear the text box
            }
        });
    }

});
