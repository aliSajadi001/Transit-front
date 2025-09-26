export type StepValues = [string, string, string, string];

export type StepState = {
  id: number;
  values: StepValues;
  completed: boolean;
};

export type StepsState = StepState[];

export type PersistedState = {
  steps: StepsState;
  currentStep: number; // 0-based
  isComplete: boolean;
};
