document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;
  const isHome = path.endsWith("home.html") || path === "/";

  // ======================
  // HOME PAGE LOGIC
  // ======================
  if (isHome) {
    console.log("Home page detected");

    const form = document.getElementById("add-form");
    const manageBtn = document.getElementById("manage-btn");
    const manageModal = document.getElementById("manage-modal");
    const closeManage = document.getElementById("close-manage");
    const questionList = document.getElementById("question-list");

    // ---------- Add Question ----------
    form.addEventListener("submit", e => {
      e.preventDefault();
      const subject = document.getElementById("add-subject").value;
      const question = document.getElementById("add-question").value.trim();
      const answer = document.getElementById("add-answer").value.trim();

      if (!question || !answer) {
        alert("Please fill in both question and answer.");
        return;
      }

      const stored = JSON.parse(localStorage.getItem("customQuestions") || "[]");
      stored.push({ subject, question, answer });
      localStorage.setItem("customQuestions", JSON.stringify(stored));

      alert("✅ Question added successfully!");
      form.reset();
    });

    // ---------- Manage Modal ----------
    manageBtn.addEventListener("click", populateManageModal);
    closeManage.addEventListener("click", () => {
      manageModal.classList.add("hidden");
    });

    function populateManageModal() {
      manageModal.classList.remove("hidden");
      questionList.innerHTML = "<p>Loading...</p>";

      fetch("./questions.json")
        .then(r => r.json())
        .then(defaultQs => {
          const customQs = JSON.parse(localStorage.getItem("customQuestions") || "[]");
          const deletedQs = JSON.parse(localStorage.getItem("deletedQuestions") || "[]");

          // Combine default + custom (excluding deleted)
          let combined = [...defaultQs, ...customQs].filter(
            q => !deletedQs.some(d => d.question === q.question)
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
              <button class="delete-btn" data-q="${q.question}">Delete</button>
            `;
            questionList.appendChild(item);
          });

          document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", e => {
              const qText = e.target.getAttribute("data-q");
              deleteQuestion(qText);
            });
          });
        });
    }

    function deleteQuestion(qText) {
      const deletedQs = JSON.parse(localStorage.getItem("deletedQuestions") || "[]");
      if (!deletedQs.some(q => q.question === qText)) {
        deletedQs.push({ question: qText });
      }
      localStorage.setItem("deletedQuestions", JSON.stringify(deletedQs));
      populateManageModal();
    }
  }

  // ======================
  // QUIZ PAGE LOGIC
  // ======================
  if (window.location.search.includes("subject=")) {
    const questionText = document.getElementById("question-text");
    const subjectTitle = document.getElementById("subject-title");
    const progressText = document.getElementById("progress-text");
    const answerText = document.getElementById("answer-text");
    const backBtn = document.getElementById("back-btn");

    const params = new URLSearchParams(window.location.search);
    const subject = params.get("subject") || "General";
    subjectTitle.textContent = `${subject} Practice Questions`;

    let questions = [];
    let current = 0;

    async function load() {
      const res = await fetch("./questions.json");
      const defaultQs = await res.json();
      const customQs = JSON.parse(localStorage.getItem("customQuestions") || "[]");
      const deletedQs = JSON.parse(localStorage.getItem("deletedQuestions") || "[]");

      questions = [...defaultQs, ...customQs]
        .filter(q => q.subject === subject)
        .filter(q => !deletedQs.some(d => d.question === q.question));

      if (!questions.length) {
        questionText.textContent = "No questions available for this subject.";
        return;
      }

      show();
    }

    function show() {
      const q = questions[current];
      questionText.textContent = q.question;
      answerText.textContent = q.answer;
      answerText.classList.add("hidden");
      progressText.textContent = `Question ${current + 1} of ${questions.length}`;
      document.getElementById("student-answer").value = "";
    }

    document.getElementById("reveal-answer").onclick = () => {
      answerText.classList.remove("hidden");
    };

    document.getElementById("next-question").onclick = () => {
      current = (current + 1) % questions.length;
      show();
    };

    document.getElementById("contact-teacher").onclick = () => {
      alert("A request to contact a teacher has been sent.");
    };

    backBtn.onclick = () => (window.location.href = "./home.html");

    load();
  }
});
