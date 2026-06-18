import { create } from 'zustand';
type DeviceState = { cameraEnabled: boolean; microphoneEnabled: boolean; screenSharing: boolean; setCamera: (enabled: boolean) => void; setMicrophone: (enabled: boolean) => void; setScreenSharing: (enabled: boolean) => void };
export const useMeetingStore = create<DeviceState>((set) => ({ cameraEnabled: true, microphoneEnabled: true, screenSharing: false, setCamera: (cameraEnabled) => set({ cameraEnabled }), setMicrophone: (microphoneEnabled) => set({ microphoneEnabled }), setScreenSharing: (screenSharing) => set({ screenSharing }) }));
