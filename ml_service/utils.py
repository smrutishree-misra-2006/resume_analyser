import re


def clean(text: str) -> str:
    text = re.sub(r"http\S+|www\.\S+", " ", str(text))
    text = re.sub(r"[^a-zA-Z0-9+#.\s]", " ", text)
    return re.sub(r"\s+", " ", text).lower().strip()