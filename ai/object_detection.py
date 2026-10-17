from ultralytics import YOLO
import os
import cv2


# =====================================================
# YOLO MODEL
# =====================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "yolo11n.pt"
)

model = YOLO(MODEL_PATH)

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
# DETECT OBJECTS IN VIDEO
# =====================================================

def detect_objects_in_video(video_path):
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {
                "success": False,
                "message": "Unable to open video file.",
                "objects": [],
                "confidence": 0
            }

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
        duration = total_frames / fps if fps > 0 else 0

        # Sample approx 1 frame per second (capped at 30 sampled keyframes for responsive speed)
        frame_step = max(1, int(fps))
        if total_frames > 0 and (total_frames // frame_step) > 30:
            frame_step = max(1, total_frames // 30)

        frame_idx = 0
        sampled_frames = 0
        all_detected = {}
        all_confidences = []

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % frame_step == 0:
                sampled_frames += 1
                results = model.predict(source=frame, conf=0.25, verbose=False)

                if results and results[0].boxes is not None:
                    for box in results[0].boxes:
                        class_id = int(box.cls[0])
                        confidence = float(box.conf[0]) * 100
                        object_name = model.names[class_id]

                        if object_name not in all_detected:
                            all_detected[object_name] = {
                                "count": 0,
                                "max_conf": 0.0,
                                "confs": []
                            }

                        all_detected[object_name]["count"] += 1
                        all_detected[object_name]["confs"].append(confidence)
                        if confidence > all_detected[object_name]["max_conf"]:
                            all_detected[object_name]["max_conf"] = confidence
                        all_confidences.append(confidence)

                if sampled_frames >= 30:
                    break

            frame_idx += 1

        cap.release()

        if not all_detected:
            return {
                "success": True,
                "message": f"No objects detected across {sampled_frames} video keyframes analyzed.",
                "objects": [],
                "confidence": 0,
                "is_video": True,
                "frames_analyzed": sampled_frames
            }

        detected_objects = []
        for name, data in sorted(all_detected.items(), key=lambda x: x[1]["max_conf"], reverse=True):
            detected_objects.append({
                "object": f"{name} (detected in {data['count']} frames)",
                "confidence": round(data["max_conf"], 2)
            })

        avg_conf = sum(all_confidences) / len(all_confidences) if all_confidences else 0

        return {
            "success": True,
            "message": f"Video analysis complete: {len(detected_objects)} object type(s) identified across {sampled_frames} keyframes (duration: {duration:.1f}s).",
            "objects": detected_objects,
            "confidence": round(avg_conf, 2),
            "is_video": True,
            "frames_analyzed": sampled_frames
        }

    except Exception as error:
        return {
            "success": False,
            "message": f"Video detection error: {str(error)}",
            "objects": [],
            "confidence": 0
        }


# =====================================================
# MAIN DETECT OBJECTS (SUPPORTS IMAGE & VIDEO)
# =====================================================

def detect_objects(file_path):
    if not os.path.exists(file_path):
        return {
            "success": False,
            "message": "File not found.",
            "objects": [],
            "confidence": 0
        }

    # Route video evidence to video analysis
    if file_path.lower().endswith(VIDEO_EXTENSIONS):
        return detect_objects_in_video(file_path)

    try:
        results = model.predict(
            source=file_path,
            conf=0.25,
            verbose=False
        )

        detected_objects = []
        confidence_values = []

        for result in results:
            if result.boxes is None:
                continue

            for box in result.boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                object_name = model.names[class_id]

                detected_objects.append({
                    "object": object_name,
                    "confidence": round(confidence * 100, 2)
                })
                confidence_values.append(confidence)

        if not detected_objects:
            return {
                "success": True,
                "message": "No objects detected.",
                "objects": [],
                "confidence": 0
            }

        average_confidence = (
            sum(confidence_values) / len(confidence_values)
        ) * 100

        return {
            "success": True,
            "message": "Objects detected successfully.",
            "objects": detected_objects,
            "confidence": round(average_confidence, 2)
        }

    except Exception as error:
        return {
            "success": False,
            "message": str(error),
            "objects": [],
            "confidence": 0
        }


if __name__ == "__main__":
    print("Object Detection Module Loaded Successfully (Images & Videos)!")