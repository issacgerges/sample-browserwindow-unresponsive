async function pessimisticallyEnableDebugger(webContents) {
  try {
    webContents.debugger.attach("1.1");
  } catch (e) {
    console.log("Failed to attach debugger", e);
    return;
  }

  const response = await webContents.debugger.sendCommand("Debugger.enable");
  console.log(`Debugger enabled with id ${response.debuggerId}`);
}

async function waitMs(timeInMs) {
  return new Promise((resolve) => { 
    setTimeout(resolve, timeInMs);
  })
}

async function sampleCallFrame(webContents, { numSamples = 5, timeToWaitBetween = 500 }) {
  const samples = [];
  let nextSampleResolve;
  const waitForNextSample = async () => {
    return new Promise((resolve) => {
      nextSampleResolve = resolve;
    });
  }
  const pauseHandler = async (event, method, params) => {
    if (method === "Debugger.paused") {
      const { functionName, functionLocation, url } = params.callFrames[0];
      const { columnNumber, lineNumber } = functionLocation
      console.log(`Debugger successfully paused, collecting sample`);
      samples.push({
        name: functionName,
        url: `${url}:${lineNumber}:${columnNumber}`,
      });
      await webContents.debugger.sendCommand("Debugger.resume");
      nextSampleResolve();
    }
  }

  webContents.debugger.on("message", pauseHandler);

  for (let i = 0; i < numSamples; i ++) {
    await webContents.debugger.sendCommand("Debugger.pause");
    await waitForNextSample();
    waitMs(timeToWaitBetween);
  }

  webContents.debugger.off("message", pauseHandler);
  webContents.debugger.detach();
  return samples;
}

module.exports = {
  pessimisticallyEnableDebugger,
  sampleCallFrame,
};
