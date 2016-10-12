export function bindValue(viewmodel, key) {
  return function (e) {
    viewmodel[key] = e.target.value;
  }
}

export function bindChecked(viewmodel, key) {
  return function (e) {
    viewmodel[key] = e.target.checked;
  }
}

export function bindSelected(viewmodel, key) {
  return function (e) {
    viewmodel[key] = e.target.selected;
  }
}


