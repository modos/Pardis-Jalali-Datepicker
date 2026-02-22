const fs = require('fs');

// Load the library file in a Node environment (no DOM needed for PardisEngine/JalaaliUtil)
const lib = fs.readFileSync(require('path').join(__dirname, '..', 'lib', 'pardis-jalali-datepicker.js'), 'utf8');

// Evaluate library in current context
// eslint-disable-next-line no-new-func
new Function(lib + '\n;globalThis.__PardisEngine = PardisEngine; globalThis.__JalaaliUtil = JalaaliUtil;')();

const PardisEngine = globalThis.__PardisEngine;
const JalaaliUtil = globalThis.__JalaaliUtil;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function inRangeYear(y) {
  return y >= PardisEngine.MIN_YEAR && y <= PardisEngine.MAX_YEAR;
}

function testPrevYearClamp() {
  const engine = new PardisEngine({ initialYear: 1400, initialMonth: 1 });
  for (let i = 0; i < 5000; i++) engine.goToPrevYear();
  assert(engine.viewYear === PardisEngine.MIN_YEAR, `Expected MIN_YEAR clamp. got ${engine.viewYear}`);
  assert(inRangeYear(engine.viewYear), 'Year out of range after prevYear spam');
}

function testPrevMonthClamp() {
  const engine = new PardisEngine({ initialYear: 1400, initialMonth: 1 });
  for (let i = 0; i < 100000; i++) engine.goToPrevMonth();
  assert(engine.viewYear === PardisEngine.MIN_YEAR, `Expected MIN_YEAR clamp via prevMonth. got ${engine.viewYear}`);
  assert(engine.viewMonth === 1, `Expected month=1 at boundary. got ${engine.viewMonth}`);
}

function testPrevDecadeClamp() {
  const engine = new PardisEngine({ initialYear: 1400, initialMonth: 1 });
  for (let i = 0; i < 2000; i++) engine.goToPrevDecade();
  assert(engine.viewYear === PardisEngine.MIN_YEAR, `Expected MIN_YEAR clamp via prevDecade. got ${engine.viewYear}`);
}

function testGetYearsDoesNotGoBelowMin() {
  const engine = new PardisEngine({ initialYear: PardisEngine.MIN_YEAR, initialMonth: 1 });
  const years = engine.getYears();
  assert(years.length === 12, 'Years grid should always be 12 items');
  assert(years[0].year === PardisEngine.MIN_YEAR, 'Years grid should start at MIN_YEAR at boundary');
  assert(years.every(y => inRangeYear(y.year)), 'Years grid contains out-of-range year');
}

function testJalaaliUtilThrowsOutsideRange() {
  // Underlying math core supports a wider range than the product's UI clamp.
  // Valid JalaaliUtil range based on breaks[] is roughly -61..3177.
  let threwLow = false;
  try { JalaaliUtil.toGregorian(-62, 1, 1); } catch { threwLow = true; }
  assert(threwLow, 'Expected toGregorian to throw for year < -61');

  let threwHigh = false;
  try { JalaaliUtil.toGregorian(PardisEngine.MAX_YEAR + 1, 1, 1); } catch { threwHigh = true; }
  assert(threwHigh, 'Expected toGregorian to throw for year > MAX_YEAR');
}

function run() {
  console.log('PardisEngine range:', PardisEngine.MIN_YEAR, 'to', PardisEngine.MAX_YEAR);

  testPrevYearClamp();
  testPrevMonthClamp();
  testPrevDecadeClamp();
  testGetYearsDoesNotGoBelowMin();
  testJalaaliUtilThrowsOutsideRange();

  console.log('All year boundary tests: OK');
}

run();
