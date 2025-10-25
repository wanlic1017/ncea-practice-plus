document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;
  const isHome =
    path.endsWith("home.html") ||
    path === "/" ||
    (path.endsWith("index.html") && !path.includes("?subject="));

  // ===========================
  // HOME PAGE (Manage Questions)
  // ===========================
  if (isHome && document.getElementById("manage-btn")) {
    console.log("Home page detected – enabling Manage Questions");

    const manageBtn = document.getElementById("manage-btn");
    const manageModal = document.getElementById("manage-modal");
    const closeManage = document.getElementById("close-manage");
    const questionList = document.getElementById("question-list");

    manageBtn.addEventListener("click", async () => {
      await populateManageModal();
      manageModal.classList.remove("hidden");
    });

    closeManage.addEventListener("click", () => {
      manageModal.classList.add("hidden");
    });

    async function populateManageModal() {
      questionList.innerHTML = "<p>Loading questions...</p>";
      try {
        const res = await fetch("./questions.json");
        const allQuestions = await res.json();
        const localQs = JSON.parse(localStorage.getItem("customQuestions") || "[]");

        // Combine everything
        const combined = [...allQuestions, ...localQs];
        if (combined.length === 0) {
          questionList.innerHTML = `<p style="color:#555;">No questions available.</p>`;
          return;
        }

        questionList.innerHTML = "";
        combined.forEach((q, i) => {
          const item = document.createElement("div");
          item.className = "question-item";
          item.innerHTML = `
            <span>${i + 1}. <strong>${q.subject}</strong> – ${q.question}</span>
            <button class="delete-btn" data-index="${i}">Delete</button>
          `;
          questionList.appendChild(item);
        });

        document.querySelectorAll(".delete-btn").forEach(btn => {
          btn.addEventListener("click", e => {
            const index = parseInt(e.target.getAttribute("data-index"));
            deleteQuestion(index);
          });
        });
      } catch (err) {
        console.error("Error loading questions:", err);
        questionList.innerHTML =
          "<p style='color:red;'>Failed to load questions.</p>";
      }
    }

    function deleteQuestion(index) {
      const localQs = JSON.parse(localStorage.getItem("customQuestions") || "[]");
      const allDeleted = JSON.parse(localStorage.getItem("deletedQuestions") || "[]");

      // Save deleted question (for reference)
      const res = fetch("./questions.json")
        .then(r => r.json())
        .then(defaultQs => {
          const allQs = [...defaultQs, ...localQs];
          if (index < allQs.length) {
            const deleted = allQs[index];
            allDeleted.push(deleted);
            localStorage.setItem("deletedQuestions", JSON.stringify(allDeleted));
            alert(`Deleted question: "${deleted.question}"`);
          }
        })
        .finally(() => populateManageModal());
    }
  }

  // ===========================
  // QUIZ PAGE (Practice)
  // ===========================
  if (window.location.search.includes("subject=")) {
    console.log("Quiz page detected – running quiz logic");

    const questionText = document.getElementById("question-text");
    const subjectTitle = document.getElementById("subject-title");
    const progressText = document.getElementById("progress-text");
    const answerText = document.getElementById("answer-text");
    const backBtn = document.getElementById("back-btn");

    let questions = [];
    let currentIndex = 0;
    const params = new URLSearchParams(window.location.search);
    const selectedSubject = params.get("subject") || "General";
    subjectTitle.textContent = `${selectedSubject} Practice Questions`;

    async function loadQuestions() {
      try {
        const res = await fetch("./questions.json");
        const allQuestions = await res.json();
        const localQs = JSON.parse(localStorage.getItem("customQuestions") || "[]");
        const deletedQs = JSON.parse(localStorage.getItem("deletedQuestions") || "[]");

        // Combine all
        const combined = [...allQuestions, ...localQs];
        // Filter by subject
        questions = combined.filter(q => q.subject === selectedSubject);

        // Remove deleted ones
        if (deletedQs.length) {
          questions = questions.filter(
            q => !deletedQs.find(d => d.question === q.question)
          );
        }

        if (questions.length === 0) {
          questionText.textContent = `No questions available for ${selectedSubject}.`;
          return;
        }

        currentIndex = 0;
        showQuestion();
      } catch (err) {
        questionText.textContent = "Error loading questions.";
        console.error(err);
      }
    }

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
  }
});
