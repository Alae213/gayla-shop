/**
 * ARIA Utility Functions
 * 
 * Provides helper functions for generating accessible ARIA attributes
 * following WAI-ARIA 1.2 specifications.
 * 
 * @see https://www.w3.org/TR/wai-aria-1.2/
 */

/**
 * Generates a unique ID for ARIA relationships
 */
export function generateAriaId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formats text for aria-label
 * Removes extra whitespace and special characters
 */
export function formatAriaLabel(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-zA-Z0-9\s.,!?-]/g, '');
}

/**
 * Generates aria-label for buttons with icons
 */
export function generateButtonLabel(
  action: string,
  context?: string
): string {
  if (context) {
    return formatAriaLabel(`${action} ${context}`);
  }
  return formatAriaLabel(action);
}

/**
 * Generates aria-describedby text for form fields
 */
export function generateFieldDescription(
  fieldName: string,
  isRequired: boolean = false,
  errorMessage?: string
): string {
  const parts: string[] = [];
  
  if (isRequired) {
    parts.push('Required field');
  }
  
  if (errorMessage) {
    parts.push(errorMessage);
  }
  
  return parts.join('. ');
}

/**
 * Gets ARIA live region politeness level
 */
export function getAriaLiveLevel(
  priority: 'low' | 'medium' | 'high'
): 'off' | 'polite' | 'assertive' {
  switch (priority) {
    case 'high':
      return 'assertive';
    case 'medium':
      return 'polite';
    case 'low':
    default:
      return 'off';
  }
}

/**
 * Gets ARIA sort attribute value
 */
export function getAriaSort(
  direction?: 'asc' | 'desc' | null
): 'ascending' | 'descending' | 'none' {
  if (!direction) return 'none';
  return direction === 'asc' ? 'ascending' : 'descending';
}

/**
 * Gets ARIA pressed state for toggle buttons
 */
export function getAriaPressed(isPressed: boolean): 'true' | 'false' {
  return isPressed ? 'true' : 'false';
}

/**
 * Gets ARIA expanded state for collapsibles
 */
export function getAriaExpanded(isExpanded: boolean): 'true' | 'false' {
  return isExpanded ? 'true' : 'false';
}

/**
 * Gets ARIA checked state for checkboxes/radio
 */
export function getAriaChecked(
  isChecked: boolean,
  isMixed?: boolean
): 'true' | 'false' | 'mixed' {
  if (isMixed) return 'mixed';
  return isChecked ? 'true' : 'false';
}

/**
 * Generates aria-label for status indicators
 */
export function generateStatusLabel(
  status: string,
  additionalInfo?: string
): string {
  const label = `Status: ${status}`;
  if (additionalInfo) {
    return `${label}. ${additionalInfo}`;
  }
  return label;
}

/**
 * Generates aria-label for pagination
 */
export function generatePaginationLabel(
  currentPage: number,
  totalPages: number
): string {
  return `Page ${currentPage} of ${totalPages}`;
}

/**
 * Generates aria-label for search input
 */
export function generateSearchLabel(
  searchTerm: string,
  resultCount?: number
): string {
  if (resultCount !== undefined) {
    return `Search results for ${searchTerm}: ${resultCount} items found`;
  }
  return `Search for ${searchTerm}`;
}

/**
 * Generates aria-label for loading states
 */
export function generateLoadingLabel(
  action: string = 'Loading'
): string {
  return `${action}, please wait`;
}

/**
 * Generates aria-label for delete/remove actions
 */
export function generateRemoveLabel(
  itemType: string,
  itemName?: string
): string {
  if (itemName) {
    return `Remove ${itemType}: ${itemName}`;
  }
  return `Remove ${itemType}`;
}

/**
 * Generates aria-label for edit actions
 */
export function generateEditLabel(
  itemType: string,
  itemName?: string
): string {
  if (itemName) {
    return `Edit ${itemType}: ${itemName}`;
  }
  return `Edit ${itemType}`;
}

/**
 * Generates aria-label for close/dismiss actions
 */
export function generateCloseLabel(
  componentName?: string
): string {
  if (componentName) {
    return `Close ${componentName}`;
  }
  return 'Close';
}

/**
 * Creates ARIA attributes object for common patterns
 */
export function createAriaAttributes(config: {
  label?: string;
  describedBy?: string;
  live?: 'off' | 'polite' | 'assertive';
  atomic?: boolean;
  relevant?: string;
  busy?: boolean;
  controls?: string;
  expanded?: boolean;
  haspopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  pressed?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  hidden?: boolean;
}) {
  const attrs: Record<string, string | boolean | undefined> = {};

  if (config.label) attrs['aria-label'] = config.label;
  if (config.describedBy) attrs['aria-describedby'] = config.describedBy;
  if (config.live) attrs['aria-live'] = config.live;
  if (config.atomic !== undefined) attrs['aria-atomic'] = config.atomic;
  if (config.relevant) attrs['aria-relevant'] = config.relevant;
  if (config.busy !== undefined) attrs['aria-busy'] = config.busy;
  if (config.controls) attrs['aria-controls'] = config.controls;
  if (config.expanded !== undefined) {
    attrs['aria-expanded'] = config.expanded ? 'true' : 'false';
  }
  if (config.haspopup !== undefined) {
    attrs['aria-haspopup'] = config.haspopup === true ? 'true' : config.haspopup;
  }
  if (config.pressed !== undefined) {
    attrs['aria-pressed'] = config.pressed ? 'true' : 'false';
  }
  if (config.selected !== undefined) {
    attrs['aria-selected'] = config.selected ? 'true' : 'false';
  }
  if (config.checked !== undefined) {
    attrs['aria-checked'] = config.checked === 'mixed' ? 'mixed' : config.checked ? 'true' : 'false';
  }
  if (config.disabled !== undefined) attrs['aria-disabled'] = config.disabled;
  if (config.readonly !== undefined) attrs['aria-readonly'] = config.readonly;
  if (config.required !== undefined) attrs['aria-required'] = config.required;
  if (config.invalid !== undefined) attrs['aria-invalid'] = config.invalid;
  if (config.hidden !== undefined) attrs['aria-hidden'] = config.hidden;

  return attrs;
}

/**
 * Type guard for checking if element is interactive
 */
export function isInteractiveElement(tagName: string): boolean {
  const interactiveTags = [
    'BUTTON',
    'A',
    'INPUT',
    'SELECT',
    'TEXTAREA',
    'SUMMARY',
  ];
  return interactiveTags.includes(tagName.toUpperCase());
}

/**
 * Gets role for interactive elements
 */
export function getInteractiveRole(
  elementType: 'button' | 'link' | 'menu' | 'tab' | 'option'
): string {
  const roleMap = {
    button: 'button',
    link: 'link',
    menu: 'menu',
    tab: 'tab',
    option: 'option',
  };
  return roleMap[elementType];
}
