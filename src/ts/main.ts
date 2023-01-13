const settingsButton: HTMLButtonElement = document.querySelector('#settings-button');
const settingsModal: HTMLElement = document.querySelector('#settings-modal');
const closeModalButton: HTMLButtonElement = document.querySelector('#close-settings-modal-button');

settingsButton.addEventListener('click', () => {
	settingsModal.dataset.open = 'true';
});

closeModalButton?.addEventListener('click', () => {
	settingsModal.dataset.open = 'false';
});
