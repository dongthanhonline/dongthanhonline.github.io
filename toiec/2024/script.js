let questionsList = []; 
let currentIndex = 0;
let userResults = {};
let currentTestFolder = "";

async function loadTest(folderName) {
    if (!folderName) return;
    currentTestFolder = folderName;
    document.getElementById('loadingStatus').style.display = 'inline-block';
    
    questionsList = []; 
    userResults = {};

    try {
        for (let i = 1; i <= 7; i++) {
            try {
                const response = await fetch(`${folderName}/data/part${i}.json`);
                if (response.ok) {
                    const data = await response.json();
                    // Tương thích cả format mảng trực tiếp (mới) và object chứa Questions (cũ)
                    const partsData = Array.isArray(data) ? data : (data.Questions || []);
                    partsData.forEach(q => {
                        questionsList.push(q);
                    });
                }
            } catch (err) { console.log(`Bỏ qua Part ${i}`); }
        }

        if (questionsList.length > 0) {
            document.getElementById('quizScreen').style.display = 'block';
            document.getElementById('loadingStatus').style.display = 'none';
            document.getElementById('progressInfo').style.display = 'block';
            renderQuiz();
            renderQuestionGrid();
        }
    } catch (error) {
        console.error("Lỗi tải dữ bộ:", error);
    }
}

function renderQuiz() {
    const q = questionsList[currentIndex];
    if (!q) return;

    // 1. Audio
    const audio = document.getElementById('quizAudio');
    audio.src = `${currentTestFolder}/audio/${q.audioFile}`;
    if (q.startAudioTime && q.startAudioTime !== "mm:ss") {
        const parts = q.startAudioTime.split(':');
        audio.currentTime = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }

    // 2. Hình ảnh (Fix: Kiểm tra chuỗi rỗng)
    const imgElement = document.getElementById('quizImage');
    if (q.imageLink && q.imageLink.trim() !== "") {
        imgElement.src = `${currentTestFolder}/images/${q.imageLink}`;
        document.getElementById('imageContainer').style.display = "block";
    } else {
        document.getElementById('imageContainer').style.display = "none";
    }

    // 3. Transcript (Dùng cho Toggle)
    const doanVanBox = document.getElementById('doanVanText');
    doanVanBox.innerHTML = `<strong>EN:</strong> ${q.paragraph}<br><br><strong>VI:</strong> ${q.translatedParagraph}`;
    doanVanBox.classList.remove('show');

    // 4. Câu hỏi
    document.getElementById('questionText').textContent = `Question ${q.no}: ${q.question}`;
    document.getElementById('questionDich').textContent = q.translatedQuestion;
    document.getElementById('questionDich').style.display = userResults[q.no] ? "block" : "none";

    // 5. Danh sách câu trả lời
    const optionsUl = document.getElementById('options');
    optionsUl.innerHTML = "";
    const labels = ["A", "B", "C", "D"];

    if (q.answers && Array.isArray(q.answers)) {
        q.answers.forEach((opt, idx) => {
            const label = labels[idx];
            const li = document.createElement('li');
            li.className = "option-item";
            
            if (userResults[q.no]) {
                if (label === q.correctAnswer) li.classList.add('correct');
                if (label === userResults[q.no].selected && label !== q.correctAnswer) li.classList.add('incorrect');
            }

            li.innerHTML = `
                <span class="opt-label">${label}</span>
                <div class="opt-content">
                    <p class="en-opt">${opt.content}</p>
                    <p class="vi-opt" style="${userResults[q.no] ? 'display:block' : 'display:none'}">${opt.translatedContent}</p>
                </div>
            `;
            li.onclick = () => checkAnswer(label, li);
            optionsUl.appendChild(li);
        });
    }

    // 6. Giải thích
    document.getElementById('explanation').style.display = userResults[q.no] ? "block" : "none";
    document.getElementById('explanationText').textContent = q.explanation;
    
    updateGridStatus();
}

function checkAnswer(selected, element) {
    const q = questionsList[currentIndex];
    if (userResults[q.no]) return;

    const isCorrect = selected === q.correctAnswer;
    userResults[q.no] = { selected, status: isCorrect ? 'correct' : 'incorrect' };

    renderQuiz(); 
    document.getElementById('completedCount').textContent = Object.keys(userResults).length;
}

function renderQuestionGrid() {
    const grid = document.getElementById('questionGrid');
    grid.innerHTML = "";
    let lastPart = "";

    questionsList.forEach((q, idx) => {
        // Gom nhóm theo Part
        if (q.part !== lastPart) {
            const label = document.createElement('div');
            label.className = 'part-label';
            label.textContent = q.part;
            grid.appendChild(label);
            lastPart = q.part;
        }

        const cell = document.createElement('div');
        cell.className = 'q-net';
        cell.id = `net-${q.no}`;
        cell.textContent = q.no;
        cell.onclick = () => { 
            currentIndex = idx; 
            renderQuiz(); 
            toggleMenu(); 
        };
        grid.appendChild(cell);
    });
}

function updateGridStatus() {
    questionsList.forEach(q => {
        const cell = document.getElementById(`net-${q.no}`);
        if (!cell) return;
        cell.className = 'q-net';
        if (userResults[q.no]) cell.classList.add(userResults[q.no].status);
        if (questionsList[currentIndex].no === q.no) cell.classList.add('current');
    });
}

function nextQuiz() { if (currentIndex < questionsList.length - 1) { currentIndex++; renderQuiz(); } }
function prevQuiz() { if (currentIndex > 0) { currentIndex--; renderQuiz(); } }
function toggleDoanVan() { document.getElementById('doanVanText').classList.toggle('show'); }
function toggleMenu() {
    const overlay = document.getElementById('menuOverlay');
    overlay.style.display = (overlay.style.display === "flex") ? "none" : "flex";
}
