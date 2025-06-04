import '@testing-library/jest-dom';

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;


if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = function () {};
}

Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
  value: () => false,
});

Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
  value: () => {},
});
