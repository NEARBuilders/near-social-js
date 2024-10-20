export default {
  '**/*.{js,json,ts}': (filenames) => `prettier --write ${filenames.join(' ')}`,
};
