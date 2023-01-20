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

/* time state buttons */
const timeStateButtons: Array<HTMLButtonElement> = Array.from(document.querySelectorAll('.state-button'));

/* constants */
/* --- general */
const SECONDS_IN_MINUTE: number = 60;
/* --- theme */
const DEFAULT_FONT: Font = 'sans-serif';
const DEFAULT_COLOUR: Colour = 'red';
/* --- times */
const DEFAULT_POMODORO_TIME: number = 25;
const DEFAULT_SHORT_BREAK_TIME: number = 5;
const DEFAULT_LONG_BREAK_TIME: number = 15;

/* Observer pattern interfaces */
interface Observable {
	addObserver: (observer: Observer) => void;
	notifyObservers: () => void;
}

interface Observer {
	update: (observable: Observable) => void;
}

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

interface Timer extends Observable {
	state: TimerState;
	start: () => void;
	pause: () => void;
	restart: () => void;
	setTime: (time: number) => void;
	getTime: () => number;
	getCurrentTime: () => number;
	getState: () => TimerState;
	setState: (state: TimerState) => void;
}

class PomodoroTimer implements Timer {
	observers: Observer[] = [];
	countTimeout: NodeJS.Timeout;
	state: TimerState = 'INITIAL';
	private countingTime: number;

	constructor(private time: number = 0) {
		this.countingTime = time;
	}

	start = (): void => {
		this.setState('COUNTING');
		this.count();
	};

	count = (): void => {
		if (this.getCurrentTime() === 0) {
			this.setState('END');
			clearTimeout(this.countTimeout);
			return;
		}

		this.countTimeout = setTimeout(() => {
			this.updateTime(this.getCurrentTime() - 1);
			this.count();
		}, 1000);
	};

	pause = (): void => {
		this.setState('PAUSED');
		clearTimeout(this.countTimeout);
	};

	restart = (): void => {
		this.setState('INITIAL');
		this.updateTime(this.time);
		clearTimeout(this.countTimeout);
	};

	getTime = (): number => this.time;

	getCurrentTime = (): number => this.countingTime;

	setTime = (time: number): void => {
		this.time = time;
		this.updateTime(this.time);
	};

	updateTime = (time: number): void => {
		this.countingTime = time;
		this.notifyObservers();
	};

	getState = (): TimerState => this.state;

	setState = (state: TimerState): void => {
		this.state = state;

		if (this.state === 'END') this.notifyObservers();
	};

	addObserver = (observer: Observer): void => {
		this.observers.push(observer);
	};

	notifyObservers = (): void => {
		this.observers.forEach(observer => observer.update(this));
	};
}

class TimerView implements Observer {
	private timer: HTMLElement;
	private timeProgressBar: HTMLElement;
	private timerTime: HTMLElement;
	private timerButton: HTMLButtonElement;

	constructor(buttonOnClick: (e: Event) => void) {
		this.timer = document.querySelector('.timer');
		this.timeProgressBar = this.timer.querySelector('#progress-bar');
		this.timerTime = this.timer.querySelector('#timer-time');
		this.timerButton = this.timer.querySelector('#timer-button');
		this.timerButton.addEventListener('click', buttonOnClick);
	}

	update = (observable: Observable): void => {
		const obs: Timer = observable as Timer;
		this.updateTime(obs.getCurrentTime());
		this.updateProgressBar(obs.getCurrentTime(), obs.getTime());

		if (obs.getState() === 'END') {
			this.updateButtonLabel('restart');
			this.resetProgressBar();
		}
	};

	updateButtonLabel = (label: string): void => {
		this.timerButton.innerText = label;
	};

	updateTime = (time: number): void => {
		this.timerTime.innerHTML = formatTime(time);
	};

	updateProgressBar = (current: number, base: number): void => {
		const circumference: number = Number(getComputedStyle(this.timeProgressBar).getPropertyValue('--circumference'));
		this.timeProgressBar.style.setProperty('--progress', ((1 - current / base) * circumference).toFixed(0));
	};

	resetProgressBar = (): void => {
		this.timeProgressBar.style.setProperty('--progress', '0');
	};
}

class TimerController {
	private view: TimerView;
	constructor(private timer: Timer) {
		this.view = new TimerView(this.timerAction);
		timer.addObserver(this.view);
		this.view.update(this.timer);
	}

	timerAction = (): void => {
		switch (this.timer.getState()) {
			case 'INITIAL':
			case 'PAUSED':
				this.startTimer();
				break;
			case 'COUNTING':
				this.pauseTimer();
				break;
			case 'END':
				this.restartTimer();
		}
	};

	startTimer = (): void => {
		this.timer.start();
		this.view.updateButtonLabel('pause');
	};

	pauseTimer = (): void => {
		this.timer.pause();
		this.view.updateButtonLabel('start');
	};

	restartTimer = (): void => {
		this.timer.restart();
		this.view.updateButtonLabel('start');
	};

	setTime = (time: number): void => {
		this.timer.setTime(time);
	};
}
/* Timer functionality end */

/* App */
type PomodoroAppStates = 'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK';
class PomodoroApp {
	private timer: TimerController;
	private appState: PomodoroAppStates = 'POMODORO';

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
		this.changeState(this.appState);
	};

	changeState = (state: PomodoroAppStates): void => {
		this.appState = state;
		this.timer.restartTimer();
		this.setTimerBasedOnState();
	};

	setTimerBasedOnState = (): void => {
		switch (this.appState) {
			case 'POMODORO':
				this.timer.setTime(minutesToSeconds(this.pomodoroTime));
				break;
			case 'SHORT_BREAK':
				this.timer.setTime(minutesToSeconds(this.shortBreakTime));
				break;
			case 'LONG_BREAK':
				this.timer.setTime(minutesToSeconds(this.longBreakTime));
				break;
		}
	};
}

const pomodoroApp: PomodoroApp = new PomodoroApp();

/* event listeners */
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

settingsButton.addEventListener('click', () => {
	openModal();
});

closeModalButton?.addEventListener('click', () => {
	closeModal();
});

timeStateButtons.forEach(button =>
	button.addEventListener('click', (e: Event) => {
		const button: HTMLButtonElement = e.target as HTMLButtonElement;
		const state: PomodoroAppStates = button.dataset.state.toUpperCase() as PomodoroAppStates;
		activateStateButton(button);
		pomodoroApp.changeState(state);
	})
);

/* helper functions */
/* --- timer */
function minutesToSeconds(minutes: number): number {
	return minutes * SECONDS_IN_MINUTE;
}

function getMinutesFromSeconds(seconds: number): number {
	return Math.floor(seconds / SECONDS_IN_MINUTE);
}

function getRemainingSeconds(seconds: number): number {
	return seconds % SECONDS_IN_MINUTE;
}

function addLeadingZero(time: number): string {
	return time < 10 ? `0${time}` : time.toString();
}

function formatTime(seconds: number): string {
	const minutes = getMinutesFromSeconds(seconds);
	const remainingSeconds = getRemainingSeconds(seconds);
	return addLeadingZero(minutes) + ':' + addLeadingZero(remainingSeconds);
}

/* --- app time state buttons function */
function activateStateButton(button: HTMLButtonElement) {
	timeStateButtons.forEach(button => button.classList.remove('active'));
	button.classList.add('active');
}

/* --- modal */
function openModal() {
	settingsModal.dataset.open = 'true';
}

function closeModal() {
	settingsModal.dataset.open = 'false';
}
