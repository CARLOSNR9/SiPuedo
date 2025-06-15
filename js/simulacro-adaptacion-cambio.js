const quizContent = document.getElementById('quiz-content');
const nextBtn = document.getElementById('next-btn');
const previousBtn = document.getElementById('previous-btn');
const submitBtn = document.getElementById('submit-btn');
const historyContainer = document.getElementById('history');
const topicId = 'adaptacion-cambio';
let currentPage = 0;
let questions = [];
let selectedAnswers = [];
let startTime = Date.now();

// Cronómetro
function updateTimer() {
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    document.getElementById('time-display').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
setInterval(updateTimer, 1000);

// Cargar preguntas
fetch('json/questions-adaptacion-cambio.json')
    .then(res => res.json())
    .then(data => {
        questions = data.sort(() => 0.5 - Math.random()).slice(0, 20);
        renderQuestions();
    })
    .catch(err => console.error("Error cargando preguntas:", err));

// Renderizado
function renderQuestions() {
    const start = currentPage * 10;
    const end = start + 10;
    const questionsToShow = questions.slice(start, end);

    quizContent.innerHTML = questionsToShow.map((q, i) => `
        <div class="question">
            <p>${start + i + 1}. ${q.question}</p>
            ${generateOptions(q.options, start + i)}
        </div>
    `).join('');

    previousBtn.disabled = currentPage === 0;
    nextBtn.disabled = end >= questions.length;
    submitBtn.disabled = !allQuestionsAnswered();
}

function generateOptions(options, index) {
    return options.map(opt => `
        <label>
            <input type="radio" name="question-${index}" value="${opt}" ${selectedAnswers[index] === opt ? 'checked' : ''}> ${opt}
        </label>
    `).join('');
}

function allQuestionsAnswered() {
    return selectedAnswers.filter(Boolean).length === questions.length;
}

// Navegación
nextBtn.addEventListener('click', () => {
    if (currentPage < questions.length / 10 - 1) {
        currentPage++;
        renderQuestions();
    }
});

previousBtn.addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        renderQuestions();
    }
});

// Registrar respuestas
document.addEventListener('change', e => {
    if (e.target.name && e.target.value) {
        const index = e.target.name.split('-')[1];
        selectedAnswers[index] = e.target.value;
        submitBtn.disabled = !allQuestionsAnswered();
    }
});

// Enviar respuestas
submitBtn.addEventListener('click', () => {
    if (!allQuestionsAnswered()) {
        alert("Por favor responde todas las preguntas.");
        return;
    }

    let score = 0;
    let results = '<h2>Resultados</h2>';
    questions.forEach((q, i) => {
        const selected = selectedAnswers[i];
        const correct = q.answer;
        const isCorrect = selected === correct;
        results += `
            <div class="result">
                <p><strong>${q.question}</strong></p>
                <p>Tu respuesta: ${selected} ${isCorrect ? '✔️' : '❌'}</p>
                ${!isCorrect ? `<p>Respuesta correcta: ${correct}</p>` : ''}
            </div>
        `;
        if (isCorrect) score++;
    });

    const percent = (score / questions.length) * 100;
    results += `<p><strong>Puntuación final: ${percent}%</strong></p>`;
    const scoreDiv = document.createElement('div');
    scoreDiv.id = 'score-container';
    scoreDiv.innerHTML = results;
    document.body.appendChild(scoreDiv);
    saveAttempt(percent);
});

// Guardar intento
function saveAttempt(score) {
    const attempt = {
        date: new Date().toLocaleString(),
        time: document.getElementById('time-display').textContent,
        score,
        topicId
    };
    let attempts = JSON.parse(localStorage.getItem('attempts-' + topicId)) || [];
    attempts.push(attempt);
    localStorage.setItem('attempts-' + topicId, JSON.stringify(attempts));
    showHistory(attempts);
}

// Mostrar historial
function showHistory(attempts) {
    historyContainer.innerHTML = '<h3>Historial de intentos:</h3>' + attempts.map(at => `
        <div class="history-item">
            <p>Intento: ${at.date}</p>
            <p>Tiempo: ${at.time}</p>
            <p>Puntuación: ${at.score}%</p>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const attempts = JSON.parse(localStorage.getItem('attempts-' + topicId)) || [];
    showHistory(attempts);
});
