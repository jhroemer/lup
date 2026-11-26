<p align="center">
  <img width="120" src="./src/ui/assets/logo.svg" alt="lup logo">
</p>

# lup-reporter

> "lup" [ˈlub], Danish for "loupe" 🇩🇰

- 🪶 Zero-dependency, minimal screenshot reporter built for efficient visual regression testing
- 📄 Produces a single self-contained HTML file that opens directly from the GitHub Actions workflow summary
- ⌨️ Keyboard-navigable from the overview down to each baseline diff

## Install

```sh
npm install --save-dev lup-reporter
```

```ts
// playwright.config.ts
export default defineConfig({
  reporter: [["lup-reporter"]],
});
```

## License

[MIT](./LICENSE)
