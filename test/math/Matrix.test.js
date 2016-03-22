import { Suite, assertThat, assertThrows, assertTrue, assertFalse } from "test/TestUtil.js"
import Matrix from "src/math/Matrix.js"

import Complex from "src/math/Complex.js"
import Format from "src/base/Format.js"
import Seq from "src/base/Seq.js"

let suite = new Suite("Matrix");

suite.test("isEqualTo", () => {
    let m = Matrix.fromRows([[new Complex(2, 3), new Complex(5, 7)], [new Complex(11, 13), new Complex(17, 19)]]);
    assertThat(m).isEqualTo(m);
    assertThat(m).isNotEqualTo(null);
    assertThat(m).isNotEqualTo("");

    assertThat(m).isEqualTo(
        Matrix.fromRows([[new Complex(2, 3), new Complex(5, 7)], [new Complex(11, 13), new Complex(17, 19)]]));
    assertThat(m).isNotEqualTo(
        Matrix.fromRows([[new Complex(2, 3)]]));
    assertThat(m).isNotEqualTo(
        Matrix.fromRows([[new Complex(-2, 3), new Complex(5, 7)], [new Complex(11, 13), new Complex(17, 19)]]));
    assertThat(m).isNotEqualTo(
        Matrix.fromRows([[new Complex(2, 3), new Complex(-5, 7)], [new Complex(11, 13), new Complex(17, 19)]]));
    assertThat(m).isNotEqualTo(
        Matrix.fromRows([[new Complex(2, 3), new Complex(5, 7)], [new Complex(-11, 13), new Complex(17, 19)]]));
    assertThat(m).isNotEqualTo(
        Matrix.fromRows([[new Complex(2, 3), new Complex(5, 7)], [new Complex(11, 13), new Complex(-17, 19)]]));

    let col = Matrix.fromRows([[new Complex(2, 3), new Complex(5, 7)]]);
    let row = Matrix.fromRows([[new Complex(2, 3)], [new Complex(5, 7)]]);
    assertThat(col).isEqualTo(col);
    assertThat(row).isEqualTo(row);
    assertThat(row).isNotEqualTo(col);
});

suite.test("isApproximatelyEqualTo", () => {
    // Size must match
    assertThat(Matrix.row([1, 1])).isNotApproximatelyEqualTo(Matrix.col([1, 1]), 0);
    assertThat(Matrix.row([1, 1])).isNotApproximatelyEqualTo(Matrix.square([1, 1, 1, 1]), 0);
    assertThat(Matrix.row([1, 1])).isNotApproximatelyEqualTo(Matrix.row([1, 1, 1]), 0);
    assertThat(Matrix.row([1, 1])).isApproximatelyEqualTo(Matrix.row([1, 1]), 0);

    // Error bound matters
    assertThat(Matrix.row([1])).isApproximatelyEqualTo(Matrix.row([1]), 0);
    assertThat(Matrix.row([1])).isApproximatelyEqualTo(Matrix.row([1]), 1/4);
    assertThat(Matrix.row([1.25])).isApproximatelyEqualTo(Matrix.row([1]), 1/4);
    assertThat(Matrix.row([0.75])).isApproximatelyEqualTo(Matrix.row([1]), 1/4);
    assertThat(Matrix.row([1.26])).isNotApproximatelyEqualTo(Matrix.row([1]), 1/4);
    assertThat(Matrix.row([0.74])).isNotApproximatelyEqualTo(Matrix.row([1]), 1/4);

    // Error bound spreads
    assertThat(Matrix.row([0, 0])).isApproximatelyEqualTo(Matrix.row([0, 0]), 1);
    assertThat(Matrix.row([1, 0])).isApproximatelyEqualTo(Matrix.row([0, 0]), 1);
    assertThat(Matrix.row([0, 1])).isApproximatelyEqualTo(Matrix.row([0, 0]), 1);
    assertThat(Matrix.row([1, 1])).isNotApproximatelyEqualTo(Matrix.row([0, 0]), 1);

    assertThat(Matrix.row([0])).isNotApproximatelyEqualTo(null);
    assertThat(Matrix.row([0])).isNotApproximatelyEqualTo("");
});

suite.test("toString", () => {
    assertThat(Matrix.square([2]).toString()).
        isEqualTo("{{2}}");
    assertThat(Matrix.square([1, 0, new Complex(0, -1), new Complex(2, -3)]).toString()).
        isEqualTo("{{1, 0}, {-i, 2-3i}}");
    assertThat(Matrix.square([1, 0, 0, 1]).toString()).
        isEqualTo("{{1, 0}, {0, 1}}");
    assertThat(Matrix.identity(3).toString()).
        isEqualTo("{{1, 0, 0}, {0, 1, 0}, {0, 0, 1}}");

    assertThat(Matrix.square([0, 1, new Complex(1/3, 1), new Complex(0, 1/3 + 0.0000001)]).toString(Format.EXACT)).
        isEqualTo("{{0, 1}, {\u2153+i, 0.3333334333333333i}}");
    assertThat(Matrix.square([0, 1, new Complex(1/3, 1), new Complex(0, 1/3 + 0.0000001)]).toString(Format.SIMPLIFIED)).
        isEqualTo("{{0, 1}, {\u2153+i, \u2153i}}");
    assertThat(Matrix.square([0, 1, new Complex(1/3, 1), new Complex(0, 1/3 + 0.0000001)]).toString(Format.MINIFIED)).
        isEqualTo("{{0,1},{\u2153+i,0.3333334333333333i}}");
    assertThat(Matrix.square([0, 1, new Complex(1/3, 1), new Complex(0, 1/3 + 0.0000001)]).toString(Format.CONSISTENT)).
        isEqualTo("{{+0.00+0.00i, +1.00+0.00i}, {+0.33+1.00i, +0.00+0.33i}}");
});

suite.test("parse", () => {
    assertThat(Matrix.parse("{{1}}")).isEqualTo(
        Matrix.square([1]));
    assertThat(Matrix.parse("{{i}}")).isEqualTo(
        Matrix.square([Complex.I]));
    assertThat(Matrix.parse("{{\u221A2}}")).isEqualTo(
        Matrix.square([Math.sqrt(2)]));

    assertThat(Matrix.parse("{{\u00BD-\u00BDi, 5}, {-i, 0}}")).isEqualTo(
        Matrix.square([new Complex(0.5, -0.5), 5, new Complex(0, -1), 0]));
    assertThat(Matrix.parse("{{1, 2, i}}")).isEqualTo(
        Matrix.row([1, 2, Complex.I]));
    assertThat(Matrix.parse("{{1}, {2}, {i}}")).isEqualTo(
        Matrix.col([1, 2, Complex.I]));
});

suite.test("generate", () => {
    assertThat(Matrix.generate(3, 2, (r, c) => r + 10* c).toString()).
        isEqualTo("{{0, 10, 20}, {1, 11, 21}}");
});

suite.test("getColumn", () => {
    let m = Matrix.square([2, 3, 5, 7]);
    assertThat(m.getColumn(0)).isEqualTo([2, 5]);
    assertThat(m.getColumn(1)).isEqualTo([3, 7]);
    assertThat(Matrix.col([1, 2, 3]).getColumn(0)).isEqualTo([1, 2, 3]);
});

suite.test("square", () => {
    let m = Matrix.square([1, new Complex(2, 3), -5.5, 0]);
    assertThat(m.rows()).isEqualTo([[1, new Complex(2, 3)], [-5.5, 0]]);

    assertThat(Matrix.square([1]).rows()).isEqualTo([[1]]);
});

suite.test("col", () => {
    assertThat(Matrix.col([2, 3, new Complex(0, 5)]).toString()).isEqualTo("{{2}, {3}, {5i}}");
});

suite.test("row", () => {
    assertThat(Matrix.row([2, 3, new Complex(0, 5)]).toString()).isEqualTo("{{2, 3, 5i}}");
});

suite.test("size", () => {
    assertThat(Matrix.row([1, 1]).width()).isEqualTo(2);
    assertThat(Matrix.row([1, 1]).height()).isEqualTo(1);

    assertThat(Matrix.row([1, 1, 3]).width()).isEqualTo(3);
    assertThat(Matrix.row([1, 1, 3]).height()).isEqualTo(1);

    assertThat(Matrix.col([1, 1]).width()).isEqualTo(1);
    assertThat(Matrix.col([1, 1]).height()).isEqualTo(2);

    assertThat(Matrix.col([1, 1, 3]).width()).isEqualTo(1);
    assertThat(Matrix.col([1, 1, 3]).height()).isEqualTo(3);
});

suite.test("isApproximatelyUnitary", () => {
    assertFalse(Matrix.row([1, 1]).isApproximatelyUnitary(999));
    assertFalse(Matrix.col([1, 1]).isApproximatelyUnitary(999));

    assertTrue(Matrix.row([1]).isApproximatelyUnitary(0));
    assertTrue(Matrix.row([Complex.I]).isApproximatelyUnitary(0));
    assertTrue(Matrix.row([-1]).isApproximatelyUnitary(0));
    assertFalse(Matrix.row([-2]).isApproximatelyUnitary(0));
    assertFalse(Matrix.row([0]).isApproximatelyUnitary(0));
    assertTrue(Matrix.row([-2]).isApproximatelyUnitary(999));

    assertTrue(Matrix.square([1, 0, 0, 1]).isApproximatelyUnitary(0));
    assertTrue(Matrix.rotation(1).isApproximatelyUnitary(0.001));
    assertTrue(Matrix.PAULI_X.isApproximatelyUnitary(0));
    assertTrue(Matrix.PAULI_Y.isApproximatelyUnitary(0));
    assertTrue(Matrix.PAULI_Z.isApproximatelyUnitary(0));
    assertTrue(Matrix.HADAMARD.isApproximatelyUnitary(0.001));
});

suite.test("isApproximatelyHermitian", () => {
    let i = Complex.I;

    assertFalse(Matrix.row([1, 1]).isApproximatelyHermitian(999));
    assertFalse(Matrix.col([1, 1]).isApproximatelyHermitian(999));

    assertTrue(Matrix.row([1]).isApproximatelyHermitian(0));
    assertTrue(Matrix.row([0]).isApproximatelyHermitian(0));
    assertTrue(Matrix.row([-1]).isApproximatelyHermitian(0));
    assertTrue(Matrix.row([-2]).isApproximatelyHermitian(0));
    assertFalse(Matrix.row([i]).isApproximatelyHermitian(0));
    assertFalse(Matrix.row([i]).isApproximatelyHermitian(0.5));
    assertTrue(Matrix.row([i]).isApproximatelyHermitian(999));

    assertTrue(Matrix.PAULI_X.isApproximatelyHermitian(0));
    assertTrue(Matrix.PAULI_Y.isApproximatelyHermitian(0));
    assertTrue(Matrix.PAULI_Z.isApproximatelyHermitian(0));
    assertTrue(Matrix.HADAMARD.isApproximatelyHermitian(0.001));

    assertTrue(Matrix.square([1, 0, 0, 1]).isApproximatelyHermitian(0));
    assertTrue(Matrix.square([1, 1, 1, 1]).isApproximatelyHermitian(0));
    assertFalse(Matrix.square([1, 1, 1.5, 1]).isApproximatelyHermitian(0));
    assertTrue(Matrix.square([1, 1, 1.5, 1]).isApproximatelyHermitian(0.5));

    assertFalse(Matrix.square([1, i, i, 1]).isApproximatelyHermitian(0));
    assertTrue(Matrix.square([1, i, i.neg(), 1]).isApproximatelyHermitian(0));
    assertTrue(Matrix.square([1, i.neg(), i, 1]).isApproximatelyHermitian(0));
    assertFalse(Matrix.square([1, i, i.times(-1.5), 1]).isApproximatelyHermitian(0));
    assertTrue(Matrix.square([1, i, i.times(-1.5), 1]).isApproximatelyHermitian(0.5));
});

suite.test("adjoint", () => {
    let v = Matrix.square([new Complex(2, 3), new Complex(5, 7),
                          new Complex(11, 13), new Complex(17, 19)]);
    let a = Matrix.square([new Complex(2, -3), new Complex(11, -13),
                          new Complex(5, -7), new Complex(17, -19)]);
    assertThat(v.adjoint()).isEqualTo(a);
});

suite.test("scaledBy", () => {
    let v = Matrix.square([new Complex(2, 3), new Complex(5, 7),
                          new Complex(11, 13), new Complex(17, 19)]);
    let a = Matrix.square([new Complex(-2, -3), new Complex(-5, -7),
                          new Complex(-11, -13), new Complex(-17, -19)]);
    assertThat(v.scaledBy(-1)).isEqualTo(a);
    assertThat(v.scaledBy(0)).isEqualTo(Matrix.square([0, 0, 0, 0]));
    assertThat(v.scaledBy(1)).isEqualTo(v);

    assertThat(Matrix.col([2, 3]).scaledBy(5)).isEqualTo(Matrix.col([10, 15]));
    assertThat(Matrix.row([2, 3]).scaledBy(5)).isEqualTo(Matrix.row([10, 15]));
});

suite.test("plus", () => {
    assertTrue(Matrix.square([2, 3, 5, 7]).plus(Matrix.square([11, 13, 17, 19]))
        .isEqualTo(Matrix.square([13, 16, 22, 26])));
});

suite.test("minus", () => {
    assertTrue(Matrix.square([2, 3, 5, 7]).minus(Matrix.square([11, 13, 17, 19]))
        .isEqualTo(Matrix.square([-9, -10, -12, -12])));
});

suite.test("times", () => {
    assertTrue(Matrix.square([2, 3, 5, 7]).times(Matrix.square([11, 13, 17, 19]))
        .isEqualTo(Matrix.square([73, 83, 174, 198])));

    let x = Matrix.square([new Complex(0.5, -0.5), new Complex(0.5, 0.5),
                          new Complex(0.5, 0.5), new Complex(0.5, -0.5)]);
    assertTrue(x.times(x.adjoint()).isEqualTo(Matrix.identity(2)));
    assertTrue(Matrix.PAULI_X.times(Matrix.PAULI_Y).times(Matrix.PAULI_Z).scaledBy(new Complex(0, -1))
        .isEqualTo(Matrix.identity(2)));
});

suite.test("times_ColRow", () => {
    // When one is a column vector and the other is a row vector...
    let r = Matrix.row([2, 3, 5]);
    let c = Matrix.col([11, 13, 17]);

    // Inner product
    assertThat(r.times(c).toString()).isEqualTo("{{146}}");

    // Outer product
    assertThat(c.times(r).toString()).isEqualTo("{{22, 33, 55}, {26, 39, 65}, {34, 51, 85}}");

    // Outer product matches tensor product
    assertThat(c.times(r)).isEqualTo(c.tensorProduct(r));

    // Tensor product is order independent (in this case)
    assertThat(r.tensorProduct(c)).isEqualTo(c.tensorProduct(r));
});

suite.test("norm2", () => {
    assertThat(Matrix.row([1]).norm2()).isEqualTo(1);
    assertThat(Matrix.row([2]).norm2()).isEqualTo(4);
    assertThat(Matrix.row([1, 1]).norm2()).isEqualTo(2);
    assertThat(Matrix.col([1, 1]).norm2()).isEqualTo(2);
    assertThat(Matrix.square([1, 2, 3, 4]).norm2()).isEqualTo(30);
});

suite.test("tensorProduct", () => {
    assertThat(Matrix.square([2]).tensorProduct(Matrix.square([3]))).
        isEqualTo(Matrix.square([6]));
    assertThat(Matrix.square([2]).tensorProduct(Matrix.square([3]))).
        isEqualTo(Matrix.square([6]));
    assertThat(Matrix.PAULI_X.tensorProduct(Matrix.PAULI_Z)).isEqualTo(Matrix.square([
        0, 0, 1, 0,
        0, 0, 0, -1,
        1, 0, 0, 0,
        0, -1, 0, 0
    ]));
    assertThat(Matrix.square([2, 3, 5, 7]).tensorProduct(Matrix.square([11, 13, 17, 19]))).
        isEqualTo(Matrix.square([
            22, 26, 33, 39,
            34, 38, 51, 57,
            55, 65, 77, 91,
            85, 95, 119, 133
        ]));
});

suite.test("tensorPower", () => {
    assertThat(Matrix.row([1, new Complex(0, 1)]).tensorPower(0).toString()).isEqualTo("{{1}}");
    assertThat(Matrix.row([1, new Complex(0, 1)]).tensorPower(1).toString()).isEqualTo("{{1, i}}");
    assertThat(Matrix.row([1, new Complex(0, 1)]).tensorPower(2).toString()).isEqualTo("{{1, i, i, -1}}");
    assertThat(Matrix.row([1, new Complex(0, 1)]).tensorPower(3).toString()).
        isEqualTo("{{1, i, i, -1, i, -1, -1, -i}}");
});

suite.test("timesQubitOperation", () => {
    let s = Math.sqrt(0.5);

    assertThat(Matrix.col([1, 0, 0, 0]).timesQubitOperation(Matrix.HADAMARD, 0, 0, 0)).
        isEqualTo(Matrix.col([s, s, 0, 0]));
    assertThat(Matrix.col([0, 1, 0, 0]).timesQubitOperation(Matrix.HADAMARD, 0, 0, 0)).
        isEqualTo(Matrix.col([s, -s, 0, 0]));
    assertThat(Matrix.col([0, 0, 1, 0]).timesQubitOperation(Matrix.HADAMARD, 0, 0, 0)).
        isEqualTo(Matrix.col([0, 0, s, s]));
    assertThat(Matrix.col([0, 0, 0, 1]).timesQubitOperation(Matrix.HADAMARD, 0, 0, 0)).
        isEqualTo(Matrix.col([0, 0, s, -s]));

    assertThat(Matrix.col([1, 0, 0, 0]).timesQubitOperation(Matrix.HADAMARD, 1, 0, 0)).
        isEqualTo(Matrix.col([s, 0, s, 0]));
    assertThat(Matrix.col([0, 1, 0, 0]).timesQubitOperation(Matrix.HADAMARD, 1, 0, 0)).
        isEqualTo(Matrix.col([0, s, 0, s]));
    assertThat(Matrix.col([0, 0, 1, 0]).timesQubitOperation(Matrix.HADAMARD, 1, 0, 0)).
        isEqualTo(Matrix.col([s, 0, -s, 0]));
    assertThat(Matrix.col([0, 0, 0, 1]).timesQubitOperation(Matrix.HADAMARD, 1, 0, 0)).
        isEqualTo(Matrix.col([0, s, 0, -s]));

    assertThat(Matrix.col([2, 3, 0, 0]).timesQubitOperation(Matrix.PAULI_X, 1, 1, 0)).
        isEqualTo(Matrix.col([0, 3, 2, 0]));
    assertThat(Matrix.col([2, 3, 0, 0]).timesQubitOperation(Matrix.PAULI_X, 1, 1, 1)).
        isEqualTo(Matrix.col([2, 0, 0, 3]));
});

suite.test("timesQubitOperation_speed", () => {
    let numQubits = 10;
    let numOps = 100;
    let t0 = performance.now();
    let buf = new Float64Array(2 << numQubits);
    buf[0] = 1;
    let state = new Matrix(1, 1 << numQubits, buf);
    for (let i = 0; i < numOps; i++) {
        state = state.timesQubitOperation(Matrix.HADAMARD, 0, 6, 0);
    }

    let t1 = performance.now();
    assertThat(t1 - t0).isLessThan(100);
});

suite.test("fromPauliRotation", () => {
    // No turn gives no-op
    assertThat(Matrix.fromPauliRotation(0, 0, 0)).isApproximatelyEqualTo(Matrix.identity(2));

    // Whole turns are no-ops
    assertThat(Matrix.fromPauliRotation(1, 0, 0)).isApproximatelyEqualTo(Matrix.identity(2));
    assertThat(Matrix.fromPauliRotation(0, 1, 0)).isApproximatelyEqualTo(Matrix.identity(2));
    assertThat(Matrix.fromPauliRotation(0, 0, 1)).isApproximatelyEqualTo(Matrix.identity(2));
    assertThat(Matrix.fromPauliRotation(-1, 0, 0)).isApproximatelyEqualTo(Matrix.identity(2));
    assertThat(Matrix.fromPauliRotation(0, -1, 0)).isApproximatelyEqualTo(Matrix.identity(2));
    assertThat(Matrix.fromPauliRotation(0, 0, -1)).isApproximatelyEqualTo(Matrix.identity(2));
    assertThat(Matrix.fromPauliRotation(0.6, 0.8, 0)).isApproximatelyEqualTo(Matrix.identity(2));

    // Half turns along each axis is the corresponding Pauli operation
    assertThat(Matrix.fromPauliRotation(0.5, 0, 0)).isApproximatelyEqualTo(Matrix.PAULI_X);
    assertThat(Matrix.fromPauliRotation(0, 0.5, 0)).isApproximatelyEqualTo(Matrix.PAULI_Y);
    assertThat(Matrix.fromPauliRotation(0, 0, 0.5)).isApproximatelyEqualTo(Matrix.PAULI_Z);
    assertThat(Matrix.fromPauliRotation(-0.5, 0, 0)).isApproximatelyEqualTo(Matrix.PAULI_X);
    assertThat(Matrix.fromPauliRotation(0, -0.5, 0)).isApproximatelyEqualTo(Matrix.PAULI_Y);
    assertThat(Matrix.fromPauliRotation(0, 0, -0.5)).isApproximatelyEqualTo(Matrix.PAULI_Z);

    // Hadamard
    assertThat(Matrix.fromPauliRotation(Math.sqrt(0.125), 0, Math.sqrt(0.125))).
        isApproximatelyEqualTo(Matrix.HADAMARD);

    // Opposites are inverses
    assertThat(Matrix.fromPauliRotation(-0.25, 0, 0).times(Matrix.fromPauliRotation(0.25, 0, 0))).
        isApproximatelyEqualTo(Matrix.identity(2));
    assertThat(Matrix.fromPauliRotation(0, -0.25, 0).times(Matrix.fromPauliRotation(0, 0.25, 0))).
        isApproximatelyEqualTo(Matrix.identity(2));
    assertThat(Matrix.fromPauliRotation(0, 0, -0.25).times(Matrix.fromPauliRotation(0, 0, 0.25))).
        isApproximatelyEqualTo(Matrix.identity(2));

    // Doubling rotation is like squaring
    let s1 = Matrix.fromPauliRotation(0.1, 0.15, 0.25);
    let s2 = Matrix.fromPauliRotation(0.2, 0.3, 0.5);
    assertThat(s1.times(s1)).isApproximatelyEqualTo(s2);
});

suite.test("fromWireSwap", () => {
    assertThat(Matrix.fromWireSwap(2, 0, 1).toString()).
        isEqualTo("{{1, 0, 0, 0}, {0, 0, 1, 0}, {0, 1, 0, 0}, {0, 0, 0, 1}}");
    let _ = 0;
    assertThat(Matrix.square([
        1, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, //____
        _, 1, _, _, _, _, _, _, _, _, _, _, _, _, _, _, //___1
        _, _, _, _, _, _, _, _, 1, _, _, _, _, _, _, _, //__1_
        _, _, _, _, _, _, _, _, _, 1, _, _, _, _, _, _, //__11
        _, _, _, _, 1, _, _, _, _, _, _, _, _, _, _, _, //_1__
        _, _, _, _, _, 1, _, _, _, _, _, _, _, _, _, _, //_1_1
        _, _, _, _, _, _, _, _, _, _, _, _, 1, _, _, _, //_11_
        _, _, _, _, _, _, _, _, _, _, _, _, _, 1, _, _, //_111
        _, _, 1, _, _, _, _, _, _, _, _, _, _, _, _, _, //1___
        _, _, _, 1, _, _, _, _, _, _, _, _, _, _, _, _, //1__1
        _, _, _, _, _, _, _, _, _, _, 1, _, _, _, _, _, //1_1_
        _, _, _, _, _, _, _, _, _, _, _, 1, _, _, _, _, //1_11
        _, _, _, _, _, _, 1, _, _, _, _, _, _, _, _, _, //11__
        _, _, _, _, _, _, _, 1, _, _, _, _, _, _, _, _, //11_1
        _, _, _, _, _, _, _, _, _, _, _, _, _, _, 1, _, //111_
        _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 1 //1111
    ])).isEqualTo(Matrix.fromWireSwap(4, 1, 3));
});

suite.test("identity", () => {
    assertThat(Matrix.identity(1).toString()).
        isEqualTo("{{1}}");
    assertThat(Matrix.identity(2).toString()).
        isEqualTo("{{1, 0}, {0, 1}}");
    assertThat(Matrix.identity(3).toString()).
        isEqualTo("{{1, 0, 0}, {0, 1, 0}, {0, 0, 1}}");
    assertThat(Matrix.identity(4).toString()).
        isEqualTo("{{1, 0, 0, 0}, {0, 1, 0, 0}, {0, 0, 1, 0}, {0, 0, 0, 1}}");
});

suite.test("rotation", () => {
    let s = Math.sqrt(0.5);
    let t = Math.PI * 2;
    assertThat(Matrix.rotation(0)).isApproximatelyEqualTo(Matrix.square([1, 0, 0, 1]));
    assertThat(Matrix.rotation(t / 8)).isApproximatelyEqualTo(Matrix.square([s, -s, s, s]));
    assertThat(Matrix.rotation(t * 2 / 8)).isApproximatelyEqualTo(Matrix.square([0, -1, 1, 0]));
    assertThat(Matrix.rotation(t * 3 / 8)).isApproximatelyEqualTo(Matrix.square([-s, -s, s, -s]));
    assertThat(Matrix.rotation(t * 4 / 8)).isApproximatelyEqualTo(Matrix.square([-1, 0, 0, -1]));
    assertThat(Matrix.rotation(t * 5 / 8)).isApproximatelyEqualTo(Matrix.square([-s, s, -s, -s]));
    assertThat(Matrix.rotation(t * 6 / 8)).isApproximatelyEqualTo(Matrix.square([0, 1, -1, 0]));
    assertThat(Matrix.rotation(t * 7 / 8)).isApproximatelyEqualTo(Matrix.square([s, s, -s, s]));
    assertThat(Matrix.rotation(t)).isApproximatelyEqualTo(Matrix.square([1, 0, 0, 1]));
});

suite.test("singularValueDecomposition_2x2", () => {
    let z = Matrix.square([0, 0, 0, 0]).singularValueDecomposition();
    assertThat(z.u).isApproximatelyEqualTo(Matrix.identity(2));
    assertThat(z.s).isApproximatelyEqualTo(Matrix.square([0, 0, 0, 0]));
    assertThat(z.v).isApproximatelyEqualTo(Matrix.identity(2));

    let i = Matrix.identity(2).singularValueDecomposition();
    assertThat(i.u).isApproximatelyEqualTo(Matrix.identity(2));
    assertThat(i.s).isApproximatelyEqualTo(Matrix.identity(2));
    assertThat(i.v).isApproximatelyEqualTo(Matrix.identity(2));

    let am = Matrix.square([1, Complex.I.times(2), 3, 4]);
    let ad = am.singularValueDecomposition();
    assertThat(ad.u.times(ad.s).times(ad.v)).isApproximatelyEqualTo(am);
    assertThat(ad.s).isApproximatelyEqualTo(Matrix.square([5.305935, 0, 0, 1.359063]));
});

suite.test("closestUnitary_2x2", () => {
    assertThat(Matrix.square([0, 0, 0, 0]).closestUnitary()).
        isApproximatelyEqualTo(Matrix.square([1, 0, 0, 1]));
    assertThat(Matrix.square([2, 0, 0, 0.0001]).closestUnitary()).
        isApproximatelyEqualTo(Matrix.square([1, 0, 0, 1]));
    assertThat(Matrix.square([0, 0.5, 0.0001, 0]).closestUnitary()).
        isApproximatelyEqualTo(Matrix.square([0, 1, 1, 0]));
    assertThat(Matrix.square([1, Complex.I, -1, Complex.I.times(-1)]).closestUnitary()).
        isApproximatelyEqualTo(Matrix.square([1, 0, 0, Complex.I.times(-1)]));
});

suite.test("eigenDecomposition", () => {
    let s = Math.sqrt(0.5);
    let z = Math.sqrt(2);
    assertThat(Matrix.identity(2).eigenDecomposition()).isEqualTo([
        {val: 1, vec: Matrix.col([1, 0])},
        {val: 1, vec: Matrix.col([0, 1])}
    ]);
    assertThat(Matrix.PAULI_X.eigenDecomposition()).isApproximatelyEqualTo([
        {val: -1, vec: Matrix.col([s, -s])},
        {val: 1, vec: Matrix.col([s, s])}
    ]);
    assertThat(Matrix.PAULI_Y.eigenDecomposition()).isApproximatelyEqualTo([
        {val: -1, vec: Matrix.col([s, new Complex(0, -s)])},
        {val: 1, vec: Matrix.col([s, new Complex(0, s)])}
    ]);
    assertThat(Matrix.PAULI_Z.eigenDecomposition()).isEqualTo([
        {val: -1, vec: Matrix.col([0, 1])},
        {val: 1, vec: Matrix.col([1, 0])}
    ]);
    assertThat(Matrix.square([1, 1, 1, -1]).eigenDecomposition()).isApproximatelyEqualTo([
        {val: -z, vec: Matrix.col([1 - z, 1]).scaledBy(-1/Math.sqrt(4-2*z))},
        {val: z, vec: Matrix.col([1 + z, 1]).scaledBy(1/Math.sqrt(4+2*z))}
    ]);
    assertThat(Matrix.HADAMARD.eigenDecomposition()).isApproximatelyEqualTo([
        {val: -1, vec: Matrix.col([1 - z, 1]).scaledBy(-1/Math.sqrt(4-2*z))},
        {val: 1, vec: Matrix.col([1 + z, 1]).scaledBy(1/Math.sqrt(4+2*z))}
    ]);
});

suite.test("liftApply", () => {
    let i = Complex.I;
    let mi = Complex.I.times(-1);
    let s = Math.sqrt(0.5);
    let tExpi = t => (c => c.times(i).times(t).exp());
    let tPow = t => (c => c.raisedTo(t));

    assertThat(Matrix.PAULI_X.liftApply(tExpi(Math.PI))).isApproximatelyEqualTo(Matrix.square([-1, 0, 0, -1]));
    assertThat(Matrix.PAULI_X.liftApply(tExpi(Math.PI/2))).isApproximatelyEqualTo(Matrix.square([0, i, i, 0]));
    assertThat(Matrix.PAULI_X.liftApply(tExpi(Math.PI/4))).
        isApproximatelyEqualTo(Matrix.square([1, i, i, 1]).scaledBy(s));

    assertThat(Matrix.PAULI_Y.liftApply(tExpi(Math.PI))).isApproximatelyEqualTo(Matrix.square([-1, 0, 0, -1]));
    assertThat(Matrix.PAULI_Y.liftApply(tExpi(Math.PI/2))).isApproximatelyEqualTo(Matrix.square([0, 1, -1, 0]));
    assertThat(Matrix.PAULI_Y.liftApply(tExpi(Math.PI/4))).isApproximatelyEqualTo(Matrix.square([s, s, -s, s]));

    assertThat(Matrix.PAULI_Z.liftApply(tExpi(Math.PI))).isApproximatelyEqualTo(Matrix.square([-1, 0, 0, -1]));
    assertThat(Matrix.PAULI_Z.liftApply(tExpi(Math.PI/2))).isApproximatelyEqualTo(Matrix.square([i, 0, 0, mi]));
    assertThat(Matrix.PAULI_Z.liftApply(tExpi(Math.PI/4))).
        isApproximatelyEqualTo(Matrix.square([new Complex(s, s), 0, 0, new Complex(s, -s)]));

    assertThat(Matrix.PAULI_X.liftApply(tPow(0.5))).
        isApproximatelyEqualTo(Matrix.square([i, 1, 1, i]).scaledBy(new Complex(0.5, -0.5)));
    assertThat(Matrix.PAULI_X.liftApply(tPow(-0.5))).
        isApproximatelyEqualTo(Matrix.square([mi, 1, 1, mi]).scaledBy(new Complex(0.5, 0.5)));

    assertThat(Matrix.PAULI_Y.liftApply(tPow(0.5))).
        isApproximatelyEqualTo(Matrix.square([1, -1, 1, 1]).scaledBy(new Complex(0.5, 0.5)));
    assertThat(Matrix.PAULI_Y.liftApply(tPow(-0.5))).
        isApproximatelyEqualTo(Matrix.square([1, 1, -1, 1]).scaledBy(new Complex(0.5, -0.5)));

    assertThat(Matrix.PAULI_Z.liftApply(tPow(0.5))).isApproximatelyEqualTo(Matrix.square([1, 0, 0, i]));
    assertThat(Matrix.PAULI_Z.liftApply(tPow(-0.5))).isApproximatelyEqualTo(Matrix.square([1, 0, 0, mi]));
});

suite.test("trace", () => {
    assertThat(Matrix.identity(2).trace()).isEqualTo(2);
    assertThat(Matrix.identity(10).trace()).isEqualTo(10);

    assertThat(Matrix.PAULI_X.trace()).isEqualTo(0);
    assertThat(Matrix.PAULI_Y.trace()).isEqualTo(0);
    assertThat(Matrix.PAULI_Z.trace()).isEqualTo(0);
    assertThat(Matrix.HADAMARD.trace()).isApproximatelyEqualTo(0);
    assertThat(Matrix.square([1, 2, 3, 4]).trace()).isEqualTo(5);

    assertThat(Matrix.square(Seq.range(9).toArray()).trace()).isEqualTo(12);
});

suite.test("qubitDensityMatrixToBlochVector", () => {
    assertThrows(() => Matrix.square([1]).qubitDensityMatrixToBlochVector());
    assertThrows(() => Matrix.square([1,0,0,0,0,0,0,0,0]).qubitDensityMatrixToBlochVector());
    assertThrows(() => Matrix.identity(2).qubitDensityMatrixToBlochVector());
    assertThrows(() => Matrix.square([1, 1, -1, 0]).qubitDensityMatrixToBlochVector());
    assertThrows(() => Matrix.square([1, 1, 0, 0]).qubitDensityMatrixToBlochVector());
    assertThrows(() => Matrix.square([1, Complex.i, Complex.i, 0]).qubitDensityMatrixToBlochVector());

    // Maximally mixed state.
    assertThat(Matrix.identity(2).scaledBy(0.5).qubitDensityMatrixToBlochVector()).
        isEqualTo([0, 0, 0]);

    // Pure states as vectors along each axis.
    let f = m => Matrix.col(m).times(Matrix.col(m).adjoint());
    let i = Complex.I;
    let mi = i.times(-1);
    assertThat(f([1, 0]).qubitDensityMatrixToBlochVector()).isEqualTo([0, 0, 1]);
    assertThat(f([0, 1]).qubitDensityMatrixToBlochVector()).isEqualTo([0, 0, -1]);
    assertThat(f([1, 1]).scaledBy(0.5).qubitDensityMatrixToBlochVector()).isEqualTo([1, 0, 0]);
    assertThat(f([1, -1]).scaledBy(0.5).qubitDensityMatrixToBlochVector()).isEqualTo([-1, 0, 0]);
    assertThat(f([1, i]).scaledBy(0.5).qubitDensityMatrixToBlochVector()).isEqualTo([0, 1, 0]);
    assertThat(f([1, mi]).scaledBy(0.5).qubitDensityMatrixToBlochVector()).isEqualTo([0, -1, 0]);
});

suite.test("determinant", () => {
    assertThrows(() => Matrix.col([1, 2]).determinant());
    assertThrows(() => Matrix.row([1, 2]).determinant());

    assertThat(Matrix.square([1]).determinant()).isEqualTo(1);
    assertThat(Matrix.square([2]).determinant()).isEqualTo(2);

    assertThat(Matrix.square([1, 2, 3, 4]).determinant()).isEqualTo(-2);
    assertThat(Matrix.square([2, 3, 5, 7]).determinant()).isEqualTo(-1);

    assertThat(Matrix.square([1, 2, 3, 4, 5, 6, 7, 8, 9]).determinant()).isEqualTo(0);
    assertThat(Matrix.square([2, 3, 5, 7, 11, 13, 17, 19, 23]).determinant()).isEqualTo(-78);
});

suite.test("fromAngleAxisPhaseRotation", () => {
    let π = Math.PI;
    let i = Complex.I;
    let s = Math.sqrt(0.5);
    let is = Complex.I.times(s);
    let mis = is.neg();
    let mi = Complex.I.times(-1);

    // No-op.
    assertThat(Matrix.fromAngleAxisPhaseRotation(0, [1, 0, 0], 0)).isEqualTo(Matrix.square([1, 0, 0, 1]));
    assertThat(Matrix.fromAngleAxisPhaseRotation(0, [0, 1, 0], 0)).isEqualTo(Matrix.square([1, 0, 0, 1]));
    assertThat(Matrix.fromAngleAxisPhaseRotation(0, [0, 0, 1], 0)).isEqualTo(Matrix.square([1, 0, 0, 1]));
    assertThat(Matrix.fromAngleAxisPhaseRotation(0, [s, 0, s], 0)).isEqualTo(Matrix.square([1, 0, 0, 1]));

    // Phase.
    assertThat(Matrix.fromAngleAxisPhaseRotation(0, [1, 0, 0], π/2)).isEqualTo(Matrix.square([i, 0, 0, i]));
    assertThat(Matrix.fromAngleAxisPhaseRotation(0, [1, 0, 0], π)).isEqualTo(Matrix.square([-1, 0, 0, -1]));

    // X.
    assertThat(Matrix.fromAngleAxisPhaseRotation(-π/2, [1, 0, 0], 0)).isEqualTo(Matrix.square([s, is, is, s]));
    assertThat(Matrix.fromAngleAxisPhaseRotation(π/2, [1, 0, 0], 0)).isEqualTo(Matrix.square([s, mis, mis, s]));
    assertThat(Matrix.fromAngleAxisPhaseRotation(π, [1, 0, 0], 0)).isEqualTo(Matrix.square([0, mi, mi, 0]));
    assertThat(Matrix.fromAngleAxisPhaseRotation(2*π, [1, 0, 0], 0)).isEqualTo(Matrix.square([-1, 0, 0, -1]));

    // Y.
    assertThat(Matrix.fromAngleAxisPhaseRotation(-π/2, [0, 1, 0], 0)).isEqualTo(Matrix.square([s, s, -s, s]));
    assertThat(Matrix.fromAngleAxisPhaseRotation(π/2, [0, 1, 0], 0)).isEqualTo(Matrix.square([s, -s, s, s]));
    assertThat(Matrix.fromAngleAxisPhaseRotation(π, [0, 1, 0], 0)).isEqualTo(Matrix.square([0, -1, 1, 0]));
    assertThat(Matrix.fromAngleAxisPhaseRotation(2*π, [0, 1, 0], 0)).isEqualTo(Matrix.square([-1, 0, 0, -1]));

    // Z.
    assertThat(Matrix.fromAngleAxisPhaseRotation(-π/2, [0, 0, 1], 0)).
        isEqualTo(Matrix.square([new Complex(s, s), 0, 0, new Complex(s, -s)]));
    assertThat(Matrix.fromAngleAxisPhaseRotation(π/2, [0, 0, 1], 0)).
        isEqualTo(Matrix.square([new Complex(s, -s), 0, 0, new Complex(s, s)]));
    assertThat(Matrix.fromAngleAxisPhaseRotation(π, [0, 0, 1], 0)).isEqualTo(Matrix.square([mi, 0, 0, i]));
    assertThat(Matrix.fromAngleAxisPhaseRotation(2*π, [0, 0, 1], 0)).isEqualTo(Matrix.square([-1, 0, 0, -1]));

    // H.
    assertThat(Matrix.fromAngleAxisPhaseRotation(-π, [s, 0, s], 0)).
        isEqualTo(Matrix.square([is, is, is, is.times(-1)]));
    assertThat(Matrix.fromAngleAxisPhaseRotation(-π, [s, 0, s], -π/2)).
        isEqualTo(Matrix.square([s, s, s, -s]));
});

suite.test("qubitOperationToAngleAxisRotation", () => {
    assertThrows(() => Matrix.col([1]).qubitOperationToAngleAxisRotation());
    assertThrows(() => Matrix.square([1, 2, 3, 4]).qubitOperationToAngleAxisRotation());

    let [w, x, y, z] = [Matrix.identity(2), Matrix.PAULI_X, Matrix.PAULI_Y, Matrix.PAULI_Z];
    let π = Math.PI;
    let i = Complex.I;
    let mi = i.neg();
    let s = Math.sqrt(0.5);

    assertThat(w.qubitOperationToAngleAxisRotation()).isEqualTo({angle: 0, axis: [1, 0, 0], phase: 0});
    assertThat(x.qubitOperationToAngleAxisRotation()).isEqualTo({angle: π, axis: [1, 0, 0], phase: π/2});
    assertThat(y.qubitOperationToAngleAxisRotation()).isEqualTo({angle: π, axis: [0, 1, 0], phase: π/2});
    assertThat(z.qubitOperationToAngleAxisRotation()).isEqualTo({angle: π, axis: [0, 0, 1], phase: π/2});

    assertThat(w.scaledBy(i).qubitOperationToAngleAxisRotation()).isEqualTo({angle: 0, axis: [1, 0, 0], phase: π/2});
    assertThat(x.scaledBy(i).qubitOperationToAngleAxisRotation()).isEqualTo({angle: π, axis: [1, 0, 0], phase: π});
    assertThat(y.scaledBy(i).qubitOperationToAngleAxisRotation()).isEqualTo({angle: π, axis: [0, 1, 0], phase: π});
    assertThat(z.scaledBy(i).qubitOperationToAngleAxisRotation()).isEqualTo({angle: π, axis: [0, 0, 1], phase: π});

    assertThat(w.scaledBy(mi).qubitOperationToAngleAxisRotation()).isEqualTo({angle: 0, axis: [1, 0, 0], phase: -π/2});
    assertThat(x.scaledBy(mi).qubitOperationToAngleAxisRotation()).isEqualTo({angle: π, axis: [1, 0, 0], phase: 0});
    assertThat(y.scaledBy(mi).qubitOperationToAngleAxisRotation()).isEqualTo({angle: π, axis: [0, 1, 0], phase: 0});
    assertThat(z.scaledBy(mi).qubitOperationToAngleAxisRotation()).isEqualTo({angle: π, axis: [0, 0, 1], phase: 0});

    assertThat(Matrix.HADAMARD.qubitOperationToAngleAxisRotation()).
        isEqualTo({angle: π, axis: [s, 0, s], phase: π/2});
    assertThat(Matrix.square([1, i, i, 1]).scaledBy(s).qubitOperationToAngleAxisRotation()).
        isEqualTo({angle: -π/2, axis: [1, 0, 0], phase: 0});
    assertThat(Matrix.square([s, s, -s, s]).qubitOperationToAngleAxisRotation()).
        isEqualTo({angle: -π/2, axis: [0, 1, 0], phase: 0});
    assertThat(Matrix.square([1, 0, 0, i]).qubitOperationToAngleAxisRotation()).
        isEqualTo({angle: π/2, axis: [0, 0, 1], phase: π/4});
});

suite.test("qubitOperationToAngleAxisRotation_vs_fromAngleAxisPhaseRotation_randomized", () => {
    for (let _ of Seq.range(100)) {
        let phase = Math.random() * Math.PI * 2;
        let angle = Math.random() * Math.PI * 4;
        let a = Math.random() * Math.PI * 2;
        let b = Math.acos(Math.random() * 2 - 1);
        let axis = [
            Math.cos(a)*Math.sin(b),
            Math.sin(a)*Math.sin(b),
            Math.cos(b)
        ];
        let U = Matrix.fromAngleAxisPhaseRotation(angle, axis, phase);
        let {angle: angle2, axis: axis2, phase: phase2} = U.qubitOperationToAngleAxisRotation();
        let U2 = Matrix.fromAngleAxisPhaseRotation(angle2, axis2, phase2);
        assertThat(U2).withInfo({angle, axis, phase}).isApproximatelyEqualTo(U);
    }
});

suite.test("cross3", () => {
    let [x, y, z] = [Matrix.col([1, 0, 0]), Matrix.col([0, 1, 0]), Matrix.col([0, 0, 1])];
    let zero = Matrix.col([0, 0, 0]);

    assertThat(zero.cross3(zero)).isEqualTo(zero);
    assertThat(x.cross3(zero)).isEqualTo(zero);
    assertThat(y.cross3(zero)).isEqualTo(zero);
    assertThat(z.cross3(zero)).isEqualTo(zero);

    assertThat(x.cross3(y)).isEqualTo(z);
    assertThat(y.cross3(z)).isEqualTo(x);
    assertThat(z.cross3(x)).isEqualTo(y);

    assertThat(y.cross3(x)).isEqualTo(z.scaledBy(-1));
    assertThat(z.cross3(y)).isEqualTo(x.scaledBy(-1));
    assertThat(x.cross3(z)).isEqualTo(y.scaledBy(-1));

    assertThat(x.scaledBy(2).cross3(y.scaledBy(3))).isEqualTo(z.scaledBy(6));
    assertThat(x.plus(y).cross3(y)).isEqualTo(z);
});
