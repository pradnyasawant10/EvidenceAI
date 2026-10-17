import os
import cv2


# =====================================================
# HAAR CASCADE MODEL
# =====================================================

CASCADE_PATH = cv2.data.haarcascades + (
    "haarcascade_frontalface_default.xml"
)

face_cascade = cv2.CascadeClassifier(
    CASCADE_PATH
)

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
# DETECT FACES IN VIDEO
# =====================================================

def detect_faces_in_video(video_path):
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {
                "success": False,
                "message": "Unable to open video file.",
                "face_count": 0,
                "confidence": 0
            }

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
        duration = total_frames / fps if fps > 0 else 0

        frame_step = max(1, int(fps))
        if total_frames > 0 and (total_frames // frame_step) > 30:
            frame_step = max(1, total_frames // 30)

        frame_idx = 0
        sampled_frames = 0
        max_faces_in_single_frame = 0
        frames_with_faces = 0
        total_faces_detected_across_frames = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % frame_step == 0:
                sampled_frames += 1
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                faces = face_cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.1,
                    minNeighbors=5,
                    minSize=(30, 30)
                )

                face_cnt = len(faces)
                if face_cnt > 0:
                    frames_with_faces += 1
                    total_faces_detected_across_frames += face_cnt
                    if face_cnt > max_faces_in_single_frame:
                        max_faces_in_single_frame = face_cnt

                if sampled_frames >= 30:
                    break

            frame_idx += 1

        cap.release()

        if max_faces_in_single_frame > 0:
            confidence = 85.0
            msg = (
                f"Video face analysis completed: detected up to {max_faces_in_single_frame} face(s) per frame "
                f"across {frames_with_faces} keyframes (duration: {duration:.1f}s, {sampled_frames} frames inspected)."
            )
        else:
            confidence = 0
            msg = f"No faces detected in video ({sampled_frames} keyframes inspected)."

        return {
            "success": True,
            "message": msg,
            "face_count": max_faces_in_single_frame,
            "confidence": confidence,
            "is_video": True,
            "frames_analyzed": sampled_frames
        }

    except Exception as error:
        return {
            "success": False,
            "message": f"Video face detection error: {str(error)}",
            "face_count": 0,
            "confidence": 0
        }


# =====================================================
# MAIN DETECT FACES (SUPPORTS IMAGE & VIDEO)
# =====================================================

def detect_faces(file_path):
    if not os.path.exists(file_path):
        return {
            "success": False,
            "message": "File not found.",
            "face_count": 0,
            "confidence": 0
        }

    if file_path.lower().endswith(VIDEO_EXTENSIONS):
        return detect_faces_in_video(file_path)

    try:
        image = cv2.imread(file_path)

        if image is None:
            return {
                "success": False,
                "message": "Unable to read image.",
                "face_count": 0,
                "confidence": 0
            }

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )

        face_count = len(faces)

        if face_count > 0:
            confidence = 85.00
            message = f"{face_count} face(s) detected."
        else:
            confidence = 0
            message = "No face detected."

        return {
            "success": True,
            "message": message,
            "face_count": face_count,
            "confidence": confidence
        }

    except Exception as error:
        return {
            "success": False,
            "message": str(error),
            "face_count": 0,
            "confidence": 0
        }


if __name__ == "__main__":
    print("Face Detection Module Loaded Successfully (Images & Videos)!")