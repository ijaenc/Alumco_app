// Service to manage training evaluation attempts
export interface AttemptData {
  trainingId: string;
  attempts: number;
  lastFailedDate: string | null;
  scores: number[];
}

const MAX_ATTEMPTS = 2;
const WAIT_PERIOD_DAYS = 14;

// Get attempt data for a training
export function getAttemptData(trainingId: string): AttemptData {
  const key = `training_attempts_${trainingId}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    trainingId,
    attempts: 0,
    lastFailedDate: null,
    scores: [],
  };
}

// Save attempt data
export function saveAttemptData(data: AttemptData): void {
  const key = `training_attempts_${data.trainingId}`;
  localStorage.setItem(key, JSON.stringify(data));
}

// Record a new attempt
export function recordAttempt(trainingId: string, score: number, passed: boolean): void {
  const data = getAttemptData(trainingId);
  
  data.attempts += 1;
  data.scores.push(score);
  
  // If failed and this was the second attempt, record the date
  if (!passed && data.attempts >= MAX_ATTEMPTS) {
    data.lastFailedDate = new Date().toISOString();
  }
  
  // If passed, reset attempts
  if (passed) {
    data.attempts = 0;
    data.lastFailedDate = null;
  }
  
  saveAttemptData(data);
}

// Check if user can attempt the evaluation
export function canAttemptEvaluation(trainingId: string): {
  canAttempt: boolean;
  attemptsRemaining: number;
  unlockDate: Date | null;
  message: string;
} {
  const data = getAttemptData(trainingId);
  
  // If less than max attempts, can attempt
  if (data.attempts < MAX_ATTEMPTS) {
    return {
      canAttempt: true,
      attemptsRemaining: MAX_ATTEMPTS - data.attempts,
      unlockDate: null,
      message: '',
    };
  }
  
  // Check if wait period has passed
  if (data.lastFailedDate) {
    const lastFailed = new Date(data.lastFailedDate);
    const unlockDate = new Date(lastFailed);
    unlockDate.setDate(unlockDate.getDate() + WAIT_PERIOD_DAYS);
    
    const now = new Date();
    
    if (now >= unlockDate) {
      // Reset attempts after wait period
      data.attempts = 0;
      data.lastFailedDate = null;
      saveAttemptData(data);
      
      return {
        canAttempt: true,
        attemptsRemaining: MAX_ATTEMPTS,
        unlockDate: null,
        message: '',
      };
    }
    
    // Still in wait period
    const daysRemaining = Math.ceil((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      canAttempt: false,
      attemptsRemaining: 0,
      unlockDate,
      message: `Has agotado tus ${MAX_ATTEMPTS} intentos. Podrás volver a intentarlo en ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}.`,
    };
  }
  
  return {
    canAttempt: false,
    attemptsRemaining: 0,
    unlockDate: null,
    message: `Has agotado tus ${MAX_ATTEMPTS} intentos.`,
  };
}

// Get remaining attempts
export function getRemainingAttempts(trainingId: string): number {
  const data = getAttemptData(trainingId);
  return Math.max(0, MAX_ATTEMPTS - data.attempts);
}

// Reset attempts for a training (admin function)
export function resetAttempts(trainingId: string): void {
  const data: AttemptData = {
    trainingId,
    attempts: 0,
    lastFailedDate: null,
    scores: [],
  };
  saveAttemptData(data);
}
