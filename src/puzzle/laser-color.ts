const LOCAL_STORAGE_KEY = '/2026/laser-puzzle:laser-color';

export interface LaserColorProfile {
    red: string;
    green: string;
}

export const DEFAULT_LASER_COLOR_PROFILE: LaserColorProfile = {
    red: '#FF0000',
    green: '#00FF00',
};

const laserColorProfile = { ...DEFAULT_LASER_COLOR_PROFILE };

const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
if (stored != null) {
    const [red, green] = stored.split(',');
    if (red != null && /^#[0-9a-fA-F]{6}$/.test(red)) laserColorProfile.red = red;
    if (green != null && /^#[0-9a-fA-F]{6}$/.test(green)) laserColorProfile.green = green;
}

export function setLaserColorProfile(profile: LaserColorProfile) {
    laserColorProfile.red = profile.red;
    laserColorProfile.green = profile.green;
    window.localStorage.setItem(LOCAL_STORAGE_KEY, laserColorProfile.red + ',' + laserColorProfile.green);
}

export function getLaserColorProfile(): LaserColorProfile {
    return { ...laserColorProfile };
}
