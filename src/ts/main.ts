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
/* --- general */
const SECONDS_IN_MINUTE = 60;
/* --- theme */
const DEFAULT_FONT: Font = 'sans-serif';
const DEFAULT_COLOUR: Colour = 'red';
/* --- times */
const DEFAULT_POMODORO_TIME = 25;
const DEFAULT_SHORT_BREAK_TIME = 5;
const DEFAULT_LONG_BREAK_TIME = 5;

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

const minutesToSeconds = (minutes: number): number => minutes * SECONDS_IN_MINUTE;

const getMinutesFromSeconds = (seconds: number): number => Math.floor(seconds / SECONDS_IN_MINUTE);

const getRemainingSeconds = (seconds: number): number => seconds % SECONDS_IN_MINUTE;

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
	countTimeout: NodeJS.Timeout;
	state: TimerState = 'INITIAL';
	private countingTime: number;
	constructor(private time: number = 0) {
		this.countingTime = time;
	}

	start = (): void => {
		this.state = 'COUNTING';
		this.count();
	};

	count = (): void => {
		this.countTimeout = setTimeout(() => {
			this.setTime(this.getTime() - 1);
			this.count();
		}, 1000);
	};

	pause = (): void => {
		this.state = 'PAUSED';
		clearTimeout(this.countTimeout);
	};

	restart = (): void => {
		this.state = 'INITIAL';
		this.countingTime = this.time;
	};

	getTime = (): number => this.countingTime;

	setTime = (time: number): void => {
		this.time = time;
		this.countingTime = time;
		timerTime.innerText = formatTime(this.countingTime);
	};

	getState = (): TimerState => this.state;

	setState = (state: TimerState): void => {
		this.state = state;
	};
}

class TimerController {
	constructor(private timer: Timer) {
		timerButton.addEventListener('click', this.timerAction);
		timerTime.innerText = formatTime(this.timer.getTime());
	}

	timerAction = (): void => {
		switch (this.timer.getState()) {
			case 'INITIAL':
			case 'PAUSED':
				this.timer.start();
				timerButton.innerText = 'pause';
				break;
			case 'COUNTING':
				this.timer.pause();
				timerButton.innerText = 'start';
				break;
		}
	};

	setTime = (time: number): void => {
		this.timer.setTime(time);
	};
}
/* Timer functionality end */

/* App */
class PomodoroApp {
	private timer: TimerController;

	constructor(
		private pomodoroTime: number = DEFAULT_POMODORO_TIME,
		private shortBreakTime: number = DEFAULT_SHORT_BREAK_TIME,
		private longBreakTime: number = DEFAULT_LONG_BREAK_TIME
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
