document.addEventListener("DOMContentLoaded", async () => {
  const questionText = document.getElementById("question-text");
  const subjectTitle = document.getElementById("subject-title");
  const progressText = document.getElementById("progress-text");
  const answerText = document.getElementById("answer-text");
  const backBtn = document.getElementById("back-btn");

  // Manage modal elements
  const manageBtn = document.getElementById("manage-btn");
  const manageModal = document.getElementById("manage-modal");
  const closeManage = document.getElementById("close-manage");
  const questionList = document.getElementById("question-list");

  let questions = [];
  let currentIndex = 0;
  let selectedSubject = null;

  // Get subject name from URL
  const params = new URLSearchParams(window.location.search);
  selectedSubject = params.get("subject") || "General";
  subjectTitle.textContent = `${selectedSubject} Practice Questions`;

  /* ---------- Load Questions ---------- */
  async function loadQuestions() {
    try {
      const res = await fetch(`./questions.json?cb=${Date.now()}`);
      const allQuestions = await res.json();
      const localQs = JSON.parse(localStorage.getItem("customQuestions") || "[]");

      // Combine global + local
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

  /* ---------- Display Question ---------- */
  function showQuestion() {
    const q = questions[currentIndex];
    if (!q) return;
    answerText.classList.add("hidden");
    answerText.style.display = "none";
    questionText.textContent = q.question;
    document.getElementById("student-answer").value = "";
    answerText.textContent = q.answer;
    progressText.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  }

  /* ---------- Button Functions ---------- */
  document.getElementById("reveal-answer").addEventListener("click", () => {
    answerText.classList.remove("hidden");
    answerText.style.display = "block";
  });

  document.getElementById("next-question").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % questions.length;
    fadeOutIn(showQuestion);
  });

  document.getElementById("contact-teacher").addEventListener("click", () => {
    alert("A request to contact a teacher has been sent.");
  });

  backBtn.addEventListener("click", () => {
    window.location.href = "./home.html";
  });

  /* ---------- Manage Modal ---------- */
  manageBtn.addEventListener("click", () => {
    populateManageModal();
    manageModal.classList.remove("hidden");
  });

  closeManage.addEventListener("click", () => {
    manageModal.classList.add("hidden");
  });

  function populateManageModal() {
    questionList.innerHTML = "";
    const localQs = JSON.parse(localStorage.getItem("customQuestions") || "[]");
    const filtered = localQs.filter(q => q.subject === selectedSubject);

    if (filtered.length === 0) {
      questionList.innerHTML = `<p style="color:#555;">No custom questions for ${selectedSubject}.</p>`;
      return;
    }

    filtered.forEach((q, i) => {
      const item = document.createElement("div");
      item.className = "question-item";
      item.innerHTML = `
        <span>${i + 1}. ${q.question}</span>
        <button class="delete-btn" data-index="${i}">Delete</button>
      `;
      questionList.appendChild(item);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const index = e.target.getAttribute("data-index");
        deleteQuestion(index);
      });
    });
  }

  function deleteQuestion(index) {
    const localQs = JSON.parse(localStorage.getItem("customQuestions") || "[]");
    const filtered = localQs.filter(q => q.subject === selectedSubject);
    const keep = localQs.filter(q => q.subject !== selectedSubject);
    filtered.splice(index, 1);
    const updated = [...keep, ...filtered];
    localStorage.setItem("customQuestions", JSON.stringify(updated));
    populateManageModal();
    loadQuestions();
  }

  /* ---------- Helpers ---------- */
  window.addEventListener("storage", event => {
    if (event.key === "customQuestions") loadQuestions();
  });

  window.addEventListener("focus", loadQuestions);

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

  await loadQuestions();
});
