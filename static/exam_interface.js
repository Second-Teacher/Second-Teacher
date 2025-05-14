document.addEventListener('DOMContentLoaded', function() {
    // 시험 설정 불러오기
    const examConfig = JSON.parse(sessionStorage.getItem('examConfig'));
    if (!examConfig) {
        // 설정이 없으면 시험 설정 페이지로 리디렉션
        window.location.href = '/exam/platform';
        return;
    }
    
    // 전역 변수
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = {};
    let examDuration = 60 * 60; // 기본 1시간 (초 단위)
    let timer;
    
    // DOM 요소
    const examTitle = document.getElementById('examTitle');
    const currentQuestionElem = document.getElementById('currentQuestion');
    const totalQuestionsElem = document.getElementById('totalQuestions');
    const progressBar = document.getElementById('progressBar');
    const questionNavigation = document.getElementById('questionNavigation');
    const questionNumber = document.getElementById('questionNumber');
    const questionType = document.getElementById('questionType');
    const questionText = document.getElementById('questionText');
    const answerContainer = document.getElementById('answerContainer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const timeDisplay = document.getElementById('timeDisplay');
    
    // 모달 요소
    const confirmSubmitModal = document.getElementById('confirmSubmit');
    const unansweredWarning = document.getElementById('unansweredWarning');
    const unansweredCount = document.getElementById('unansweredCount');
    const cancelSubmitBtn = document.getElementById('cancelSubmit');
    const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');
    
    // 초기화 함수
    function init() {
        // 시험 데이터 로드
        loadQuestions();
        
        // 버튼 이벤트 리스너 설정
        prevBtn.addEventListener('click', goToPreviousQuestion);
        nextBtn.addEventListener('click', goToNextQuestion);
        submitBtn.addEventListener('click', showSubmitConfirmation);
        cancelSubmitBtn.addEventListener('click', hideSubmitConfirmation);
        confirmSubmitBtn.addEventListener('click', submitExam);
        
        // 타이머 시작
        startTimer();
    }
    
    // 시험 문제 로드
    function loadQuestions() {
        fetch('/api/exam/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(examConfig)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                questions = data.questions;
                userAnswers = new Array(questions.length).fill(null);
                
                // UI 초기화
                totalQuestionsElem.textContent = questions.length;
                createQuestionNavigation();
                renderCurrentQuestion();
            } else {
                alert('문제를 불러오는데 실패했습니다: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('문제를 불러오는데 실패했습니다. 다시 시도해주세요.');
            window.location.href = '/exam/platform';
        });
    }
    
    // 문제 네비게이션 생성
    function createQuestionNavigation() {
        questionNavigation.innerHTML = '';
        
        for (let i = 0; i < questions.length; i++) {
            const navItem = document.createElement('div');
            navItem.className = 'question-nav-item';
            navItem.textContent = i + 1;
            navItem.dataset.index = i;
            
            navItem.addEventListener('click', function() {
                // 현재 문제 답변 저장
                saveCurrentAnswer();
                // 선택한 문제로 이동
                currentQuestionIndex = parseInt(this.dataset.index);
                renderCurrentQuestion();
                updateNavigation();
            });
            
            questionNavigation.appendChild(navItem);
        }
        
        updateNavigation();
    }
    
    // 네비게이션 상태 업데이트
    function updateNavigation() {
        const navItems = questionNavigation.querySelectorAll('.question-nav-item');
        
        navItems.forEach((item, index) => {
            // 클래스 초기화
            item.classList.remove('active', 'answered');
            
            // 현재 문제 표시
            if (index === currentQuestionIndex) {
                item.classList.add('active');
            }
            
            // 답변한 문제 표시
            if (userAnswers[index] !== null && userAnswers[index] !== undefined && userAnswers[index] !== '') {
                item.classList.add('answered');
            }
        });
        
        // 이전/다음 버튼 상태 업데이트
        prevBtn.disabled = currentQuestionIndex === 0;
        
        if (currentQuestionIndex === questions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
        
        // 진행 상황 업데이트
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    // 현재 문제 렌더링
    function renderCurrentQuestion() {
        const question = questions[currentQuestionIndex];
        
        currentQuestionElem.textContent = currentQuestionIndex + 1;
        questionNumber.textContent = currentQuestionIndex + 1;
        questionText.textContent = question.text;
        
        // 문제 유형에 따른 UI 설정
        if (question.type === 'short') {
            questionType.textContent = '서술형';
            questionType.className = 'badge badge-short';
            renderShortAnswerUI(question);
        } else if (question.type === 'multiple') {
            questionType.textContent = '선택형';
            questionType.className = 'badge badge-multiple';
            renderMultipleChoiceUI(question);
        }
    }
    
    // 서술형 문제 UI 렌더링
    function renderShortAnswerUI(question) {
        answerContainer.innerHTML = `
            <textarea id="shortAnswer" placeholder="답변을 입력하세요...">${userAnswers[currentQuestionIndex] || ''}</textarea>
        `;
    }
    
    // 선택형 문제 UI 렌더링
    function renderMultipleChoiceUI(question) {
        answerContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionItem = document.createElement('div');
            optionItem.className = 'option-item';
            if (userAnswers[currentQuestionIndex] === index) {
                optionItem.classList.add('selected');
            }
            
            optionItem.innerHTML = `
                <input type="radio" id="option_${index}" name="answer" value="${index}" ${userAnswers[currentQuestionIndex] === index ? 'checked' : ''}>
                <label for="option_${index}">${option}</label>
            `;
            
            optionItem.addEventListener('click', function() {
                // 다른 옵션의 선택 상태 제거
                answerContainer.querySelectorAll('.option-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // 현재 옵션 선택
                this.classList.add('selected');
                this.querySelector('input[type="radio"]').checked = true;
                
                // 답변 저장
                userAnswers[currentQuestionIndex] = index;
                updateNavigation();
            });
            
            answerContainer.appendChild(optionItem);
        });
    }
    
    // 현재 문제 답변 저장
    function saveCurrentAnswer() {
        const question = questions[currentQuestionIndex];
        
        if (question.type === 'short') {
            const textArea = document.getElementById('shortAnswer');
            if (textArea) {
                userAnswers[currentQuestionIndex] = textArea.value.trim();
            }
        } else if (question.type === 'multiple') {
            const selectedOption = answerContainer.querySelector('input[type="radio"]:checked');
            if (selectedOption) {
                userAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
            }
        }
        
        updateNavigation();
    }
    
    // 이전 문제로 이동
    function goToPreviousQuestion() {
        if (currentQuestionIndex > 0) {
            saveCurrentAnswer();
            currentQuestionIndex--;
            renderCurrentQuestion();
            updateNavigation();
        }
    }
    
    // 다음 문제로 이동
    function goToNextQuestion() {
        if (currentQuestionIndex < questions.length - 1) {
            saveCurrentAnswer();
            currentQuestionIndex++;
            renderCurrentQuestion();
            updateNavigation();
        }
    }
    
    // 제출 확인 모달 표시
    function showSubmitConfirmation() {
        saveCurrentAnswer();
        
        // 답변하지 않은 문제 확인
        const unanswered = userAnswers.filter(answer => answer === null || answer === undefined || answer === '').length;
        
        if (unanswered > 0) {
            unansweredWarning.style.display = 'block';
            unansweredCount.textContent = unanswered;
        } else {
            unansweredWarning.style.display = 'none';
        }
        
        confirmSubmitModal.style.display = 'flex';
    }
    
    // 제출 확인 모달 숨기기
    function hideSubmitConfirmation() {
        confirmSubmitModal.style.display = 'none';
    }
    
    // 시험 제출
    function submitExam() {
        saveCurrentAnswer();
        
        // 서버에 답안 제출
        fetch('/api/exam/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                answers: userAnswers,
                questions: questions.map(q => q.id)
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 결과 데이터 세션 저장
                sessionStorage.setItem('examResults', JSON.stringify({
                    questions: questions,
                    userAnswers: userAnswers,
                    results: data.results
                }));
                
                // 결과 페이지로 이동
                window.location.href = '/results';
            } else {
                alert('시험 제출에 실패했습니다: ' + data.error);
                hideSubmitConfirmation();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            
            // 결과 페이지로 이동 (오류 발생 시 임시 처리)
            sessionStorage.setItem('examResults', JSON.stringify({
                questions: questions,
                userAnswers: userAnswers,
                // 임시 결과 생성
                results: userAnswers.map((answer, index) => {
                    return {
                        question_id: questions[index].id,
                        is_correct: false,
                        message: '서버 오류로 채점할 수 없습니다.'
                    };
                })
            }));
            
            alert('서버 오류가 발생했습니다. 결과 페이지로 이동합니다.');
            window.location.href = '/results';
        });
    }
    
    // 타이머 시작
    function startTimer() {
        let timeLeft = examDuration;
        
        timer = setInterval(function() {
            timeLeft--;
            
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;
            
            timeDisplay.textContent = `남은 시간: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                alert('시험 시간이 종료되었습니다. 자동으로 제출됩니다.');
                submitExam();
            }
        }, 1000);
    }
    
    // 초기화 실행
    init();
});