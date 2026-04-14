# Component & Function Declaration Patterns

## Impact: HIGH

Consistent patterns for declaring screen components, shared components, hooks, and utility functions.

## Screen Components — Named `function` Declaration

Screen components (pages/routes) use named `function` declarations. They are the default export and should NOT be wrapped in `memo` (screens rarely re-render from parent props).

```typescript
// ✅ Correct — screen component
export default function ProfileScreen() {
  return <View>...</View>;
}

// ❌ Wrong — arrow function for screen
const ProfileScreen = () => { ... };
export default ProfileScreen;

// ❌ Wrong — memo on a screen (unnecessary, screens don't receive props from parent re-renders)
export default memo(function ProfileScreen() { ... });
```

## Shared / Reusable Components — `memo` Wrapped Arrow `const`

Shared components that receive props should be wrapped in `memo` to prevent unnecessary re-renders from parent changes. Use named function inside `memo` for better stack traces.

```typescript
// ✅ Correct — shared component with memo
interface AvatarProps {
  uri: string;
  size?: number;
}

export const Avatar = memo(function Avatar({ uri, size = 40 }: AvatarProps) {
  return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
});

// ✅ Also correct — named function inside memo for better stack traces
export const UserCard = memo(function UserCard({ user }: UserCardProps) {
  return <View>...</View>;
});

// ❌ Wrong — no memo on reusable component
export const Avatar = ({ uri }: AvatarProps) => { ... };

// ❌ Wrong — anonymous arrow inside memo (bad stack traces)
export const Avatar = memo(({ uri }: AvatarProps) => { ... });
```

## List Item Components — Always `memo`

List items MUST be wrapped in `memo`. This is critical for FlashList/FlatList performance.

```typescript
// ✅ Correct
export const ChatItem = memo(function ChatItem({ message }: ChatItemProps) {
  return <View>...</View>;
});

// ❌ Wrong — unmemoized list item causes full list re-renders
export const ChatItem = ({ message }: ChatItemProps) => { ... };
```

## Hooks — Arrow `const` with Explicit Return Type

Custom hooks use arrow function assigned to `const`. Always prefix with `use`.

```typescript
// ✅ Correct
export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  return { user, setUser };
};

// ❌ Wrong — function declaration for hooks (inconsistent with convention)
export function useAuth() { ... }
```

## Utility / Helper Functions — Arrow `const`

Pure utility functions use arrow `const`. No memo needed.

```typescript
// ✅ Correct
export const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
};

// ✅ Correct — Hoist Intl objects outside functions for performance
const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export const formatCurrency = (amount: number): string => currencyFormatter.format(amount);
```

## Event Handlers & Callbacks — `useCallback` with Stable References

Callbacks passed to child components or list items must be stabilized.

```typescript
// ✅ Correct
const handlePress = useCallback((id: string) => {
  navigation.navigate("Detail", { id });
}, [navigation]);

// ❌ Wrong — inline arrow creates new reference every render
<Button onPress={() => navigation.navigate("Detail", { id })} />
```

## Pressable vs Button — When to Use What

Use the shared `Button` component (`@/shared/components/button`) for any interactive element that looks like a button (has background, border, label text, press feedback). Use `CloseButton` (`@/shared/components/close-button`) for dismiss/close actions and `BackButton` (`@/shared/components/back-button`) for back navigation.

Only use raw `Pressable` for non-styled tap areas — things like list items, cards, backdrops, text links, tab bar items, or highly custom animated elements that don't match the Button design system.

```typescript
// ✅ Correct — use Button for styled action buttons
<Button variant="primary" onPress={handleSubmit}>Submit</Button>
<Button variant="ghost" onPress={handleCancel}>Cancel</Button>
<Button variant="icon-secondary" isIconOnly onPress={handleFavorite}>
  <HeartIcon size={22} color={color} />
</Button>

// ✅ Correct — use CloseButton / BackButton for navigation
<CloseButton onPress={() => router.back()} />
<BackButton onPress={() => router.back()} />

// ✅ Correct — Pressable for non-styled tap areas (cards, list items, backdrops)
<Pressable onPress={() => openDetail(item.id)}>
  <View className="flex-row items-center gap-3 p-4">
    <Text>{item.title}</Text>
  </View>
</Pressable>

// ✅ Correct — Pressable for inline text links
<Pressable onPress={onResend}>
  <Text className="text-primary text-sm font-bold">Resend code</Text>
</Pressable>

// ❌ Wrong — Pressable styled as a button (use Button instead)
<Pressable
  className="bg-primary py-4 rounded-[16px] items-center"
  style={{ borderWidth: 2, borderColor: "#2C2418" }}
  onPress={handleSubmit}
>
  <Text className="text-secondary text-sm font-bold uppercase">Submit</Text>
</Pressable>

// ❌ Wrong — Pressable with XMarkIcon (use CloseButton instead)
<Pressable className="w-10 h-10 rounded-full bg-card" onPress={() => router.back()}>
  <XMarkIcon size={20} />
</Pressable>
```

**Button variants:** `primary`, `secondary`, `ghost`, `danger`, `icon-primary`, `icon-secondary`, `icon-accent`, `icon-danger`
**Button sizes:** `sm`, `md`, `lg`

## Summary Table

| Type | Declaration | Memo | Export |
|------|------------|------|--------|
| Screen component | `function` declaration | No | `export default` |
| Shared component | Named function in `memo()` | Yes | Named export |
| List item | Named function in `memo()` | Always | Named export |
| Hook | Arrow `const` | N/A | Named export |
| Utility function | Arrow `const` | N/A | Named export |
| Callback | `useCallback` | N/A | N/A |
