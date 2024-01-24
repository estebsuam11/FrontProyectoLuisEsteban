const openModals = document.querySelectorAll('.hero__cta');
const modal = document.querySelector('.modal');
const closeModal = document.querySelector('.modal__close');

openModals.forEach(function (openModal) {
    openModal.addEventListener('click', function (e) {
        e.preventDefault();
        modal.classList.add('modal--show');
    });
});


closeModal.addEventListener('click', (e)=>{
    e.preventDefault();
    modal.classList.remove('modal--show');
});