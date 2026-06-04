/**
 * PURPOSE: Application-wide constants.
 * MAQSAD: Ilova miqyosidagi o'zgarmas qiymatlar (bo'limlar, shifokorlar, qon guruhlari).
 */

export const DEPARTMENTS = [
  { value: 'Cardiology', label: 'Cardiology / Kardiologiya' },
  { value: 'Neurology', label: 'Neurology / Nevrologiya' },
  { value: 'Pediatrics', label: 'Pediatrics / Pediatriya' },
  { value: 'General Medicine', label: 'General Medicine / Ichki kasalliklar' },
  { value: 'Orthopedics', label: 'Orthopedics / Ortopediya' }
];

export const SPECIALIZATIONS = [
  { value: 'Cardiologist', label: 'Cardiologist / Kardiolog' },
  { value: 'Neurologist', label: 'Neurologist / Nevrolog' },
  { value: 'Pediatrician', label: 'Pediatrician / Pediatr' },
  { value: 'General Practitioner', label: 'General Practitioner / Umumiy amaliyot shifokori' },
  { value: 'Orthopedic Surgeon', label: 'Orthopedic Surgeon / Ortoped-travmatolog' }
];

export const SEVERITY_LEVELS = [
  { value: 'mild', label: 'Mild / Yengil', color: 'bg-green-100 text-green-800' },
  { value: 'moderate', label: 'Moderate / O\'rtacha', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'severe', label: 'Severe / Og\'ir', color: 'bg-amber-100 text-amber-800 animate-pulse' },
  { value: 'critical', label: 'Critical / O\'ta og\'ir', color: 'bg-red-100 text-red-800 animate-bounce font-bold' }
];

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
