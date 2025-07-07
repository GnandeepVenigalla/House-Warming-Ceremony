/* Removed house-img event listener because element does not exist in DOM */
// document.getElementById("house-img").addEventListener("click", () => {
//   document.getElementById("invite").classList.remove("hidden");
// });

const rsvpForm = document.getElementById("rsvp-form");
const attendeesInput = document.getElementById("attendees-input");
const adultsInput = document.getElementById("adults-input");
const kidsInput = document.getElementById("kids-input");

document.querySelectorAll('input[name="attendance"]').forEach((elem) => {
  elem.addEventListener("change", (event) => {
    const mapContainer = document.getElementById("map-container");
    if (event.target.value === "yes") {
      attendeesInput.classList.remove("hidden");
      adultsInput.setAttribute("required", "required");
      kidsInput.setAttribute("required", "required");
      mapContainer.classList.remove("hidden");
    } else {
      attendeesInput.classList.add("hidden");
      adultsInput.removeAttribute("required");
      kidsInput.removeAttribute("required");
      adultsInput.value = "";
      kidsInput.value = "";
      mapContainer.classList.add("hidden");
    }
  });
});

rsvpForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new URLSearchParams(new FormData(form));
  const loadingSpinner = document.getElementById("loading-spinner");

  try {
    // Show loading spinner
    loadingSpinner.classList.remove("hidden");

    // Remove any existing comment entries to avoid duplicates
    formData.delete('comment');

    // Include comment field in formData as a single string
    const comment = form.querySelector('textarea[name="comment"]').value;
    if (comment) {
      formData.append('comment', comment);
    }

    // Check if RSVP exists for firstName and lastName
    const firstName = form.querySelector('input[name="firstName"]').value.trim();
    const lastName = form.querySelector('input[name="lastName"]').value.trim();

    const checkResponse = await fetch(`https://house-warming-ceremony.onrender.com/rsvp/check?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`);
    const checkData = await checkResponse.json();

    if (checkData.success && checkData.data) {
      // RSVP exists, show message with contact and show map
      loadingSpinner.classList.add("hidden");
      form.classList.add("hidden");
      const thankYouMessage = document.getElementById("thank-you-message");
      thankYouMessage.innerHTML = `You have already submitted the request for edit of RSVP contact 609-210-3151`;
      thankYouMessage.classList.remove("hidden");
      const mapContainer = document.getElementById("map-container");
      mapContainer.classList.remove("hidden");
      
      return;
    }

    const response = await fetch('https://house-warming-ceremony.onrender.com/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      redirect: 'follow'
    });

    // Hide loading spinner
    loadingSpinner.classList.add("hidden");

    console.log('Response status:', response.status);
    console.log('Response redirected:', response.redirected);

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        form.classList.add("hidden");
        const thankYouMessage = document.getElementById("thank-you-message");
        const attendance = form.querySelector('input[name="attendance"]:checked').value;
        if (attendance === "yes") {
          thankYouMessage.innerHTML = "Thank you for your RSVP! <br/> Welcome to our new home <br/> where the journey of beautiful memories begins.";
        } else {
          thankYouMessage.textContent = "Thank you for your RSVP!";
        }
        thankYouMessage.classList.remove("hidden");
        form.reset();
        attendeesInput.classList.add("hidden");
      } else {
        alert('Failed to submit RSVP. Please try again.');
      }
    } else {
      alert('Failed to submit RSVP. Please try again.');
    }
  } catch (error) {
    // Hide loading spinner on error
    loadingSpinner.classList.add("hidden");

    alert('Error submitting RSVP. Please try again.');
    console.error('Error:', error);
  }
});


const container = document.getElementById('door-container');
const main      = document.getElementById('main-content');

container.addEventListener('click', () => {
  container.classList.add('open');
  // after doors finish swinging (1s), remove overlay and show main page
  container.addEventListener('transitionend', () => {
    container.remove();
    main.classList.remove('opacity-0');
    main.classList.add('opacity-100');
  }, { once: true });
});
