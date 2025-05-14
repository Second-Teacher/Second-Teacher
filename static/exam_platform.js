document.addEventListener('DOMContentLoaded', function() {
    // 요소 선택
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const continueBtn = document.getElementById('continueBtn');
    const backBtn = document.getElementById('backBtn');
    const startExamBtn = document.getElementById('startExamBtn');
    
    // 라디오 버튼 선택 시 이벤트
    const totalQuestionsInputs = document.querySelectorAll('input[name="total_questions"]');
    
    // 슬라이더 요소
    const shortAnswerCount = document.getElementById('shortAnswerCount');
    const multipleChoiceCount = document.getElementById('multipleChoiceCount');
    const shortAnswerDisplay = document.getElementById('shortAnswerDisplay');
    const multipleChoiceDisplay = document.getElementById('multipleChoiceDisplay');
    
    // 요약 정보 요소
    const selectedQuestionCount = document.getElementById('selectedQuestionCount');
    const summaryTotal = document.getElementById('summaryTotal');
    const summaryShort = document.getElementById('summaryShort');
    const summaryMultiple = document.getElementById('summaryMultiple');
    const validationMessage = document.getElementById('validationMessage');
    
    // 총 문제 수 변경 처리
    function updateTotalQuestions() {
        const totalQuestions = parseInt(document.querySelector('input[name="total_questions"]:checked').value);
        
        // 슬라이더 최대값 업데이트
        shortAnswerCount.max = totalQuestions;
        multipleChoiceCount.max = totalQuestions;
        
        // 기본값 설정 (반반으로 나누기)
        const halfValue = Math.floor(totalQuestions / 2);
        shortAnswerCount.value = halfValue;
        multipleChoiceCount.value = totalQuestions - halfValue;
        
        // 화면 표시 업데이트
        selectedQuestionCount.textContent = totalQuestions;
        summaryTotal.textContent = totalQuestions;
        shortAnswerDisplay.textContent = shortAnswerCount.value;
        multipleChoiceDisplay.textContent = multipleChoiceCount.value;
        summaryShort.textContent = shortAnswerCount.value;
        summaryMultiple.textContent = multipleChoiceCount.value;
    }
    
    // 문제 유형 수 조정 처리
    function updateQuestionTypeCounts() {
        const totalQuestions = parseInt(document.querySelector('input[name="total_questions"]:checked').value);
        const shortCount = parseInt(shortAnswerCount.value);
        
        // 선택형 문제 수 자동 조정
        multipleChoiceCount.value = totalQuestions - shortCount;
        
        // 화면 표시 업데이트
        shortAnswerDisplay.textContent = shortCount;
        multipleChoiceDisplay.textContent = multipleChoiceCount.value;
        summaryShort.textContent = shortCount;
        summaryMultiple.textContent = multipleChoiceCount.value;
        
        // 유효성 검증
        validateQuestionCounts();
    }
    
    // 유효성 검증
    function validateQuestionCounts() {
        const totalQuestions = parseInt(document.querySelector('input[name="total_questions"]:checked').value);
        const shortCount = parseInt(shortAnswerCount.value);
        const multipleCount = parseInt(multipleChoiceCount.value);
        
        if (shortCount + multipleCount !== totalQuestions) {
            validationMessage.textContent = `문제 유형의 합이 총 문제 수(${totalQuestions})와 일치해야 합니다.`;
            validationMessage.classList.remove('hidden');
            startExamBtn.disabled = true;
        } else {
            validationMessage.classList.add('hidden');
            startExamBtn.disabled = false;
        }
    }
    
    // 이벤트 리스너 등록
    continueBtn.addEventListener('click', function() {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        updateTotalQuestions();
    });
    
    backBtn.addEventListener('click', function() {
        step2.classList.add('hidden');
        step1.classList.remove('hidden');
    });
    
    totalQuestionsInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (step2.classList.contains('hidden')) return;
            updateTotalQuestions();
        });
    });
    
    shortAnswerCount.addEventListener('input', updateQuestionTypeCounts);
    multipleChoiceCount.addEventListener('input', function() {
        const totalQuestions = parseInt(document.querySelector('input[name="total_questions"]:checked').value);
        const multipleCount = parseInt(multipleChoiceCount.value);
        
        // 서술형 문제 수 자동 조정
        shortAnswerCount.value = totalQuestions - multipleCount;
        
        // 화면 표시 업데이트
        shortAnswerDisplay.textContent = shortAnswerCount.value;
        multipleChoiceDisplay.textContent = multipleCount;
        summaryShort.textContent = shortAnswerCount.value;
        summaryMultiple.textContent = multipleCount;
        
        // 유효성 검증
        validateQuestionCounts();
    });
    
    // 폼 제출 처리
    document.getElementById('examConfigForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        // 유효성 검증
        const totalQuestions = parseInt(document.querySelector('input[name="total_questions"]:checked').value);
        const shortCount = parseInt(shortAnswerCount.value);
        const multipleCount = parseInt(multipleChoiceCount.value);
        
        if (shortCount + multipleCount !== totalQuestions) {
            alert('문제 유형의 합이 총 문제 수와 일치해야 합니다.');
            return;
        }
        
        // 시험 설정 저장
        const examConfig = {
            total_questions: totalQuestions,
            short_answer_count: shortCount,
            multiple_choice_count: multipleCount
        };
        
        // 세션 스토리지에 저장 (페이지 간 데이터 유지)
        sessionStorage.setItem('examConfig', JSON.stringify(examConfig));
        
        // 시험 페이지로 이동
        window.location.href = 'interface';
    });
});