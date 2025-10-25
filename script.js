let questions = [];
let currentIndex = 0;
let selectedSubject = null;

async function loadQuestions() {
  try {
    const res = await fetch('questions.json');
    const allQuestions = await res.json();

    // Check if subject is passed in the URL
    const params = new URLSearchParams(window.location.search);
    selectedSubject = params.get('subject');

    // Filter by subject (if chosen)
    questions = selectedSubject
      ? allQuestions.filter(q => q.subject === selectedSubject)
      : allQuestions;

    if (questions.length === 0) {
      document.getElementById('question-text').textContent = `No questions available for ${selectedSubject}.`;
      return;
    }

    showQuestion();
  } catch (err) {
    document.getElementById('question-text').textContent = "Error loading questions.";
  }
}

function showQuestion() {
  const q = questions[currentIndex];
  document.getElementById('question-text').textContent = q.question;
  document.getElementById('student-answer').value = '';
  document.getElementById('answer-text').textContent = q.answer;
  document.getElementById('answer-text').classList.add('hidden');
}

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

loadQuestions();
