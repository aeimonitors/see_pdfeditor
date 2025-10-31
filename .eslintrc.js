module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  globals: {
    // PDF.js library (loaded via vendor-loader)
    pdfjsLib: 'readonly',
    // pdf-lib library (loaded via vendor-loader)
    PDFLib: 'readonly',
    // Our modules (loaded via vendor-loader)
    PDFViewer: 'readonly',
    AnnotationManager: 'readonly',
    PDFExporter: 'readonly',
    generateSamplePDF: 'readonly',
    performanceMonitor: 'readonly',
    PerformanceMonitor: 'readonly',
  },
  rules: {
    // Relax rules for prototype code
    'no-console': 'off',
    'no-alert': 'off',
    'no-restricted-globals': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'max-len': ['warn', { code: 120 }],
    'no-param-reassign': ['error', { props: false }],
    // Allow dangling underscores for private methods (convention)
    'no-underscore-dangle': ['error', { allowAfterThis: true, allow: ['_initPdfJs', '_renderThumbnail', '_renderPage', '_setupDragDrop', '_moveInArray'] }],
    // Allow ++ operator (common in for loops)
    'no-plusplus': 'off',
    // Allow continue statements
    'no-continue': 'off',
    // Allow for...of loops (no-restricted-syntax is too strict)
    'no-restricted-syntax': 'off',
    // Allow await in loops (necessary for sequential rendering)
    'no-await-in-loop': 'off',
    // Allow function hoisting
    'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
    // Allow unnamed functions in IIFEs
    'func-names': ['warn', 'as-needed'],
  },
  ignorePatterns: [
    'node_modules/',
    'site/',
    '.venv/',
    '*.min.js',
  ],
};
