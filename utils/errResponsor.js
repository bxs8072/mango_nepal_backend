class ErrorResponsor {
  constructor() {
    this.errors = [];
    this.plainError = [];
    this.hasError = false;
  }

  add = (key, value) => {
    this.errors.push({ [key]: value });
    this.plainError.push(value);
    this.hasError = true;
  };

  reset = () => {
    this.errors = [];
    this.plainError = [];
    this.hasError = false;
  };

  errArray = () => {
    if (this.errors.length === 0) return false;
    return this.errors;
  };

  errString = () => {
    if (this.plainError.length === 0) return false;
    return this.plainError.join(". <br/>");
  };
}

module.exports = ErrorResponsor;
