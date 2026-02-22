let fullTestData = [];
let currentPartIndex = 0;
let currentQuizIndex = 0;
let userResults = {};
let currentTestFolder = "";

async function loadTest(folderName) {
    if (!folderName) return;
    currentTestFolder = folderName;
    document.getElementById('loadingStatus').style.display = 'inline-block';
    
    fullTestData = [];
    userResults = {};

    try {
        // Quét dữ liệu từ Part 1 đến Part 7 trong folder data/
        for (let i = 1; i <= 7; i++) {
            try {
                const response = await fetch(`${folderName}/data/part${i}.json`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.Parts) fullTestData = fullTestData.concat(data.Parts);
                }
            } catch (err) { console.log(`Bỏ qua Part ${i}`); }
        }

        if (fullTestData.length > 0) {
            document.getElementById('quizScreen').style.display = 'block';
            document.getElementById('loadingStatus').style.display = 'none';
            renderSidebar();
            renderQuiz(true);
        } else {
            alert("Không tìm thấy dữ liệu JSON trong folder " + folderName + "/data/");
            document.getElementById('loadingStatus').style.display = 'none';
        }
    } catch (error) {
        alert("Lỗi hệ thống. Vui lòng kiểm tra lại cấu trúc thư mục.");
    }
}

function renderQuiz(isNewPart = false) {
    const part = fullTestData[currentPartIndex];
    const quiz = part.Questions[currentQuizIndex];
    const audioPlayer = document.getElementById('quizAudio');

    // 1. Cập nhật Audio
    if (isNewPart) {
        audioPlayer.src = `${currentTestFolder}/audio/part${part.PartNumber}.mp3`;
    }

    // 2. Cập nhật Hình ảnh
    const imgContainer = document.getElementById('imageContainer');
    const imgTag = document.getElementById('quizImage');
    if (quiz.ImageURL) {
        imgTag.src = `${currentTestFolder}/${quiz.ImageURL}`;
        imgContainer.style.display = 'flex';
        imgTag.onerror = () => imgContainer.style.display = 'none';
    } else {
        imgContainer.style.display = 'none';
    }

    // 3. Hiển thị Đoạn Văn (DoanVan)
    const dvBox = document.getElementById('doanVanBox');
    const dvText = document.getElementById('doanVanText');
    if (quiz.DoanVan) {
        dvBox.style.display = 'block';
        dvText.textContent = quiz.DoanVan;
        dvText.classList.remove('show'); 
    } else {
        dvBox.style.display = 'none';
    }

    // 4. Nội dung câu hỏi
    document.getElementById('quizInfo').textContent = `Câu ${quiz.ThuTu}`;
    document.getElementById('questionText').textContent = quiz.CauHoi;
    
    // 5. Đáp án & Lịch sử làm bài
    const history = userResults[quiz.ThuTu];
    const list = document.getElementById('options');
    list.innerHTML = '';
    
    quiz.CauTraLoi.forEach(opt => {
        const li = document.createElement('li');
        const key = opt.TraLoi.match(/\(([A-D])\)/)?.[1] || opt.TraLoi.charAt(0);
        li.innerHTML = `<div>${opt.TraLoi}</div> <div class="vi-text" style="display:${history ? 'block' : 'none'}">${opt.Dich}</div>`;
        
        if (history) {
            if (key === quiz.DapAn) li.classList.add('selected-correct');
            else if (key === history.selected) li.classList.add('selected-incorrect');
        }
        li.onclick = () => { if (!userResults[quiz.ThuTu]) handleSelection(key, quiz); };
        list.appendChild(li);
    });
    
    if (history) {
        document.getElementById('questionDich').textContent = `Dịch: ${quiz.DichCauHoi}`;
        document.getElementById('questionDich').style.display = 'block';
        document.getElementById('explanationText').textContent = `Giải thích: ${quiz.GiaiThich}`;
        document.getElementById('explanation').style.display = 'block';
    } else {
        document.getElementById('explanation').style.display = 'none';
        document.getElementById('questionDich').style.display = 'none';
    }

    // Highlight câu hiện tại trong grid
    document.querySelectorAll('.q-net').forEach(el => el.classList.remove('current'));
    const net = document.getElementById(`net-${quiz.ThuTu}`);
    if (net) net.classList.add('current');
}

function toggleDoanVan() {
    document.getElementById('doanVanText').classList.toggle('show');
}

function handleSelection(selected, quiz) {
    const status = (selected === quiz.DapAn) ? 'correct' : 'incorrect';
    userResults[quiz.ThuTu] = { selected, status };
    const net = document.getElementById(`net-${quiz.ThuTu}`);
    if (net) net.classList.add(status);
    renderQuiz(false);
}

function renderSidebar() {
    const grid = document.getElementById('questionGrid');
    grid.innerHTML = '';
    fullTestData.forEach((part, pIdx) => {
        const label = document.createElement('div');
        label.className = 'part-label'; label.textContent = `PART ${part.PartNumber}`;
        grid.appendChild(label);
        part.Questions.forEach((q, qIdx) => {
            const cell = document.createElement('div');
            cell.className = 'q-net'; cell.id = `net-${q.ThuTu}`; cell.textContent = q.ThuTu;
            cell.onclick = () => {
                const isNewPart = (currentPartIndex !== pIdx);
                currentPartIndex = pIdx; currentQuizIndex = qIdx;
                renderQuiz(isNewPart); toggleMenu();
            };
            grid.appendChild(cell);
        });
    });
}

function toggleMenu() {
    const overlay = document.getElementById('menuOverlay');
    overlay.style.display = (overlay.style.display === "flex") ? "none" : "flex";
}

function nextQuiz() {
    const questions = fullTestData[currentPartIndex].Questions;
    if (currentQuizIndex < questions.length - 1) { currentQuizIndex++; renderQuiz(false); }
    else if (currentPartIndex < fullTestData.length - 1) { currentPartIndex++; currentQuizIndex = 0; renderQuiz(true); }
}

function prevQuiz() {
    if (currentQuizIndex > 0) { currentQuizIndex--; renderQuiz(false); }
    else if (currentPartIndex > 0) { currentPartIndex--; currentQuizIndex = fullTestData[currentPartIndex].Questions.length - 1; renderQuiz(false); }
}