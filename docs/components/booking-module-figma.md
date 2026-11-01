# Booking module: Figma sync

Updated in Figma file `8VW5pfsag9wEyJSzPwRvhM` on page `Composed Components`.

## Section

- Name: `Composed Components / Booking Module`
- Node: `6121:33`
- Standards frame: `6121:34`
- Source component set: `Booking Module` (`6121:169`, hidden)

## Variants

Properties in component set:

- `Mode`: `home` / `inner`
- `Viewport`: `desktop` / `tablet` / `mobile`
- `State`: `Default` / `Loading`

Total variants: `12`.

## Composition

- Date field stub (matches date picker visual slot)
- `Select` state `Default` instance
- `Input` state `Default` instance
- `Button` instance from existing source set:
  - `home` -> `Primary`
  - `inner` -> `Danger`
  - `Loading` -> disabled state

## Preview rows

- Home / Desktop / Default
- Inner / Desktop / Default
- Inner / Desktop / Loading
- Home / Mobile / Default
