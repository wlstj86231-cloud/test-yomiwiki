/**
 * Share Modal Logic (SPA Compatible)
 * Uses Event Delegation to prevent null reference errors during dynamic navigation.
 */
document.addEventListener('click', (e) => {
    // 1. Share Button Click
    const btnShare = e.target.closest('#btn-share');
    if (btnShare) {
        const shareModal = document.getElementById('share-modal');
        const shareInput = document.getElementById('share-url-input');
        if (shareModal && shareInput) {
            shareInput.value = window.location.href;
            shareModal.style.display = 'flex';
        }
        return;
    }

    // 2. Copy Button Click
    const btnCopy = e.target.closest('#btn-share-copy');
    if (btnCopy) {
        const shareInput = document.getElementById('share-url-input');
        if (shareInput) {
            shareInput.select();
            try {
                document.execCommand('copy');
                const originalText = btnCopy.textContent;
                btnCopy.textContent = '[LINK_COPIED]';
                setTimeout(() => {
                    btnCopy.textContent = originalText;
                }, 2000);
            } catch (err) {
                console.error('Copy failed', err);
            }
        }
        return;
    }

    // 3. Close Button Click
    const btnClose = e.target.closest('#btn-share-close');
    const shareModal = document.getElementById('share-modal');
    if (btnClose && shareModal) {
        shareModal.style.display = 'none';
        return;
    }

    // 4. Overlay Click (to close)
    if (shareModal && e.target === shareModal) {
        shareModal.style.display = 'none';
    }
});
