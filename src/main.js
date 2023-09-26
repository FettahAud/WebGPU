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

const vertices = new Float32Array([-0.8, -0.8, 0.8, -0.8, 0.8, 0.8, -0.8, 0.8]);

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
