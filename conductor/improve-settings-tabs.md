# Plan: Improve Settings Page Tabs UI/UX

## Objective
Improve the mobile experience of the Settings page tabs by replacing the vertical stack with a horizontal scrollable interface. This will save vertical space and provide a more modern mobile-native feel.

## Key Files & Context
- `src/app/(dashboard)/settings/page.tsx`: The main settings page containing the tabs implementation.
- `src/app/globals.css`: Global styles where a scrollbar-hiding utility will be added.
- `src/components/ui/tabs.tsx`: Reference for existing tabs styling and props.

## Implementation Steps

### 1. Add `no-scrollbar` Utility
In `src/app/globals.css`, add a utility to hide scrollbars while allowing scrolling functionality using Tailwind 4's `@utility` directive.
```css
@utility no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
```

### 2. Refactor `TabsList` in `SettingsPage`
Modify the `TabsList` in `src/app/(dashboard)/settings/page.tsx`:
- Change `flex-col sm:flex-row` to `flex-row`.
- Add `overflow-x-auto` and `no-scrollbar` for horizontal scrolling.
- Add `flex-nowrap` to prevent wrapping.
- Use `justify-start` instead of `justify-center`.
- Adjust padding (`p-1.5`) and gap (`gap-2`) for better spacing.
- Ensure `w-full` remains to take up the container width.

### 3. Refactor `TabsTrigger` in `SettingsPage`
Modify all `TabsTrigger` components in `src/app/(dashboard)/settings/page.tsx`:
- Add `flex-shrink-0` to keep them from squeezing.
- Change `justify-start` to `justify-center` for a balanced look in horizontal mode.
- Update active state styling to ensure the primary orange remains prominent.
- Remove `w-full sm:w-auto` since they will now have a natural width based on content.

## Verification & Testing

### Manual Testing
1. **Mobile Responsiveness**:
    - Open the settings page in a mobile view.
    - Swiping horizontally on the tabs should work smoothly.
    - The active tab should be clearly highlighted.
    - Ensure no vertical layout shift happens when switching tabs.
2. **Desktop Consistency**:
    - Verify tabs still look great on wider screens.
    - Check that the horizontal layout doesn't feel overly stretched.
3. **Regression**:
    - Ensure all form fields and buttons within the `TabsContent` remain fully functional.
    - Verify that saving settings still works as expected.
