def is_image_request(query: str):
    keywords = [
        "draw", "diagram", "image", "visual",
        "architecture", "flowchart", "illustrate",
        "design", "sketch"
    ]
    return any(k in query.lower() for k in keywords)