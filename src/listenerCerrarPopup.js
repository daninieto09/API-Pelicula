const popup = document.getElementById('media');

popup.addEventListener('click', (e) => {
    if (e.target.closest('.media__btn')) {
        popup.classList.remove('media--active');
    }  
});