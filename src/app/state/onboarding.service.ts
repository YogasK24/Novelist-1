// src/app/state/onboarding.service.ts
import { Injectable, signal } from '@angular/core';

const LONG_PRESS_HINT_SHOWN_KEY = 'onboarding_longPressHintShown';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  // Signal to control the visibility of the long-press hint.
  readonly showLongPressHint = signal<boolean>(false);

  constructor() {
    this.checkIfHintIsNeeded();
  }

  /**
   * Checks localStorage to see if the hint has been shown before.
   * If not, it sets the signal to true, indicating the hint should be displayed.
   */
  private checkIfHintIsNeeded(): void {
    try {
      const hintShown = localStorage.getItem(LONG_PRESS_HINT_SHOWN_KEY);
      if (hintShown !== 'true') {
        this.showLongPressHint.set(true);
      }
    } catch (e) {
      console.error('Could not access localStorage for onboarding state.', e);
      // If localStorage is unavailable, just don't show the hint.
      this.showLongPressHint.set(false);
    }
  }

  /**
   * Marks the long-press hint as shown in localStorage and updates the signal
   * to hide it for the rest of the user's session and future sessions.
   */
  dismissLongPressHint(): void {
    try {
      localStorage.setItem(LONG_PRESS_HINT_SHOWN_KEY, 'true');
      this.showLongPressHint.set(false);
    } catch (e) {
      console.error('Could not access localStorage to save onboarding state.', e);
      // Still hide it for the current session.
      this.showLongPressHint.set(false);
    }
  }
}
