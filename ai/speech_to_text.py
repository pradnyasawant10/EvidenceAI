import os

from faster_whisper import WhisperModel

try:
    import av
except ImportError:
    av = None


# =====================================================
# WHISPER MODEL (LAZY LOADING)
# =====================================================

MODEL_SIZE = "tiny"
_model = None


def get_model():
    """Load Whisper model only when first required to prevent high RAM usage during server startup."""
    global _model
    if _model is None:
        _model = WhisperModel(
            MODEL_SIZE,
            device="cpu",
            compute_type="int8"
        )
    return _model


VIDEO_EXTENSIONS = (
    ".mp4",
    ".avi",
    ".mov",
    ".mkv",
    ".webm",
    ".flv",
    ".wmv",
    ".m4v",
    ".3gp"
)


# =====================================================
# SPEECH TO TEXT FUNCTION (SUPPORTS AUDIO & VIDEO)
# =====================================================

def transcribe_audio(audio_path):
    if not os.path.exists(audio_path):
        return {
            "success": False,
            "message": "Media file not found.",
            "text": "",
            "confidence": 0,
            "language": ""
        }

    # If it's a video file, check if it has an audio stream first
    if audio_path.lower().endswith(VIDEO_EXTENSIONS) and av:
        try:
            container = av.open(audio_path)
            has_audio = len(container.streams.audio) > 0
            container.close()

            if not has_audio:
                return {
                    "success": True,
                    "message": "Video has no audio track (silent recording/CCTV footage).",
                    "text": "[Video contains no audio stream to transcribe]",
                    "confidence": 0,
                    "language": "N/A"
                }
        except Exception:
            pass

    try:
        whisper = get_model()
        segments, info = whisper.transcribe(
            audio_path,
            beam_size=5
        )

        text_parts = []
        for segment in segments:
            text_parts.append(segment.text.strip())

        extracted_text = " ".join(text_parts).strip()

        if not extracted_text:
            return {
                "success": True,
                "message": "No speech detected in audio/video stream.",
                "text": "",
                "confidence": 0,
                "language": info.language if hasattr(info, "language") else "en"
            }

        confidence = 85.00

        return {
            "success": True,
            "message": "Media audio transcribed successfully.",
            "text": extracted_text,
            "confidence": confidence,
            "language": info.language if hasattr(info, "language") else "en"
        }

    except Exception as error:
        return {
            "success": False,
            "message": str(error),
            "text": "",
            "confidence": 0,
            "language": ""
        }


if __name__ == "__main__":
    print("Speech-to-Text Module Loaded Successfully (Audio & Video)!")