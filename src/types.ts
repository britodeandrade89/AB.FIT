export interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: string;
  rest: number;
  notes?: string;
  completed?: boolean;
  actualReps?: number[];
  actualWeight?: number[];
  thumb?: string | null;
  benefits?: string;
  load?: string;
  loadUnit?: 'Kg' | 'Placas';
  method?: string;
  groupId?: string;
  executionType?: 'Simples' | 'Conjugado' | 'Drop Set' | 'Pirâmide' | 'Rest-Pause' | 'SST';
}

export interface Workout {
  id: string;
  studentId: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  muscleGroups?: string[];
  difficulty?: 'Iniciante' | 'Intermediário' | 'Avançado';
  estimatedDuration?: number;
  createdAt: string;
  status?: 'draft' | 'published';
}

export interface RunningStats {
  id?: string;
  studentId: string;
  date: string;
  distance: number;
  duration: number;
  pace: string;
  heartRate?: number;
  calories?: number;
  avgHR?: number;
  maxHR?: number;
  cadence?: number;
  vo2max?: number;
  elevation?: number;
  strideLength?: number;
  verticalOscillation?: number;
  groundContactTime?: number;
  asymmetry?: string;
}

export interface WorkoutHistoryEntry {
  id: string;
  studentId: string;
  workoutId: string;
  workoutName: string;
  date: string;
  duration: number;
  totalVolume: number;
  exercises: Exercise[];
  type: 'STRENGTH' | 'RUNNING' | 'POST';
}

export interface PeriodizationPlan {
  id: string;
  studentId: string;
  title: string;
  startDate: string;
  endDate: string;
  mesocycles: {
    name: string;
    duration: number;
    focus: string;
    intensity: string;
  }[];
  focus: string;
  intensity: string;
  volume: string;
  aiInsights?: string;
}

export interface PhysicalAssessment {
  id: string;
  studentId: string;
  date: string;
  weight: number;
  height: number;
  bodyFat?: number;
  muscleMass?: number;
  imc?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    thigh?: number;
    bicep?: number;
  };
}

export interface AppNotification {
  id: string;
  studentId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'RENEWAL' | 'SYSTEM' | 'WORKOUT';
}

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionLog {
  id: string;
  studentId: string;
  date: string;
  meals: {
    name: string;
    time: string;
    items: string[];
    macros: MacroNutrients;
  }[];
  totals: MacroNutrients;
}

export interface MealPlan {
  id: string;
  studentId: string;
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

export interface NutritionProfile {
  studentId: string;
  goal: string;
  restrictions: string;
  dailyTargets: MacroNutrients;
}

export interface AnalyticsData {
  sessionsCompleted: number;
  streakDays: number;
  exercises: Record<string, { completed: number; skipped: number }>;
  lastSessionDate?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  objective?: string;
  lastWorkoutDate?: string;
  role: 'student' | 'professor';
  age?: number;
  weight?: number;
  height?: number;
}
