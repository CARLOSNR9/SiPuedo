const quizContent = document.getElementById('quiz-content');
const nextBtn = document.getElementById('next-btn');
const previousBtn = document.getElementById('previous-btn');
const submitBtn = document.getElementById('submit-btn');
const scoreContainer = document.createElement('div');
const historyContainer = document.getElementById('history');
let currentPage = 0;
let questions = [];
let selectedAnswers = [];
let startTime = Date.now();
const topicId = 'responsabilidad-servidores';

// Función para actualizar el cronómetro
function updateTimer() {
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    document.getElementById('time-display').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
setInterval(updateTimer, 1000);

// Cargar preguntas
fetch('json/questions-responsabilidad-servidores.json')
    .then(res => res.json())
    .then(data => {
        questions = getRandomQuestions(20, data);
        renderQuestions();
    })
    .catch(err => console.error('Error al cargar preguntas:', err));

// Obtener preguntas aleatorias
function getRandomQuestions(num, data) {
    const shuffled = data.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

// Renderizar preguntas
function renderQuestions() {
    const startIndex = currentPage * 10;
    const endIndex = startIndex + 10;
    const questionsToShow = questions.slice(startIndex, endIndex);

    quizContent.innerHTML = questionsToShow.map((q, i) => `
        <div class="question">
            <p>${startIndex + i + 1}. ${q.question}</p>
            ${generateOptions(q.options, startIndex + i)}
        </div>
    `).join('');

    previousBtn.disabled = currentPage === 0;
    nextBtn.disabled = endIndex >= questions.length;
    submitBtn.disabled = !allQuestionsAnswered(); // Asegura estado correcto al renderizar
}

// Generar opciones
function generateOptions(options, index) {
    return options.map(opt => `
        <label>
            <input type="radio" name="question-${index}" value="${opt}" ${selectedAnswers[index] === opt ? 'checked' : ''}> ${opt}
        </label><br>
    `).join('');
}

// Verificar si todas las preguntas fueron respondidas
function allQuestionsAnswered() {
    return selectedAnswers.length === questions.length && selectedAnswers.every(ans => ans !== undefined);
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

// Guardar respuestas y verificar habilitación del botón
document.addEventListener('change', e => {
    if (e.target.name && e.target.value) {
        const idx = parseInt(e.target.name.split('-')[1]);
        selectedAnswers[idx] = e.target.value;
        submitBtn.disabled = !allQuestionsAnswered(); // ✅ ACTUALIZA estado del botón
    }
});

// Enviar respuestas
submitBtn.addEventListener('click', () => {
    if (!allQuestionsAnswered()) {
        alert('Responde todas las preguntas antes de enviar.');
        return;
    }

    let score = 0;
    let resultHTML = '<h2>Resultados</h2>';

    questions.forEach((q, i) => {
        const selected = selectedAnswers[i];
        const icon = selected === q.answer ? '✔️' : '❌';
        resultHTML += `
            <div class="result">
                <p><strong>${q.question}</strong></p>
                <p>Tu respuesta: ${selected} ${icon}</p>
                ${selected !== q.answer ? `<p><strong>Correcta:</strong> ${q.answer}</p>` : ''}
            </div>
        `;
        if (selected === q.answer) score++;
    });

    const percent = (score / questions.length) * 100;
    resultHTML += `<p><strong>Puntuación final: ${percent}%</strong></p>`;
    scoreContainer.innerHTML = resultHTML;
    document.body.appendChild(scoreContainer);
    saveAttempt(percent);
});

// Guardar historial
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

// Cargar historial al abrir la página
document.addEventListener('DOMContentLoaded', () => {
    const attempts = JSON.parse(localStorage.getItem('attempts-' + topicId)) || [];
    showHistory(attempts);
});
