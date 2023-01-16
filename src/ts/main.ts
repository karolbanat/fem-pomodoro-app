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

/* timer elements */
const timer: HTMLElement = document.querySelector('.timer');
const timeProgressBar: HTMLElement = timer.querySelector('#progress-bar');
const timerTime: HTMLElement = timer.querySelector('#timer-time');
const timerButton: HTMLButtonElement = timer.querySelector('#timer-button');

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
type TimerState = 'INITIAL' | 'COUNTING' | 'PAUSED' | 'END';

const minutesToSeconds = (minutes: number): number => minutes * 60;

const getMinutesFromSeconds = (seconds: number): number => Math.floor(seconds / 60);

const getRemainingSeconds = (seconds: number): number => seconds % 60;

const addLeadingZero = (time: number): string => {
	return time < 10 ? `0${time}` : time.toString();
};

const formatTime = (seconds: number): string => {
	const minutes = getMinutesFromSeconds(seconds);
	const remainingSeconds = getRemainingSeconds(seconds);
	return addLeadingZero(minutes) + ':' + addLeadingZero(remainingSeconds);
};

interface Timer {
	state: TimerState;
	start: () => void;
	pause: () => void;
	restart: () => void;
	setTime: (time: number) => void;
	getTime: () => number;
	getState: () => TimerState;
	setState: (state: TimerState) => void;
}

class PomodoroTimer implements Timer {
	state: TimerState = 'INITIAL';
	constructor(private time: number = 0) {}

	start = (): void => {
		this.state = 'COUNTING';
	};

	pause = (): void => {
		this.state = 'PAUSED';
	};

	restart = (): void => {
		this.state = 'END';
	};

	getTime = (): number => this.time;

	setTime = (time: number): void => {
		this.time = time;
	};

	getState = (): TimerState => this.state;

	setState = (state: TimerState): void => {
		this.state = state;
	};
}

class TimerController {
	countTimeout: NodeJS.Timeout;
	constructor(private timer: Timer) {
		timerButton.addEventListener('click', this.timerAction);
		timerTime.innerText = formatTime(this.timer.getTime());
	}

	timerAction = (): void => {
		switch (this.timer.getState()) {
			case 'INITIAL':
			case 'PAUSED':
				this.timer.start();
				this.count();
				timerButton.innerText = 'pause';
				break;
			case 'COUNTING':
				this.timer.pause();
				clearTimeout(this.countTimeout);
				timerButton.innerText = 'start';
				break;
		}
	};

	count = (): void => {
		this.setTime(this.timer.getTime() - 1);
		this.countTimeout = setTimeout(() => {
			this.count();
		}, 1000);
	};

	setTime = (time: number): void => {
		this.timer.setTime(time);
		timerTime.innerText = formatTime(this.timer.getTime());
	};
}
/* Timer functionality end */

/* App */
class PomodoroApp {
	private timer: TimerController;

	constructor(
		private pomodoroTime: number = 25,
		private shortBreakTime: number = 5,
		private longBreakTime: number = 15
	) {
		this.timer = new TimerController(new PomodoroTimer(minutesToSeconds(this.pomodoroTime)));
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
