export function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    const msRem = String(ms % 1000).padStart(3, '0');
    return `${mm}:${ss}.${msRem}`;
}

export class Timer {
    constructor(timerElement){
        this.timerEl = timerElement; 
        this.timerInterval = null; 
        this.startedAt = null;
        this.elapsedMs = 0;
        this.penaltyMs = 0;
        this.onTickCallback = null;

        this.tick = this.tick.bind(this);
    }

    tick(){
        if (!this.startedAt) return;
        this.elapsedMs = Math.round(performance.now() - this.startedAt);
        const totalMs = this.elapsedMs + this.penaltyMs;

        if(this.timerEl) {
            this.timerEl.textContent = formatTime(totalMs);
        }

        if(this.onTickCallback){
            this.onTickCallback(totalMs);
        }

        this.timerInterval = requestAnimationFrame(this.tick);
    }

    start(onTickCallback){
        if(this.timerInterval) return;

        this.onTickCallBack = onTickCallback;

        this.startedAt = performance.now() - this.elapsedMs;

        this.timerInterval = requestAnimationFrame(this.tick);
    }

    stop() {
        if(this.timerInterval){
            cancelAnimationFrame(this.timerInterval);
            this.timerInterval = null;
        }
        this.startedAt = null;
        this.onTickCallback = null;
    }

    pause() {
        this.stop();
    }

    resume(onTickCallback) {
        this.start(onTickCallback);
    }

    reset(){
        this.stop();
        this.elapsedMs = 0;
        this.penaltyMs = 0;
        if (this.timerEl){
            this.timerEl.textContent = formatTime(0);
        }
    }

    addPenalty(ms){
        this.penaltyMs += ms;
        if(this.timerEl){
            this.timerEl.textContent = formatTime(this.elapsedMs + this.penaltyMs);
        }
    }

    getTotalMs() {
        return Math.round(this.elapsedMs + this.penaltyMs);
    }

    isRunning(){
        return this.timerInterval !== null;
    }
}