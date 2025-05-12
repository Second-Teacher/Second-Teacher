document.addEventListener('DOMContentLoaded', function() {
    const audioUploadForm = document.getElementById('audioUploadForm');
    if (!audioUploadForm) return; // 오디오 업로드 페이지가 아닌 경우 종료
    
    const audioFileInput = document.getElementById('audioFile');
    const loaderSection = document.getElementById('loaderSection');
    const resultSection = document.getElementById('resultSection');
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    const editableTranscription = document.getElementById('editableTranscription');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    // 폼 제출 이벤트 핸들러
    audioUploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const file = audioFileInput.files[0];
        
        if (!file) {
            showError('오디오 파일을 선택해주세요.');
            return;
        }
        
        // 로딩 표시
        loaderSection.classList.remove('hidden');
        resultSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        
        const formData = new FormData();
        formData.append('file', file);
        
        fetch('/api/stt', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // 로딩 숨기기
            loaderSection.classList.add('hidden');
            
            if (data.success) {
                // 결과 표시
                resultSection.classList.remove('hidden');
                editableTranscription.value = data.transcription;
            } else {
                // 오류 표시
                showError(data.error || '알 수 없는 오류가 발생했습니다.');
            }
        })
        .catch(error => {
            // 로딩 숨기기
            loaderSection.classList.add('hidden');
            // 오류 표시
            showError('서버 통신 중 오류가 발생했습니다: ' + error);
            console.error('Error:', error);
        });
    });

    // DB에 저장 버튼
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const transcriptionText = editableTranscription.value;
            const fileName = audioFileInput.files[0].name;
            
            // 오디오 변환 내용 저장 API 호출
            fetch('/summary/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file_name: fileName,
                    content: transcriptionText,
                    type: 'stt'
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('변환 내용이 저장되었습니다.');
                } else {
                    alert('저장 실패: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('저장 중 오류가 발생했습니다.');
            });
        });
    }
    
    // 복사 버튼
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const transcriptionText = editableTranscription.value;
            navigator.clipboard.writeText(transcriptionText)
                .then(() => alert('변환 내용이 클립보드에 복사되었습니다.'))
                .catch(err => alert('복사 중 오류가 발생했습니다: ' + err));
        });
    }
    
    // 다운로드 버튼
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const transcriptionText = editableTranscription.value;
            const fileName = audioFileInput.files[0].name.replace(/\.[^/.]+$/, '') + '_변환.txt';
            
            const blob = new Blob([transcriptionText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
    
    // 오류 표시 함수
    function showError(message) {
        errorSection.classList.remove('hidden');
        errorMessage.textContent = message;
    }
}); 