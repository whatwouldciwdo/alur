export async function getLocalIp(): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel("");

      const timer = setTimeout(() => {
        pc.close();
        resolve(null);
      }, 2000);

      pc.onicecandidate = (event) => {
        if (!event?.candidate?.candidate) return;
        const match = event.candidate.candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
        if (match && match[1] !== "0.0.0.0") {
          clearTimeout(timer);
          pc.close();
          resolve(match[1]);
        }
      };

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => {
          clearTimeout(timer);
          pc.close();
          resolve(null);
        });
    } catch {
      resolve(null);
    }
  });
}
