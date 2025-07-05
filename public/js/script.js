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
    if (event.target.value === "yes") {
      attendeesInput.classList.remove("hidden");
      adultsInput.setAttribute("required", "required");
      kidsInput.setAttribute("required", "required");
    } else {
      attendeesInput.classList.add("hidden");
      adultsInput.removeAttribute("required");
      kidsInput.removeAttribute("required");
      adultsInput.value = "";
      kidsInput.value = "";
    }
  });
});

rsvpForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new URLSearchParams(new FormData(form));

  try {
    // Include comment field in formData
    const comment = form.querySelector('textarea[name="comment"]').value;
    if (comment) {
      formData.append('comment', comment);
    }

    const response = await fetch('https://house-warming-ceremony.onrender.com/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      redirect: 'follow'
    });


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
    alert('Error submitting RSVP. Please try again.');
    console.error('Error:', error);
  }
});
