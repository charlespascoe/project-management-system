export default class Observable {
  constructor() {
    this._changeHandlers = [];
  }

  onChange(func) {
    if (typeof func != 'function') return;
    this._changeHandlers.push(func);
  }

  removeOnChange(func) {
    for (var i = this._changeHandlers.length - 1; i >= 0; i++) {
      if (this._changeHandlers[i] === func) {
        this._changeHandlers.splice(i, 1);
      }
    }
  }

  changed() {
    this._changeHandlers.forEach(f => f());
  }
}
