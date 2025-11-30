// Admin components barrel export
export { DefaultsTabEditor, DefaultsPreview } from './DefaultsTabEditor';
export { HeroTabEditor } from './HeroTabEditor';
export { MissionTabEditor } from './MissionTabEditor';
export { PopulationTabEditor } from './PopulationTabEditor';
export { FinancialTabEditor, validateFinancialPieCharts } from './FinancialTabEditor';
export { MethodTabEditor } from './MethodTabEditor';
export { CurriculumTabEditor } from './CurriculumTabEditor';
export { ImpactSectionTabEditor } from './ImpactSectionTabEditor';
export { HearOurImpactTabEditor } from './HearOurImpactTabEditor';
export { TestimonialsTabEditor } from './TestimonialsTabEditor';
export { NationalImpactTabEditor } from './NationalImpactTabEditor';
export { 
  GradientEditor, 
  parseGradientString, 
  composeGradient,
  composeAdvancedGradient,
  useGradientColorPicker,
} from './GradientEditor';
export type { GradientType, ParsedGradient, GradientEditorProps, GradientColorPickerState } from './GradientEditor';
