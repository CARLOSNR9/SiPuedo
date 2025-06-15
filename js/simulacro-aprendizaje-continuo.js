const quizContent = document.getElementById('quiz-content');
const nextBtn = document.getElementById('next-btn');
const previousBtn = document.getElementById('previous-btn');
const submitBtn = document.getElementById('submit-btn');
const historyContainer = document.getElementById('history');
const topicId = 'aprendizaje-continuo';

let questions = [];
let selectedAnswers = [];
let currentPage = 0;
let startTime = Date.now();

function updateTimer() {
    const elapsed = Date.now() - startTime;
    const min = String(Math.floor(elapsed / 60000)).padStart(2, '0');
    const sec = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
    document.getElementById('time-display').textContent = `${min}:${sec}`;
}
setInterval(updateTimer, 1000);

fetch('json/questions-aprendizaje-continuo.json')
    .then(res => res.json())
    .then(data => {
        questions = shuffle(data).slice(0, 20);
        renderQuestions();
    });

function shuffle(array) {
    return array.sort(() => 0.5 - Math.random());
}

function renderQuestions() {
    const start = currentPage * 10;
    const end = start + 10;
    const toShow = questions.slice(start, end);

    quizContent.innerHTML = toShow.map((q, i) => `
        <div class="question">
            <p>${start + i + 1}. ${q.question}</p>
            ${q.options.map(opt => `
                <label>
                    <input type="radio" name="question-${start + i}" value="${opt}" 
                        ${selectedAnswers[start + i] === opt ? 'checked' : ''}>
                    ${opt}
                </label><br>`).join('')}
        </div>
    `).join('');

    previousBtn.disabled = currentPage === 0;
    nextBtn.disabled = end >= questions.length;
    submitBtn.disabled = !allAnswered();
}

function allAnswered() {
    return selectedAnswers.filter(Boolean).length === questions.length;
}

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

document.addEventListener('change', e => {
    if (e.target.name.startsWith('question-')) {
        const index = parseInt(e.target.name.split('-')[1]);
        selectedAnswers[index] = e.target.value;
        submitBtn.disabled = !allAnswered();
    }
});

submitBtn.addEventListener('click', () => {
    if (!allAnswered()) {
        alert("Responde todas las preguntas antes de enviar.");
        return;
    }

    let score = 0;
    let resultHTML = "<h2>Resultados</h2>";

    questions.forEach((q, i) => {
        const selected = selectedAnswers[i];
        const icon = selected === q.answer ? '✔️' : '❌';
        resultHTML += `
            <div class="result">
                <p><strong>${q.question}</strong></p>
                <p>Tu respuesta: ${selected} ${icon}</p>
                ${selected !== q.answer ? `<p><strong>Correcta:</strong> ${q.answer}</p>` : ''}
            </div>`;
        if (selected === q.answer) score++;
    });

    const percentage = (score / questions.length) * 100;
    resultHTML += `<p><strong>Puntuación final: ${percentage.toFixed(2)}%</strong></p>`;
    const resultBox = document.createElement('div');
    resultBox.innerHTML = resultHTML;
    document.body.appendChild(resultBox);

    saveAttempt(percentage);
});

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
    const stored = JSON.parse(localStorage.getItem('attempts-' + topicId)) || [];
    showHistory(stored);
});
