const quizContent = document.getElementById('quiz-content');
const nextBtn = document.getElementById('next-btn');
const previousBtn = document.getElementById('previous-btn');
const submitBtn = document.getElementById('submit-btn');
const scoreContainer = document.createElement('div'); // Para mostrar la puntuación
const historyContainer = document.getElementById('history'); // Donde se mostrará el historial
let currentPage = 0; // Página actual
let questions = [];
let selectedAnswers = [];
let startTime = Date.now(); // Guardamos el tiempo de inicio
const topicId = 'estado-social'; // Identificador único para el tema actual

// Función para actualizar el cronómetro
function updateTimer() {
    const elapsedTime = Date.now() - startTime; // Tiempo transcurrido en milisegundos
    const minutes = Math.floor(elapsedTime / 60000); // Convertimos a minutos
    const seconds = Math.floor((elapsedTime % 60000) / 1000); // Convertimos a segundos

    // Mostramos el tiempo en formato MM:SS
    document.getElementById('time-display').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Actualizamos el cronómetro cada segundo
setInterval(updateTimer, 1000);

// Cargar preguntas desde el archivo JSON
fetch('json/questions-estado-social.json') // Verifica que esta ruta sea correcta
    .then(response => response.json())
    .then(data => {
        if (data.length === 0) {
            console.error("El archivo 'questions-estado-social.json' está vacío o no tiene datos.");
        } else {
            questions = getRandomQuestions(20, data); // Seleccionamos 20 preguntas aleatorias
            renderQuestions(); // Renderizamos las preguntas
        }
    })
    .catch(error => {
        console.error("Error al cargar las preguntas:", error);
    });

// Función para obtener 20 preguntas aleatorias de la base de datos
function getRandomQuestions(num, data) {
    const shuffled = data.sort(() => 0.5 - Math.random()); // Aleatorizamos las preguntas
    return shuffled.slice(0, num); // Seleccionamos solo las primeras 20 preguntas
}

// Función para renderizar las preguntas
function renderQuestions() {
    const startIndex = currentPage * 10; // 10 preguntas por bloque
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

    // Habilitar/deshabilitar botones de paginación
    previousBtn.disabled = currentPage === 0;
    nextBtn.disabled = endIndex >= questions.length;

    // Habilitar el botón "Enviar respuestas" solo si todas las preguntas están respondidas
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
    return selectedAnswers.every(answer => answer !== undefined); // Verifica que todas las respuestas estén contestadas
}

// Manejar la navegación entre preguntas
nextBtn.addEventListener('click', () => {
    if (currentPage < questions.length / 10 - 1) { // Solo 2 páginas (bloques de 10)
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

// Guardar las respuestas seleccionadas
document.addEventListener('change', (e) => {
    if (e.target.name && e.target.value) {
        const questionIndex = e.target.name.split('-')[1];
        selectedAnswers[questionIndex] = e.target.value; // Guardamos la respuesta seleccionada
    }
});

// Mostrar la calificación al final y los íconos de respuestas correctas e incorrectas
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
        const icon = selectedOption === question.answer ? '✔️' : '❌'; // Íconos para respuestas correctas e incorrectas
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

    // Guardar el intento en el historial
    saveAttempt(percentage);
});

// Función para guardar un intento en el historial
function saveAttempt(score) {
    const attempt = {
        date: new Date().toLocaleString(), // Fecha y hora del intento
        time: document.getElementById('time-display').textContent, // Tiempo que tardó en completar el cuestionario
        score: score, // Puntuación
        topicId: topicId // Guardamos el identificador del tema
    };

    // Recuperar historial de intentos de localStorage
    let attempts = JSON.parse(localStorage.getItem('attempts')) || [];

    // Agregar el nuevo intento al historial
    attempts.push(attempt);

    // Filtrar solo los intentos del tema actual
    attempts = attempts.filter(attempt => attempt.topicId === topicId);

    // Guardar el historial actualizado en localStorage
    localStorage.setItem('attempts', JSON.stringify(attempts));

    // Mostrar el historial de intentos en la página
    showHistory(attempts);
}

// Función para mostrar el historial de intentos
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

// Mostrar historial de intentos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const attempts = JSON.parse(localStorage.getItem('attempts')) || [];
    showHistory(attempts);
});
