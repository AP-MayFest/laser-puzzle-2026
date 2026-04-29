import './color.css';

import {
    DEFAULT_LASER_COLOR_PROFILE,
    getLaserColorProfile,
    setLaserColorProfile,
} from "../puzzle/laser-color.ts";
import {Runtime} from "../puzzle/runtime.ts";
import {Vec2} from "../utils/vec.ts";

const redInput = document.getElementById('laser-color-red');
const greenInput = document.getElementById('laser-color-green');
const resetButton = document.getElementById('reset-laser-colors');
if (!(redInput instanceof HTMLInputElement) || !(greenInput instanceof HTMLInputElement) || !(resetButton instanceof HTMLButtonElement)) {
    throw new Error('bad color controls');
}
const redColorInput = redInput;
const greenColorInput = greenInput;

const profile = getLaserColorProfile();
redColorInput.value = profile.red;
greenColorInput.value = profile.green;

function updateProfile() {
    setLaserColorProfile({
        red: redColorInput.value,
        green: greenColorInput.value,
    });
}

redColorInput.addEventListener('input', updateProfile);
greenColorInput.addEventListener('input', updateProfile);
resetButton.addEventListener('click', () => {
    redColorInput.value = DEFAULT_LASER_COLOR_PROFILE.red;
    greenColorInput.value = DEFAULT_LASER_COLOR_PROFILE.green;
    updateProfile();
});

new Runtime(
    'preview',
    {
        board: { width: 7, height: 5, placements: [
            { position: new Vec2(1, 3), descriptor: { kind: 'laser', color: 'R', direction: 'E' } },
            { position: new Vec2(3, 5), descriptor: { kind: 'laser', color: 'G', direction: 'N' } },
            { position: new Vec2(3, 3), descriptor: { kind: 'dichroic-mirror', direction: 'NW' } },
            { position: new Vec2(5, 3), descriptor: { kind: 'polarizing-beam-splitter', direction: 'NW' } },
            { position: new Vec2(5, 1), descriptor: { kind: 'mirror', direction: 'SE' } },
            { position: new Vec2(7, 3), descriptor: { kind: 'mirror', direction: 'NW' } },
            { position: new Vec2(7, 1), descriptor: { kind: 'mirror', direction: 'SW' } },
        ] },
        reserve: {},
    },
    () => {},
).start();
