const canvas = document.querySelector("canvas");
if (!navigator.gpu) {
  throw new Error("WebGPU not supported on this browser.");
}

const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
  throw new Error("No appropriate GPUAdapter found.");
}

const device = await adapter.requestDevice();

const context = canvas.getContext("webgpu");
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
  device: device,
  format: canvasFormat,
});

const vertices = new Float32Array([
  // Triangle 1
  -0.8, -0.8, 0.8, -0.8, 0.8, 0.8,

  // Triangle 2
  -0.8, -0.8, 0.8, 0.8, -0.8, 0.8,
]);

const vertexBuffer = device.createBuffer({
  label: "Cell vertices",
  size: vertices.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.Copy_DST,
});

device.queue.writeBuffer(vertexBuffer, /*bufferOffset*/ 0, vertices);

const vertexBufferLayout = {
  arrayStride: 8,
  attributes: [
    {
      format: "float32x2",
      offset: 0,
      shaderLocation: 0, // Position
    },
  ],
};

const cellShaderModule = device.createShaderModule({
  label: "Cell shader",
  code: `
    @vertex
    fn vertexMain(@location(0) pos: vec2f) -> @builtin(position) vec4f {
      return vec4f(pos, 0, 1); // (X, Y, Z, W)
    }

    @fragment
    fn fragmentMain() -> @location(0) vec4f {
      return vec4f(1, 0, 0, 1); // (Red, Green, Blue, Alpha) 
    }
  `,
});
const encoder = device.createCommandEncoder();

const pass = encoder.beginRenderPass({
  colorAttachments: [
    {
      view: context.getCurrentTexture().createView(),
      loadOp: "clear",
      clearValue: { r: 0.2, g: 0.2, b: 0.8, a: 1 },
      storeOp: "store",
    },
  ],
});
pass.end();

device.queue.submit([encoder.finish()]);
