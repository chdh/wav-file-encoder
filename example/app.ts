import * as WavFileEncoder from "wav-file-encoder";

interface UiParms {
   frequency:      number;
   amplitude:      number;
   duration:       number;
   channels:       number;
   sampleRate:     number;
   wavFileType:    WavFileEncoder.WavFileType; }

function getRadioButtonGroupValue (name: string) : string | undefined {
   const a = document.getElementsByName(name);
   for (let i = 0; i < a.length; i++) {
      let e = <HTMLInputElement>a[i];
      if (e.checked) {
         return e.value; }}
   return undefined; }

// When a parameter is invalid, an error message is displayed, the cursor is placed within
// the affected field and the return value is undefined.
function getUiParms() : UiParms | undefined {
   const frequencyElement  = <HTMLInputElement>document.getElementById("frequency")!;
   const amplitudeElement  = <HTMLInputElement>document.getElementById("amplitude")!;
   const durationElement   = <HTMLInputElement>document.getElementById("duration")!;
   const channelsElement   = <HTMLInputElement>document.getElementById("channels")!;
   const sampleRateElement = <HTMLInputElement>document.getElementById("sampleRate")!;
   if (  !frequencyElement.reportValidity() ||
         !amplitudeElement.reportValidity()  ||
         !durationElement.reportValidity()  ||
         !channelsElement.reportValidity()  ||
         !sampleRateElement.reportValidity() ) {
      return; }
   let uiParms = <UiParms>{};
   uiParms.frequency  = frequencyElement.valueAsNumber;
   uiParms.amplitude  = amplitudeElement.valueAsNumber;
   uiParms.duration   = durationElement.valueAsNumber;
   uiParms.channels   = channelsElement.valueAsNumber;
   uiParms.sampleRate = sampleRateElement.valueAsNumber;
   uiParms.wavFileType = Number(getRadioButtonGroupValue("wavFileType"));
   return uiParms; }

function generateSineWaveSignal (frequency: number, amplitude: number, duration: number, channels: number, sampleRate: number) : AudioBuffer {
   const length = duration * sampleRate;
   const audioBuffer: AudioBuffer = new (<any>AudioBuffer)({length, numberOfChannels: channels, sampleRate});
      // <any> is used because the constructor declaration is missing in TypeScript 2.8.
   const omega = 2 * Math.PI * frequency;
   for (let channel = 0; channel < channels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let p = 0; p < length; p++) {
         channelData[p] = Math.sin(p / sampleRate * omega) * amplitude; }}
   return audioBuffer; }

function openSaveAsDialog (blob: Blob, fileName: string) {
   let url = URL.createObjectURL(blob);
   let element = document.createElement("a");
   element.href = url;
   element.download = fileName;
   let clickEvent = new MouseEvent("click");
   element.dispatchEvent(clickEvent);
   setTimeout(() => URL.revokeObjectURL(url), 60000);
   (<any>document).dummySaveAsElementHolder = element; }   // to prevent garbage collection

function generateWavFile() {
   const uiParms = getUiParms();
   if (!uiParms) {
      return; }
   const audioBuffer = generateSineWaveSignal(uiParms.frequency, uiParms.amplitude, uiParms.duration, uiParms.channels, uiParms.sampleRate);
   const wavFileData = WavFileEncoder.encodeWavFile(audioBuffer, uiParms.wavFileType);
   const blob = new Blob([wavFileData], {type: "audio/wav"});
   openSaveAsDialog(blob, "test.wav"); }

function generateWavFileButton_click() {
   try {
      generateWavFile(); }
    catch (e) {
      alert(e); }}

function startup() {
   document.getElementById("generateWavFileButton")!.addEventListener("click", generateWavFileButton_click); }

document.addEventListener("DOMContentLoaded", startup);

// Missing declaration for TypeScript 2.8:
declare global {
   interface HTMLInputElement {
      reportValidity(): boolean; }}
