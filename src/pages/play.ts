import './play.css';
import {decodeProblem} from "../puzzle/problem.ts";
import {Runtime} from "../puzzle/runtime.ts";

class ResultDialog {
    #element: HTMLDialogElement;
    #timeDisplay: HTMLSpanElement;

    constructor() {
        const dialog = document.getElementById('result-dialog');
        if (dialog == null || !(dialog instanceof HTMLDialogElement)) {
            throw new Error('dialog is null');
        }

        const timeDisplay = dialog.querySelector('#time');
        if (timeDisplay == null || !(timeDisplay instanceof HTMLSpanElement)) {
            throw new Error('#time is null');
        }

        const closeButton = dialog.querySelector('#close-button');
        if (closeButton == null || !(closeButton instanceof HTMLButtonElement)) {
            throw new Error('#close-button is null');
        }
        closeButton.addEventListener('click', () => {
            dialog.close();
        })

        this.#element = dialog;
        this.#timeDisplay = timeDisplay;
    }

    showResult(time: number) {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor(time / 60) % 60;
        const seconds = time % 60;
        const text = hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` : `${minutes}:${seconds.toString().padStart(2, '0')}`;

        this.#timeDisplay.textContent = text;
        this.#element.showModal();
    }
}

const params = new URLSearchParams(window.location.search);
const problemCode = params.get('p');
if (problemCode != null) {
    const problemDecodeResult = decodeProblem(problemCode);
    if (problemDecodeResult.kind === 'ok') {
        let startAt: number;
        const dialog = new ResultDialog();
        const runtime = new Runtime('puzzle-view', problemDecodeResult.problem, () => {
            const timeMs = Date.now() - startAt;
            const time = Math.floor(timeMs / 1000);
            dialog.showResult(time);
        });

        runtime.start();
        startAt = Date.now();
    }
}
