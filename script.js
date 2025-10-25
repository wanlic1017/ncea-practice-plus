// ==================================================
// NCEA Practice Portal Script
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const isHome =
    path.endsWith("home.html") ||
    path.endsWith("/") ||
    path.endsWith("/ncea-practice-plus");

  // ==================================================
  // HOME PAGE LOGIC
  // ==================================================
  if (isHome) {
    // ---------- Add Question Modal ----------
    const addModal = document.getElementById("add-modal");
    const openAddBtn = document.getElementById("open-add-modal");
    const closeAddBtn = document.getElementById("close-add");
    const addForm = document.getElementById("add-form");

    if (openAddBtn && addModal && closeAddBtn && addForm) {
      openAddBtn.addEventListener("click", () => {
        addModal.classList.remove("hidden");
      });
      closeAddBtn.addEventListener("click", () => {
        addModal.classList.add("hidden");
      });

      // Handle Add Form Submission
      addForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Always read values live from DOM
        const subject = document.getElementById("subject").value.trim();
        const question = document.getElementById("question").value.trim();
        const answer = document.getElementById("answer").value.trim();

        // Debug line (optional)
        console.log("Submitting:", { subject, question, answer });

        if (!question || !answer) {
          alert("⚠️ Please fill in both question and answer.");
          return;
        }

        let stored = [];
        try {
          stored = JSON.parse(localStorage.getItem("customQuestions")) || [];
        } catch {
          stored = [];
        }

        stored.push({ subject, question, answer });
        localStorage.setItem("customQuestions", JSON.stringify(stored));

        alert("✅ Question added successfully!");
        addForm.reset();
        addModal.classList.add("hidden");
      });
    }

    // ---------- Manage Questions ----------
    const manageBtn = document.getElementById("manage-btn");
    const manageModal = document.getElementById("manage-modal");
    const closeManage = document.getElementById("close-manage");
    const questionList = document.getElementById("question-list");

    function populateManageModal() {
      if (!questionList) return;
      questionList.innerHTML = "<p>Loading...</p>";

      fetch("./questions.json")
        .then((r) => r.json())
        .then((defaultQs) => {
          const customQs = JSON.parse(
            localStorage.getItem("customQuestions") || "[]"
          );
          const deletedQs = JSON.parse(
            localStorage.getItem("deletedQuestions") || "[]"
          );

          const combined = [...defaultQs, ...customQs].filter(
            (q) => !deletedQs.some((d) => d.question === q.question)
          );

          if (!combined.length) {
            questionList.innerHTML = `<p style="color:#555;">No questions available.</p>`;
            return;
          }

          questionList.innerHTML = "";
          combined.forEach((q, i) => {
            const item = document.createElement("div");
            item.className = "question-item";
            item.innerHTML = `
              <span>${i + 1}. <strong>${q.subject}</strong> – ${q.question}</span>
              <button class="delete-btn" data-q="${encodeURIComponent(
                q.question
              )}">Delete</button>
            `;
            questionList.appendChild(item);
          });

          // Delete functionality
          questionList.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
              const qText = decodeURIComponent(
                e.currentTarget.getAttribute("data-q") || ""
              );
              const deleted = JSON.parse(
                localStorage.getItem("deletedQuestions") || "[]"
              );
              if (!deleted.some((d) => d.question === qText)) {
                deleted.push({ question: qText });
                localStorage.setItem(
                  "deletedQuestions",
                  JSON.stringify(deleted)
                );
              }
              populateManageModal();
            });
          });
        })
        .catch(() => {
          questionList.innerHTML =
            "<p style='color:red;'>Failed to load questions.</p>";
        });
    }

    if (manageBtn && manageModal && closeManage) {
      manageBtn.addEventListener("click", () => {
        populateManageModal();
        manageModal.classList.remove("hidden");
      });
      closeManage.addEventListener("click", () => {
        manageModal.classList.add("hidden");
      });
    }
  }

  // ==================================================
  // QUIZ PAGE LOGIC (index.html)
  // ==================================================
  if (window.location.search.includes("subject=")) {
    const params = new URLSearchParams(window.location.search);
    const subject = params.get("subject") || "General";

    const questionText = document.getElementById("question-text");
    const subjectTitle = document.getElementById("subject-title");
    const progressText = document.getElementById("progress-text");
    const answerText = document.getElementById("answer-text");
    const backBtn = document.getElementById("back-btn");

    if (subjectTitle)
      subjectTitle.textContent = `${subject} Practice Questions`;

    let questions = [];
    let current = 0;

    async function loadQuestions() {
      try {
        const res = await fetch("./questions.json");
        const defaults = await res.json();
        const custom = JSON.parse(
          localStorage.getItem("customQuestions") || "[]"
        );
        const deleted = JSON.parse(
          localStorage.getItem("deletedQuestions") || "[]"
        );

        questions = [...defaults, ...custom]
          .filter((q) => q.subject === subject)
          .filter((q) => !deleted.some((d) => d.question === q.question));

        if (!questions.length) {
          questionText.textContent = `No questions available for ${subject}.`;
          return;
        }

        showQuestion();
      } catch (err) {
        console.error("Error loading questions:", err);
        questionText.textContent = "Error loading questions.";
      }
    }

    function showQuestion() {
      const q = questions[current];
      if (!q) return;

      if (questionText) questionText.textContent = q.question;
      if (progressText)
        progressText.textContent = `Question ${current + 1} of ${
          questions.length
        }`;

      if (answerText) {
        answerText.textContent = q.answer;
        answerText.classList.add("hidden");
        answerText.style.display = "none";
      }

      const studentAnswer = document.getElementById("student-answer");
      if (studentAnswer) studentAnswer.value = "";
    }

    // Reveal answer
    const revealBtn = document.getElementById("reveal-answer");
    if (revealBtn && answerText) {
      revealBtn.addEventListener("click", () => {
        answerText.classList.remove("hidden");
        answerText.style.display = "block";
      });
    }

    // Next question
    const nextBtn = document.getElementById("next-question");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        current = (current + 1) % questions.length;
        showQuestion();
      });
    }

    // Contact teacher
    const contactBtn = document.getElementById("contact-teacher");
    if (contactBtn) {
      contactBtn.addEventListener("click", () =>
        alert("📩 A request to contact a teacher has been sent.")
      );
    }

    // Back button
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.location.href = "./home.html";
      });
    }

    loadQuestions();
  }
});
