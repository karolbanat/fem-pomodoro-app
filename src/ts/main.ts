/* modal and modal realted elements */
const settingsButton: HTMLButtonElement = document.querySelector('#settings-button');
const settingsModal: HTMLElement = document.querySelector('#settings-modal');
const closeModalButton: HTMLButtonElement = document.querySelector('#close-settings-modal-button');

/* settings form elements */
const settingsForm: HTMLFormElement = settingsModal.querySelector('#settings-form');
const pomodoroTimeInput: HTMLInputElement = settingsForm.querySelector('#pomodoro-time');
const shortBreakTimeInput: HTMLInputElement = settingsForm.querySelector('#short-break-time');
const longBreakTimeInput: HTMLInputElement = settingsForm.querySelector('#long-break-time');
const fontRadioButtons: Array<HTMLInputElement> = Array.from(
	settingsForm.querySelectorAll('input[type="radio"][name="font"]')
);
const colourRadioButtons: Array<HTMLInputElement> = Array.from(
	settingsForm.querySelectorAll('input[type="radio"][name="colour"]')
);
const settingsSubmit: HTMLButtonElement = settingsForm.querySelector('button[type="submit"]');

/* constants */
const DEFAULT_FONT: Font = 'sans-serif';
const DEFAULT_COLOUR: Colour = 'red';

/* theme states */
type Colour = 'red' | 'cyan' | 'violet';
type Font = 'serif' | 'sans-serif' | 'monospace';
interface Theme {
	colour: Colour;
	font: Font;
	updateTheme: (font: Font, colour: Colour) => void;
}

class AppTheme implements Theme {
	colour: Colour = DEFAULT_COLOUR;
	font: Font = DEFAULT_FONT;

	updateTheme = (font: Font, colour: Colour): void => {
		this.colour = colour;
		this.font = font;
		document.body.dataset.font = font;
		document.body.dataset.theme = colour;
	};
}

const appTheme: Theme = new AppTheme();

/* Timer functionality */
interface Timer {
	start: () => void;
	pause: () => void;
	restart: () => void;
	setTime: (time: number) => void;
}

class PomodoroTimer implements Timer {
	constructor(private time: number = 0) {}

	start = (): void => {};

	pause = (): void => {};

	restart = (): void => {};

	setTime = (time: number): void => {
		this.time = time;
	};
}
/* Timer functionality end */

class PomodoroApp {
	private timer: Timer;

	constructor(
		private pomodoroTime: number = 25,
		private shortBreakTime: number = 5,
		private longBreakTime: number = 15
	) {
		this.timer = new PomodoroTimer(this.pomodoroTime);
	}

	setTimes = (pomodoro: number, shortBreak: number, longBreak: number): void => {
		this.pomodoroTime = pomodoro;
		this.shortBreakTime = shortBreak;
		this.longBreakTime = longBreak;
	};
}
const pomodoroApp: PomodoroApp = new PomodoroApp();

/* modal functions */
const openModal = () => {
	settingsModal.dataset.open = 'true';
};

const closeModal = () => {
	settingsModal.dataset.open = 'false';
};

settingsSubmit.addEventListener('click', (e: Event) => {
	e.preventDefault();
	const pomodoroTime = Number(pomodoroTimeInput.value);
	const shortBreakTime = Number(shortBreakTimeInput.value);
	const longBreakTime = Number(longBreakTimeInput.value);
	const chosenFont: Font = fontRadioButtons.find(button => button.checked).value as Font;
	const chosenColour: Colour = colourRadioButtons.find(button => button.checked).value as Colour;
	pomodoroApp.setTimes(pomodoroTime, shortBreakTime, longBreakTime);
	appTheme.updateTheme(chosenFont, chosenColour);
	closeModal();
});

/* modal opening and closing */
settingsButton.addEventListener('click', () => {
	openModal();
});

closeModalButton?.addEventListener('click', () => {
	closeModal();
});
/* modal opening and closing end */
