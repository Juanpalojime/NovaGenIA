"""
SDXL Styles System

Sistema de estilos predefinidos extraído de Fooocus
para aplicar estilos profesionales fácilmente.
"""

SDXL_STYLES = [
    {
        "id": "fooocus_enhance",
        "name": "Fooocus Enhance",
        "category": "quality",
        "prompt": "",
        "negative_prompt": "(worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed, grayscale, bw, bad photo, bad photography, bad art:1.4), (watermark, signature, text font, username, error, logo, words, letters, digits, autograph, trademark, name:1.2), (blur, blurry, grainy), morbid, ugly, asymmetrical, mutated malformed, mutilated, poorly lit, bad shadow, draft, cropped, out of frame, cut off, censored, jpeg artifacts, out of focus, glitch, duplicate, (airbrushed, cartoon, anime, semi-realistic, cgi, render, blender, digital art, manga, amateur:1.3), (3D ,3D Game, 3D Game Scene, 3D Character:1.1), (bad hands, bad anatomy, bad body, bad face, bad teeth, bad arms, bad legs, deformities:1.3)"
    },
    {
        "id": "fooocus_sharp",
        "name": "Fooocus Sharp",
        "category": "cinematic",
        "prompt": "cinematic still {prompt} . emotional, harmonious, vignette, 4k epic detailed, shot on kodak, 35mm photo, sharp focus, high budget, cinemascope, moody, epic, gorgeous, film grain, grainy",
        "negative_prompt": "anime, cartoon, graphic, (blur, blurry, bokeh), text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured"
    },
    {
        "id": "fooocus_masterpiece",
        "name": "Fooocus Masterpiece",
        "category": "artistic",
        "prompt": "(masterpiece), (best quality), (ultra-detailed), {prompt}, illustration, disheveled hair, detailed eyes, perfect composition, moist skin, intricate details, earrings",
        "negative_prompt": "longbody, lowres, bad anatomy, bad hands, missing fingers, pubic hair,extra digit, fewer digits, cropped, worst quality, low quality"
    },
    {
        "id": "fooocus_photograph",
        "name": "Fooocus Photograph",
        "category": "realistic",
        "prompt": "photograph {prompt}, 50mm . cinematic 4k epic detailed 4k epic detailed photograph shot on kodak detailed cinematic hbo dark moody, 35mm photo, grainy, vignette, vintage, Kodachrome, Lomography, stained, highly detailed, found footage",
        "negative_prompt": "bokeh, depth of field, blurry, cropped, regular face, saturated, contrast, deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime, text, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck"
    },
    {
        "id": "fooocus_cinematic",
        "name": "Fooocus Cinematic",
        "category": "cinematic",
        "prompt": "cinematic still {prompt} . emotional, harmonious, vignette, highly detailed, high budget, bokeh, cinemascope, moody, epic, gorgeous, film grain, grainy",
        "negative_prompt": "anime, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured"
    },
    {
        "id": "anime",
        "name": "Anime",
        "category": "anime",
        "prompt": "anime artwork {prompt} . anime style, key visual, vibrant, studio anime, highly detailed",
        "negative_prompt": "photo, deformed, black and white, realism, disfigured, low contrast"
    },
    {
        "id": "digital_art",
        "name": "Digital Art",
        "category": "artistic",
        "prompt": "concept art {prompt} . digital artwork, illustrative, painterly, matte painting, highly detailed",
        "negative_prompt": "photo, photorealistic, realism, ugly"
    },
    {
        "id": "fantasy",
        "name": "Fantasy Art",
        "category": "artistic",
        "prompt": "ethereal fantasy concept art of {prompt} . magnificent, celestial, ethereal, painterly, epic, majestic, magical, fantasy art, cover art, dreamy",
        "negative_prompt": "photographic, realistic, realism, 35mm film, dslr, cropped, frame, text, deformed, glitch, noise, noisy, off-center, deformed, cross-eyed, closed eyes, bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white"
    },
    {
        "id": "3d_model",
        "name": "3D Model",
        "category": "3d",
        "prompt": "professional 3d model {prompt} . octane render, highly detailed, volumetric, dramatic lighting",
        "negative_prompt": "ugly, deformed, noisy, low poly, blurry, painting"
    },
    {
        "id": "pixel_art",
        "name": "Pixel Art",
        "category": "artistic",
        "prompt": "pixel-art {prompt} . low-res, blocky, pixel art style, 8-bit graphics",
        "negative_prompt": "sloppy, messy, blurry, noisy, highly detailed, ultra textured, photo, realistic"
    }
]

def get_style(style_id: str) -> dict:
    """Get style by ID"""
    for style in SDXL_STYLES:
        if style["id"] == style_id:
            return style
    return None

def get_styles_by_category(category: str) -> list:
    """Get all styles in a category"""
    return [s for s in SDXL_STYLES if s["category"] == category]

def apply_style(prompt: str, negative_prompt: str, style_id: str) -> tuple:
    """Apply style to prompts"""
    style = get_style(style_id)
    if not style:
        return prompt, negative_prompt
    
    # Apply style prompt
    if style["prompt"]:
        styled_prompt = style["prompt"].replace("{prompt}", prompt)
    else:
        styled_prompt = prompt
    
    # Combine negative prompts
    if style["negative_prompt"]:
        if negative_prompt:
            styled_negative = f"{negative_prompt}, {style['negative_prompt']}"
        else:
            styled_negative = style["negative_prompt"]
    else:
        styled_negative = negative_prompt
    
    return styled_prompt, styled_negative

def get_all_styles() -> list:
    """Get all available styles"""
    return SDXL_STYLES

def get_categories() -> list:
    """Get all style categories"""
    categories = set(s["category"] for s in SDXL_STYLES)
    return sorted(list(categories))
