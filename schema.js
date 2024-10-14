const { Schema, type, ArraySchema, MapSchema } = require("@colyseus/schema");

class Vector3 extends Schema {
  constructor(x = 0, y = 0, z = 0) {
    super();
    this.x = this.ensureNumber(x);
    this.y = this.ensureNumber(y);
    this.z = this.ensureNumber(z);
  }
  ensureNumber(value) {
    return isNaN(value) ? 0 : Number(value);
  }
}
type("number")(Vector3.prototype, "x");
type("number")(Vector3.prototype, "y");
type("number")(Vector3.prototype, "z");

class Shape extends Schema {
  constructor(name) {
    super();
    this.name = name;
    this.position = new Vector3();
    this.vertices = new ArraySchema();
  }
  addVertex(x, y, z) {
    this.vertices.push(new Vector3(x, y, z));  // Add vertices to the array
  }
}
type("string")(Shape.prototype, "name");
type(Vector3)(Shape.prototype, "position");
type([Vector3])(Shape.prototype, "vertices");

class State extends Schema {
  constructor() {
    super();
    this.shapes = new MapSchema();
  }
}
type({ map: Shape })(State.prototype, "shapes");

module.exports = { Shape, Vector3, State };
