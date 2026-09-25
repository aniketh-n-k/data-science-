const setupScreen = document.getElementById('setup-screen');
const startBtn = document.getElementById('start-btn');
const difficultySelect = document.getElementById('difficulty');

const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const quizContainer = document.getElementById('quiz');
const resultDiv = document.getElementById('result');
const questionEl = document.getElementById('question');
const answerButtons = document.getElementById('answer-buttons');
const scoreText = document.getElementById('score-text');
const timerEl = document.getElementById('timer');

let questions = [];  // will hold fetched questions
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 15;
let timer;

// Start quiz when Start button clicked
startBtn.addEventListener('click', async () => {
  const difficulty = difficultySelect.value;  // easy / medium / hard
  setupScreen.classList.add('hidden');
  // Fetch questions based on chosen difficulty
  await fetchQuestions(difficulty);
  startQuiz();
});

// Restart
restartBtn.addEventListener('click', () => {
  resultDiv.classList.add('hidden');
  setupScreen.classList.remove('hidden');
});

// Next button
nextBtn.addEventListener('click', () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    setNextQuestion();
  } else {
    showResult();
  }
});

function startQuiz() {
  score = 0;
  currentQuestionIndex = 0;
  quizContainer.classList.remove('hidden');
  setNextQuestion();
}

function setNextQuestion() {
  resetState();
  showQuestion(questions[currentQuestionIndex]);
  startTimer();
}

function showQuestion(q) {
  questionEl.innerHTML = decodeHtml(q.question);
  // combine correct + incorrect answers and shuffle
  const answers = [...q.incorrect_answers.map(a => ({ text: a, correct: false })), { text: q.correct_answer, correct: true }];
  shuffleArray(answers);
  answers.forEach(ans => {
    const btn = document.createElement('button');
    btn.innerHTML = decodeHtml(ans.text);
    btn.classList.add('btn');
    if (ans.correct) btn.dataset.correct = "true";
    btn.addEventListener('click', selectAnswer);
    answerButtons.appendChild(btn);
  });
}

function resetState() {
  clearStatusClass(document.body);
  nextBtn.classList.add('hidden');
  answerButtons.innerHTML = '';
  clearInterval(timer);
  timeLeft = 15;
  timerEl.innerText = `Time: ${timeLeft}`;
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerEl.innerText = `Time: ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      disableAnswers();
      nextBtn.classList.remove('hidden');
    }
  }, 1000);
}

function selectAnswer(e) {
  const selectedBtn = e.target;
  const correct = selectedBtn.dataset.correct === 'true';
  if (correct) score++;
  Array.from(answerButtons.children).forEach(btn => {
    setStatusClass(btn, btn.dataset.correct === 'true');
    btn.disabled = true;
  });
  clearInterval(timer);
  nextBtn.classList.remove('hidden');
}

function disableAnswers() {
  Array.from(answerButtons.children).forEach(btn => {
    btn.disabled = true;
    setStatusClass(btn, btn.dataset.correct === 'true');
  });
}

function showResult() {
  quizContainer.classList.add('hidden');
  resultDiv.classList.remove('hidden');
  scoreText.innerText = `Your score: ${score} / ${questions.length}`;
}

// --- Utility functions ---

// Fetch questions from Open Trivia DB API with difficulty parameter
async function fetchQuestions(difficulty) {
  try {
    const amount = 5;  // you can change number of questions
    const url = `https://opentdb.com/api.php?amount=${amount}&difficulty=${difficulty}&type=multiple`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.response_code !== 0) {
      console.error('Error fetching questions, response code:', data.response_code);
      // fallback: maybe fetch with no difficulty filter
      questions = [];
    } else {
      questions = data.results;
    }
  } catch (err) {
    console.error('Fetch error:', err);
    questions = [];
  }
}

// Fisher–Yates shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// HTML entities decoder — because API returns HTML encoded strings
function decodeHtml(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

function setStatusClass(element, correct) {
  clearStatusClass(element);
  if (correct) element.classList.add('correct');
  else element.classList.add('wrong');
}

function clearStatusClass(element) {
  element.classList.remove('correct');
  element.classList.remove('wrong');
}
