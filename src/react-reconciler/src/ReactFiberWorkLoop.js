export const NoContext = 0b000;
export const RenderContext = 0b010;

let executionContext = NoContext;

export function isUnsafeClassRenderPhaseUpdate(fiber) {
  return (executionContext & RenderContext) !== NoContext;
}
