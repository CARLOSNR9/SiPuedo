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
const topicId = 'organos-gobierno'; // Identificador único para el tema actual

// Función para actualizar el cronómetro
function updateTimer() {
    const elapsedTime = Date.now() - startTime;
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);

    document.getElementById('time-display').textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Actualizar cronómetro cada segundo
setInterval(updateTimer, 1000);

// Cargar preguntas desde el archivo JSON
fetch('json/questions-organos-gobierno.json')
    .then(response => response.json())
    .then(data => {
        if (data.length === 0) {
            console.error("El archivo 'questions-organos-gobierno.json' está vacío o no tiene datos.");
        } else {
            questions = getRandomQuestions(20, data);
            renderQuestions();
        }
    })
    .catch(error => {
        console.error("Error al cargar las preguntas:", error);
    });

// Función para obtener preguntas aleatorias
function getRandomQuestions(num, data) {
    const shuffled = data.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

// Función para renderizar las preguntas
function renderQuestions() {
    const startIndex = currentPage * 10;
    const endIndex = startIndex + 10;
    const questionsToDisplay = questions.slice(startIndex, endIndex);

    let questionHTML = '';
    questionsToDisplay.forEach((question, index) => {
        questionHTML += `
            <div class="question">
                <p>${startIndex + index + 1}. ${question.question}</p>
                ${generateOptions(question.options, startIndex + index)}
            </div>
        `;
    });

    quizContent.innerHTML = questionHTML;

    previousBtn.disabled = currentPage === 0;
    nextBtn.disabled = endIndex >= questions.length;
    submitBtn.disabled = !allQuestionsAnswered();
}

// Función para generar las opciones de cada pregunta
function generateOptions(options, questionIndex) {
    let optionsHTML = '';
    options.forEach(option => {
        const isChecked = selectedAnswers[questionIndex] === option ? 'checked' : '';
        optionsHTML += `
            <label>
                <input type="radio" name="question-${questionIndex}" value="${option}" ${isChecked}>
                ${option}
            </label><br>
        `;
    });
    return optionsHTML;
}

// Verificar si todas las preguntas han sido respondidas
function allQuestionsAnswered() {
    return selectedAnswers.every(answer => answer !== undefined);
}

// Navegar entre preguntas
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

// Guardar respuestas seleccionadas
document.addEventListener('change', (e) => {
    if (e.target.name && e.target.value) {
        const questionIndex = e.target.name.split('-')[1];
        selectedAnswers[questionIndex] = e.target.value;
    }
});

// Mostrar la calificación al final
submitBtn.addEventListener('click', function() {
    const allAnswered = selectedAnswers.every(answer => answer !== undefined);
    if (!allAnswered) {
        alert("Por favor, contesta todas las preguntas antes de enviar.");
        return;
    }

    let score = 0;
    let resultHTML = "<h2>Resultados</h2>";
    questions.forEach((question, index) => {
        const selectedOption = selectedAnswers[index];
        const icon = selectedOption === question.answer ? '✔️' : '❌';
        resultHTML += `
            <div class="result">
                <p><strong>${question.question}</strong></p>
                <p>Tu respuesta: ${selectedOption} ${icon}</p>
                ${selectedOption !== question.answer ? `<p><strong>Respuesta correcta:</strong> ${question.answer}</p>` : ''}
            </div>
        `;
        if (selectedOption && selectedOption === question.answer) {
            score++;
        }
    });

    const percentage = (score / questions.length) * 100;
    resultHTML += `<p><strong>Tu puntuación es: ${percentage}%</strong></p>`;
    scoreContainer.innerHTML = resultHTML;
    document.body.appendChild(scoreContainer);

    saveAttempt(percentage);
});

// Guardar el intento en el historial
function saveAttempt(score) {
    const attempt = {
        date: new Date().toLocaleString(),
        time: document.getElementById('time-display').textContent,
        score: score,
        topicId: topicId
    };

    // Recuperar historial de intentos de localStorage usando una clave única por tema
    let attempts = JSON.parse(localStorage.getItem('attempts-' + topicId)) || [];
    attempts.push(attempt);

    // Guardar el historial actualizado en localStorage
    localStorage.setItem('attempts-' + topicId, JSON.stringify(attempts));

    showHistory(attempts);
}

// Mostrar el historial de intentos
function showHistory(attempts) {
    let historyHTML = '<h3>Historial de intentos:</h3>';
    attempts.forEach(attempt => {
        historyHTML += `
            <div class="history-item">
                <p>Intento: ${attempt.date}</p>
                <p>Tiempo: ${attempt.time}</p>
                <p>Puntuación: ${attempt.score}%</p>
                <hr>
            </div>
        `;
    });
    historyContainer.innerHTML = historyHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    const attempts = JSON.parse(localStorage.getItem('attempts-' + topicId)) || [];
    showHistory(attempts);
});
