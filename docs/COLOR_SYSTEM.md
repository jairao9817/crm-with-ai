# Color System Guide

## Semantic Color Tokens

Use these semantic tokens instead of hardcoded colors for consistency and proper dark mode support.

### Text Colors

```css
/* ✅ Use these semantic tokens */
text-text-primary      /* Main text color */
text-text-secondary    /* Secondary/muted text */
text-text-tertiary     /* Tertiary/disabled text */
text-text-inverse      /* Inverse text (for dark backgrounds) */

/* ❌ Avoid hardcoded colors */
text-gray-900 dark:text-white
text-gray-600 dark:text-gray-400
```

### Background Colors

```css
/* ✅ Use these semantic tokens */
bg-background          /* Main background */
bg-background-secondary /* Secondary background */
bg-background-tertiary  /* Tertiary background */
bg-surface             /* Card/surface background */
bg-surface-secondary   /* Secondary surface */

/* ❌ Avoid hardcoded colors */
bg-white dark:bg-gray-900
bg-gray-50 dark:bg-gray-800
```

### Border Colors

```css
/* ✅ Use these semantic tokens */
border-border          /* Default border */
border-border-secondary /* Secondary border */
border-border-focus    /* Focus state border */

/* ❌ Avoid hardcoded colors */
border-gray-200 dark:border-gray-700
```

### Status Colors

```css
/* ✅ Use semantic status colors */
text-primary    /* Primary actions/links */
text-secondary  /* Secondary elements */
text-success    /* Success states */
text-warning    /* Warning states */
text-error      /* Error states */

/* ❌ Avoid hardcoded status colors */
text-blue-600 dark:text-blue-400
text-green-600 dark:text-green-400
text-red-600 dark:text-red-400
```

## Component-Specific Guidelines

### Icons

```typescript
// ✅ Consistent icon colors
<UserIcon className="w-5 h-5 text-text-secondary" />
<CheckIcon className="w-5 h-5 text-success" />
<ExclamationIcon className="w-5 h-5 text-warning" />

// ❌ Avoid hardcoded icon colors
<UserIcon className="w-5 h-5 text-gray-500" />
<CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
```

### Cards and Surfaces

```typescript
// ✅ Consistent card styling
<Card className="bg-surface border border-border">
  <CardHeader className="border-b border-border">
    <h3 className="text-text-primary">Title</h3>
  </CardHeader>
  <CardBody>
    <p className="text-text-secondary">Content</p>
  </CardBody>
</Card>

// ❌ Avoid mixed approaches
<Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
```

### Status Indicators

```typescript
// ✅ Use semantic colors for status
const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "error":
      return "error";
    default:
      return "primary";
  }
};

// ❌ Avoid hardcoded status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "text-green-600 dark:text-green-400";
    case "pending":
      return "text-yellow-600 dark:text-yellow-400";
  }
};
```

## Migration Strategy

1. **Phase 1**: Update all text colors to use semantic tokens
2. **Phase 2**: Update all background colors to use semantic tokens
3. **Phase 3**: Update all border colors to use semantic tokens
4. **Phase 4**: Remove manual dark mode variants where semantic tokens are used

## Testing Dark Mode

Always test components in both light and dark modes to ensure proper contrast and readability.

```typescript
// Test both modes
<div className="text-text-primary bg-background border border-border">
  Content should be readable in both light and dark modes
</div>
```
