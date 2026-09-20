/** Shared API types for the CrossBugSense frontend. */

export interface ModelInfo {
  key: string
  name: string
  accuracy: number
}

export interface ModelsResponse {
  models: ModelInfo[]
}

/** The 24 source-code / code-smell metrics extracted per file. */
export type Metrics = Record<string, number>

export interface FilePrediction {
  filename: string
  language: string
  prediction: 0 | 1
  buggy_probability: number
  metrics: Metrics
}

export interface PredictResponse {
  model: string
  model_accuracy: number
  files: FilePrediction[]
}

export const METRIC_ORDER = [
  'WMC', 'DIT', 'NOC', 'CBO', 'RFC', 'LCOM', 'Ca', 'Ce', 'NPM', 'LOC',
  'DAM', 'MOA', 'MFA', 'CAM', 'IC', 'CBM', 'AMC', 'MCC', 'ACC',
  'Intensity', 'ANA', 'ARL', 'ACPD', 'ACM',
] as const
