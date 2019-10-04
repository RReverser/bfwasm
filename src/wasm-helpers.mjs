/**
 * Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export function* instr(code, args, exprs) {
  for (let expr of exprs) {
    yield* expr;
  }
  yield code;
  for (let arg of args) {
    yield* leb128(arg);
  }
}

export function* leb128(v) {
  while (v > 127) {
    yield (1 << 7) | (v & 0xff);
    v = Math.floor(v >> 7);
  }
  yield v;
}

const encoder = new TextEncoder();
export function toUTF8(s) {
  return [...encoder.encode(s)];
}

export function section(idx, data) {
  return [...leb128(idx), ...leb128(data.length), ...data];
}

export function vector(items) {
  return [...leb128(items.length), ...items.flat()];
}

// Adapted version from
// https://github.com/Rich-Harris/vlq/blob/master/src/vlq.ts
export function base64vlq(num) {
  const BASE64 =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  let result = "";

  if (num < 0) {
    num = (-num << 1) | 1;
  } else {
    num <<= 1;
  }

  do {
    let clamped = num & 31;
    num >>>= 5;
    if (num > 0) clamped |= 32;
    result += BASE64[clamped];
  } while (num > 0);

  return result;
}
