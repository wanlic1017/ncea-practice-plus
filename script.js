let questions = [];
let currentIndex = 0;

async function loadQuestions() {
  try {
    const res = await fetch('questions.json');
    questions = await res.json();
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
  alert('A request to contact a teacher has been sent. Someone will get back to you soon.');
});

loadQuestions();
