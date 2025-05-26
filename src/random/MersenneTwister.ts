const N = 624;
const M = 397;
const MATRIX_A = 0x9908b0df;
const UPPER_MASK = 0x80000000;
const LOWER_MASK = 0x7fffffff;

const TEMPERING_MASK_B = 0x9d2c5680;
const TEMPERING_MASK_C = 0xefc60000;

const MULTIPLIER = 0x6c078965;

export class MersenneTwister {
    private MT: number[] = new Array(N);
    private index = N;

    constructor(seed: number) {
        this.seed(seed);
    }

    public seed(seed: number) {
        this.MT[0] = seed >>> 0;
        for (let i = 1; i < N; i++) {
            this.MT[i] = (MULTIPLIER * (this.MT[i - 1] ^ (this.MT[i - 1] >>> 30)) + i) >>> 0;
        }
        this.index = N;
    }

    private twist() {
        for (let i = 0; i < N; i++) {
            const y = (this.MT[i] & UPPER_MASK) + (this.MT[(i + 1) % N] & LOWER_MASK);
            this.MT[i] = this.MT[(i + M) % N] ^ (y >>> 1);
            if (y % 2 !== 0) {
                this.MT[i] ^= MATRIX_A;
            }
        }
        this.index = 0;
    }

    public random(): number {
        if (this.index >= N) {
            this.twist();
        }

        let y = this.MT[this.index++];
        y ^= y >>> 11;
        y ^= (y << 7) & TEMPERING_MASK_B;
        y ^= (y << 15) & TEMPERING_MASK_C;
        y ^= y >>> 18;

        return (y >>> 0) / 0x100000000;
    }
}
