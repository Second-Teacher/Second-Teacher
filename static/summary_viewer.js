// summary_viewer.js 파일 수정

document.addEventListener('DOMContentLoaded', function() {
    const pdfBtn = document.getElementById('pdfBtn');
    const sttBtn = document.getElementById('sttBtn');
    const loadBtn = document.getElementById('loadBtn');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const success = document.getElementById('success');
    const summaryList = document.getElementById('summaryList');
    const summaryContent = document.getElementById('summaryContent');
    const viewModeContent = document.getElementById('viewModeContent');
    const editModeContent = document.getElementById('editModeContent');
    const editModeToggle = document.getElementById('editModeToggle');
    const editTitle = document.getElementById('editTitle');
    const editType = document.getElementById('editType');
    const editTextarea = document.getElementById('editTextarea');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    let selectedType = 'pdf'; // 기본값
    let currentData = null; // 현재 선택된 데이터
    let summariesData = {}; // 불러온 요약 데이터
    
    // 초기 로딩 상태 확인 및 숨기기
    if (loading) {
        loading.classList.add('hidden');
    }
    
    // 유형 선택 버튼 이벤트
    pdfBtn.addEventListener('click', function() {
        setActiveType('pdf');
    });
    
    sttBtn.addEventListener('click', function() {
        setActiveType('stt');
    });
    
    // 선택 유형 활성화 함수
    function setActiveType(type) {
        selectedType = type;
        
        // 버튼 스타일 변경
        pdfBtn.classList.toggle('active', type === 'pdf');
        sttBtn.classList.toggle('active', type === 'stt');
        
        // 목록 초기화
        summaryList.innerHTML = '<p>조회 버튼을 클릭하여 목록을 불러오세요.</p>';
        resetContentView();
        hideMessages();
    }
    
    // 편집 모드 토글 이벤트
    editModeToggle.addEventListener('change', function() {
        const isEditMode = editModeToggle.checked;
        
        if (isEditMode) {
            // 편집 모드로 전환
            if (!currentData) {
                editModeToggle.checked = false;
                showError('편집할 내용을 먼저 선택해주세요.');
                return;
            }
            
            viewModeContent.classList.add('hidden');
            editModeContent.classList.remove('hidden');
            
            // 편집 폼 설정
            editTitle.textContent = currentData.fileName;
            editType.textContent = currentData.type === 'pdf' ? 'PDF 요약' : 'STT 변환 내용';
            editTextarea.value = currentData.content;
            
        } else {
            // 보기 모드로 전환
            viewModeContent.classList.remove('hidden');
            editModeContent.classList.add('hidden');
        }
    });
    
    // 저장 버튼 이벤트
    saveBtn.addEventListener('click', function() {
        if (!currentData) {
            showError('저장할 내용이 없습니다.');
            return;
        }
        
        const updatedContent = editTextarea.value.trim();
        
        if (!updatedContent) {
            showError('내용을 입력해주세요.');
            return;
        }
        
        // 로딩 표시
        loading.classList.remove('hidden');
        hideMessages();
        
        // 업데이트 API 호출
        fetch('/summary/api/summaries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: currentData.type,
                fileName: currentData.fileName,
                content: updatedContent
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`서버 오류 (${response.status}): ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // 항상 로딩 상태 숨기기
            loading.classList.add('hidden');
            
            if (data.success) {
                // 저장 성공
                showSuccess('요약 내용이 성공적으로 저장되었습니다.');
                
                // 데이터 업데이트
                currentData.content = updatedContent;
                summariesData[currentData.fileName] = updatedContent;
                
                // 보기 모드 업데이트
                showSummaryContent(currentData.type, currentData.fileName, updatedContent);
                
                // 보기 모드로 전환
                editModeToggle.checked = false;
                viewModeContent.classList.remove('hidden');
                editModeContent.classList.add('hidden');
            } else {
                throw new Error(data.error || '저장 중 오류가 발생했습니다.');
            }
        })
        .catch(err => {
            // 항상 로딩 상태 숨기기
            loading.classList.add('hidden');
            showError(`오류: ${err.message}`);
            console.error('요약 내용 저장 오류:', err);
        });
    });
    
    // 취소 버튼 이벤트
    cancelBtn.addEventListener('click', function() {
        // 편집 취소하고 보기 모드로 돌아가기
        editModeToggle.checked = false;
        viewModeContent.classList.remove('hidden');
        editModeContent.classList.add('hidden');
    });
    
    // 요약 목록 로드 이벤트
    loadBtn.addEventListener('click', function() {
        // UI 초기화
        loading.classList.remove('hidden');
        hideMessages();
        summaryList.innerHTML = '';
        resetContentView();
        
        // API 호출
        fetch(`/summary/api/summaries?type=${selectedType}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`서버 오류 (${response.status}): ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                // 명시적으로 로딩 상태 숨기기
                if (loading) {
                    loading.classList.add('hidden');
                }
                
                if (!data.success) {
                    throw new Error(data.error || '알 수 없는 오류가 발생했습니다.');
                }
                
                const summaries = data.summaries;
                const type = data.type; // 서버에서 반환한 유형
                
                // 데이터 저장
                summariesData = summaries;
                
                // 데이터 없음 처리
                if (Object.keys(summaries).length === 0) {
                    summaryList.innerHTML = `<p>저장된 ${type === 'pdf' ? 'PDF 요약' : 'STT 변환 내용'}이 없습니다.</p>`;
                    return;
                }
                
                // 요약 목록 표시
                Object.keys(summaries).forEach(fileName => {
                    const item = document.createElement('div');
                    item.className = 'summary-item';
                    item.textContent = fileName;
                    item.addEventListener('click', function() {
                        // 활성 항목 스타일 업데이트
                        document.querySelectorAll('.summary-item').forEach(el => {
                            el.classList.remove('active');
                        });
                        item.classList.add('active');
                        
                        // 현재 데이터 설정
                        currentData = {
                            type: type,
                            fileName: fileName,
                            content: summaries[fileName]
                        };
                        
                        // 내용 표시
                        showSummaryContent(type, fileName, summaries[fileName]);
                        
                        // 편집 모드에 있다면 편집 폼도 업데이트
                        if (editModeToggle.checked) {
                            editTitle.textContent = fileName;
                            editType.textContent = type === 'pdf' ? 'PDF 요약' : 'STT 변환 내용';
                            editTextarea.value = summaries[fileName];
                        }
                    });
                    summaryList.appendChild(item);
                });
            })
            .catch(err => {
                // 명시적으로 로딩 상태 숨기기
                if (loading) {
                    loading.classList.add('hidden');
                }
                
                // 오류 처리
                showError(`오류: ${err.message}`);
                console.error('요약 목록 조회 오류:', err);
            })
            .finally(() => {
                // 추가 안전장치: 항상 로딩 숨기기
                if (loading) {
                    loading.classList.add('hidden');
                }
            });
    });
    
    // 요약 내용 표시 함수
    function showSummaryContent(type, fileName, content) {
        viewModeContent.innerHTML = `
            <div class="content-header">
                <h2>${fileName}</h2>
                <p><strong>유형:</strong> ${type === 'pdf' ? 'PDF 요약' : 'STT 변환 내용'}</p>
            </div>
            <div>${content}</div>
        `;
    }
    
    // 오류 메시지 표시 함수
    function showError(message) {
        error.classList.remove('hidden');
        error.textContent = message;
        success.classList.add('hidden');
    }
    
    // 성공 메시지 표시 함수
    function showSuccess(message) {
        success.classList.remove('hidden');
        success.textContent = message;
        error.classList.add('hidden');
    }
    
    // 메시지 숨김 함수
    function hideMessages() {
        error.classList.add('hidden');
        success.classList.add('hidden');
    }
    
    // 컨텐츠 뷰 초기화 함수
    function resetContentView() {
        viewModeContent.innerHTML = '<p>항목을 선택하면 내용이 여기에 표시됩니다.</p>';
        viewModeContent.classList.remove('hidden');
        editModeContent.classList.add('hidden');
        editModeToggle.checked = false;
        currentData = null;
    }
});