document.addEventListener('DOMContentLoaded', async () => {
  const questionText = document.getElementById('question-text');
  const subjectTitle = document.getElementById('subject-title');
  const progressText = document.getElementById('progress-text');
  const answerText = document.getElementById('answer-text');
  const backBtn = document.getElementById('back-btn');

  let questions = [];
  let currentIndex = 0;

  // Extract subject from URL
  const params = new URLSearchParams(window.location.search);
  const selectedSubject = params.get('subject') || 'General';

  // Display the subject title immediately
  subjectTitle.textContent = `${selectedSubject} Practice Questions`;

  try {
    const res = await fetch('./questions.json');
    const allQuestions = await res.json();

    questions = allQuestions.filter(q => q.subject === selectedSubject);

    if (questions.length === 0) {
      questionText.textContent = `No questions available for ${selectedSubject}.`;
      return;
    }

    showQuestion();

    document.getElementById('reveal-answer').addEventListener('click', () => {
      answerText.classList.remove('hidden');
    });

    document.getElementById('next-question').addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % questions.length;
      fadeOutIn(() => showQuestion());
    });

    document.getElementById('contact-teacher').addEventListener('click', () => {
      alert('A request to contact a teacher has been sent.');
    });

    backBtn.addEventListener('click', () => {
      window.location.href = './home.html';
    });
  } catch (error) {
    questionText.textContent = 'Error loading questions.';
    console.error(error);
  }

  function showQuestion() {
    const q = questions[currentIndex];
    questionText.textContent = q.question;
    document.getElementById('student-answer').value = '';
    answerText.textContent = q.answer;
    answerText.classList.add('hidden');
    progressText.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  }

  function fadeOutIn(callback) {
    const container = document.querySelector('.fade-container');
    container.classList.add('fade-out');
    setTimeout(() => {
      callback();
      container.classList.remove('fade-out');
      container.classList.add('fade-in');
      setTimeout(() => container.classList.remove('fade-in'), 300);
    }, 300);
  }
});
