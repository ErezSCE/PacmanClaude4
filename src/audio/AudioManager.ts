/** Audio Manager — stub. Full implementation in a later assignment. */
export class AudioManager {
  private muted = false;

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }
}
