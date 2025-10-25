document.addEventListener("DOMContentLoaded", async () => {
  const questionText = document.getElementById("question-text");
  const subjectTitle = document.getElementById("subject-title");
  const progressText = document.getElementById("progress-text");
  const answerText = document.getElementById("answer-text");
  const backBtn = document.getElementById("back-btn");

  let questions = [];
  let currentIndex = 0;
  let selectedSubject = null;

  // Extract subject from URL
  const params = new URLSearchParams(window.location.search);
  selectedSubject = params.get("subject") || "General";
  subjectTitle.textContent = `${selectedSubject} Practice Questions`;

  // Load questions from JSON + localStorage
  async function loadQuestions() {
    try {
      const res = await fetch(`./questions.json?cb=${Date.now()}`);
      const allQuestions = await res.json();
      const localQs = JSON.parse(localStorage.getItem("customQuestions") || "[]");

      // Combine both pools
      const combined = [...allQuestions, ...localQs];
      questions = combined.filter(q => q.subject === selectedSubject);

      if (questions.length === 0) {
        questionText.textContent = `No questions available for ${selectedSubject}.`;
        return;
      }

      currentIndex = 0;
      showQuestion();
    } catch (err) {
      console.error("Error loading questions:", err);
      questionText.textContent = "Error loading questions.";
    }
  }

  // Show question function
  function showQuestion() {
    const q = questions[currentIndex];
    if (!q) return;

    // Always hide the answer first
    answerText.classList.add("hidden");
    answerText.style.display = "none";

    questionText.textContent = q.question;
    document.getElementById("student-answer").value = "";
    answerText.textContent = q.answer;
    progressText.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  }

  // Reveal Answer button
  document.getElementById("reveal-answer").addEventListener("click", () => {
    answerText.classList.remove("hidden");
    answerText.style.display = "block"; // ensures it becomes visible again
  });

  // Next Question button
  document.getElementById("next-question").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % questions.length;
    fadeOutIn(showQuestion);
  });

  // Contact Teacher button
  document.getElementById("contact-teacher").addEventListener("click", () => {
    alert("A request to contact a teacher has been sent.");
  });

  // Back Button
  backBtn.addEventListener("click", () => {
    window.location.href = "./home.html";
  });

  // Auto-refresh questions if new ones are added
  window.addEventListener("storage", event => {
    if (event.key === "customQuestions") {
      loadQuestions();
    }
  });

  // Reload questions when refocusing the tab
  window.addEventListener("focus", loadQuestions);

  // Fade animation for question transitions
  function fadeOutIn(callback) {
    const container = document.querySelector(".fade-container");
    container.classList.add("fade-out");
    setTimeout(() => {
      callback();
      container.classList.remove("fade-out");
      container.classList.add("fade-in");
      setTimeout(() => container.classList.remove("fade-in"), 300);
    }, 300);
  }

  // Load questions on first run
  await loadQuestions();
});
