function isCmdOrCtrl(event: KeyboardEvent) {
  return event.metaKey || event.ctrlKey;
}

function isEnter(event: KeyboardEvent) {
  return event.key === 'Enter';
}

function isShift(event: KeyboardEvent) {
  return event.shiftKey;
}

const KeyEventChecker = {
  isCmdOrCtrl,
  isEnter,
  isShift,
};

export default KeyEventChecker;
