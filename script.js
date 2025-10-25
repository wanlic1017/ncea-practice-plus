let questions = [];
let currentIndex = 0;
let selectedSubject = null;

async function loadQuestions() {
  try {
    const res = await fetch('questions.json');
    const allQuestions = await res.json();

    const params = new URLSearchParams(window.location.search);
    selectedSubject = params.get('subject');

    questions = selectedSubject
      ? allQuestions.filter(q => q.subject === selectedSubject)
      : allQuestions;

    const titleEl = document.getElementById('subject-title');
    if (titleEl) {
      titleEl.textContent = selectedSubject
        ? `${selectedSubject} Practice Questions`
        : 'Practice Questions';
    }

    if (questions.length === 0) {
      document.getElementById('question-text').textContent =
        `No questions available for ${selectedSubject}.`;
      return;
    }

    showQuestion();
  } catch (err) {
    document.getElementById('question-text').textContent =
      "Error loading questions file.";
    console.error("Error loading questions:", err);
  }
}

function showQuestion() {
  const q = questions[currentIndex];
  if (!q) return;

  document.getElementById('question-text').textContent = q.question;
  document.getElementById('student-answer').value = '';
  document.getElementById('answer-text').textContent = q.answer;
  document.getElementById('answer-text').classList.add('hidden');

  document.getElementById('progress-text').textContent =
    `Question ${currentIndex + 1} of ${questions.length}`;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reveal-answer').addEventListener('click', () => {
    document.getElementById('answer-text').classList.remove('hidden');
  });

  document.getElementById('next-question').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % questions.length;
    showQuestion();
  });

  document.getElementById('contact-teacher').addEventListener('click', () => {
    alert('A request to contact a teacher has been sent.');
  });

  document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = 'home.html';
  });

  loadQuestions();
});
