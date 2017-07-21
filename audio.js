(function () {
  function bpmToMsPerBeat(bpm) {
    // (1 min/bpm bpm) * (60 s/1 min) * (1000 ms/1 sec)
    return (1 / bpm) * 60 * 1000;
  }

  function createMetronome(bpm, beatsPerBar, audioContext) {
    const TICK_LENGTH_MS = 100;
    const TICK_FREQUENCY = 261.63;
    const TICK_FREQUENCY_BELL = 392.00; // C5
    const msPerBeat = bpmToMsPerBeat(bpm);
    const audioCtx = new AudioContext();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const speakers = audioCtx.destination;

    gainNode.connect(speakers);
    oscillator.connect(gainNode);

    function mute() {
      gainNode.gain.value = 0;
    }

    function unmute() {
      gainNode.gain.value = 1;
    }

    function highFrequency() {
      oscillator.frequency.value = TICK_FREQUENCY_BELL;
    }

    function normalFrequency() {
      oscillator.frequency.value = TICK_FREQUENCY;
    }

    mute();
    normalFrequency();
    oscillator.start();

    let intervalId;
    let started = false;

    function tick() {
      let ticks = 0;
      normalFrequency();

      function pendulumSwing() {
        if (ticks % beatsPerBar === 0) {
          highFrequency();
        }
        unmute();
        setTimeout(() => {
          mute();
          normalFrequency();
          ticks += 1;
        }, TICK_LENGTH_MS);
      }
      pendulumSwing();
      intervalId = setInterval(pendulumSwing, msPerBeat);
    }

    function start() {
      if (started) {
        return;
      }
      started = true;
      return tick();
    }

    function stop() {
      clearInterval(intervalId);
      started = false;
    }

    function destroy() {
      audioContext.close();
    }

    return {
      start,
      stop,
      destroy
    }
  }

  function newAudioContext(win) {
    return new (win.AudioContext || win.webkitAudioContext);
  }

  function getStartButton(win) {
    return win.document.getElementById('start');
  }
  function getStopButton(win) {
    return win.document.getElementById('stop');
  }
  function getTempo(win) {
    return win.document.getElementById('tempo').value;
  }
  function getBeatsPerBar(win) {
    return win.document.getElementById('beats-per-bar').value;
  }

  function main() {
    let metronome;
    getStartButton(window).addEventListener('click', () => {
      if (metronome) metronome.destroy();
      metronome = createMetronome(getTempo(window), getBeatsPerBar(window), newAudioContext(window));
      metronome.start();
    });
    getStopButton(window).addEventListener('click', () => {
      if (metronome) {
        metronome.stop();
      }
    });
  }
  main();
}());
