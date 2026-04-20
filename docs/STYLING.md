# Styling Guide — Pawchi

How we style Pawchi. Read this once, then follow it everywhere.

**Stack:** Tailwind CSS v4 → Uniwind (RN runtime) → HeroUI Native (component library).

---

## The three rules

1. **Colors live in [`global.css`](../global.css).** Nowhere else. No `const PINK = '#FFAFCC'` in feature code. No hex literals in `style` props.
2. **Use `className` first.** Reach for `useCSSVariable` only when a prop can't take a class (Ionicons `color`, Skia `color`, `NativeTabs.backgroundColor`, `TextInput.placeholderTextColor`).
3. **Components own internal spacing only.** Never `margin` on a component's outermost container — parent screens control gaps via `gap-*` / `p-*`.

---

## How the theme is wired

**HeroUI Native uses a two-layer color system.** You must understand this or you'll spend hours debugging why `bg-background` shows the wrong color.

### Layer 1 — semantic variables (the source of truth)

HeroUI ships its palette in [`node_modules/heroui-native/src/styles/variables.css`](../node_modules/heroui-native/src/styles/variables.css). Variables are named **without** the `--color-` prefix:

```css
@layer theme {
  :root {
    @variant light {
      --background: #FFF9FB;
      --foreground: #5A4A54;
      --accent: #FFAFCC;
      --danger: #FF8FAB;
      /* …etc */
    }
  }
}
```

These are what HeroUI components style themselves against internally. Overriding them recolors the entire HeroUI component library for free.

### Layer 2 — Tailwind utility mapping

HeroUI also ships [`theme.css`](../node_modules/heroui-native/src/styles/theme.css) which uses `@theme inline static` to map each semantic variable to a `--color-*` name that Tailwind v4 understands:

```css
@theme inline static {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-accent: var(--accent);
  --color-danger: var(--danger);
  /* …etc */
}
```

This is what generates the `bg-background`, `text-foreground`, `border-accent` Tailwind utilities. The `inline` modifier means the value is inlined at build time — which has a consequence for us (see below).

### How we customize it in `global.css`

```css
@import 'tailwindcss/theme';
@import 'uniwind';
@import 'heroui-native/styles';

/* (1) Override the SEMANTIC layer with the Pawchi palette.
 *     This recolors every HeroUI component + every bg-background/bg-accent utility. */
@layer theme {
  :root {
    @variant light {
      --background: #FFF9FB;
      --foreground: #5A4A54;
      --accent:     #FFAFCC;   /* kawaii pink */
      --danger:     #FF8FAB;
      --success:    #B9E4C9;
      /* …etc */
    }
    @variant dark { /* dark palette */ }
  }
}

/* (2) Pawchi-specific tokens that don't exist in HeroUI. */
@theme static {
  /* HeroUI alias re-exports — see "Why the alias block exists" below */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-danger:     var(--danger);
  /* …etc */

  /* Our own tokens */
  --color-primary:    var(--accent);   /* alias so bg-primary === bg-accent */
  --color-card:       #FFF0F5;
  --color-card-alt:   #FFE4EC;
  --color-hunger:     #FFCBA4;
  --color-mood:       #B9E4C9;
  --color-energy:     #BDE0FE;
  --color-bond:       #FFAFCC;
  --color-personality:#D8C8F6;
  --color-lavender:   #EDE7FF;
  /* …etc */
}
```

### Why the alias block exists (the non-obvious gotcha)

HeroUI's Layer 2 uses `@theme inline static`. The **`inline` modifier** means Tailwind inlines the value at build time and **does not write `--color-background`, `--color-danger`, etc. to `:root`**. Tailwind utilities still work (they reference `var(--background)` directly), but:

```tsx
// This returns undefined — --color-danger is never written to :root
const c = useCSSVariable('--color-danger');
<Ionicons color={c} />  // crashes or renders black
```

Our `@theme static` block re-exports each HeroUI token via `var(--semantic)`. Because `@theme static` (without `inline`) DOES write to `:root`, `useCSSVariable('--color-danger')` now resolves through the chain `--color-danger` → `var(--danger)` → `#FF8FAB` at runtime. **One source of truth, two access paths.**

> Symptom if this is missing: blank screens when `LinearGradient` receives `[undefined, …]`, Ionicons rendering black, `NativeTabs` background defaulting to system color.

### Why `@theme static` (not plain `@theme`)

From the [Uniwind docs](https://docs.uniwind.dev/api/use-css-variable): "Variables defined in `@theme static` are always available via `useCSSVariable`, even if they're never used in any `className`."

Plain `@theme { … }` only registers a variable when Uniwind sees the matching class in a `className` prop at build time. `@theme static` guarantees the variable is written to `:root` and readable from JS regardless. We use `static` for every Pawchi token because we access several of them via `useCSSVariable` for gradient / Skia / Ionicons props.

---

## Accessing colors

### From a `className` prop (preferred — 90% of cases)

```tsx
<View className="bg-card border border-border rounded-3xl p-4">
  <Text className="text-foreground font-extrabold">Hello</Text>
</View>
```

Every token in `global.css` auto-generates matching utilities:

| Layer                            | Sample utilities                                                          |
| -------------------------------- | ------------------------------------------------------------------------- |
| HeroUI semantic (Layer 1→2)      | `bg-background`, `bg-accent`, `bg-danger`, `bg-success`, `bg-warning`, `bg-overlay`, `text-foreground`, `text-muted`, `border-border` |
| Pawchi aliases                   | `bg-primary` (= `bg-accent`), `text-foreground-secondary`                 |
| Pawchi surfaces                  | `bg-card`, `bg-card-alt`, `border-border-soft`, `bg-overlay-soft`         |
| Pawchi kawaii accents            | `bg-lavender`, `bg-peach`, `bg-sky`                                       |
| Pawchi pet-state tones           | `bg-hunger`, `bg-mood`, `bg-energy`, `bg-bond`, `bg-personality`          |

### From JS — `useCSSVariable` (for non-className props only)

Use this **only** when the prop can't take a Tailwind class:

- `@shopify/react-native-skia` `color=`
- `@expo/vector-icons` `Ionicons color=`
- `expo-router/unstable-native-tabs` `NativeTabs backgroundColor=`, `indicatorColor=`
- `TextInput placeholderTextColor=`
- Dynamic/computed `style={{ borderColor }}`

```tsx
import { useCSSVariable } from 'uniwind';
import { Ionicons } from '@expo/vector-icons';

export function DangerIcon() {
  // Always cast `as string` — useCSSVariable returns `string | number | undefined`.
  // With @theme static + the HeroUI alias block, the value is always resolved —
  // no fallback needed.
  const danger = useCSSVariable('--color-danger') as string;
  return <Ionicons name="alert-circle" color={danger} size={20} />;
}
```

**Never** fall back to hex: `useCSSVariable(...) ?? '#FFAFCC'`. That's how the previous broken setup masked real bugs.

---

## `className` rules (Uniwind-specific gotchas)

- **RN core components support `className` natively.** `View`, `Text`, `Pressable`, `ScrollView`, `SafeAreaView` — don't wrap them.
- **Non-RN components need `withUniwind()`.** Example: `expo-image`'s `Image` is wrapped in [`src/shared/components/styled.ts`](../src/shared/components/styled.ts). Import from there, not from `expo-image` directly.
- **No dynamic class names.** `` className={`bg-${tone}`} `` won't work — Uniwind can't see it at build time. Use a mapping object with full literal strings:
  ```tsx
  const TONE: Record<Tone, string> = {
    hunger: 'bg-hunger',
    mood:   'bg-mood',
    energy: 'bg-energy',
  };
  <View className={TONE[tone]} />
  ```

---

## Variant-based components: `tv()` from `tailwind-variants`

For reusable components with multiple visual states, use `tv()` to declare variants as class strings:

```tsx
import { tv } from 'tailwind-variants';
import { cn } from '@lib/cn';

const button = tv({
  base: 'rounded-full py-5 items-center justify-center',
  variants: {
    tone: {
      primary: 'bg-accent border border-accent',
      soft:    'bg-overlay border border-border',
      ghost:   'bg-transparent border border-border',
    },
  },
});

export function KawaiiButton({ tone = 'primary', className, ...rest }) {
  return <Button className={cn(button({ tone }), className)} {...rest} />;
}
```

- `cn()` from [`src/lib/cn.ts`](../src/lib/cn.ts) merges conflicting classes correctly (`clsx` + `tailwind-merge`).
- Always accept a `className` prop on reusable components and merge it last so callers can override.

---

## HeroUI Native compound components

HeroUI Native uses the compound pattern — the root is a layout shell, children are styled slots:

```tsx
import { Button } from 'heroui-native';

<Button className="bg-accent rounded-full py-5">
  <Button.Label className="text-accent-foreground font-extrabold">Save</Button.Label>
</Button>
```

Components that follow this pattern in our codebase:
- `Button` + `Button.Label`
- `Dialog` + `.Trigger`, `.Portal`, `.Content`, `.Title`, `.Description`, `.Actions`, `.BlurBackdrop`
- `BottomSheet` + same children as `Dialog`
- `Toast` + `.Icon`, `.Title`, `.Description` (imperative via `useToast().show()`)

### Style precedence

Per the HeroUI Native docs:

1. **Animated styles** (Reanimated) — highest precedence.
2. **`style` prop** (StyleSheet) — beats `className`.
3. **`className`** — lowest precedence.

If both `style` and `className` set the same property, `style` wins. If an animated style is "occupying" a property, use the component's `animation` prop or set `isAnimatedStyleActive={false}` to deactivate it.

### Provider setup

The root layout wires everything up once. Don't add other providers:

```tsx
// app/_layout.tsx
import '../global.css';
import { Uniwind } from 'uniwind';
import { HeroUINativeProvider } from 'heroui-native/provider';

Uniwind.setTheme('light'); // or 'dark'

export default function RootLayout() {
  return (
    <HeroUINativeProvider>
      <Stack />
    </HeroUINativeProvider>
  );
}
```

No runtime color registry, no manual token registration, no theme provider — the CSS file is the only source of truth.

---

## Adding a new color

**If you want it to match HeroUI's semantic language (background, accent, surface, …):**

1. Override the semantic variable inside `@layer theme @variant light` (and `@variant dark`).
2. That's it — HeroUI auto-generates the `bg-*` utility via Layer 2.

**If it's Pawchi-specific (mood, hunger, lavender, …):**

1. Add it to the `@theme static` block:
   ```css
   --color-sunshine: #FFE68B;
   ```
2. Use it anywhere:
   ```tsx
   <View className="bg-sunshine" />
   const c = useCSSVariable('--color-sunshine') as string;
   ```

No rebuild required beyond a Metro reload. Prebuild only if you change native modules.

---

## Common mistakes

| ❌ Don't                                                  | ✅ Do                                                                  |
| --------------------------------------------------------- | ---------------------------------------------------------------------- |
| `const PINK = '#FFAFCC'`                                  | Add to `global.css` once, use `bg-primary` or `bg-accent`              |
| `style={{ backgroundColor: '#FFAFCC' }}`                  | `className="bg-primary"`                                               |
| `` className={`bg-${variant}`} ``                         | Mapping object with full string literals                               |
| `StyleSheet.create({ container: { flex: 1, padding: 32 } })` | `className="flex-1 p-8"`                                            |
| `useCSSVariable('--color-x') ?? '#fallback'`              | Trust the cast — fallbacks hide bugs                                   |
| Overriding `--color-background` directly in `@theme`      | Override `--background` in `@variant light` instead                    |
| Wrapping `View` / `Text` with `withUniwind()`             | Use them directly — `className` is already supported                   |
| Outer `margin` on a reusable component                    | Parent screens own the spacing via `gap-*` / `p-*`                     |
