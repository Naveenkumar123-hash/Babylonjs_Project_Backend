const { Room } = require("colyseus");
const { Shape, Vector3, State } = require('./schema');

const chunkSize = 10;

class GameRoom extends Room {
  onCreate(options) {
    this.setState(new State());

    this.onMessage("shapeChunk", (client, chunkData) => {
      console.log(chunkData);
      
      if (!this.state.shapes.has(chunkData.name)) {
        const newShape = new Shape();
        newShape.name = chunkData.name;
        newShape.position.x = chunkData.position.x;
        newShape.position.y = chunkData.position.y;
        newShape.position.z = chunkData.position.z;
        newShape.totalChunks = chunkData.totalChunks;
        newShape.receivedChunks = 0; // Initialize receivedChunks
        this.state.shapes.set(chunkData.name, newShape);
      }

      const shape = this.state.shapes.get(chunkData.name);

      // Convert plain objects to instances of Vector3
      const vertices = chunkData.vertices.map(vertex => {
        return new Vector3(vertex.x, vertex.y, vertex.z);
      });

      shape.vertices.push(...vertices);
      shape.receivedChunks += 1;

      if (shape.receivedChunks >= shape.totalChunks) {
        console.log(Array.from(this.state.shapes.entries()));
        
        this.broadcast("updateShapes",  Array.from(this.state.shapes.entries()));
      }
    });

    this.onMessage("moveShape", (client, message) => {
      const { name, position } = message;
      
      // Update the position on the server
      const shape = this.state.shapes[name];
      if (shape) {
          shape.position.set(position.x, position.y, position.z);
          
          // Broadcast the change to all clients
          this.broadcast("moveShape", { name, position });
      }
  });

    this.onMessage("UpdateMeshPosition", (data, client) => {
      const { name, position } = data;
  
      // Update the position of the shape in the game state
      const shape = this.state.shapes.get(name);
      if (shape) {
          shape.position.x = position.x;
          shape.position.y = position.y;
          shape.position.z = position.z;
  
          // Broadcast the updated position to all clients
          this.broadcast("MeshPositionUpdated", { name, position });
      }
  });
  }

  onJoin(client, options) {
    console.log(client.sessionId, "joined!");
    client.send("updateShapes", this.state.shapes);
  }

  onLeave(client, consented) {
    console.log(client.sessionId, "left!");
    if (this.state.shapes.has(client.sessionId)) {
      this.state.shapes.delete(client.sessionId);
    } else {
      console.warn(`Attempted to delete non-existing shape for session: ${client.sessionId}`);
    }
    this.broadcast("updateShapes", this.state.shapes);
  }
}

module.exports = { GameRoom };
