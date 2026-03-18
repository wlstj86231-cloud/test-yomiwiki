/**
 * Share Modal Logic
 * Defensive implementation to prevent frontend paralysis.
 */
document.addEventListener('DOMContentLoaded', () => {
    const btnShare = document.getElementById('btn-share');
    const shareModal = document.getElementById('share-modal');
    const shareInput = document.getElementById('share-url-input');
    const btnCopy = document.getElementById('btn-share-copy');
    const btnClose = document.getElementById('btn-share-close');

    // Defensive check: only proceed if all elements exist
    if (!btnShare || !shareModal || !shareInput || !btnCopy || !btnClose) {
        console.warn('[SHARE_PROTOCOL_OFFLINE]: Required DOM elements missing. Share functionality disabled.');
        return;
    }

    btnShare.addEventListener('click', () => {
        shareInput.value = window.location.href;
        shareModal.style.display = 'flex';
    });

    btnCopy.addEventListener('click', () => {
        shareInput.select();
        document.execCommand('copy');
        
        const originalText = btnCopy.textContent;
        btnCopy.textContent = '[LINK_COPIED]';
        setTimeout(() => {
            btnCopy.textContent = originalText;
        }, 2000);
    });

    btnClose.addEventListener('click', () => {
        shareModal.style.display = 'none';
    });

    // Close on overlay click
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.style.display = 'none';
        }
    });
});
