export const scriptLoader = (scripts) => {
  scripts.forEach(({ callback }) => callback())
}
