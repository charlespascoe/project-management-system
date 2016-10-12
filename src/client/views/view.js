import { Component } from 'react';

export default class View extends Component {
  get viewmodel() {
    return this._viewmodel;
  }

  set viewmodel(vm) {
    if (this.viewmodel && typeof this.viewmodel.removeOnChange == 'function') {
      this.viewmodel.removeOnChange(this.onChange);
    }

    this._viewmodel = vm;

    if (this.viewmodel && this.viewmodel.onChange) {
      this.viewmodel.onChange(this.onChange);
    }

    this.onChange();
  }

  constructor(props, viewmodel = null) {
    super(props);

    this.onChange = this.onChange.bind(this);

    // Viewmodel can be passed either through props or constructor argument
    this._viewmodel = viewmodel || props.viewmodel;
    this.state = { viewmodel: this.viewmodel };

    if (this.viewmodel) {
      this.viewmodel.onChange(this.onChange);
    }
  }

  onChange() {
    this.setState({ viewmodel: this.viewmodel });
  }
}
