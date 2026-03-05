/**
 * Safely evaluate simple math expressions from user input.
 * Supports: +, -, *, / and parentheses.
 * Returns NaN if the expression is invalid.
 *
 * Uses a simple recursive-descent parser instead of eval() for safety.
 */

function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === ' ') {
      i++;
      continue;
    }
    if ('+-*/()'.includes(ch)) {
      tokens.push(ch);
      i++;
    } else if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push(parseFloat(num));
    } else {
      return null; // invalid character
    }
  }
  return tokens;
}

function parse(tokens) {
  let pos = 0;

  function peek() {
    return tokens[pos];
  }

  function consume() {
    return tokens[pos++];
  }

  // expression = term (('+' | '-') term)*
  function expression() {
    let result = term();
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const right = term();
      if (op === '+') result += right;
      else result -= right;
    }
    return result;
  }

  // term = factor (('*' | '/') factor)*
  function term() {
    let result = factor();
    while (peek() === '*' || peek() === '/') {
      const op = consume();
      const right = factor();
      if (op === '*') result *= right;
      else result = right !== 0 ? result / right : NaN;
    }
    return result;
  }

  // factor = number | '(' expression ')' | unary +/- factor
  function factor() {
    if (peek() === '(') {
      consume(); // '('
      const result = expression();
      if (peek() === ')') consume(); // ')'
      return result;
    }
    if (peek() === '-') {
      consume();
      return -factor();
    }
    if (peek() === '+') {
      consume();
      return factor();
    }
    const val = consume();
    if (typeof val === 'number') return val;
    return NaN;
  }

  const result = expression();
  // If there are leftover tokens, the expression is invalid
  if (pos < tokens.length) return NaN;
  return result;
}

/**
 * Evaluate a simple math expression string.
 * @param {string} expr - e.g. "100+200", "5000-1500", "100*3", "1500/3", "(100+50)*2"
 * @returns {number} The computed result, or NaN if invalid
 */
export function evaluateExpression(expr) {
  if (!expr || typeof expr !== 'string') return NaN;

  const cleaned = expr.trim();
  if (!cleaned) return NaN;

  // If it's just a plain number, return it directly
  const asNumber = Number(cleaned);
  if (!isNaN(asNumber)) return asNumber;

  const tokens = tokenize(cleaned);
  if (!tokens || tokens.length === 0) return NaN;

  try {
    const result = parse(tokens);
    return isFinite(result) ? result : NaN;
  } catch {
    return NaN;
  }
}

/**
 * Check if a string contains a math expression (not just a plain number).
 * @param {string} expr
 * @returns {boolean}
 */
export function isMathExpression(expr) {
  if (!expr || typeof expr !== 'string') return false;
  return /[+\-*/()]/.test(expr.replace(/^[+-]/, '')); // ignore leading sign
}
