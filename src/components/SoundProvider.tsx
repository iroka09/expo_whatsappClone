
import { createContext, useContext, type PropsWithChildren, useCallback } from "react"
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'


export type SoundKeysType = "textMessageSentSound" | "voiceNotePausedSound" | "voiceNoteStartSound" | "voiceNoteStopSound" | "voiceNoteSendSound" | "incomingMessageSound"


type SoundContextType = {
  playSound: (key: SoundKeysType) => void
}

const SoundContext = createContext<SoundContextType>()

export const useSound = (): SoundContextType => {
  const soundObj = useContext(SoundContext)
  return soundObj
}

export default function SoundProvider({ children }: PropsWithChildren) {
  const textMessageSentSound = useAudioPlayer(require("@/assets/sounds/text_message_sent.m4a"))
  const voiceNoteStartSound = useAudioPlayer(require("@/assets/sounds/voice_note_start.m4a"))
  const voiceNotePausedSound = useAudioPlayer(require("@/assets/sounds/voice_note_paused.mp3"))
  const voiceNoteStopSound = useAudioPlayer(require("@/assets/sounds/voice_note_stop.m4a"))
  const voiceNoteSendSound = useAudioPlayer(require("@/assets/sounds/voice_note_send.m4a"))
  const incomingMessageSound = useAudioPlayer(require("@/assets/sounds/incoming_message.mp3"))
  const playSound = useCallback((key: SoundKeysType) => {
    switch (key) {
      case "textMessageSentSound":
        textMessageSentSound.seekTo(0)
        textMessageSentSound.play()
        break
      case "voiceNoteStartSound":
        voiceNoteStartSound.seekTo(0)
        voiceNoteStartSound.play()
        break
      case "voiceNotePausedSound":
        voiceNotePausedSound.seekTo(0)
        voiceNotePausedSound.play()
        break
      case "voiceNoteStopSound":
        voiceNoteStopSound.seekTo(0)
        voiceNoteStopSound.play()
        break
      case "voiceNoteSendSound":
        voiceNoteSendSound.seekTo(0)
        voiceNoteSendSound.play()
        break
      case "incomingMessageSound":
        incomingMessageSound.seekTo(0)
        incomingMessageSound.play()
        break
      default:
        break
    }
  }, [])
  return (
    <SoundContext.Provider value={{ playSound }}>
      {children}
    </SoundContext.Provider>
  )
}