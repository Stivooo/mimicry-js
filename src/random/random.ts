import {MersenneTwister} from './MersenneTwister';

function generateSeed() {
    return Math.floor(Math.random() * 1000);
}

let currentSeed = generateSeed();
let generator = new MersenneTwister(currentSeed);

export function seed(value: number = generateSeed()) {
    currentSeed = value;
    generator = new MersenneTwister(currentSeed);
}

export function getSeed() {
    return currentSeed;
}

export function random(): number {
    return generator.random();
}
