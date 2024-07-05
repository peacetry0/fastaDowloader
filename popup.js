document.addEventListener('DOMContentLoaded', function() {
    const codeInput = document.getElementById('codeInput');
    const downloadBtn = document.getElementById('downloadBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');

    function setLoading(isLoading) {
        if (isLoading) {
            downloadBtn.disabled = true;
            loadingSpinner.classList.remove('hidden');
            downloadBtn.querySelector('span').textContent = 'İndiriliyor...';
        } else {
            downloadBtn.disabled = false;
            loadingSpinner.classList.add('hidden');
            downloadBtn.querySelector('span').textContent = 'Fatsal İndir';
        }
    }

    downloadBtn.addEventListener('click', function() {
        const code = codeInput.value.trim();
        if (code) {
            setLoading(true);
            errorMessage.textContent = '';
            successMessage.textContent = '';

            fetch(`https://www.ncbi.nlm.nih.gov/nuccore/${code}`)
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    
                    const phidMeta = doc.querySelector('meta[name="ncbi_phid"]');
                    const uidlistMeta = doc.querySelector('meta[name="ncbi_uidlist"]');
                    
                    if (phidMeta && uidlistMeta) {
                        const phid = phidMeta.getAttribute('content');
                        const uidlist = uidlistMeta.getAttribute('content');
                        
                        const downloadUrl = `https://www.ncbi.nlm.nih.gov/sviewer/viewer.cgi?tool=portal&save=file&log$=seqview&db=nuccore&report=fasta&id=${uidlist}&conwithfeat=on&withparts=on&show-sequence=on&hide-cdd=on&ncbi_phid=${phid}`;
                        
                        return fetch(downloadUrl);
                    } else {
                        throw new Error('Gerekli meta etiketleri bulunamadı.');
                    }
                })
                .then(response => response.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `${code}.fasta`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    successMessage.textContent = 'Dosya başarıyla indirildi!';
                })
                .catch(error => {
                    errorMessage.textContent = error.message || 'Bir hata oluştu.';
                    console.error('Hata:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            errorMessage.textContent = 'Lütfen geçerli bir kod girin.';
        }
    });
});